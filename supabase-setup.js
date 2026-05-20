/**
 * Supabase Tablo Kurulum Scripti
 * node supabase-setup.js ile çalıştırın
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SQL = `
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

-- Borsa / Şirketler
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

-- Ekonomi (genel state)
CREATE TABLE IF NOT EXISTS economy (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO economy (id, data) VALUES ('main', '{}') ON CONFLICT (id) DO NOTHING;

-- Partiler (Fraksiyonlar)
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

-- Oyun Olayları (eventler)
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

-- Genel Oyun State (anahtar-değer)
CREATE TABLE IF NOT EXISTS game_state (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liderlik Tablosu (view)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id, username, level, money, city, gang, party,
  (COALESCE((stats->>'netWorth')::BIGINT, money)) AS net_worth,
  last_seen
FROM players
ORDER BY (COALESCE((stats->>'netWorth')::BIGINT, money)) DESC
LIMIT 100;

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

-- Announcements (Duyurular)
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

-- Realtime için gerekli: tüm tablolarda publication etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE global_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_market;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
`;

async function setup() {
  console.log('🚀 Supabase tabloları kuruluyor...');
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: SQL }).catch(() => ({ error: { message: 'RPC yok' } }));
    if (error) {
      console.log('RPC mevcut değil, teker teker oluşturuyorum...');
      await createTablesManually();
    } else {
      console.log('✅ Tüm tablolar oluşturuldu!');
    }
  } catch (e) {
    console.log('Manuel kurulum yapılıyor...');
    await createTablesManually();
  }
}

async function createTablesManually() {
  const tables = [
    {
      name: 'players',
      check: async () => {
        const { error } = await supabase.from('players').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'global_chat',
      check: async () => {
        const { error } = await supabase.from('global_chat').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'stock_market',
      check: async () => {
        const { error } = await supabase.from('stock_market').select('company_id').limit(1);
        return !error;
      }
    },
    {
      name: 'economy',
      check: async () => {
        const { error } = await supabase.from('economy').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'parties',
      check: async () => {
        const { error } = await supabase.from('parties').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'gangs',
      check: async () => {
        const { error } = await supabase.from('gangs').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'game_events',
      check: async () => {
        const { error } = await supabase.from('game_events').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'game_state',
      check: async () => {
        const { error } = await supabase.from('game_state').select('key').limit(1);
        return !error;
      }
    },
    {
      name: 'trade_offers',
      check: async () => {
        const { error } = await supabase.from('trade_offers').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'laws',
      check: async () => {
        const { error } = await supabase.from('laws').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'auction_items',
      check: async () => {
        const { error } = await supabase.from('auction_items').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'announcements',
      check: async () => {
        const { error } = await supabase.from('announcements').select('id').limit(1);
        return !error;
      }
    }
  ];

  for (const table of tables) {
    const exists = await table.check();
    if (exists) {
      console.log(`  ✓ ${table.name} mevcut`);
    } else {
      console.log(`  ✗ ${table.name} YOK — Supabase Dashboard'dan SQL çalıştırmanız gerekiyor`);
    }
  }

  console.log('\n📋 Supabase Dashboard > SQL Editor\'e gidin ve sql/schema.sql dosyasını çalıştırın.');
}

setup();
