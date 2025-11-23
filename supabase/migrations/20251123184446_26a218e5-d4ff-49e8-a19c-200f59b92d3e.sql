-- Fix function to set search_path explicitly for security
CREATE OR REPLACE FUNCTION update_data_sync_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;