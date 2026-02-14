CREATE OR REPLACE FUNCTION increment_vote(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
