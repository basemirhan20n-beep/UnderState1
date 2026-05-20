-- ============================================================
-- UNDERSTATE - TAM OYUN ŞEMASI (schema_full.sql)
-- Supabase Dashboard > SQL Editor > Çalıştır
-- ============================================================

-- ── OYUNCULAR (genişletilmiş) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  found_us TEXT,
  role TEXT DEFAULT 'user',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  money BIGINT DEFAULT 5000,
  under_coin INTEGER DEFAULT 0,
  city TEXT DEFAULT 'İstanbul',
  gender TEXT DEFAULT 'erkek',
  avatar TEXT,
  avatar_url TEXT,
  education_level TEXT DEFAULT 'İlkokul',
  education_points INTEGER DEFAULT 0,
  edu_package BOOLEAN DEFAULT false,
  edu_package_expiry BIGINT,
  job TEXT,
  job_active_until BIGINT,
  health INTEGER DEFAULT 100,
  happiness INTEGER DEFAULT 50,
  energy INTEGER DEFAULT 100,
  reputation INTEGER DEFAULT 0,
  prestige TEXT DEFAULT 'Vatandaş',
  position TEXT DEFAULT 'Vatandaş',
  salary BIGINT DEFAULT 0,
  salary_period TEXT,
  last_salary_collected BIGINT,
  party TEXT,
  gang TEXT,
  family TEXT,
  alliance TEXT,
  premium BOOLEAN DEFAULT false,
  premium_expiry BIGINT,
  vip BOOLEAN DEFAULT false,
  banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_until BIGINT,
  prison BOOLEAN DEFAULT false,
  prison_until BIGINT,
  prison_reason TEXT,
  active_loan JSONB DEFAULT 'null',
  active_loan_amount BIGINT DEFAULT 0,
  active_loan_due BIGINT,
  stock_portfolio JSONB DEFAULT '{}',
  inventory JSONB DEFAULT '[]',
  crafting_inv JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '[]',
  daily_tasks JSONB DEFAULT '{}',
  daily_streak INTEGER DEFAULT 0,
  last_daily_spin BIGINT,
  cooldowns JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  net_worth BIGINT DEFAULT 0,
  crime_records JSONB DEFAULT '[]',
  friend_list JSONB DEFAULT '[]',
  notification_prefs JSONB DEFAULT '{}',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS players_username_idx ON players(username);
CREATE INDEX IF NOT EXISTS players_email_idx ON players(email);
CREATE INDEX IF NOT EXISTS players_city_idx ON players(city);
CREATE INDEX IF NOT EXISTS players_money_idx ON players(money DESC);
CREATE INDEX IF NOT EXISTS players_level_idx ON players(level DESC);

-- ── GLOBAL SOHBET ─────────────────────────────────────────────
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

