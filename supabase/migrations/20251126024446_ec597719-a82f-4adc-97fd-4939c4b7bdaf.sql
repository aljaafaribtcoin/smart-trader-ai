-- Create backtesting_runs table
CREATE TABLE IF NOT EXISTS public.backtesting_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  timeframe text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  strategy_type text NOT NULL, -- 'signals', 'patterns', 'indicators'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  
  -- Results
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0,
  total_profit numeric(15,2) DEFAULT 0,
  total_loss numeric(15,2) DEFAULT 0,
  net_profit numeric(15,2) DEFAULT 0,
  net_profit_percentage numeric(8,2) DEFAULT 0,
  average_profit numeric(15,2) DEFAULT 0,
  average_loss numeric(15,2) DEFAULT 0,
  largest_profit numeric(15,2) DEFAULT 0,
  largest_loss numeric(15,2) DEFAULT 0,
  profit_factor numeric(8,2) DEFAULT 0, -- total_profit / abs(total_loss)
  max_drawdown numeric(8,2) DEFAULT 0,
  max_drawdown_percentage numeric(8,2) DEFAULT 0,
  sharpe_ratio numeric(8,2) DEFAULT 0,
  
  -- Configuration
  initial_capital numeric(15,2) DEFAULT 10000,
  risk_per_trade numeric(5,2) DEFAULT 2, -- percentage
  max_trades_per_day integer DEFAULT 3,
  
  -- Metadata
  execution_time_ms integer,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create backtest_trades table
CREATE TABLE IF NOT EXISTS public.backtest_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.backtesting_runs(id) ON DELETE CASCADE,
  
  -- Trade details
  symbol text NOT NULL,
  direction text NOT NULL, -- 'long', 'short'
  entry_time timestamp with time zone NOT NULL,
  entry_price numeric(15,8) NOT NULL,
  exit_time timestamp with time zone,
  exit_price numeric(15,8),
  
  -- Targets and stops
  stop_loss numeric(15,8) NOT NULL,
  take_profit_1 numeric(15,8),
  take_profit_2 numeric(15,8),
  take_profit_3 numeric(15,8),
  
  -- Position sizing
  position_size numeric(15,8) NOT NULL,
  risk_amount numeric(15,2) NOT NULL,
  
  -- Results
  status text NOT NULL DEFAULT 'open', -- 'open', 'closed', 'stopped_out', 'target_hit'
  exit_reason text, -- 'stop_loss', 'take_profit_1', 'take_profit_2', 'take_profit_3', 'manual'
  profit_loss numeric(15,2) DEFAULT 0,
  profit_loss_percentage numeric(8,2) DEFAULT 0,
  
  -- Signal/Pattern reference
  signal_id uuid,
  pattern_id uuid,
  confidence numeric(5,2),
  
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backtesting_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backtesting_runs
CREATE POLICY "Users can view their own backtest runs"
  ON public.backtesting_runs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own backtest runs"
  ON public.backtesting_runs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own backtest runs"
  ON public.backtesting_runs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own backtest runs"
  ON public.backtesting_runs FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for backtest_trades
CREATE POLICY "Users can view trades from their backtest runs"
  ON public.backtest_trades FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.backtesting_runs
    WHERE backtesting_runs.id = backtest_trades.run_id
    AND backtesting_runs.user_id = auth.uid()
  ));

CREATE POLICY "System can manage backtest trades"
  ON public.backtest_trades FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backtesting_runs_user_id ON public.backtesting_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backtesting_runs_status ON public.backtesting_runs(status);
CREATE INDEX IF NOT EXISTS idx_backtest_trades_run_id ON public.backtest_trades(run_id);
CREATE INDEX IF NOT EXISTS idx_backtest_trades_entry_time ON public.backtest_trades(entry_time);

-- Create materialized view for backtest statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.backtest_statistics AS
SELECT 
  symbol,
  strategy_type,
  timeframe,
  COUNT(*) as total_runs,
  AVG(win_rate) as avg_win_rate,
  AVG(net_profit_percentage) as avg_return,
  AVG(profit_factor) as avg_profit_factor,
  AVG(max_drawdown_percentage) as avg_max_drawdown,
  SUM(total_trades) as total_trades_all_runs,
  MAX(net_profit_percentage) as best_return,
  MIN(net_profit_percentage) as worst_return
FROM public.backtesting_runs
WHERE status = 'completed'
GROUP BY symbol, strategy_type, timeframe;

CREATE UNIQUE INDEX IF NOT EXISTS idx_backtest_stats_unique 
  ON public.backtest_statistics(symbol, strategy_type, timeframe);