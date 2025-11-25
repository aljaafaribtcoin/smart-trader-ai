-- ==========================================
-- المرحلة 6: تحسين الأداء
-- ==========================================

-- 1. إضافة Indexes لتحسين سرعة الاستعلامات
-- ==========================================

-- Indexes لجدول market_candles
CREATE INDEX IF NOT EXISTS idx_market_candles_symbol_timeframe 
ON market_candles(symbol, timeframe);

CREATE INDEX IF NOT EXISTS idx_market_candles_timestamp 
ON market_candles(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_market_candles_symbol_timeframe_timestamp 
ON market_candles(symbol, timeframe, timestamp DESC);

-- Indexes لجدول technical_indicators
CREATE INDEX IF NOT EXISTS idx_technical_indicators_symbol_timeframe 
ON technical_indicators(symbol, timeframe);

CREATE INDEX IF NOT EXISTS idx_technical_indicators_calculated_at 
ON technical_indicators(calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_technical_indicators_symbol_timeframe_calculated 
ON technical_indicators(symbol, timeframe, calculated_at DESC);

-- Indexes لجدول patterns
CREATE INDEX IF NOT EXISTS idx_patterns_symbol_timeframe 
ON patterns(symbol, timeframe);

CREATE INDEX IF NOT EXISTS idx_patterns_status 
ON patterns(status);

CREATE INDEX IF NOT EXISTS idx_patterns_detected_at 
ON patterns(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_patterns_symbol_status_detected 
ON patterns(symbol, status, detected_at DESC);

-- Indexes لجدول trading_signals
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol 
ON trading_signals(symbol);

CREATE INDEX IF NOT EXISTS idx_trading_signals_status 
ON trading_signals(status);

CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at 
ON trading_signals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol_status_created 
ON trading_signals(symbol, status, created_at DESC);

-- Indexes لجدول market_prices
CREATE INDEX IF NOT EXISTS idx_market_prices_symbol 
ON market_prices(symbol);

CREATE INDEX IF NOT EXISTS idx_market_prices_last_updated 
ON market_prices(last_updated DESC);

-- Indexes لجدول data_sync_status
CREATE INDEX IF NOT EXISTS idx_data_sync_status_symbol_data_type 
ON data_sync_status(symbol, data_type);

CREATE INDEX IF NOT EXISTS idx_data_sync_status_status 
ON data_sync_status(status);

CREATE INDEX IF NOT EXISTS idx_data_sync_status_last_sync 
ON data_sync_status(last_sync_at DESC);

-- 2. إنشاء Materialized Views للاستعلامات المعقدة
-- ==========================================

-- View للشموع الأخيرة مع المؤشرات الفنية
CREATE MATERIALIZED VIEW IF NOT EXISTS latest_market_data AS
SELECT 
  mc.symbol,
  mc.timeframe,
  mc.timestamp,
  mc.open,
  mc.high,
  mc.low,
  mc.close,
  mc.volume,
  ti.rsi,
  ti.macd_value,
  ti.macd_signal,
  ti.macd_histogram,
  ti.bb_upper,
  ti.bb_middle,
  ti.bb_lower,
  ti.ema_20,
  ti.ema_50,
  ti.ema_200,
  ti.atr,
  ti.stochastic_k,
  ti.stochastic_d,
  mp.price as current_price,
  mp.change_24h,
  mp.volume_24h
FROM market_candles mc
LEFT JOIN technical_indicators ti 
  ON mc.symbol = ti.symbol AND mc.timeframe = ti.timeframe
LEFT JOIN market_prices mp 
  ON mc.symbol = mp.symbol
WHERE mc.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY mc.symbol, mc.timeframe, mc.timestamp DESC;

-- Index للـ materialized view
CREATE INDEX IF NOT EXISTS idx_latest_market_data_symbol_timeframe 
ON latest_market_data(symbol, timeframe, timestamp DESC);

-- View للأنماط النشطة مع التوصيات
CREATE MATERIALIZED VIEW IF NOT EXISTS active_patterns_with_signals AS
SELECT 
  p.id as pattern_id,
  p.symbol,
  p.timeframe,
  p.pattern_name,
  p.pattern_type,
  p.confidence as pattern_confidence,
  p.target_price as pattern_target,
  p.stop_loss as pattern_stop_loss,
  p.detected_at,
  ts.id as signal_id,
  ts.direction,
  ts.confidence as signal_confidence,
  ts.entry_from,
  ts.entry_to,
  ts.tp1,
  ts.tp2,
  ts.tp3,
  ts.stop_loss as signal_stop_loss,
  ts.risk_reward,
  ts.main_scenario,
  ts.created_at as signal_created_at,
  mp.price as current_price
FROM patterns p
LEFT JOIN trading_signals ts 
  ON p.symbol = ts.symbol 
  AND ts.status = 'active'
  AND ts.created_at >= p.detected_at - INTERVAL '1 hour'
LEFT JOIN market_prices mp 
  ON p.symbol = mp.symbol
WHERE p.status = 'active'
ORDER BY p.detected_at DESC;

-- Index للـ materialized view
CREATE INDEX IF NOT EXISTS idx_active_patterns_signals_symbol 
ON active_patterns_with_signals(symbol, detected_at DESC);

-- View لملخص أحدث البيانات لكل رمز
CREATE MATERIALIZED VIEW IF NOT EXISTS market_summary AS
SELECT 
  mp.symbol,
  mp.price,
  mp.change_24h,
  mp.change_7d,
  mp.volume_24h,
  mp.market_cap,
  mp.last_updated,
  ms.name,
  ms.rank,
  (SELECT COUNT(*) FROM patterns WHERE symbol = mp.symbol AND status = 'active') as active_patterns_count,
  (SELECT COUNT(*) FROM trading_signals WHERE symbol = mp.symbol AND status = 'active') as active_signals_count,
  (SELECT ti.rsi FROM technical_indicators ti 
   WHERE ti.symbol = mp.symbol AND ti.timeframe = '1h' 
   ORDER BY ti.calculated_at DESC LIMIT 1) as rsi_1h,
  (SELECT ti.macd_histogram FROM technical_indicators ti 
   WHERE ti.symbol = mp.symbol AND ti.timeframe = '1h' 
   ORDER BY ti.calculated_at DESC LIMIT 1) as macd_histogram_1h,
  (SELECT dss.status FROM data_sync_status dss 
   WHERE dss.symbol = mp.symbol AND dss.data_type = 'candles' 
   ORDER BY dss.last_sync_at DESC LIMIT 1) as sync_status,
  (SELECT dss.last_sync_at FROM data_sync_status dss 
   WHERE dss.symbol = mp.symbol AND dss.data_type = 'candles' 
   ORDER BY dss.last_sync_at DESC LIMIT 1) as last_sync_at
FROM market_prices mp
LEFT JOIN market_symbols ms ON mp.symbol = ms.symbol
ORDER BY ms.rank ASC NULLS LAST;

-- Index للـ materialized view
CREATE INDEX IF NOT EXISTS idx_market_summary_symbol 
ON market_summary(symbol);

-- 3. Function لتحديث Materialized Views
-- ==========================================
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_market_data;
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_patterns_with_signals;
  REFRESH MATERIALIZED VIEW CONCURRENTLY market_summary;
END;
$$ LANGUAGE plpgsql;

-- 4. تحسين RLS Policies
-- ==========================================

-- السماح للجميع بقراءة الـ materialized views
ALTER MATERIALIZED VIEW latest_market_data OWNER TO postgres;
ALTER MATERIALIZED VIEW active_patterns_with_signals OWNER TO postgres;
ALTER MATERIALIZED VIEW market_summary OWNER TO postgres;

-- Note: Materialized views don't support RLS directly, 
-- but they inherit security from the underlying tables