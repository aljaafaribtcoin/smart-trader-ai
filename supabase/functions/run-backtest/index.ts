import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BacktestConfig {
  name: string;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  strategy_type: 'signals' | 'patterns' | 'indicators';
  initial_capital: number;
  risk_per_trade: number;
  max_trades_per_day: number;
}

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Signal {
  id: string;
  symbol: string;
  direction: string;
  entry_from: number;
  entry_to: number;
  stop_loss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  confidence: number;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const config: BacktestConfig = await req.json();
    console.log('Starting backtest with config:', config);

    // Create backtest run record
    const { data: run, error: runError } = await supabaseClient
      .from('backtesting_runs')
      .insert({
        user_id: user.id,
        name: config.name,
        symbol: config.symbol,
        timeframe: config.timeframe,
        start_date: config.start_date,
        end_date: config.end_date,
        strategy_type: config.strategy_type,
        status: 'running',
        initial_capital: config.initial_capital,
        risk_per_trade: config.risk_per_trade,
        max_trades_per_day: config.max_trades_per_day,
      })
      .select()
      .single();

    if (runError || !run) {
      throw new Error('Failed to create backtest run');
    }

    console.log('Backtest run created:', run.id);

    // Fetch historical candles
    const { data: candles, error: candlesError } = await supabaseClient
      .from('market_candles')
      .select('*')
      .eq('symbol', config.symbol)
      .eq('timeframe', config.timeframe)
      .gte('timestamp', config.start_date)
      .lte('timestamp', config.end_date)
      .order('timestamp', { ascending: true });

    if (candlesError || !candles || candles.length === 0) {
      await supabaseClient
        .from('backtesting_runs')
        .update({
          status: 'failed',
          error_message: 'No historical data available for the selected period',
        })
        .eq('id', run.id);
      
      throw new Error('No historical data available');
    }

    console.log(`Fetched ${candles.length} candles`);

    // Fetch signals/patterns based on strategy type
    let signals: Signal[] = [];
    
    if (config.strategy_type === 'signals') {
      const { data: signalsData } = await supabaseClient
        .from('trading_signals')
        .select('*')
        .eq('symbol', config.symbol)
        .gte('created_at', config.start_date)
        .lte('created_at', config.end_date)
        .order('created_at', { ascending: true });
      
      signals = signalsData || [];
    }

    console.log(`Fetched ${signals.length} signals`);

    // Run backtest simulation
    const result = await runBacktestSimulation(
      run.id,
      candles as Candle[],
      signals,
      config,
      supabaseClient
    );

    // Update run with results
    const executionTime = Date.now() - startTime;
    await supabaseClient
      .from('backtesting_runs')
      .update({
        status: 'completed',
        ...result.metrics,
        execution_time_ms: executionTime,
        completed_at: new Date().toISOString(),
      })
      .eq('id', run.id);

    console.log('Backtest completed:', result.metrics);

    return new Response(
      JSON.stringify({
        success: true,
        run_id: run.id,
        metrics: result.metrics,
        execution_time_ms: executionTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Backtest error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function runBacktestSimulation(
  runId: string,
  candles: Candle[],
  signals: Signal[],
  config: BacktestConfig,
  supabase: any
) {
  let capital = config.initial_capital;
  let peakCapital = capital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  
  const trades: any[] = [];
  const dailyTrades: { [key: string]: number } = {};

  // Process each signal
  for (const signal of signals) {
    const signalDate = new Date(signal.created_at).toISOString().split('T')[0];
    const tradesThisDay = dailyTrades[signalDate] || 0;

    if (tradesThisDay >= config.max_trades_per_day) {
      console.log(`Max trades reached for ${signalDate}`);
      continue;
    }

    // Find entry candle
    const entryIndex = candles.findIndex(
      (c) => new Date(c.timestamp) >= new Date(signal.created_at)
    );

    if (entryIndex === -1 || entryIndex >= candles.length - 1) {
      continue;
    }

    const entryCandle = candles[entryIndex];
    const entryPrice = (signal.entry_from + signal.entry_to) / 2;

    // Calculate position size based on risk
    const riskAmount = (capital * config.risk_per_trade) / 100;
    const stopDistance = Math.abs(entryPrice - signal.stop_loss);
    const positionSize = riskAmount / stopDistance;

    // Simulate trade execution
    let exitPrice = 0;
    let exitTime = '';
    let exitReason = '';
    let status = 'open';

    // Look for exit in subsequent candles
    for (let i = entryIndex + 1; i < candles.length; i++) {
      const candle = candles[i];

      // Check stop loss
      if (signal.direction === 'long' && candle.low <= signal.stop_loss) {
        exitPrice = signal.stop_loss;
        exitTime = candle.timestamp;
        exitReason = 'stop_loss';
        status = 'stopped_out';
        break;
      } else if (signal.direction === 'short' && candle.high >= signal.stop_loss) {
        exitPrice = signal.stop_loss;
        exitTime = candle.timestamp;
        exitReason = 'stop_loss';
        status = 'stopped_out';
        break;
      }

      // Check take profits
      if (signal.direction === 'long') {
        if (candle.high >= signal.tp3) {
          exitPrice = signal.tp3;
          exitTime = candle.timestamp;
          exitReason = 'take_profit_3';
          status = 'target_hit';
          break;
        } else if (candle.high >= signal.tp2) {
          exitPrice = signal.tp2;
          exitTime = candle.timestamp;
          exitReason = 'take_profit_2';
          status = 'target_hit';
          break;
        } else if (candle.high >= signal.tp1) {
          exitPrice = signal.tp1;
          exitTime = candle.timestamp;
          exitReason = 'take_profit_1';
          status = 'target_hit';
          break;
        }
      } else {
        if (candle.low <= signal.tp3) {
          exitPrice = signal.tp3;
          exitTime = candle.timestamp;
          exitReason = 'take_profit_3';
          status = 'target_hit';
          break;
        } else if (candle.low <= signal.tp2) {
          exitPrice = signal.tp2;
          exitTime = candle.timestamp;
          exitReason = 'take_profit_2';
          status = 'target_hit';
          break;
        } else if (candle.low <= signal.tp1) {
          exitPrice = signal.tp1;
          exitTime = candle.timestamp;
          exitReason = 'take_profit_1';
          status = 'target_hit';
          break;
        }
      }
    }

    // Calculate P&L
    if (exitPrice > 0) {
      const priceDiff =
        signal.direction === 'long'
          ? exitPrice - entryPrice
          : entryPrice - exitPrice;
      const profitLoss = priceDiff * positionSize;
      const profitLossPercent = (profitLoss / capital) * 100;

      capital += profitLoss;

      // Update peak and drawdown
      if (capital > peakCapital) {
        peakCapital = capital;
      }
      const currentDrawdown = peakCapital - capital;
      const currentDrawdownPercent = (currentDrawdown / peakCapital) * 100;
      
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
      if (currentDrawdownPercent > maxDrawdownPercent) {
        maxDrawdownPercent = currentDrawdownPercent;
      }

      // Record trade
      trades.push({
        run_id: runId,
        symbol: signal.symbol,
        direction: signal.direction,
        entry_time: entryCandle.timestamp,
        entry_price: entryPrice,
        exit_time: exitTime,
        exit_price: exitPrice,
        stop_loss: signal.stop_loss,
        take_profit_1: signal.tp1,
        take_profit_2: signal.tp2,
        take_profit_3: signal.tp3,
        position_size: positionSize,
        risk_amount: riskAmount,
        status: status,
        exit_reason: exitReason,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercent,
        signal_id: signal.id,
        confidence: signal.confidence,
      });

      dailyTrades[signalDate] = (dailyTrades[signalDate] || 0) + 1;
    }
  }

  // Insert all trades
  if (trades.length > 0) {
    await supabase.from('backtest_trades').insert(trades);
  }

  // Calculate metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.profit_loss > 0).length;
  const losingTrades = trades.filter((t) => t.profit_loss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalProfit = trades
    .filter((t) => t.profit_loss > 0)
    .reduce((sum, t) => sum + t.profit_loss, 0);
  const totalLoss = Math.abs(
    trades
      .filter((t) => t.profit_loss < 0)
      .reduce((sum, t) => sum + t.profit_loss, 0)
  );

  const netProfit = capital - config.initial_capital;
  const netProfitPercent = ((netProfit / config.initial_capital) * 100);

  const avgProfit =
    winningTrades > 0
      ? trades
          .filter((t) => t.profit_loss > 0)
          .reduce((sum, t) => sum + t.profit_loss, 0) / winningTrades
      : 0;

  const avgLoss =
    losingTrades > 0
      ? trades
          .filter((t) => t.profit_loss < 0)
          .reduce((sum, t) => sum + t.profit_loss, 0) / losingTrades
      : 0;

  const largestProfit =
    trades.length > 0
      ? Math.max(...trades.map((t) => t.profit_loss))
      : 0;
  const largestLoss =
    trades.length > 0
      ? Math.min(...trades.map((t) => t.profit_loss))
      : 0;

  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

  // Calculate Sharpe ratio (simplified)
  const returns = trades.map((t) => t.profit_loss_percentage);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
      returns.length
  ) || 1;
  const sharpeRatio = avgReturn / stdDev;

  return {
    metrics: {
      total_trades: totalTrades,
      winning_trades: winningTrades,
      losing_trades: losingTrades,
      win_rate: Number(winRate.toFixed(2)),
      total_profit: Number(totalProfit.toFixed(2)),
      total_loss: Number(totalLoss.toFixed(2)),
      net_profit: Number(netProfit.toFixed(2)),
      net_profit_percentage: Number(netProfitPercent.toFixed(2)),
      average_profit: Number(avgProfit.toFixed(2)),
      average_loss: Number(avgLoss.toFixed(2)),
      largest_profit: Number(largestProfit.toFixed(2)),
      largest_loss: Number(largestLoss.toFixed(2)),
      profit_factor: Number(profitFactor.toFixed(2)),
      max_drawdown: Number(maxDrawdown.toFixed(2)),
      max_drawdown_percentage: Number(maxDrawdownPercent.toFixed(2)),
      sharpe_ratio: Number(sharpeRatio.toFixed(2)),
    },
    trades,
  };
}
