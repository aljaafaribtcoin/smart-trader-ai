-- Fix security warnings: Add search_path to functions

-- Update notify_new_pattern function with search_path
CREATE OR REPLACE FUNCTION notify_new_pattern()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update notify_new_signal function with search_path
CREATE OR REPLACE FUNCTION notify_new_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update notify_critical_indicators function with search_path
CREATE OR REPLACE FUNCTION notify_critical_indicators()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;