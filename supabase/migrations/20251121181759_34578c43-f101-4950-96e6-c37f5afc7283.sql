-- Create ENUM types for better type safety
CREATE TYPE trade_type AS ENUM ('long', 'short');
CREATE TYPE trade_status AS ENUM ('open', 'closed', 'pending', 'cancelled');
CREATE TYPE trade_style AS ENUM ('scalping', 'day', 'swing', 'position');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  equity DECIMAL(20, 2) NOT NULL DEFAULT 10000.00,
  balance DECIMAL(20, 2) NOT NULL DEFAULT 10000.00,
  margin DECIMAL(20, 2) NOT NULL DEFAULT 0,
  free_margin DECIMAL(20, 2) NOT NULL DEFAULT 10000.00,
  margin_level DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_pnl DECIMAL(20, 2) NOT NULL DEFAULT 0,
  today_pnl DECIMAL(20, 2) NOT NULL DEFAULT 0,
  open_trades INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  exchange TEXT NOT NULL DEFAULT 'Binance Futures',
  leverage INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view their own account"
  ON public.accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own account"
  ON public.accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own account"
  ON public.accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- TRADES TABLE
-- =====================================================
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  type trade_type NOT NULL,
  status trade_status NOT NULL DEFAULT 'open',
  style trade_style NOT NULL DEFAULT 'day',
  
  -- Entry details
  entry_price DECIMAL(20, 8) NOT NULL,
  entry_zone_min DECIMAL(20, 8),
  entry_zone_max DECIMAL(20, 8),
  entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Exit details
  stop_loss DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  exit_time TIMESTAMPTZ,
  
  -- Position details
  quantity DECIMAL(20, 8) NOT NULL,
  leverage INTEGER NOT NULL DEFAULT 10,
  position_size DECIMAL(20, 2) NOT NULL,
  
  -- Performance
  pnl DECIMAL(20, 2),
  pnl_percentage DECIMAL(10, 4),
  fees DECIMAL(20, 2) NOT NULL DEFAULT 0,
  
  -- AI Analysis
  confidence_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
  ai_reason TEXT,
  risk_reward DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trades
CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own trades"
  ON public.trades FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- TAKE PROFITS TABLE (for multiple TP levels)
-- =====================================================
CREATE TABLE public.take_profits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  hit BOOLEAN NOT NULL DEFAULT FALSE,
  hit_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.take_profits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for take_profits
CREATE POLICY "Users can view take profits for their trades"
  ON public.take_profits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = take_profits.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert take profits for their trades"
  ON public.take_profits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = take_profits.trade_id
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update take profits for their trades"
  ON public.take_profits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE trades.id = take_profits.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- =====================================================
-- WATCHLIST TABLE
-- =====================================================
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  price DECIMAL(20, 8),
  change_percentage DECIMAL(10, 4),
  alert_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  alert_price DECIMAL(20, 8),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol, timeframe)
);

-- Enable RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watchlist
CREATE POLICY "Users can view their own watchlist"
  ON public.watchlist FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert to their own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own watchlist"
  ON public.watchlist FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete from their own watchlist"
  ON public.watchlist FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- PATTERNS TABLE
-- =====================================================
CREATE TABLE public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,
  target_price DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  status TEXT NOT NULL DEFAULT 'active',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patterns
CREATE POLICY "Users can view their own patterns"
  ON public.patterns FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own patterns"
  ON public.patterns FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patterns"
  ON public.patterns FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own patterns"
  ON public.patterns FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON public.watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_symbol ON public.watchlist(symbol);
CREATE INDEX idx_patterns_user_id ON public.patterns(user_id);
CREATE INDEX idx_patterns_symbol ON public.patterns(symbol);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);