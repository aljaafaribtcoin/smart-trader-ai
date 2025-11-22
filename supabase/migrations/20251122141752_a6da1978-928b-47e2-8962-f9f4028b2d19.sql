-- Create market_symbols table for basic cryptocurrency information
CREATE TABLE IF NOT EXISTS public.market_symbols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  market_cap NUMERIC,
  rank INTEGER,
  circulating_supply NUMERIC,
  max_supply NUMERIC,
  total_supply NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_prices table for live price data
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume_24h NUMERIC,
  change_24h NUMERIC,
  change_7d NUMERIC,
  change_30d NUMERIC,
  high_24h NUMERIC,
  low_24h NUMERIC,
  market_cap NUMERIC,
  source TEXT NOT NULL DEFAULT 'livecoinwatch',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, source)
);

-- Create market_candles table for candlestick data
CREATE TABLE IF NOT EXISTS public.market_candles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  open NUMERIC NOT NULL,
  high NUMERIC NOT NULL,
  low NUMERIC NOT NULL,
  close NUMERIC NOT NULL,
  volume NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL DEFAULT 'bybit',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, timeframe, timestamp, source)
);

-- Create technical_indicators table
CREATE TABLE IF NOT EXISTS public.technical_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  rsi NUMERIC,
  macd_value NUMERIC,
  macd_signal NUMERIC,
  macd_histogram NUMERIC,
  stochastic_k NUMERIC,
  stochastic_d NUMERIC,
  ema_20 NUMERIC,
  ema_50 NUMERIC,
  ema_200 NUMERIC,
  bb_upper NUMERIC,
  bb_middle NUMERIC,
  bb_lower NUMERIC,
  atr NUMERIC,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, timeframe)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.market_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Market data is public for reading
CREATE POLICY "Market symbols are viewable by everyone"
  ON public.market_symbols FOR SELECT
  USING (true);

CREATE POLICY "Market prices are viewable by everyone"
  ON public.market_prices FOR SELECT
  USING (true);

CREATE POLICY "Market candles are viewable by everyone"
  ON public.market_candles FOR SELECT
  USING (true);

CREATE POLICY "Technical indicators are viewable by everyone"
  ON public.technical_indicators FOR SELECT
  USING (true);

-- System can insert/update market data (for edge functions)
CREATE POLICY "System can insert market symbols"
  ON public.market_symbols FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update market symbols"
  ON public.market_symbols FOR UPDATE
  USING (true);

CREATE POLICY "System can insert market prices"
  ON public.market_prices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update market prices"
  ON public.market_prices FOR UPDATE
  USING (true);

CREATE POLICY "System can insert market candles"
  ON public.market_candles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert technical indicators"
  ON public.technical_indicators FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update technical indicators"
  ON public.technical_indicators FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_prices_symbol ON public.market_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_market_prices_last_updated ON public.market_prices(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_market_candles_symbol_timeframe ON public.market_candles(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_market_candles_timestamp ON public.market_candles(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_technical_indicators_symbol ON public.technical_indicators(symbol);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_market_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_market_symbols_updated_at
  BEFORE UPDATE ON public.market_symbols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_market_updated_at();

-- Enable realtime for market_prices table
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_prices;