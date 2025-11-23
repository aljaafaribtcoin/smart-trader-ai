-- Create data_sync_status table to track synchronization state
CREATE TABLE IF NOT EXISTS public.data_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_type TEXT NOT NULL, -- 'candles', 'prices', 'indicators', etc.
  symbol TEXT NOT NULL,
  timeframe TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'syncing', 'success', 'error'
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'bybit',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data_type, symbol, timeframe, source)
);

-- Enable RLS
ALTER TABLE public.data_sync_status ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view sync status
CREATE POLICY "Sync status is viewable by everyone"
ON public.data_sync_status
FOR SELECT
USING (true);

-- Policy: System can manage sync status
CREATE POLICY "System can manage sync status"
ON public.data_sync_status
FOR ALL
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_data_sync_status_lookup ON public.data_sync_status(data_type, symbol, timeframe, source);
CREATE INDEX idx_data_sync_status_next_sync ON public.data_sync_status(next_sync_at) WHERE status = 'pending';
CREATE INDEX idx_data_sync_status_errors ON public.data_sync_status(status) WHERE status = 'error';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_data_sync_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_data_sync_status_timestamp
BEFORE UPDATE ON public.data_sync_status
FOR EACH ROW
EXECUTE FUNCTION update_data_sync_status_updated_at();