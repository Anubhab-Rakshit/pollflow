-- Create tables for Pollflow Realtime

-- 1. Polls Table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  creator_fingerprint TEXT,
  creator_ip_hash TEXT,
  slug TEXT UNIQUE NOT NULL
);

-- 2. Poll Options Table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0 NOT NULL,
  position INTEGER NOT NULL
);

-- 3. Votes Table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  voter_fingerprint TEXT,
  voter_ip_hash TEXT,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance and constraints
CREATE INDEX idx_votes_poll_fingerprint ON votes(poll_id, voter_fingerprint);
CREATE INDEX idx_polls_slug ON polls(slug);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies (Public read/write for this simple app, but can be restricted)
CREATE POLICY "Allow public read access on polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Allow public insert on polls" ON polls FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on poll_options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert on poll_options" ON poll_options FOR INSERT WITH CHECK (true); -- Usually inserted by creator

CREATE POLICY "Allow public read access on votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on votes" ON votes FOR INSERT WITH CHECK (true); -- Users voting
