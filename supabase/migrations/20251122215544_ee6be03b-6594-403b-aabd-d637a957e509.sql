-- Create analysis_results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  bias TEXT CHECK (bias IN ('long', 'short', 'neutral')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  market_condition TEXT CHECK (market_condition IN ('trending', 'ranging', 'choppy', 'high_volatility')),
  analysis_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trading_signals table
CREATE TABLE IF NOT EXISTS public.trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  entry_from NUMERIC NOT NULL,
  entry_to NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  tp1 NUMERIC NOT NULL,
  tp2 NUMERIC NOT NULL,
  tp3 NUMERIC NOT NULL,
  risk_reward NUMERIC NOT NULL,
  main_scenario TEXT NOT NULL,
  alternative_scenario TEXT,
  invalidation_price NUMERIC,
  telegram_summary TEXT,
  supporting_factors JSONB,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'invalidated')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analysis_results
CREATE POLICY "Users can view their own analysis results"
  ON public.analysis_results FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert their own analysis results"
  ON public.analysis_results FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert analysis results"
  ON public.analysis_results FOR INSERT
  WITH CHECK (true);

-- RLS Policies for trading_signals
CREATE POLICY "Users can view their own signals"
  ON public.trading_signals FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert their own signals"
  ON public.trading_signals FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own signals"
  ON public.trading_signals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert signals"
  ON public.trading_signals FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_analysis_results_symbol ON public.analysis_results(symbol);
CREATE INDEX idx_analysis_results_created_at ON public.analysis_results(created_at DESC);
CREATE INDEX idx_trading_signals_symbol ON public.trading_signals(symbol);
CREATE INDEX idx_trading_signals_status ON public.trading_signals(status);
CREATE INDEX idx_trading_signals_created_at ON public.trading_signals(created_at DESC);