-- ── BORSA / HİSSE SENEDİ ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_market (
  company_id TEXT PRIMARY KEY,
  name TEXT,
  owner_id TEXT,
  owner_name TEXT,
  share_price BIGINT DEFAULT 100,
  total_shares INTEGER DEFAULT 1000,
  available_shares INTEGER DEFAULT 1000,
  sector TEXT DEFAULT '',
  sector_icon TEXT DEFAULT '🏢',
  price_history JSONB DEFAULT '[]',
  shareholders JSONB DEFAULT '{}',
  value BIGINT DEFAULT 0,
  dividend_rate NUMERIC DEFAULT 0,
  last_dividend BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HOLDİNGLER ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY,
  name TEXT,
  owner_id TEXT,
  owner_name TEXT,
  sector TEXT,
  sector_icon TEXT DEFAULT '🏢',
  level INTEGER DEFAULT 1,
  profit BIGINT DEFAULT 0,
  weekly_revenue BIGINT DEFAULT 0,
  employees INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  approved_by TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS holdings_owner_idx ON holdings(owner_id);

-- ── EKONOMİ ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS economy (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB DEFAULT '{}',
  inflation NUMERIC DEFAULT 0,
  unemployment NUMERIC DEFAULT 0,
  gdp BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO economy (id, data) VALUES ('main', '{}') ON CONFLICT (id) DO NOTHING;

-- ── EMTİALAR / COMMODITIES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS commodities (
  id TEXT PRIMARY KEY,
  name TEXT,
  icon TEXT,
  price BIGINT DEFAULT 100,
  supply INTEGER DEFAULT 1000,
  demand INTEGER DEFAULT 1000,
  price_history JSONB DEFAULT '[]',
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PARTİLER ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  leader TEXT,
  ideology TEXT DEFAULT '',
  ideology_icon TEXT DEFAULT '🏛️',
  members JSONB DEFAULT '[]',
  treasury BIGINT DEFAULT 0,
  votes INTEGER DEFAULT 0,
  vote_history JSONB DEFAULT '[]',
  color TEXT DEFAULT '#888',
  logo TEXT,
  manifesto TEXT,
  campaign_posters JSONB DEFAULT '[]',
  seats INTEGER DEFAULT 0,
  founded_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ÇETELER / KLANLAR ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gangs (
  id TEXT PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  leader TEXT,
  members JSONB DEFAULT '[]',
  territory TEXT DEFAULT '',
  territories JSONB DEFAULT '[]',
  treasury BIGINT DEFAULT 0,
  power INTEGER DEFAULT 0,
  weapons INTEGER DEFAULT 0,
  logo TEXT,
  color TEXT DEFAULT '#DC2626',
  alliance_id TEXT,
  war_status JSONB DEFAULT '{}',
  rank INTEGER DEFAULT 0,
  founded_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gangs_power_idx ON gangs(power DESC);

-- ── AİLELER ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  leader TEXT,
  members JSONB DEFAULT '[]',
  treasury BIGINT DEFAULT 0,
  influence INTEGER DEFAULT 0,
  logo TEXT,
  color TEXT DEFAULT '#7C3AED',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── OYUN OLAYLARI ─────────────────────────────────────────────
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
CREATE INDEX IF NOT EXISTS game_events_type_idx ON game_events(type);
CREATE INDEX IF NOT EXISTS game_events_active_idx ON game_events(active);

-- ── TİCARET TEKLİFLERİ ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS trade_offers (
  id TEXT PRIMARY KEY,
  from_user_id TEXT,
  from_username TEXT,
  to_user_id TEXT,
  to_username TEXT,
  offer JSONB DEFAULT '{}',
  request JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS trade_offers_to_idx ON trade_offers(to_user_id);
CREATE INDEX IF NOT EXISTS trade_offers_status_idx ON trade_offers(status);

-- ── GENEL OYUN STATE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_state (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── KABİNE / HÜKÜMET ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cabinet (
  position TEXT PRIMARY KEY,
  player_id TEXT,
  username TEXT,
  appointed_by TEXT,
  appointed_at BIGINT,
  salary BIGINT DEFAULT 0,
  under_coin_bonus INTEGER DEFAULT 0,
  city TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEÇİMLER ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS elections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  election_type TEXT DEFAULT 'general',
  city TEXT DEFAULT '',
  position TEXT,
  status TEXT DEFAULT 'active',
  candidates JSONB DEFAULT '[]',
  voted_by JSONB DEFAULT '[]',
  vote_counts JSONB DEFAULT '{}',
  winner_id TEXT,
  winner_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  result_declared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS elections_status_idx ON elections(status);
CREATE INDEX IF NOT EXISTS elections_city_idx ON elections(city);

-- ── YASALAR ──────────────────────────────────────────────────
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
  city TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ── MÜZAYEDELEr ──────────────────────────────────────────────
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

-- ── DUYURULAR ─────────────────────────────────────────────────
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

-- ── BANKA / KREDİLER ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  username TEXT,
  tier TEXT,
  amount BIGINT NOT NULL,
  interest_rate NUMERIC DEFAULT 0.10,
  total_due BIGINT,
  paid BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active',
  approved_by TEXT,
  due_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS loans_player_idx ON loans(player_id);
CREATE INDEX IF NOT EXISTS loans_status_idx ON loans(status);

-- ── HAFTALık İŞLER / COLLAB ──────────────────────────────────
CREATE TABLE IF NOT EXISTS collab_requests (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  job_name TEXT,
  job_icon TEXT,
  from_user TEXT,
  to_user TEXT,
  earn BIGINT DEFAULT 0,
  trade_point INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  day TEXT,
  sent_at BIGINT,
  expires_at BIGINT,
  completed_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── KUMARHANe LOGLARI ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS casino_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT,
  username TEXT,
  game_type TEXT,
  bet BIGINT DEFAULT 0,
  result BIGINT DEFAULT 0,
  won BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS casino_logs_player_idx ON casino_logs(player_id);

-- ── PİYANGO ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lottery (
  id TEXT PRIMARY KEY DEFAULT 'current',
  jackpot BIGINT DEFAULT 0,
  tickets JSONB DEFAULT '[]',
  last_winner TEXT,
  last_amount BIGINT DEFAULT 0,
  draw_at BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO lottery (id, jackpot) VALUES ('current', 0) ON CONFLICT (id) DO NOTHING;

-- ── SUİKAST / AMELİYAT ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS assassinations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  attacker_id TEXT,
  attacker_name TEXT,
  target_id TEXT,
  target_name TEXT,
  method TEXT,
  success BOOLEAN DEFAULT false,
  cost BIGINT DEFAULT 0,
  result_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MAHKEME DAVALARI ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS court_cases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plaintiff_id TEXT,
  plaintiff_name TEXT,
  defendant_id TEXT,
  defendant_name TEXT,
  charge TEXT,
  evidence JSONB DEFAULT '[]',
  verdict TEXT,
  judge_id TEXT,
  judge_name TEXT,
  status TEXT DEFAULT 'open',
  fine BIGINT DEFAULT 0,
  prison_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ── SAVAŞLAR ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS city_wars (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  attacker_gang_id TEXT,
  attacker_gang_name TEXT,
  defender_gang_id TEXT,
  defender_gang_name TEXT,
  city TEXT,
  status TEXT DEFAULT 'active',
  attacker_power INTEGER DEFAULT 0,
  defender_power INTEGER DEFAULT 0,
  winner TEXT,
  winner_name TEXT,
  started_at BIGINT,
  ended_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ŞEHİR SAHİPLİĞİ ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS city_ownership (
  city_id TEXT PRIMARY KEY,
  gang_id TEXT,
  gang_name TEXT,
  captured_by TEXT,
  captured_at BIGINT,
  tax_rate INTEGER DEFAULT 5,
  income_per_hour BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MUHAREBE LOGLARI ─────────────────────────────────────────
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

-- ── MARKET EŞYALARı ──────────────────────────────────────────
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

-- ── AKTİVİTE LOGU ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT,
  username TEXT,
  action TEXT,
  description TEXT,
  data JSONB DEFAULT '{}',
  city TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_log_player_idx ON activity_log(player_id);
CREATE INDEX IF NOT EXISTS activity_log_created_idx ON activity_log(created_at DESC);

-- ── DİREKT MESAJLAR ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS direct_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_id TEXT,
  from_name TEXT,
  to_id TEXT,
  to_name TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  ts BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS dm_to_idx ON direct_messages(to_id);
CREATE INDEX IF NOT EXISTS dm_from_idx ON direct_messages(from_id);

-- ── ÇIFTLIK / TARIM ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  crop_type TEXT,
  crop_icon TEXT,
  planted_at BIGINT,
  harvest_at BIGINT,
  yield BIGINT DEFAULT 0,
  harvested BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS farms_player_idx ON farms(player_id);

-- ── FABRIKALAR ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS factories (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  owner_name TEXT,
  name TEXT,
  type TEXT,
  level INTEGER DEFAULT 1,
  production_rate BIGINT DEFAULT 0,
  inventory JSONB DEFAULT '{}',
  orders JSONB DEFAULT '[]',
  city TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── GAZETELEr / LİVE NEWS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS live_news (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  headline TEXT,
  content TEXT,
  category TEXT DEFAULT 'genel',
  author TEXT DEFAULT 'Sistem',
  city TEXT DEFAULT '',
  image_url TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS live_news_created_idx ON live_news(created_at DESC);

-- ── OHAL SİSTEMİ ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ohal (
  id TEXT PRIMARY KEY DEFAULT 'current',
  active BOOLEAN DEFAULT false,
  declared_by TEXT,
  reason TEXT,
  city TEXT DEFAULT '',
  started_at BIGINT,
  ends_at BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO ohal (id, active) VALUES ('current', false) ON CONFLICT (id) DO NOTHING;

-- ── DARBE / COUP ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coup_system (
  id TEXT PRIMARY KEY DEFAULT 'current',
  active BOOLEAN DEFAULT false,
  instigator_id TEXT,
  instigator_name TEXT,
  votes JSONB DEFAULT '[]',
  status TEXT DEFAULT 'idle',
  started_at BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO coup_system (id, active) VALUES ('current', false) ON CONFLICT (id) DO NOTHING;

-- ── VERGİ SİSTEMİ ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tax_system (
  id TEXT PRIMARY KEY DEFAULT 'main',
  income_tax NUMERIC DEFAULT 0.10,
  corporate_tax NUMERIC DEFAULT 0.15,
  sales_tax NUMERIC DEFAULT 0.08,
  city_tax JSONB DEFAULT '{}',
  last_collection BIGINT,
  total_collected BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO tax_system (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ── GÜNLÜK GÖREVLER (şablon) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_task_templates (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  type TEXT,
  target INTEGER DEFAULT 1,
  reward_money BIGINT DEFAULT 0,
  reward_uc INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  icon TEXT DEFAULT '🎯',
  active BOOLEAN DEFAULT true
);

-- ── MAİL GÖNDERIM LOGU ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mail_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  to_email TEXT,
  to_name TEXT,
  subject TEXT,
  type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'sent',
  error TEXT,
  player_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUDIT LOGLARI ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT,
  player_name TEXT,
  action TEXT,
  data JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_logs_flagged_idx ON audit_logs(flagged);
CREATE INDEX IF NOT EXISTS audit_logs_player_idx ON audit_logs(player_id);

-- ── LEADERBOARd VIEW ─────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id, username, level, money, under_coin, city, gang, party, position,
  net_worth, education_level, premium, vip,
  COALESCE(net_worth, money) AS rank_score,
  last_seen
FROM players
WHERE banned = false AND role != 'admin'
ORDER BY COALESCE(net_worth, money) DESC
LIMIT 100;

-- ── REALTIME YAYINLARI ────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE global_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_market;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE economy;
ALTER PUBLICATION supabase_realtime ADD TABLE parties;
ALTER PUBLICATION supabase_realtime ADD TABLE gangs;
ALTER PUBLICATION supabase_realtime ADD TABLE elections;
ALTER PUBLICATION supabase_realtime ADD TABLE cabinet;
ALTER PUBLICATION supabase_realtime ADD TABLE city_ownership;
ALTER PUBLICATION supabase_realtime ADD TABLE live_news;

-- ── STARTER DATA ─────────────────────────────────────────────
INSERT INTO market_items (id, name, description, price, category, icon, rarity, effect) VALUES
  ('health_potion',  'Sağlık İksiri',     'Anında +20 can yeniler',               5000,   'combat',   '💊', 'common',    '{"health": 20}'),
  ('energy_drink',   'Enerji İçeceği',    '+30 enerji verir, çalışma hızlanır',   3000,   'work',     '⚡', 'common',    '{"energy": 30}'),
  ('shield',         'Savaş Kalkanı',     '30 dk boyunca muharebe bonusu +15',    15000,  'combat',   '🛡️', 'rare',      '{"combatBonus": 15, "duration": 1800000}'),
  ('speed_boost',    'Hız Takviyesi',     '30 dk çalışma hızı x2',               12000,  'work',     '🚀', 'rare',      '{"workSpeed": 2, "duration": 1800000}'),
  ('xp_boost',       'XP Yükselticisi',   '1 saat XP x2 kazanırsın',             20000,  'xp',       '⭐', 'epic',      '{"xpMultiplier": 2, "duration": 3600000}'),
  ('money_bag',      'Para Çantası',      'Anında ₺5.000 kazanırsın',            3000,   'economy',  '💰', 'common',    '{"money": 5000}'),
  ('gang_badge',     'Çete Rozeti',       'Çetene +10 güç verir',                50000,  'faction',  '🏴', 'epic',      '{"gangPower": 10}'),
  ('election_token', 'Seçim Jetonu',      'Ekstra oy kullanma hakkı',             25000,  'politics', '🗳️', 'rare',      '{"extraVote": 1}'),
  ('vip_pass_1d',    '1 Günlük VIP',      '24 saat VIP ayrıcalıkları',           50000,  'premium',  '👑', 'epic',      '{"vip": true, "duration": 86400000}'),
  ('city_intel',     'Şehir İstihbaratı', 'Rakip çete güçlerini görürsün',       10000,  'strategy', '🔍', 'uncommon',  '{"cityIntel": true}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO daily_task_templates (id, title, description, type, target, reward_money, reward_uc, reward_xp, icon) VALUES
  ('task_chat_1',    'Sohbet Et',          'Global sohbette 5 mesaj gönder',     'chat',     5,   1000,  0,  50,  '💬'),
  ('task_job_1',     'Çalış',              'Herhangi bir işten kazanç elde et',  'job',      1,   2000,  0,  100, '💼'),
  ('task_login',     'Giriş Yap',          'Bugün oyuna giriş yaptın',           'login',    1,   500,   1,  25,  '📅'),
  ('task_trade_1',   'Ticaret Yap',        'En az 1 ticaret teklifi gönder',     'trade',    1,   3000,  0,  150, '🤝'),
  ('task_vote_1',    'Oy Kullan',          'Bir seçimde oy kullan',              'vote',     1,   5000,  2,  200, '🗳️'),
  ('task_market_1',  'Borsa İşlemi',       'Bir hisse al veya sat',              'market',   1,   2500,  0,  125, '📈'),
  ('task_login_7',   '7 Günlük Seri',      '7 gün üst üste giriş yap',          'streak',   7,   10000, 10, 500, '🔥'),
  ('task_gang_1',    'Çete Devriyesi',     'Çete görevini tamamla',              'gang',     1,   4000,  0,  200, '🔫'),
  ('task_help_1',    'Yardım Et',          'Birine ticaret teklifini kabul et',  'help',     1,   2000,  0,  100, '🤝')
ON CONFLICT (id) DO NOTHING;
