-- Enable Realtime for key tables (skip if already exists)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patterns;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_signals;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;

-- Create function to notify about new patterns
CREATE OR REPLACE FUNCTION notify_new_pattern()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    action_url
  )
  VALUES (
    NEW.user_id::text,
    'pattern',
    'نمط جديد: ' || NEW.pattern_name,
    'تم اكتشاف نمط ' || NEW.pattern_name || ' على ' || NEW.symbol || ' (' || NEW.timeframe || ') بثقة ' || ROUND(NEW.confidence::numeric, 0) || '%',
    jsonb_build_object(
      'pattern_id', NEW.id,
      'symbol', NEW.symbol,
      'timeframe', NEW.timeframe,
      'confidence', NEW.confidence,
      'target_price', NEW.target_price
    ),
    '/patterns'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to notify about new signals
CREATE OR REPLACE FUNCTION notify_new_signal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    action_url
  )
  SELECT
    u.id::text,
    'trade',
    'توصية جديدة: ' || NEW.direction || ' على ' || NEW.symbol,
    'توصية ' || NEW.direction || ' على ' || NEW.symbol || ' | الدخول: ' || NEW.entry_from || '-' || NEW.entry_to || ' | الهدف 1: ' || NEW.tp1,
    jsonb_build_object(
      'signal_id', NEW.id,
      'symbol', NEW.symbol,
      'direction', NEW.direction,
      'confidence', NEW.confidence,
      'entry_from', NEW.entry_from,
      'entry_to', NEW.entry_to,
      'tp1', NEW.tp1,
      'risk_reward', NEW.risk_reward
    ),
    '/signals'
  FROM auth.users u
  WHERE NEW.user_id IS NULL OR NEW.user_id = u.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to notify about critical RSI levels
CREATE OR REPLACE FUNCTION notify_critical_indicators()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify if RSI is oversold (< 30)
  IF NEW.rsi < 30 AND (OLD.rsi IS NULL OR OLD.rsi >= 30) THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata,
      action_url
    )
    SELECT
      u.id::text,
      'warning',
      'RSI منخفض جداً: ' || NEW.symbol,
      'مؤشر RSI وصل إلى ' || ROUND(NEW.rsi::numeric, 2) || ' على ' || NEW.symbol || ' (' || NEW.timeframe || ') - منطقة تشبع بيعي',
      jsonb_build_object(
        'symbol', NEW.symbol,
        'timeframe', NEW.timeframe,
        'rsi', NEW.rsi,
        'level', 'oversold'
      ),
      '/analysis'
    FROM auth.users u;
  END IF;
  
  -- Notify if RSI is overbought (> 70)
  IF NEW.rsi > 70 AND (OLD.rsi IS NULL OR OLD.rsi <= 70) THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata,
      action_url
    )
    SELECT
      u.id::text,
      'warning',
      'RSI مرتفع جداً: ' || NEW.symbol,
      'مؤشر RSI وصل إلى ' || ROUND(NEW.rsi::numeric, 2) || ' على ' || NEW.symbol || ' (' || NEW.timeframe || ') - منطقة تشبع شرائي',
      jsonb_build_object(
        'symbol', NEW.symbol,
        'timeframe', NEW.timeframe,
        'rsi', NEW.rsi,
        'level', 'overbought'
      ),
      '/analysis'
    FROM auth.users u;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_new_pattern ON public.patterns;
CREATE TRIGGER trigger_notify_new_pattern
  AFTER INSERT ON public.patterns
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_pattern();

DROP TRIGGER IF EXISTS trigger_notify_new_signal ON public.trading_signals;
CREATE TRIGGER trigger_notify_new_signal
  AFTER INSERT ON public.trading_signals
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_signal();

DROP TRIGGER IF EXISTS trigger_notify_critical_indicators ON public.technical_indicators;
CREATE TRIGGER trigger_notify_critical_indicators
  AFTER INSERT OR UPDATE OF rsi ON public.technical_indicators
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_indicators();

-- Create indexes for better performance on notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Add notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT jsonb_build_object(
  'patterns_enabled', true,
  'signals_enabled', true,
  'indicators_enabled', true,
  'price_alerts_enabled', true
);