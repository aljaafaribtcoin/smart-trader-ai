-- تفعيل REPLICA IDENTITY للجداول لضمان التحديثات الكاملة
ALTER TABLE public.market_prices REPLICA IDENTITY FULL;
ALTER TABLE public.market_candles REPLICA IDENTITY FULL;
ALTER TABLE public.technical_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.market_symbols REPLICA IDENTITY FULL;