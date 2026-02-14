-- Create a table to track poll views
CREATE TABLE IF NOT EXISTS poll_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for faster queries on poll_id (fetching analytics)
CREATE INDEX IF NOT EXISTS idx_poll_views_poll_id ON poll_views(poll_id);

-- RPC to record a view safely
CREATE OR REPLACE FUNCTION record_poll_view(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO poll_views (poll_id) VALUES (p_id);
END;
$$;
