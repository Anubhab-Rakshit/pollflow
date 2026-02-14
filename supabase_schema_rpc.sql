-- Create a function to insert a poll and its options atomically
CREATE OR REPLACE FUNCTION create_poll(
  p_question TEXT,
  p_slug TEXT,
  p_creator_fingerprint TEXT,
  p_creator_ip_hash TEXT,
  p_options TEXT[]
) RETURNS UUID AS $$
DECLARE
  v_poll_id UUID;
  v_option_text TEXT;
  v_position INTEGER := 0;
BEGIN
  -- Insert the poll
  INSERT INTO polls (question, slug, creator_fingerprint, creator_ip_hash)
  VALUES (p_question, p_slug, p_creator_fingerprint, p_creator_ip_hash)
  RETURNING id INTO v_poll_id;

  -- Insert the options
  FOREACH v_option_text IN ARRAY p_options
  LOOP
    INSERT INTO poll_options (poll_id, option_text, position)
    VALUES (v_poll_id, v_option_text, v_position);
    v_position := v_position + 1;
  END LOOP;

  RETURN v_poll_id;
END;
$$ LANGUAGE plpgsql;
