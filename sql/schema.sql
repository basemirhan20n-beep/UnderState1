-- ============================================================
-- UNDERSTATE - Supabase Schema
-- Supabase Dashboard > SQL Editor'e yapıştırın ve çalıştırın
-- ============================================================

-- Oyuncular
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  username TEXT,
  level INTEGER DEFAULT 1,
  money BIGINT DEFAULT 5000,
  city TEXT DEFAULT '',
  gender TEXT DEFAULT 'erkek',
  avatar TEXT,
  party TEXT,
  gang TEXT,
  job TEXT,
  education TEXT,
  health INTEGER DEFAULT 100,
  happiness INTEGER DEFAULT 50,
  stats JSONB DEFAULT '{}',
  inventory JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Global Sohbet
CREATE TABLE IF NOT EXISTS global_chat (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT,
  sender TEXT NOT NULL,
  message TEXT,
  gif_url TEXT,
  channel TEXT DEFAULT 'global',
  sticker TEXT,
  reply_to TEXT,
  ts BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS global_chat_channel_idx ON global_chat(channel);
CREATE INDEX IF NOT EXISTS global_chat_ts_idx ON global_chat(ts DESC);

-- Borsa
CREATE TABLE IF NOT EXISTS stock_market (
  company_id TEXT PRIMARY KEY,
  name TEXT,
  owner_id TEXT,
  owner_name TEXT,
  share_price BIGINT DEFAULT 100,
  total_shares INTEGER DEFAULT 1000,
  sector TEXT DEFAULT '',
  sector_icon TEXT DEFAULT '🏢',
  price_history JSONB DEFAULT '[]',
  shareholders JSONB DEFAULT '{}',
  value BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ekonomi
CREATE TABLE IF NOT EXISTS economy (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO economy (id, data) VALUES ('main', '{}') ON CONFLICT (id) DO NOTHING;

-- Partiler
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  leader TEXT,
  ideology TEXT DEFAULT '',
  members JSONB DEFAULT '[]',
  treasury BIGINT DEFAULT 0,
  votes INTEGER DEFAULT 0,
  color TEXT DEFAULT '#888',
  logo TEXT,
  manifesto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Çeteler / Klanlar
CREATE TABLE IF NOT EXISTS gangs (
  id TEXT PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  leader TEXT,
  members JSONB DEFAULT '[]',
  territory TEXT DEFAULT '',
  treasury BIGINT DEFAULT 0,
  power INTEGER DEFAULT 0,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oyun Olayları
CREATE TABLE IF NOT EXISTS game_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT,
  title TEXT,
  description TEXT,
  data JSONB DEFAULT '{}',
  city TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Teklifleri
CREATE TABLE IF NOT EXISTS trade_offers (
  id TEXT PRIMARY KEY,
  from_user_id TEXT,
  from_username TEXT,
  to_user_id TEXT,
  to_username TEXT,
  offer JSONB DEFAULT '{}',
  request JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genel Oyun State
CREATE TABLE IF NOT EXISTS game_state (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yasalar
CREATE TABLE IF NOT EXISTS laws (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  description TEXT,
  type TEXT,
  effects JSONB DEFAULT '{}',
  proposer_id TEXT,
  proposer TEXT,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  voted_by JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Müzayede
CREATE TABLE IF NOT EXISTS auction_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  description TEXT,
  type TEXT,
  starting_price BIGINT DEFAULT 0,
  current_bid BIGINT DEFAULT 0,
  highest_bidder_id TEXT,
  highest_bidder TEXT,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

-- Duyurular
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  content TEXT,
  author_id TEXT,
  author TEXT,
  type TEXT DEFAULT 'general',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liderlik Tablosu
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id, username, level, money, city, gang, party,
  COALESCE((stats->>'netWorth')::BIGINT, money) AS net_worth,
  last_seen
FROM players
ORDER BY COALESCE((stats->>'netWorth')::BIGINT, money) DESC
LIMIT 100;

-- Realtime yayınları etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE global_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_market;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE economy;
ALTER PUBLICATION supabase_realtime ADD TABLE parties;
ALTER PUBLICATION supabase_realtime ADD TABLE gangs;
