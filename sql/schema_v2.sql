-- ============================================================
-- UNDERSTATE - Schema v2 (Yeni Sistemler)
-- Supabase Dashboard > SQL Editor'e yapıştırın ve çalıştırın
-- ============================================================

-- Muharebe Logları
CREATE TABLE IF NOT EXISTS combat_logs (
  id TEXT PRIMARY KEY,
  attacker_id TEXT,
  attacker_name TEXT,
  defender_id TEXT,
  defender_name TEXT,
  winner_id TEXT,
  winner_name TEXT,
  combat_type TEXT DEFAULT 'duel',
  money_transfer BIGINT DEFAULT 0,
  attacker_power INTEGER DEFAULT 0,
  defender_power INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}',
  ts BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS combat_logs_attacker_idx ON combat_logs(attacker_id);
CREATE INDEX IF NOT EXISTS combat_logs_defender_idx ON combat_logs(defender_id);
CREATE INDEX IF NOT EXISTS combat_logs_ts_idx ON combat_logs(ts DESC);

-- Şehir Sahipliği (JSONB game_state'e ek olarak ayrı tablo)
CREATE TABLE IF NOT EXISTS city_ownership (
  city_id TEXT PRIMARY KEY,
  gang_id TEXT,
  gang_name TEXT,
  captured_by TEXT,
  captured_at BIGINT,
  tax_rate INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Eşyaları (Envanter için satın alınabilir ürünler)
CREATE TABLE IF NOT EXISTS market_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT DEFAULT 0,
  category TEXT DEFAULT 'general',
  icon TEXT DEFAULT '📦',
  rarity TEXT DEFAULT 'common',
  effect JSONB DEFAULT '{}',
  stock INTEGER DEFAULT -1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mafia Savaşları
CREATE TABLE IF NOT EXISTS mafia_wars (
  id TEXT PRIMARY KEY,
  attacking_gang_id TEXT,
  attacking_gang_name TEXT,
  defending_gang_id TEXT,
  defending_gang_name TEXT,
  city TEXT DEFAULT '',
  winner TEXT,
  winner_name TEXT,
  attack_power INTEGER DEFAULT 0,
  defense_power INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  ts BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seçim Geçmişi (detaylı)
CREATE TABLE IF NOT EXISTS election_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  election_id TEXT,
  election_type TEXT DEFAULT 'general',
  city TEXT DEFAULT '',
  winner_id TEXT,
  winner_name TEXT,
  total_votes INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Piyasa Siparişleri (canlı ekonomi)
CREATE TABLE IF NOT EXISTS market_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  player_name TEXT,
  order_type TEXT DEFAULT 'buy',
  item_type TEXT,
  item_id TEXT,
  quantity INTEGER DEFAULT 1,
  price_per_unit BIGINT DEFAULT 0,
  total_price BIGINT DEFAULT 0,
  status TEXT DEFAULT 'open',
  matched_with TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS market_orders_player_idx ON market_orders(player_id);
CREATE INDEX IF NOT EXISTS market_orders_status_idx ON market_orders(status);

-- Envanter işlem geçmişi
CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  action TEXT,
  item_id TEXT,
  item_name TEXT,
  amount INTEGER DEFAULT 1,
  from_player TEXT,
  to_player TEXT,
  money_change BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS inventory_logs_player_idx ON inventory_logs(player_id);

-- Sunucu olayları loglama (anti-cheat audit)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT,
  player_name TEXT,
  action TEXT,
  data JSONB DEFAULT '{}',
  ip TEXT,
  flagged BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_logs_player_idx ON audit_logs(player_id);
CREATE INDEX IF NOT EXISTS audit_logs_flagged_idx ON audit_logs(flagged);

-- Faction savaş durumu (gerçek zamanlı)
CREATE TABLE IF NOT EXISTS faction_wars (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  faction_type TEXT DEFAULT 'gang',
  attacker_id TEXT,
  attacker_name TEXT,
  defender_id TEXT,
  defender_name TEXT,
  city TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  attacker_hp INTEGER DEFAULT 100,
  defender_hp INTEGER DEFAULT 100,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  winner TEXT,
  data JSONB DEFAULT '{}'
);

-- Mevcut gangs tablosuna power kolonu ekle (yoksa)
ALTER TABLE gangs ADD COLUMN IF NOT EXISTS power INTEGER DEFAULT 0;

-- Mevcut players tablosuna inventory kolonu ekle (yoksa)
ALTER TABLE players ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]';

-- Realtime yayınları aktifleştir
ALTER PUBLICATION supabase_realtime ADD TABLE combat_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE city_ownership;
ALTER PUBLICATION supabase_realtime ADD TABLE market_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE faction_wars;

-- Starter market items
INSERT INTO market_items (id, name, description, price, category, icon, rarity, effect) VALUES
  ('health_potion', 'Sağlık İksiri', 'Anında +20 can yeniler', 5000, 'combat', '💊', 'common', '{"health": 20}'),
  ('energy_drink', 'Enerji İçeceği', '+30 enerji verir', 3000, 'work', '⚡', 'common', '{"energy": 30}'),
  ('shield', 'Savaş Kalkanı', '30 dakika boyunca muharebe bonusu +15', 15000, 'combat', '🛡️', 'rare', '{"combatBonus": 15, "duration": 1800000}'),
  ('speed_boost', 'Hız Takviyesi', '30 dakika çalışma hızı x2', 12000, 'work', '🚀', 'rare', '{"workSpeed": 2, "duration": 1800000}'),
  ('xp_boost', 'XP Yükselticisi', '1 saat boyunca XP x2 kazanırsın', 20000, 'xp', '⭐', 'epic', '{"xpMultiplier": 2, "duration": 3600000}'),
  ('money_bag', 'Para Çantası', 'Anında ₺5.000 kazanırsın', 3000, 'economy', '💰', 'common', '{"money": 5000}'),
  ('gang_badge', 'Çete Rozeti', 'Güç +10 verir çetene', 50000, 'faction', '🏴', 'epic', '{"gangPower": 10}'),
  ('election_token', 'Seçim Jetonu', 'Ekstra oy kullanma hakkı', 25000, 'politics', '🗳️', 'rare', '{"extraVote": 1}')
ON CONFLICT (id) DO NOTHING;
