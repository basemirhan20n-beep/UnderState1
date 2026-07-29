"use strict";
const {
  useState, useEffect, useRef, useCallback, useMemo, useReducer,
  createContext, useContext, Fragment
} = React;

// ═══════════════════════════════════════════════════════
// SVG ICON COMPONENT
// ═══════════════════════════════════════════════════════
const _ICON_MAP = {
  money:            'assets/icons/money.svg',
  bank:             'assets/icons/bank.svg',
  government:       'assets/icons/government.svg',
  user:             'assets/icons/user.svg',
  briefcase:        'assets/icons/briefcase.svg',
  settings:         'assets/icons/settings.svg',
  crown:            'assets/icons/crown.svg',
  vote:             'assets/icons/vote.svg',
  law:              'assets/icons/law.svg',
  chart:            'assets/icons/chart.svg',
  weapon:           'assets/icons/weapon.svg',
  map:              'assets/icons/map.svg',
  education:        'assets/icons/education.svg',
  truck:            'assets/icons/truck.svg',
  factory:          'assets/icons/factory.svg',
  'job-trash':      'assets/icons/jobs/trash.svg',
  'job-chef':       'assets/icons/jobs/chef.svg',
  'job-porter':     'assets/icons/jobs/porter.svg',
  'job-warehouse':  'assets/icons/jobs/warehouse.svg',
  'job-miner':      'assets/icons/jobs/miner.svg',
  'job-engineer':   'assets/icons/jobs/engineer.svg',
  'job-doctor':     'assets/icons/jobs/doctor.svg',
  'job-programmer': 'assets/icons/jobs/programmer.svg',
  'job-pilot':      'assets/icons/jobs/pilot.svg',
};
function SvgIcon({ name, size=24, style={} }) {
  const src = _ICON_MAP[name];
  if (!src) return null;
  return React.createElement('img', { src, alt:name, width:size, height:size, style:{display:'inline-block',flexShrink:0,...style} });
}

// ═══════════════════════════════════════════════════════
// SABITLER
// ═══════════════════════════════════════════════════════
const GAME_ID = "understate_main_server";
const APP_V   = "8.0";

const CITIES = ['Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'];

// ── Çok Dilli Destek (TR / EN / DE / AZ) ────────────────
const TRANSLATIONS = {
  tr: {
    home:'Ana Sayfa', economy:'Ekonomi', battle:'Savaş', state:'Devlet', social:'Sosyal',
    jobs:'İşler', general:'Genel', market:'Market', companies:'Şirketler', factory:'Fabrika',
    mining:'Maden', education:'Eğitim', tasks:'Görevler', farm:'Tarım', livestock:'Hayvancılık',
    army:'Ordu', fight:'Dövüş', gang:'Çete', intelligence:'İstihbarat', tournament:'Turnuva',
    crisis:'Kriz', court:'Mahkeme', politics:'Siyaset', governance:'Yönetim',
    municipality:'Belediye', construction:'İnşaat', map:'Harita', alliance:'İttifak',
    world:'Dünya', npc:'NPC', wiki:'Wiki',
    chat:'Sohbet', clan:'Klan', messages:'Mesaj', players:'Oyuncular',
    newsfeed:'Sosyal', newspaper:'Gazete', football:'Futbol', casino:'Kumarhane',
    announcements:'Duyurular', leaderboard:'Sıralama', achievements:'Başarılar',
    money:'PARA', uc:'PG', send:'Gönder', buy:'Satın Al', sell:'Sat',
    upgrade:'Geliştir', collect:'Topla', feed:'Besle', profile:'Profil',
    settings:'Ayarlar', logout:'Çıkış', language:'Dil',
    barn:'Ahır', capacity:'Kapasite', level:'Seviye', barnFull:'Ahır dolu!',
    messageSend:'Mesaj Gönder', viewProfile:'Profili Gör',
    authorities:'Yetkilerim', events:'Olaylar', war:'Savaş', premium:'Premium',
    admin:'Admin', pvp:'Dövüş', spy:'İstihbarat', daily:'Görevler',
    store:'Market', leaderbd:'Sıralama',
    // Common button texts
    close:'Kapat', save:'Kaydet', cancel:'İptal', confirm:'Onayla', back:'Geri',
    next:'İleri', search:'Ara', filter:'Filtrele', refresh:'Yenile', submit:'Gönder',
    login:'Giriş Yap', register:'Kayıt Ol', invite:'Davet Et', join:'Katıl', leave:'Ayrıl',
    create:'Oluştur', edit:'Düzenle', delete:'Sil', share:'Paylaş', report:'Şikayet Et',
    vote:'Oy Ver', donate:'Bağış Yap', collect2:'Topla', harvest:'Hasat',
    plant:'Ek', water:'Sula', upgrade2:'Yükselt', attack:'Saldır', defend:'Savun',
    trade:'Ticaret', produce:'Üret', train:'Eğit', recruit:'İşe Al',
    accept:'Kabul Et', reject:'Reddet', apply:'Başvur', manage:'Yönet',
    transfer:'Transfer', withdraw:'Çek', deposit:'Yatır',
    online:'Çevrimiçi', offline:'Çevrimdışı', loading:'Yükleniyor...',
    noData:'Veri yok', empty:'Boş',
  },
  en: {
    home:'Home', economy:'Economy', battle:'Battle', state:'State', social:'Social',
    jobs:'Jobs', general:'General', market:'Market', companies:'Companies', factory:'Factory',
    mining:'Mining', education:'Education', tasks:'Tasks', farm:'Farming', livestock:'Livestock',
    army:'Army', fight:'Fight', gang:'Gang', intelligence:'Intel', tournament:'Tournament',
    crisis:'Crisis', court:'Court', politics:'Politics', governance:'Governance',
    municipality:'Municipality', construction:'Construction', map:'Map', alliance:'Alliance',
    world:'World', npc:'NPC', wiki:'Wiki',
    chat:'Chat', clan:'Clan', messages:'Messages', players:'Players',
    newsfeed:'Social', newspaper:'News', football:'Football', casino:'Casino',
    announcements:'News', leaderboard:'Leaderboard', achievements:'Achievements',
    money:'MONEY', uc:'PG', send:'Send', buy:'Buy', sell:'Sell',
    upgrade:'Upgrade', collect:'Collect', feed:'Feed', profile:'Profile',
    settings:'Settings', logout:'Logout', language:'Language',
    barn:'Barn', capacity:'Capacity', level:'Level', barnFull:'Barn is full!',
    messageSend:'Send Message', viewProfile:'View Profile',
    authorities:'Authorities', events:'Events', war:'War', premium:'Premium',
    admin:'Admin', pvp:'Fight', spy:'Intel', daily:'Tasks',
    store:'Store', leaderbd:'Ranking',
    close:'Close', save:'Save', cancel:'Cancel', confirm:'Confirm', back:'Back',
    next:'Next', search:'Search', filter:'Filter', refresh:'Refresh', submit:'Submit',
    login:'Login', register:'Register', invite:'Invite', join:'Join', leave:'Leave',
    create:'Create', edit:'Edit', delete:'Delete', share:'Share', report:'Report',
    vote:'Vote', donate:'Donate', collect2:'Collect', harvest:'Harvest',
    plant:'Plant', water:'Water', upgrade2:'Upgrade', attack:'Attack', defend:'Defend',
    trade:'Trade', produce:'Produce', train:'Train', recruit:'Recruit',
    accept:'Accept', reject:'Reject', apply:'Apply', manage:'Manage',
    transfer:'Transfer', withdraw:'Withdraw', deposit:'Deposit',
    online:'Online', offline:'Offline', loading:'Loading...',
    noData:'No data', empty:'Empty',
  },
  de: {
    home:'Startseite', economy:'Wirtschaft', battle:'Kampf', state:'Staat', social:'Sozial',
    jobs:'Jobs', general:'Allgemein', market:'Markt', companies:'Firmen', factory:'Fabrik',
    mining:'Bergbau', education:'Bildung', tasks:'Aufgaben', farm:'Landwirtschaft', livestock:'Vieh',
    army:'Armee', fight:'Kampf', gang:'Gang', intelligence:'Geheimdienst', tournament:'Turnier',
    crisis:'Krise', court:'Gericht', politics:'Politik', governance:'Verwaltung',
    municipality:'Gemeinde', construction:'Bau', map:'Karte', alliance:'Allianz',
    world:'Welt', npc:'NPC', wiki:'Wiki',
    chat:'Chat', clan:'Clan', messages:'Nachrichten', players:'Spieler',
    newsfeed:'Sozial', newspaper:'Zeitung', football:'Fußball', casino:'Casino',
    announcements:'Ankündigungen', leaderboard:'Rangliste', achievements:'Erfolge',
    money:'GELD', uc:'PG', send:'Senden', buy:'Kaufen', sell:'Verkaufen',
    upgrade:'Verbessern', collect:'Sammeln', feed:'Füttern', profile:'Profil',
    settings:'Einstellungen', logout:'Abmelden', language:'Sprache',
    barn:'Stall', capacity:'Kapazität', level:'Stufe', barnFull:'Stall voll!',
    messageSend:'Nachricht senden', viewProfile:'Profil ansehen',
    authorities:'Befugnisse', events:'Ereignisse', war:'Krieg', premium:'Premium',
    admin:'Admin', pvp:'Kampf', spy:'Geheimdienst', daily:'Aufgaben',
    store:'Laden', leaderbd:'Rangliste',
    close:'Schließen', save:'Speichern', cancel:'Abbrechen', confirm:'Bestätigen', back:'Zurück',
    next:'Weiter', search:'Suchen', filter:'Filtern', refresh:'Aktualisieren', submit:'Absenden',
    login:'Anmelden', register:'Registrieren', invite:'Einladen', join:'Beitreten', leave:'Verlassen',
    create:'Erstellen', edit:'Bearbeiten', delete:'Löschen', share:'Teilen', report:'Melden',
    vote:'Abstimmen', donate:'Spenden', collect2:'Sammeln', harvest:'Ernten',
    plant:'Pflanzen', water:'Gießen', upgrade2:'Verbessern', attack:'Angreifen', defend:'Verteidigen',
    trade:'Handeln', produce:'Produzieren', train:'Trainieren', recruit:'Rekrutieren',
    accept:'Annehmen', reject:'Ablehnen', apply:'Bewerben', manage:'Verwalten',
    transfer:'Überweisen', withdraw:'Abheben', deposit:'Einzahlen',
    online:'Online', offline:'Offline', loading:'Laden...',
    noData:'Keine Daten', empty:'Leer',
  },
  az: {
    home:'Ana Səhifə', economy:'İqtisadiyyat', battle:'Müharibə', state:'Dövlət', social:'Sosial',
    jobs:'İşlər', general:'Ümumi', market:'Bazar', companies:'Şirkətlər', factory:'Zavod',
    mining:'Mədən', education:'Təhsil', tasks:'Tapşırıqlar', farm:'Əkinçilik', livestock:'Heyvandarlıq',
    army:'Ordu', fight:'Döyüş', gang:'Dəstə', intelligence:'Kəşfiyyat', tournament:'Turnir',
    crisis:'Böhran', court:'Məhkəmə', politics:'Siyasət', governance:'İdarəetmə',
    municipality:'Bələdiyyə', construction:'İnşaat', map:'Xəritə', alliance:'İttifaq',
    world:'Dünya', npc:'NPC', wiki:'Vikipediya',
    chat:'Söhbət', clan:'Klan', messages:'Mesaj', players:'Oyunçular',
    newsfeed:'Sosial', newspaper:'Qəzet', football:'Futbol', casino:'Kazino',
    announcements:'Elanlar', leaderboard:'Liderlik', achievements:'Nailiyyətlər',
    money:'PUL', uc:'PG', send:'Göndər', buy:'Al', sell:'Sat',
    upgrade:'Yüksəlt', collect:'Topla', feed:'Yem ver', profile:'Profil',
    settings:'Parametrlər', logout:'Çıxış', language:'Dil',
    barn:'Tövlə', capacity:'Tutum', level:'Səviyyə', barnFull:'Tövlə doludur!',
    messageSend:'Mesaj Göndər', viewProfile:'Profili Gör',
    authorities:'Səlahiyyətlər', events:'Hadisələr', war:'Müharibə', premium:'Premium',
    admin:'Admin', pvp:'Döyüş', spy:'Kəşfiyyat', daily:'Tapşırıqlar',
    store:'Mağaza', leaderbd:'Liderlik',
    close:'Bağla', save:'Saxla', cancel:'Ləğv et', confirm:'Təsdiq et', back:'Geri',
    next:'İrəli', search:'Axtar', filter:'Filtrlə', refresh:'Yenilə', submit:'Göndər',
    login:'Daxil ol', register:'Qeydiyyat', invite:'Dəvət et', join:'Qoşul', leave:'Ayrıl',
    create:'Yarat', edit:'Düzəlt', delete:'Sil', share:'Paylaş', report:'Şikayet et',
    vote:'Səs ver', donate:'Bağış et', collect2:'Topla', harvest:'Məhsul götür',
    plant:'Ək', water:'Sula', upgrade2:'Yüksəlt', attack:'Hücum et', defend:'Müdafiə et',
    trade:'Ticarət', produce:'İstehsal et', train:'Hazırla', recruit:'İşə al',
    accept:'Qəbul et', reject:'Rədd et', apply:'Müraciət et', manage:'İdarə et',
    transfer:'Köçür', withdraw:'Çək', deposit:'Yatır',
    online:'Onlayn', offline:'Oflayn', loading:'Yüklənir...',
    noData:'Məlumat yoxdur', empty:'Boş',
  },
};
const LangCtx = createContext('tr');
function useLang() { return useContext(LangCtx); }
function useT() { const lang = useLang(); return (key) => (TRANSLATIONS[lang]||TRANSLATIONS.tr)[key] || (TRANSLATIONS.tr)[key] || key; }

// Mapping from nav item id → TRANSLATIONS key
const NAV_ITEM_TKEYS = {
  jobs:'jobs', economy:'general', farm:'farm', livestock:'livestock',
  market:'market', holdings:'companies', factory:'factory', mining:'mining',
  education:'education', daily:'tasks', army:'army', pvp:'fight', gang:'gang',
  spy:'intelligence', tournament:'tournament', crisis:'crisis', crime:'court',
  politics:'politics', yetkilerim:'authorities', election_events:'events', teamwar:'war',
  citygov:'governance', taxgov:'municipality', citybuild:'construction', map:'map',
  alliance:'alliance', world:'world', npcplayers:'npc', wiki:'wiki', chat:'chat',
  klanchat:'clan', dm:'messages', players:'players', social:'newsfeed',
  newspaper:'newspaper', football:'football', casino:'casino', duyurular:'announcements',
  leaderboard:'leaderboard', achievements:'achievements', premium:'premium',
  home:'home', admin:'admin',
};

const LEVELS = [
  {lvl:1,xp:0,title:'Yeni Vatandaş',icon:'🆕'},
  {lvl:2,xp:150,title:'Vatandaş',icon:'👤'},
  {lvl:3,xp:400,title:'Aktif Vatandaş',icon:'🧑'},
  {lvl:5,xp:1000,title:'Tanınan Kişi',icon:'⭐'},
  {lvl:10,xp:4000,title:'Etkin Üye',icon:'🌟'},
  {lvl:20,xp:15000,title:'Toplum Önderi',icon:'💫'},
  {lvl:30,xp:40000,title:'Güç Sahibi',icon:'👑'},
  {lvl:50,xp:120000,title:'Efsanevi',icon:'🔱'},
  {lvl:99,xp:500000,title:'Tanrısal',icon:'⚡'},
];

function getLevelInfo(xp=0) {
  let cur = LEVELS[0];
  let nxt = LEVELS[1];
  for (let i=0; i<LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; nxt = LEVELS[i+1] || LEVELS[i]; }
  }
  const pct = nxt.xp > cur.xp ? Math.min(100, Math.round((xp - cur.xp)/(nxt.xp - cur.xp)*100)) : 100;
  return { ...cur, next: nxt, pct };
}

// ═══════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─── Dark Mode Context ────────────────────────────────
const ThemeCtx = createContext({ dark: false, toggle: ()=>{} });
const useTheme = () => useContext(ThemeCtx);

// ═══════════════════════════════════════════════════════
// YARDIMCI
// ═══════════════════════════════════════════════════════
const fmt    = (n) => Number(n||0).toLocaleString('tr-TR');
const fmtWord = (n) => {
  n = Math.floor(n || 0);
  if (n < 0) return `-${fmtWord(-n)}`;
  if (n >= 1e15) return `₱${(n/1e15).toFixed(1)}Kt`;
  if (n >= 1e12) return `₱${(n/1e12).toFixed(1)}Tr`;
  if (n >= 1e9)  return `₱${(n/1e9).toFixed(1)}Mr`;
  if (n >= 1e6)  return `₱${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3)  return `₱${(n/1e3).toFixed(0)}Bin`;
  return `₱${fmt(n)}`;
};
const fmtM   = fmtWord;
const fmtUC  = (n) => `${fmt(n||0)} PG`;
const cls    = (...a) => a.filter(Boolean).join(' ');

// ─── Map / Territory helpers ───────────────────────────────────────────────
const getCentroid = (pts) => {
  const pairs = pts.split(' ').map(p => p.split(',').map(Number));
  const n = pairs.length;
  return { x: pairs.reduce((s,p)=>s+p[0],0)/n, y: pairs.reduce((s,p)=>s+p[1],0)/n };
};
const DEFAULT_DISTRICTS = [
  {id:'d1',  name:'Kuzey Park',    controlBy:'Halk',      controlColor:'#6B7280', crime:28, support:76, alarm:22, income:52000,  influence:65, population:42000, legalIncome:48000, illegalIncome:4000,  conflicts:[]},
  {id:'d2',  name:'Üniversite',    controlBy:'Aydınlar',  controlColor:'#3B82F6', crime:18, support:88, alarm:14, income:55000,  influence:90, population:38000, legalIncome:50000, illegalIncome:5000,  conflicts:[]},
  {id:'d3',  name:'Askeri Üs',     controlBy:'Ordu',      controlColor:'#EF4444', crime:10, support:62, alarm:88, income:48000,  influence:95, population:8000,  legalIncome:48000, illegalIncome:0,     conflicts:['police']},
  {id:'d4',  name:'Sanayi',        controlBy:'Şirketler', controlColor:'#10B981', crime:52, support:55, alarm:40, income:95000,  influence:58, population:30000, legalIncome:72000, illegalIncome:23000, conflicts:[]},
  {id:'d5',  name:'Tarihi Merkez', controlBy:'Tüccarlar', controlColor:'#EAB308', crime:42, support:72, alarm:35, income:85000,  influence:80, population:45000, legalIncome:65000, illegalIncome:20000, conflicts:[]},
  {id:'d6',  name:'Liman',         controlBy:'Halk',      controlColor:'#06B6D4', crime:65, support:48, alarm:55, income:120000, influence:62, population:35000, legalIncome:80000, illegalIncome:40000, conflicts:['cartel']},
  {id:'d7',  name:'Gecekondular',  controlBy:'Asi Grup',  controlColor:'#F59E0B', crime:80, support:35, alarm:72, income:38000,  influence:52, population:68000, legalIncome:22000, illegalIncome:16000, conflicts:['riot','cartel']},
  {id:'d8',  name:'İş Merkezi',    controlBy:'Şirketler', controlColor:'#10B981', crime:28, support:68, alarm:26, income:200000, influence:88, population:22000, legalIncome:185000,illegalIncome:15000, conflicts:[]},
  {id:'d9',  name:'Sahil',         controlBy:'Halk',      controlColor:'#06B6D4', crime:22, support:82, alarm:18, income:90000,  influence:74, population:35000, legalIncome:82000, illegalIncome:8000,  conflicts:[]},
  {id:'d10', name:'Banliyö',       controlBy:'Halk',      controlColor:'#6B7280', crime:38, support:70, alarm:32, income:48000,  influence:45, population:58000, legalIncome:42000, illegalIncome:6000,  conflicts:[]},
  {id:'d11', name:'Çarşı',         controlBy:'Tüccarlar', controlColor:'#EAB308', crime:48, support:64, alarm:45, income:78000,  influence:68, population:42000, legalIncome:62000, illegalIncome:16000, conflicts:[]},
  {id:'d12', name:'Güney Kent',    controlBy:'Halk',      controlColor:'#6B7280', crime:44, support:68, alarm:38, income:58000,  influence:50, population:52000, legalIncome:50000, illegalIncome:8000,  conflicts:[]},
];
const DISTRICT_POLYGONS = {
  d1:  '0,0 125,0 138,88 68,108 0,86',
  d2:  '125,0 258,0 270,82 192,106 138,88',
  d3:  '258,0 360,0 360,95 308,108 270,82',
  d4:  '0,86 68,108 78,208 22,230 0,210',
  d5:  '68,108 138,88 192,106 270,82 282,190 210,218 132,212 78,208',
  d6:  '270,82 308,108 360,95 360,205 326,220 282,205 282,190',
  d7:  '0,210 22,230 32,342 0,480',
  d8:  '22,230 78,208 132,212 210,218 220,332 148,348 78,340 32,342',
  d9:  '282,190 326,220 360,205 360,342 322,355 222,334 220,332',
  d10: '32,342 78,340 88,448 35,480 0,480',
  d11: '78,340 148,348 220,332 222,334 322,355 325,465 222,480 78,480 88,448',
  d12: '322,355 360,342 360,480 325,480 325,465',
};
const genId  = () => Math.random().toString(36).slice(2,10);
const sleep  = (ms) => new Promise(r => setTimeout(r, ms));
const timeAgo = (ts) => {
  if (!ts) return '';
  const d = Date.now() - ts;
  if (d < 60000)   return 'Az önce';
  if (d < 3600000) return `${Math.floor(d/60000)}dk önce`;
  if (d < 86400000)return `${Math.floor(d/3600000)}sa önce`;
  return `${Math.floor(d/86400000)}g önce`;
};

// ═══════════════════════════════════════════════════════
// FİREBASE HOOKS
// ═══════════════════════════════════════════════════════
function useLs(key, def) {
  const [s, set] = useState(() => {
    try { const v=localStorage.getItem('rep_'+key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  });
  useEffect(() => {
    const h = (e) => {
      if (e.detail?.key===key && e.detail.value != null) set(e.detail.value);
    };
    window.addEventListener('fb-sync', h);
    return () => window.removeEventListener('fb-sync', h);
  }, [key]);
  const write = useCallback((val) => {
    set(prev => {
      const v = typeof val==='function' ? val(prev) : val;
      localStorage.setItem('rep_'+key, JSON.stringify(v));
      if (window._fbPendingWrites) {
        window._fbPendingWrites[key] = v;
        window._fbScheduleFlush?.(key);
      }
      return v;
    });
  }, [key]);
  return [s, write];
}

function useOnlineCount() {
  const [cnt, setCnt] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rep_onlineCount')||'0'); } catch{return 0;}
  });
  useEffect(() => {
    const h = (e) => setCnt(e.detail?.count || 0);
    window.addEventListener('presence-updated', h);
    const fb = (e) => { if(e.detail?.key==='onlineCount') setCnt(e.detail.value); };
    window.addEventListener('fb-sync', fb);
    return () => { window.removeEventListener('presence-updated', h); window.removeEventListener('fb-sync', fb); };
  }, []);
  return cnt;
}

// ═══════════════════════════════════════════════════════
// FIREBASE AUTH HELPERS
// ═══════════════════════════════════════════════════════
async function fbLogin(email, password) {
  const auth = firebase.auth();
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}
async function fbRegister(email, password) {
  const auth = firebase.auth();
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  return cred.user;
}
async function fbLogout() {
  await firebase.auth().signOut();
}
async function loadUserProfile(uid) {
  if (!window._fb?.db) return null;
  const snap = await window._fb.db.collection('games').doc(GAME_ID)
    .collection('users').doc(uid).get();
  return snap.exists ? snap.data()?.userProfile : null;
}
async function saveUserProfile(uid, profile) {
  if (!window._fb?.db) return;
  await window._fb.db.collection('games').doc(GAME_ID)
    .collection('users').doc(uid)
    .set({ userProfile: profile }, { merge: true });
  localStorage.setItem('rep_userProfile', JSON.stringify(profile));
}

// ═══════════════════════════════════════════════════════
// AUTH EKRANI
// ═══════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [f, setF] = useState({ username:'', password:'', email:'', city:'İstanbul', gender:'male' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showPw, setShowPw] = useState(false);
  const u = (k,v) => setF(p => ({...p,[k]:v}));

  const getUsers = () => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return [];} };
  const saveUsers = (arr) => localStorage.setItem('rep_users', JSON.stringify(arr));

  const _hashPass = (raw) => { try { return btoa(unescape(encodeURIComponent(raw + '_us_salt_2024'))); } catch(e) { return raw; } };

  const doLogin = () => {
    if (!f.username.trim() || !f.password) { setErr('Kullanıcı adı / e-posta ve şifre gerekli'); return; }
    setLoading(true); setErr('');
    const uname = f.username.trim();
    const users = getUsers();
    if (uname === 'admin' && f.password === 'admin123') {
      let adminUser = users.find(u => u.username === 'admin' || u.role === 'admin');
      if (!adminUser) {
        adminUser = {
          id:'admin_001', uid:'admin_001', username:'admin', password:_hashPass('admin123'),
          email:'admin@understate.tr', city:'Ankara', gender:'erkek',
          money:999999999, bankMoney:999999999, bank:999999999, underCoin:99999,
          xp:999999, level:99, meritPoints:9999, loyaltyPoints:9999, hp:100,
          role:'admin', isAdmin:true, banned:false, premium:true, vip:true,
          educationLevel:'Profesör', educationCompleted:true, educationProgress:4000,
          eduPackage:true, eduPackageExpiry:Date.now()+365*24*60*60*1000,
          packages:{edu:true},
          registeredAt:Date.now(), lastOnline:Date.now(),
          loginStreak:1, lastLoginDate:new Date().toDateString(),
          createdAt:new Date().toLocaleDateString('tr-TR'),
          achievements:[], inventory:{}, badges:[],
          stats:{trades:0,messages:0,crimes:0,votes:0,battles:0,farm:0},
          skills:{trade:0,politics:0,crime:0,military:0,farming:0}
        };
      } else {
        adminUser = {...adminUser, role:'admin', banned:false, password:_hashPass('admin123'),
          money:999999999999, bankMoney:999999999999, bank:999999999999, underCoin:99999,
          educationLevel:'Profesör', educationCompleted:true, educationProgress:4000,
          eduPackage:true, eduPackageExpiry:Date.now()+365*24*60*60*1000,
          packages:{...(adminUser.packages||{}),edu:true}
        };
      }
      saveUsers(users.map(u=>(u.username==='admin'||u.role==='admin')?adminUser:u).concat(users.find(u=>u.username==='admin'||u.role==='admin')?[]:[adminUser]));
      localStorage.setItem('userId', adminUser.id);
      localStorage.setItem('rep_userProfile', JSON.stringify(adminUser));
      try {
        if(typeof io !== 'undefined' && !window._socket) {
          window._socket = io(window.location.origin, {reconnection:true,reconnectionAttempts:10,transports:['websocket','polling']});
          window._socket.on('connect', ()=>console.log('✓ Socket.IO bağlandı'));
          window._socket.on('onlineCount', (cnt)=>window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'onlineCount',value:cnt}})));
        }
        if(window._socket) window._socket.emit('playerJoin', {userId:adminUser.id, username:adminUser.username, level:adminUser.level||1, city:adminUser.city||'', gender:adminUser.gender||'erkek', money:adminUser.money||0, party:adminUser.party||null, gang:adminUser.gang||null});
      } catch(e) {}
      setLoading(false);
      onLogin(adminUser);
      return;
    }
    const hashedInput = _hashPass(f.password);
    const found = users.find(u => (u.username === uname || (u.email && u.email.toLowerCase() === uname.toLowerCase())) && (u.password === hashedInput || u.password === f.password));
    if (!found) { setErr('Kullanıcı adı veya şifre hatalı'); setLoading(false); return; }
    if (found.banned) { setErr('Bu hesap banlanmıştır: ' + (found.banReason||'Kural ihlali')); setLoading(false); return; }
    let finalUser = { ...found, lastOnline: Date.now(), online: true };
    if (found.password === f.password) { finalUser.password = hashedInput; }
    saveUsers(users.map(u => u.id === found.id ? finalUser : u));
    localStorage.setItem('userId', found.id);
    localStorage.setItem('rep_userProfile', JSON.stringify(finalUser));
    try {
      if(typeof io !== 'undefined' && !window._socket) {
        window._socket = io(window.location.origin, {reconnection:true,reconnectionAttempts:10,transports:['websocket','polling']});
        window._socket.on('connect', ()=>console.log('✓ Socket.IO bağlandı'));
        window._socket.on('onlineCount', (cnt)=>window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'onlineCount',value:cnt}})));
      }
      if(window._socket) window._socket.emit('playerJoin', {userId:found.id, username:found.username, level:finalUser.level||1, city:finalUser.city||'', gender:finalUser.gender||'erkek', money:finalUser.money||0, party:finalUser.party||null, gang:finalUser.gang||null});
    } catch(e) {}
    setLoading(false);
    onLogin(finalUser);
  };

  const doRegister = () => {
    if (!f.username.trim() || !f.password) { setErr('Kullanıcı adı ve şifre gerekli'); return; }
    if (f.username.length < 3) { setErr('Kullanıcı adı en az 3 karakter'); return; }
    if (f.password.length < 6) { setErr('Şifre en az 6 karakter'); return; }
    if (!f.email.trim()) { setErr('E-posta adresi zorunludur'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setErr('Geçerli bir e-posta adresi girin'); return; }
    setLoading(true); setErr('');
    const uname = f.username.trim();
    const users = getUsers();
    if (users.find(u => u.username === uname)) { setErr('Bu kullanıcı adı zaten alınmış'); setLoading(false); return; }
    const id = 'user_' + Date.now();
    const profile = {
      id, uid:id, username:uname, password:_hashPass(f.password),
      email:f.email.trim(), city:f.city, gender:f.gender==='female'?'kadin':'erkek',
      money:10000, bankMoney:5000, bank:5000, underCoin:50,
      xp:0, level:1, meritPoints:0, loyaltyPoints:100, hp:100,
      health:100, happiness:85, energy:100,
      role:'user', isAdmin:false, banned:false, premium:false, vip:false,
      registeredAt:Date.now(), lastOnline:Date.now(),
      loginStreak:1, lastLoginDate:new Date().toDateString(),
      createdAt:new Date().toLocaleDateString('tr-TR'),
      achievements:[], inventory:{}, badges:[],
      stats:{trades:0,messages:0,crimes:0,votes:0,battles:0,farm:0},
      skills:{trade:0,politics:0,crime:0,military:0,farming:0}
    };
    const updatedUsers = [...users, profile];
    saveUsers(updatedUsers);
    if(window._fb && window._fb.rtdb) {
      try {
        const gid = window._gameId || 'understate_main_server';
        window._fb.rtdb.ref('games/'+gid+'/realtime/users').set(updatedUsers);
      } catch(e) {}
    }
    localStorage.setItem('userId', id);
    localStorage.setItem('rep_userProfile', JSON.stringify(profile));
    try {
      if(typeof io !== 'undefined' && !window._socket) {
        window._socket = io(window.location.origin, {reconnection:true,reconnectionAttempts:10,transports:['websocket','polling']});
        window._socket.on('connect', ()=>console.log('✓ Socket.IO bağlandı'));
        window._socket.on('onlineCount', (cnt)=>window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'onlineCount',value:cnt}})));
      }
      if(window._socket) window._socket.emit('playerJoin', {userId:id, username:uname, level:1, city:f.city||'', gender:f.gender==='female'?'kadin':'erkek', money:10000, party:null, gang:null});
    } catch(e) {}
    setLoading(false);
    onLogin(profile);
  };

  const [barProgress, setBarProgress] = React.useState(0);
  useEffect(() => {
    if (!loading) { setBarProgress(0); return; }
    setBarProgress(0);
    const t = setTimeout(() => setBarProgress(100), 50);
    return () => clearTimeout(t);
  }, [loading]);

  const inputStyle = {
    width:'100%', padding:'0.85rem 1rem', borderRadius:'14px',
    border:'1px solid rgba(255,255,255,0.12)', background:'rgba(0,0,0,0.45)',
    color:'#E8EDF2', fontFamily:"'DM Sans',sans-serif", fontSize:'1rem',
    outline:'none', boxSizing:'border-box', backdropFilter:'blur(8px)',
    WebkitAppearance:'none'
  };

  return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',overflowY:'auto',minHeight:'100dvh'}}>
      {/* City background image */}
      <div style={{position:'fixed',inset:0,backgroundImage:'url(understate-bg.jpg)',backgroundSize:'cover',backgroundPosition:'center top',backgroundRepeat:'no-repeat',zIndex:0}} />
      {/* Dark overlay */}
      <div style={{position:'fixed',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.92) 100%)',zIndex:1}} />

      {/* Content */}
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100dvh',padding:'env(safe-area-inset-top,1rem) 0 env(safe-area-inset-bottom,1rem)'}}>

        {/* Logo block */}
        <div style={{textAlign:'center',marginBottom:'1.5rem',width:'100%',padding:'0 1.5rem'}}>
          {/* Logo görseli */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:'0.5rem'}}>
            <img src="favicon.jpg" alt="Politikon" style={{width:'clamp(90px,22vw,140px)',height:'clamp(90px,22vw,140px)',objectFit:'contain',borderRadius:'50%',boxShadow:'0 0 40px rgba(59,130,246,0.4)',border:'3px solid rgba(255,255,255,0.12)'}} />
          </div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.4rem,5vw,2.2rem)',fontWeight:900,letterSpacing:'0.15em',color:'#fff',textShadow:'0 2px 24px rgba(0,0,0,0.8)',textTransform:'uppercase',marginBottom:'0.4rem'}}>
            UOLİTİKON
          </div>
          {/* Animated loading bar */}
          <div style={{width:'100%',maxWidth:'320px',margin:'0 auto',height:'3px',background:'rgba(255,255,255,0.15)',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{height:'100%',width:loading?`${barProgress}%`:'0%',background:'linear-gradient(90deg,#3B82F6,#fff,#3B82F6)',borderRadius:'2px',transition:loading?'width 1.8s cubic-bezier(0.4,0,0.2,1)':'none',boxShadow:'0 0 8px rgba(59,130,246,0.8)'}} />
          </div>
          <div style={{color:'rgba(255,255,255,0.35)',fontSize:'0.65rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginTop:'0.4rem'}}>
            Şehir & Devlet Simülasyonu • v{APP_V}
          </div>
        </div>

        {/* Panel — full width on mobile */}
        <div style={{width:'100%',maxWidth:'480px',padding:'0 1rem'}}>
          <form onSubmit={e=>{e.preventDefault();tab==='login'?doLogin():doRegister();}} autoComplete="on">
          <div style={{background:'rgba(5,10,20,0.82)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'24px',padding:'1.75rem 1.5rem',backdropFilter:'blur(24px)',boxShadow:'0 24px 80px rgba(0,0,0,0.7)'}}>

            {/* Tabs */}
            <div style={{display:'flex',gap:'8px',marginBottom:'1.5rem'}}>
              {[['login','→ Giriş Yap'],['register','Kayıt Ol']].map(([v,l]) => (
                <button key={v} type="button" onClick={() => {setTab(v);setErr('');}}
                  style={{
                    flex:1, padding:'0.7rem', borderRadius:'8px',
                    cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                    fontWeight:700, fontSize:'0.88rem', letterSpacing:'0.03em',
                    position:'relative', overflow:'hidden',
                    border: tab===v ? '1.5px solid #00C9FF' : '1px solid rgba(255,255,255,0.1)',
                    background: tab===v ? 'rgba(0,201,255,0.12)' : 'rgba(255,255,255,0.04)',
                    color: tab===v ? '#00C9FF' : 'rgba(255,255,255,0.4)',
                    boxShadow: tab===v ? '0 2px 14px rgba(0,201,255,0.2)' : 'none',
                  }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Error */}
            {err && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',padding:'0.7rem 1rem',color:'#FCA5A5',fontSize:'0.85rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>⚠️ {err}</div>}

            {/* Login fields */}
            <div style={{marginBottom:'1rem'}}>
              <input style={inputStyle} type="text" placeholder="Kullanıcı adı veya e-posta" value={f.username} onChange={e=>u('username',e.target.value)} autoComplete="username" />
            </div>
            <div style={{marginBottom:'1.25rem',position:'relative'}}>
              <input style={inputStyle} type={showPw?'text':'password'} placeholder={tab==='register'?'Şifre (en az 6 karakter)':'Şifre'} value={f.password} onChange={e=>u('password',e.target.value)} autoComplete={tab==='register'?'new-password':'current-password'} />
              <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'1rem',padding:'4px'}}>{showPw?'🙈':'👁️'}</button>
            </div>

            {tab==='register' && <>
              <div style={{marginBottom:'1rem'}}>
                <input style={inputStyle} type="email" placeholder="E-posta adresi (zorunlu)" value={f.email} onChange={e=>u('email',e.target.value)} autoComplete="email" />
              </div>
              <div style={{marginBottom:'1rem'}}>
                <select value={f.city} onChange={e=>u('city',e.target.value)}
                  style={{...inputStyle,color:f.city?'#E8EDF2':'rgba(255,255,255,0.4)'}}>
                  {CITIES.map(c=><option key={c} value={c} style={{background:'#0B1527'}}>{c}</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
                {[['male','👨 Erkek'],['female','👩 Kadın']].map(([v,l])=>(
                  <button key={v} type="button" onClick={()=>u('gender',v)}
                    style={{padding:'0.75rem',borderRadius:'14px',border:`1px solid ${f.gender===v?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)'}`,background:f.gender===v?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.03)',color:f.gender===v?'#fff':'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer',fontSize:'0.9rem',transition:'all 0.15s'}}>
                    {l}
                  </button>
                ))}
              </div>
            </>}

            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'1rem',borderRadius:'8px',border:'2px solid transparent',background:loading?'rgba(208,0,0,0.3)':'#D00000',color:'#fff',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem',letterSpacing:'0.08em',cursor:loading?'not-allowed':'pointer',transition:'all 0.2s ease',textTransform:'uppercase',boxShadow:loading?'none':'0 4px 24px rgba(208,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
              {loading ? <>
                <div style={{width:'18px',height:'18px',border:'2.5px solid rgba(255,255,255,0.2)',borderTopColor:'rgba(255,255,255,0.7)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
                <span>Lütfen bekleyin...</span>
              </> : (tab==='login' ? '→ Giriş Yap' : '→ Hesap Oluştur')}
            </button>

          </div>
          </form>
        </div>

        <div style={{marginTop:'1.5rem',color:'rgba(255,255,255,0.2)',fontSize:'0.68rem',textAlign:'center',position:'relative',zIndex:1,letterSpacing:'0.08em'}}>
          🔒 Politikon • Güvenli Giriş
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AuthField({ label, type='text', placeholder, value, onChange, suffix }) {
  return (
    <div style={{marginBottom:'1rem'}}>
      <div style={{fontSize:'0.72rem',color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.4rem',fontWeight:700}}>{label}</div>
      <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',overflow:'hidden',transition:'all 0.2s'}}>
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          autoComplete={type==='password'?'current-password':type==='email'?'email':'username'}
          style={{flex:1,background:'none',border:'none',outline:'none',padding:'0.75rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px'}} />
        {suffix && <div style={{paddingRight:'0.75rem'}}>{suffix}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ORTAK BİLEŞENLER
// ═══════════════════════════════════════════════════════
function Modal({ title, onClose, children, maxW=440 }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(6px)',padding:'0'}}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{background:'rgba(10,18,36,0.99)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px 20px 0 0',padding:'1.5rem',width:'100%',maxWidth:maxW,maxHeight:'90dvh',overflowY:'auto',animation:'slideUp 0.25s ease'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.05rem',fontWeight:800,color:'#3B82F6',textTransform:'uppercase',letterSpacing:'0.06em'}}>{title}</div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)',border:'none',color:'#5A7089',borderRadius:'8px',padding:'0.3rem 0.6rem',cursor:'pointer',fontSize:'1.1rem'}}>✕</button>
        </div>
        {children}
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function Notif({ msg, type='info', onClose }) {
  useEffect(() => { const t=setTimeout(onClose,3500); return ()=>clearTimeout(t); }, []);
  const colors = { info:'#3B82F6', success:'#10B981', error:'#EF4444', gold:'#F59E0B' };
  const c = colors[type] || colors.info;
  return (
    <div style={{position:'fixed',bottom:'calc(70px + env(safe-area-inset-bottom, 0px))',left:'0.75rem',right:'0.75rem',background:'rgba(10,20,38,0.98)',border:`1px solid rgba(${c==='#3B82F6'?'59,130,246':c==='#10B981'?'16,185,129':c==='#EF4444'?'239,68,68':'245,158,11'},0.3)`,borderLeft:`3px solid ${c}`,borderRadius:'12px',padding:'0.75rem 1rem',zIndex:2000,fontSize:'0.85rem',fontWeight:600,color:'#E8EDF2',boxShadow:'0 8px 32px rgba(0,0,0,0.5)',backdropFilter:'blur(20px)',animation:'notifIn 0.25s ease',display:'flex',alignItems:'center',gap:'0.5rem'}}>
      <span>{msg}</span>
      <button onClick={onClose} style={{marginLeft:'auto',background:'none',border:'none',color:'#5A7089',cursor:'pointer',fontSize:'1rem'}}>✕</button>
      <style>{`@keyframes notifIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function Spinner({ size=20 }) {
  return <div style={{width:size,height:size,border:'2.5px solid rgba(59,130,246,0.2)',borderTopColor:'#3B82F6',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />;
}

function ProgressBar({ pct, color='#3B82F6', h=6 }) {
  return (
    <div style={{background:'rgba(0,0,0,0.08)',borderRadius:'100px',height:h,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${Math.max(0,Math.min(100,pct))}%`,background:`linear-gradient(90deg,${color},${color}cc)`,borderRadius:'100px',transition:'width 0.5s ease'}} />
    </div>
  );
}

function Tag({ children, color='blue' }) {
  const map = { blue:'rgba(59,130,246,0.12) #60A5FA rgba(59,130,246,0.25)', green:'rgba(16,185,129,0.12) #10B981 rgba(16,185,129,0.25)', red:'rgba(239,68,68,0.12) #FCA5A5 rgba(239,68,68,0.25)', gold:'rgba(245,158,11,0.12) #F59E0B rgba(245,158,11,0.25)', gray:'rgba(255,255,255,0.06) #5A7089 rgba(255,255,255,0.1)', violet:'rgba(139,92,246,0.12) #A78BFA rgba(139,92,246,0.25)' };
  const [bg, tc, bc] = (map[color]||map.blue).split(' ');
  return <span style={{display:'inline-block',padding:'2px 8px',borderRadius:'6px',fontSize:'0.67rem',fontWeight:700,background:bg,color:tc,border:`1px solid ${bc}`}}>{children}</span>;
}

function Card({ children, style={}, onClick }) {
  const { dark } = useTheme();
  return <div style={{
    background: dark ? '#1E293B' : '#FFFFFF',
    border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
    borderRadius:'16px', padding:'1rem',
    boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
    ...style
  }} onClick={onClick}>{children}</div>;
}

const VIP_FRAMES = {
  rainbow: {border:'3px solid transparent',backgroundImage:'linear-gradient(#0B1527,#0B1527),linear-gradient(135deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',backgroundOrigin:'border-box',backgroundClip:'padding-box,border-box',animation:'vipRainbow 3s linear infinite'},
  fire:    {border:'3px solid transparent',backgroundImage:'linear-gradient(#0B1527,#0B1527),linear-gradient(135deg,#FF4500,#FF8C00,#FFD700)',backgroundOrigin:'border-box',backgroundClip:'padding-box,border-box',animation:'vipFire 1.5s ease-in-out infinite'},
  ice:     {border:'3px solid transparent',backgroundImage:'linear-gradient(#0B1527,#0B1527),linear-gradient(135deg,#00BFFF,#87CEEB,#E0FFFF)',backgroundOrigin:'border-box',backgroundClip:'padding-box,border-box',animation:'vipIce 2s ease-in-out infinite'},
  gold:    {border:'3px solid transparent',backgroundImage:'linear-gradient(#0B1527,#0B1527),linear-gradient(135deg,#FFD700,#FFA500,#FFD700)',backgroundOrigin:'border-box',backgroundClip:'padding-box,border-box',animation:'vipGold 2s ease-in-out infinite'},
  neon:    {border:'3px solid #00FF64',boxShadow:'0 0 8px #00FF64,0 0 16px rgba(0,255,100,0.4)',animation:'vipNeon 1.2s ease-in-out infinite'},
  violet:  {border:'3px solid transparent',backgroundImage:'linear-gradient(#0B1527,#0B1527),linear-gradient(135deg,#8B5CF6,#A78BFA,#7C3AED)',backgroundOrigin:'border-box',backgroundClip:'padding-box,border-box',animation:'vipViolet 2s ease-in-out infinite'},
  heart:   {border:'3px solid transparent',backgroundImage:'linear-gradient(#0B1527,#0B1527),linear-gradient(135deg,#EC4899,#F43F5E,#EC4899)',backgroundOrigin:'border-box',backgroundClip:'padding-box,border-box',animation:'vipHeart 1.5s ease-in-out infinite'},
};

function Avatar({ profile, size=40 }) {
  if (!profile) return <div style={{width:size,height:size,borderRadius:'50%',background:'rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.45,flexShrink:0}}>👤</div>;
  const icon = profile.gender==='female' ? '👩' : '👨';
  const photoSrc = profile.avatarUrl || profile.photoUrl || profile.avatar || null;
  const frameStyle = profile.premium && profile.vipFrame ? (VIP_FRAMES[profile.vipFrame]||{}) : {};
  const borderDefault = profile.premium ? '2px solid rgba(245,158,11,0.5)' : '2px solid rgba(59,130,246,0.3)';
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#1a3a5c,#0a1a2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.45,border:borderDefault,flexShrink:0,overflow:'hidden',position:'relative',...frameStyle}}>
      {photoSrc ? <img src={photoSrc} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none';}} /> : icon}
    </div>
  );
}

function Btn({ children, onClick, variant='primary', size='md', disabled=false, style={} }) {
  const [hov, setHov]     = useState(false);
  const [press, setPress] = useState(false);

  const active = press && !disabled;
  const hover  = hov   && !disabled && !press;

  const base = {
    borderRadius:'8px', fontFamily:"'DM Sans',sans-serif", fontWeight:700,
    cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.45:1,
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    gap:'0.35rem', letterSpacing:'0.03em', userSelect:'none', WebkitUserSelect:'none',
    WebkitTapHighlightColor:'transparent', border:'none',
    position:'relative', overflow:'hidden',
    transform: active ? 'scale(0.94)' : hover ? 'translateY(-2px)' : 'none',
    transition: active ? 'transform 0.06s ease,filter 0.06s ease,box-shadow 0.1s ease'
                       : 'transform 0.15s ease,filter 0.15s ease,box-shadow 0.18s ease,background 0.18s ease',
    filter: active ? 'brightness(0.86)' : hover ? 'brightness(1.1)' : 'none',
  };

  const vars = {
    primary: {
      background:'#D00000', color:'#fff',
      boxShadow: active ? '0 1px 6px rgba(208,0,0,0.25)'
                : hover  ? '0 8px 28px rgba(208,0,0,0.55)'
                         : '0 4px 16px rgba(208,0,0,0.35)',
    },
    secondary: {
      background: hover ? 'rgba(0,201,255,0.18)' : 'rgba(0,201,255,0.08)',
      color:'#00C9FF', border:'1.5px solid #00C9FF',
      boxShadow: hover ? '0 4px 18px rgba(0,201,255,0.3)' : 'none',
    },
    ghost: {
      background: hover ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
      color: hover ? '#E2E8F0' : '#94A3B8',
      border:`1px solid ${hover?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.1)'}`,
    },
    gold: {
      background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#0F172A',
      boxShadow: active ? '0 1px 6px rgba(245,158,11,0.2)'
                : hover  ? '0 7px 22px rgba(245,158,11,0.5)'
                         : '0 3px 12px rgba(245,158,11,0.3)',
    },
    green: {
      background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff',
      boxShadow: active ? '0 1px 6px rgba(16,185,129,0.2)'
                : hover  ? '0 7px 22px rgba(16,185,129,0.5)'
                         : '0 3px 12px rgba(16,185,129,0.3)',
    },
    red: {
      background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff',
      boxShadow: active ? '0 1px 6px rgba(239,68,68,0.2)'
                : hover  ? '0 7px 22px rgba(239,68,68,0.5)'
                         : '0 3px 12px rgba(239,68,68,0.3)',
    },
    danger: {
      background: hover ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
      color:'#FCA5A5',
      border:`1px solid ${hover?'rgba(239,68,68,0.4)':'rgba(239,68,68,0.2)'}`,
    },
  };

  const sizes = {
    sm:   {padding:'0.32rem 0.75rem', fontSize:'0.75rem', minHeight:'30px'},
    md:   {padding:'0.62rem 1.2rem',  fontSize:'0.87rem', minHeight:'38px'},
    lg:   {padding:'0.85rem 1.5rem',  fontSize:'1rem',    minHeight:'46px'},
    full: {padding:'0.68rem 1rem',    fontSize:'0.87rem', width:'100%', minHeight:'42px'},
  };

  return (
    <button
      style={{...base,...(vars[variant]||vars.primary),...(sizes[size]||sizes.md),...style}}
      onClick={disabled?undefined:onClick}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>{setHov(false);setPress(false);}}
      onMouseDown={()=>!disabled&&setPress(true)}
      onMouseUp={()=>setPress(false)}
      onTouchStart={()=>!disabled&&setPress(true)}
      onTouchEnd={()=>setPress(false)}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════
function Header({ profile, notifCount, onNotif, page, onNavigate }) {
  const onlineCnt = useOnlineCount();
  const lvl = getLevelInfo(profile?.xp || 0);
  const { dark, toggle } = useTheme();
  const T = useT();
  const [parties] = useLs('parties', []);
  const [gangs] = useLs('gangs', []);
  const uid = profile?.uid;
  const myParty = uid ? parties.find(p => p.leaderId===uid || (p.members||[]).includes(uid)) : null;
  const myGang  = uid ? gangs.find(g => g.leaderId===uid || (g.members||[]).includes(uid)) : null;
  const orgLabel = myParty ? `🏛️ ${myParty.name}` : myGang ? `💀 ${myGang.name}` : null;
  return (
    <div style={{position:'sticky',top:0,zIndex:100,background: dark ? '#0F172A' : '#FFFFFF',borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.4)' : '0 1px 8px rgba(0,0,0,0.06)'}} >
      {/* Ticker */}
      <div style={{height:'22px',background:'rgba(0,0,0,0.4)',borderBottom:'1px solid rgba(255,255,255,0.04)',overflow:'hidden',display:'flex',alignItems:'center'}}>
        <div style={{whiteSpace:'nowrap',fontSize:'0.58rem',fontFamily:"'JetBrains Mono',monospace",color:'#94A3B8',animation:'ticker 35s linear infinite',paddingLeft:'100%'}}>
          🟢 {onlineCnt} çevrimiçi oyuncu &nbsp;•&nbsp; 💰 TECH +2.4% ENERGY -1.1% BANK +3.2% &nbsp;•&nbsp; 🏛️ Parlamento: Anayasa değişikliği oylaması &nbsp;•&nbsp; ⚔️ Aktif çatışma: Kuzey bölgesi &nbsp;•&nbsp; 🕵️ İstihbarat: Gizli holding soruşturması &nbsp;•&nbsp; 🎓 Yeni üniversite kuruldu: Başvurular açık &nbsp;•&nbsp; 💼 İşsizlik oranı %12.4 &nbsp;•&nbsp; 🏗️ İstanbul'da 3 yeni inşaat ruhsatı &nbsp;•&nbsp; 👨‍👩‍👧 Yeni bir aile kuruldu &nbsp;•&nbsp; 🗳️ Seçim tarihi yaklaşıyor: 30 gün kaldı &nbsp;•&nbsp; 📈 Borsa rekor kırdı: 10 yılın en yüksek değeri &nbsp;•&nbsp; 🚔 Organize suç soruşturması genişledi &nbsp;•&nbsp; 🟢 {onlineCnt} çevrimiçi oyuncu &nbsp;•&nbsp; 💰 TECH +2.4% ENERGY -1.1%
        </div>
      </div>
      {/* Main header */}
      <div style={{display:'flex',alignItems:'center',padding:'0.4rem 0.75rem',gap:'0.55rem'}}>
        {/* Avatar + İsim — tıklanınca profil sayfasına git */}
        <div onClick={()=>onNavigate&&onNavigate('profile')} style={{display:'flex',alignItems:'center',gap:'0.5rem',flex:1,minWidth:0,cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
          <Avatar profile={profile} size={38} />
          <div style={{display:'flex',flexDirection:'column',justifyContent:'center',minWidth:0}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:'0.78rem',fontWeight:700,color: dark ? '#E2E8F0' : '#1E293B',lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {profile?.username || '—'}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'0.3rem',flexWrap:'nowrap',overflow:'hidden'}}>
              <span style={{fontSize:'0.57rem',color:'#F59E0B',fontWeight:700,whiteSpace:'nowrap'}}>{lvl.title}</span>
              {orgLabel && <>
                <span style={{fontSize:'0.5rem',color: dark ? '#475569' : '#94A3B8'}}>•</span>
                <span style={{fontSize:'0.57rem',color: dark ? '#94A3B8' : '#64748B',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{orgLabel}</span>
              </>}
            </div>
          </div>
        </div>
        {/* Para */}
        <div style={{textAlign:'center',padding:'0.18rem 0.45rem',background: dark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'8px',flexShrink:0}}>
          <div style={{fontSize:'0.42rem',color:'#6EE7B7',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:700}}>{T('money')}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.67rem',fontWeight:700,color:'#10B981',lineHeight:1.3}}>{fmtWord(profile?.money)}</div>
        </div>
        {/* PoliGold */}
        <div style={{textAlign:'center',padding:'0.18rem 0.45rem',background: dark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'8px',flexShrink:0}}>
          <div style={{fontSize:'0.42rem',color:'#C4B5FD',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:700}}>{T('uc')}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.67rem',fontWeight:700,color:'#A78BFA',lineHeight:1.3}}>{fmt(profile?.underCoin||0)}</div>
        </div>
        {/* Tema + Bildirim */}
        <button onClick={toggle} title={dark?'Aydınlık mod':'Karanlık mod'} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.32rem 0.48rem',cursor:'pointer',fontSize:'0.9rem',color:'#8BA0B5',flexShrink:0}}>
          {dark ? '☀️' : '🌙'}
        </button>
        <button onClick={onNotif} style={{position:'relative',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.32rem 0.48rem',cursor:'pointer',fontSize:'0.9rem',color:'#8BA0B5',flexShrink:0}}>
          🔔
          {notifCount > 0 && <span style={{position:'absolute',top:'-4px',right:'-4px',background:'#EF4444',color:'#fff',fontSize:'0.52rem',fontWeight:900,minWidth:'14px',height:'14px',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 2px',border:'2px solid #06080F'}}>{notifCount}</span>}
        </button>
      </div>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ALT NAVİGASYON (5 Ana Tab + Grid Alt Menü)
// ═══════════════════════════════════════════════════════
const NAV_GROUPS = [
  {
    id: 'home',
    icon: '🏠',
    label: 'Ana Sayfa',
    rgb: '59,130,246',
    direct: true,
  },
  {
    id: 'ekonomi',
    icon: '💰', svgIcon: 'money',
    label: 'Ekonomi',
    rgb: '16,185,129',
    items: [
      { id:'jobs',       icon:'💼', svgIcon:'briefcase',  label:'İşler',        rgb:'16,185,129' },
      { id:'economy',    icon:'📊', svgIcon:'chart',       label:'Genel',         rgb:'16,185,129' },
      { id:'farm',       icon:'🌾',                        label:'Tarım',         rgb:'34,197,94'  },
      { id:'livestock',  icon:'🐄',                        label:'Hayvancılık',   rgb:'16,185,129' },
      { id:'market',     icon:'🛒',                        label:'Market',        rgb:'236,72,153' },
      { id:'holdings',   icon:'🏢',                        label:'Şirketler',     rgb:'245,158,11' },
      { id:'factory',    icon:'🏭', svgIcon:'factory',    label:'Fabrika',       rgb:'245,158,11' },
      { id:'mining',     icon:'⛏️',                       label:'Maden',         rgb:'161,97,40'  },
      { id:'education',  icon:'🎓', svgIcon:'education',  label:'Eğitim',        rgb:'59,130,246' },
      { id:'daily',      icon:'📅',                        label:'Görevler',      rgb:'245,158,11' },
    ],
  },
  {
    id: 'savas',
    icon: '⚔️',
    label: 'Savaş',
    rgb: '239,68,68',
    items: [
      { id:'army',       icon:'⚔️',                   label:'Ordu',      rgb:'239,68,68'  },
      { id:'pvp',        icon:'🥊',                   label:'Dövüş',     rgb:'239,68,68'  },
      { id:'gang',       icon:'🔫', svgIcon:'weapon', label:'Çete',      rgb:'239,68,68'  },
      { id:'spy',        icon:'🕵️',                  label:'İstihbarat',rgb:'139,92,246' },
      { id:'tournament', icon:'🎯',                   label:'Turnuva',   rgb:'239,68,68'  },
      { id:'crisis',     icon:'🚨',                   label:'Kriz',      rgb:'239,68,68'  },
      { id:'crime',      icon:'⚖️', svgIcon:'law',   label:'Mahkeme',   rgb:'239,68,68'  },
    ],
  },
  {
    id: 'devlet',
    icon: '🏛️', svgIcon: 'government',
    label: 'Devlet',
    rgb: '245,200,66',
    items: [
      { id:'politics',        icon:'🏛️', svgIcon:'government', label:'Siyaset',   rgb:'245,200,66' },
      { id:'yetkilerim',      icon:'⭐',                        label:'Yetkilerim', rgb:'245,200,66' },
      { id:'election_events', icon:'🚨',                        label:'Olaylar',   rgb:'239,68,68'  },
      { id:'teamwar',         icon:'⚔️',                       label:'Savaş',     rgb:'239,68,68'  },
      { id:'citygov',         icon:'🏙️',                       label:'Yönetim',   rgb:'99,102,241' },
      { id:'taxgov',          icon:'🏦', svgIcon:'bank',        label:'Belediye',   rgb:'245,158,11' },
      { id:'citybuild',       icon:'🏗️',                       label:'İnşaat',    rgb:'245,158,11' },
      { id:'map',             icon:'🗺️', svgIcon:'map',         label:'Harita',     rgb:'0,200,100'  },
      { id:'alliance',        icon:'🤝',                        label:'İttifak',    rgb:'96,165,250' },
      { id:'world',           icon:'🌍',                        label:'Dünya',      rgb:'59,130,246' },
      { id:'npcplayers',      icon:'🤖',                        label:'NPC',        rgb:'99,102,241' },
      { id:'wiki',            icon:'📚',                        label:'Wiki',       rgb:'59,130,246' },
    ],
  },
  {
    id: 'sosyal',
    icon: '👥',
    label: 'Sosyal',
    rgb: '139,92,246',
    items: [
      { id:'chat',        icon:'💬', label:'Sohbet',    rgb:'139,92,246' },
      { id:'klanchat',    icon:'🔒', label:'Klan',      rgb:'139,92,246' },
      { id:'dm',          icon:'📬', label:'Mesaj',     rgb:'96,165,250' },
      { id:'players',     icon:'👥', label:'Oyuncular', rgb:'59,130,246' },
      { id:'social',      icon:'📱', label:'Sosyal',    rgb:'167,139,250'},
      { id:'newspaper',   icon:'📰', label:'Gazete',    rgb:'96,165,250' },
      { id:'football',    icon:'⚽', label:'Futbol',    rgb:'16,185,129' },
      { id:'casino',      icon:'🎰', label:'Kumarhane', rgb:'255,215,0'  },
      { id:'duyurular',   icon:'📣', label:'Duyurular', rgb:'245,158,11' },
      { id:'leaderboard', icon:'🏆', label:'Sıralama',  rgb:'255,215,0'  },
      { id:'achievements',icon:'🎖️', label:'Başarılar', rgb:'255,215,0' },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.direct ? [{ id: g.id, icon: g.icon, label: g.label, rgb: g.rgb }] : (g.items || []));

function getActiveGroup(page) {
  if (page === 'home') return 'home';
  for (const g of NAV_GROUPS) {
    if (g.direct) continue;
    if (g.items && g.items.some(i => i.id === page)) return g.id;
  }
  return null;
}

const NAV_GROUP_TKEYS = { home:'home', ekonomi:'economy', savas:'battle', devlet:'state', sosyal:'social' };

function BottomNav({ page, onChange, items, notifMap={} }) {
  const { dark } = useTheme();
  const T = useT();
  const [openGroup, setOpenGroup] = useState(null);
  const activeGroup = getActiveGroup(page);

  // Build groups — add extra tabs (e.g. Admin) from `items` prop if not already in groups
  const allGroupIds = new Set(NAV_GROUPS.flatMap(g => g.direct ? [g.id] : (g.items||[]).map(i=>i.id)));
  const extraItems  = (items||[]).filter(i => !allGroupIds.has(i.id));
  const extraGroups = extraItems.map(i => ({ ...i, direct: true }));
  const allGroups   = [...NAV_GROUPS, ...extraGroups];

  const handleTabClick = (group) => {
    if (group.direct) {
      setOpenGroup(null);
      onChange(group.id);
      return;
    }
    setOpenGroup(prev => prev === group.id ? null : group.id);
  };

  const handleItemClick = (itemId) => {
    setOpenGroup(null);
    onChange(itemId);
  };

  const currentGroup = allGroups.find(g => g.id === openGroup);

  const bg     = dark ? '#0F172A' : '#FFFFFF';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)';
  const shadow = dark ? '0 -4px 16px rgba(0,0,0,0.4)'     : '0 -4px 16px rgba(0,0,0,0.08)';
  const navH   = 64;

  return (
    <>
      {openGroup && currentGroup && (
        <>
          {/* Backdrop — tıklayınca menüyü kapat */}
          <div
            onClick={() => setOpenGroup(null)}
            style={{position:'fixed',inset:0,zIndex:890,background:'rgba(0,0,0,0.5)'}}
          />
          {/* Grid menü — app container ile hizalı */}
          <div style={{
            position:'fixed',
            bottom: navH,
            left:'50%',
            transform:'translateX(-50%)',
            width:'min(100vw, 480px)',
            zIndex:895,
            background: dark ? '#111827' : '#F8FAFC',
            borderTop:`2px solid rgba(${currentGroup.rgb},0.45)`,
            borderRadius:'18px 18px 0 0',
            padding:'14px 12px 10px',
            boxShadow:'0 -8px 40px rgba(0,0,0,0.5)',
            maxHeight:'56vh',
            overflowY:'auto',
          }}>
            {/* Başlık */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px',paddingLeft:'2px'}}>
              <span style={{fontSize:'0.95rem',fontWeight:800,color: dark ? '#E2E8F0' : '#1E293B',fontFamily:"'Syne',sans-serif",letterSpacing:'0.04em'}}>
                {currentGroup.icon}&nbsp;{NAV_GROUP_TKEYS[currentGroup.id]?T(NAV_GROUP_TKEYS[currentGroup.id]):currentGroup.label}
              </span>
              <button
                onClick={() => setOpenGroup(null)}
                style={{background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',border:'none',borderRadius:'8px',color: dark ? '#94A3B8' : '#64748B',fontSize:'0.9rem',cursor:'pointer',padding:'4px 10px',lineHeight:1}}
              >✕</button>
            </div>
            {/* İtem ızgarası */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'7px'}}>
              {(currentGroup.items||[]).map(it => {
                const active = page === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => handleItemClick(it.id)}
                    style={{
                      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                      gap:'5px',padding:'11px 4px',borderRadius:'13px',
                      border:`1px solid ${active ? `rgba(${it.rgb},0.5)` : dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      background: active ? `rgba(${it.rgb},0.18)` : dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      cursor:'pointer',WebkitTapHighlightColor:'transparent',
                      transition:'all 0.12s',position:'relative',
                    }}
                  >
                    {it.svgIcon
                      ? <SvgIcon name={it.svgIcon} size={26} style={{filter:active?`drop-shadow(0 0 5px rgba(${it.rgb},0.7))`:'none'}} />
                      : <span style={{fontSize:'1.45rem',lineHeight:1,filter:active?`drop-shadow(0 0 5px rgba(${it.rgb},0.7))`:'none'}}>{it.icon}</span>}
                    <span style={{fontSize:'0.58rem',fontWeight:700,color:active?`rgb(${it.rgb})`:dark?'#94A3B8':'#64748B',textAlign:'center',lineHeight:1.2,letterSpacing:'0.01em'}}>{T(NAV_ITEM_TKEYS[it.id]||it.id)||it.label}</span>
                    {notifMap[it.id] > 0 && (
                      <span style={{position:'absolute',top:3,right:5,background:'#EF4444',color:'#fff',fontSize:'0.45rem',fontWeight:900,minWidth:'13px',height:'13px',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 2px'}}>
                        {notifMap[it.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Ana nav çubuğu */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:900,background:bg,borderTop:border,paddingBottom:'env(safe-area-inset-bottom,0px)',boxShadow:shadow}}>
        <div style={{display:'flex',height:`${navH}px`,maxWidth:'480px',margin:'0 auto'}}>
          {allGroups.map(group => {
            const isActive = group.direct ? page === group.id : activeGroup === group.id;
            const isOpen   = openGroup === group.id;
            const hasNotif = !group.direct && (group.items||[]).some(i => notifMap[i.id] > 0);
            const lit      = isActive || isOpen;
            return (
              <button
                key={group.id}
                onClick={() => handleTabClick(group)}
                style={{
                  flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  gap:'3px',border:'none',
                  background: isOpen ? `rgba(${group.rgb},0.1)` : 'transparent',
                  cursor:'pointer',WebkitTapHighlightColor:'transparent',
                  position:'relative',transition:'background 0.15s',
                  borderTop: lit ? `2px solid rgb(${group.rgb})` : '2px solid transparent',
                }}
              >
                {group.svgIcon
                  ? <SvgIcon name={group.svgIcon} size={22} style={{transform:lit?'scale(1.12)':'scale(1)',transition:'transform 0.15s',filter:lit?`drop-shadow(0 0 5px rgba(${group.rgb},0.7))`:'none'}} />
                  : <span style={{fontSize:'1.25rem',lineHeight:1,transform:lit?'scale(1.12)':'scale(1)',transition:'transform 0.15s',filter:lit?`drop-shadow(0 0 5px rgba(${group.rgb},0.7))`:'none'}}>{group.icon}</span>}
                <span style={{fontSize:'0.5rem',fontWeight:800,letterSpacing:'0.04em',textTransform:'uppercase',color:lit?`rgb(${group.rgb})`:dark?'#475569':'#94A3B8',transition:'color 0.15s'}}>{NAV_GROUP_TKEYS[group.id]?T(NAV_GROUP_TKEYS[group.id]):group.label}</span>
                {hasNotif && <span style={{position:'absolute',top:5,right:'16%',width:'6px',height:'6px',borderRadius:'50%',background:'#EF4444'}} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// ANA SAYFA — PLATFORM DESIGN
// ═══════════════════════════════════════════════════════
function HomePage({ profile, onNavigate }) {
  const lvl = getLevelInfo(profile?.xp || 0);
  const onlineCnt = useOnlineCount();
  const [news] = useLs('liveNews', []);
  const [activity] = useLs('activityFeed', []);
  const [announcements] = useLs('announcements', []);
  const [annModal, setAnnModal] = useState(null);
  const [dailyState, setDailyState] = useLs('dailyTaskProgress', {});
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportText, setSupportText] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const money = profile?.money || 0;
  const { dark } = useTheme();
  const playerLevel = profile?.level || 1;
  const uid = profile?.uid || profile?.id;

  const sendSupportMsg = () => {
    const t = supportText.trim();
    if (!t) return;
    const msg = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2,7),
      from: profile?.username || 'Anonim',
      userId: profile?.uid || '',
      text: t,
      ts: Date.now(),
      status: 'pending',
      replies: [],
    };
    try {
      const prev = JSON.parse(localStorage.getItem('rep_supportMsgs')||'[]');
      const upd = Array.isArray(prev) ? [...prev, msg] : [msg];
      localStorage.setItem('rep_supportMsgs', JSON.stringify(upd));
      window.dispatchEvent(new CustomEvent('fb-sync', {detail:{key:'supportMsgs',value:upd}}));
      if (window._fb?.rtdb && window._gameId) {
        window._fb.rtdb.ref(`games/${window._gameId}/realtime/supportMsgs`)
          .transaction(cur => { const arr=Array.isArray(cur)?cur:[]; return [...arr,msg].slice(-500); });
      }
    } catch(e) {}
    setSupportSent(true);
    setSupportText('');
    setTimeout(() => { setSupportSent(false); setSupportOpen(false); }, 2200);
  };

  const fmtShort = (n) => {
    const abs = Math.abs(n||0);
    if (abs>=1e9)  return (n/1e9).toFixed(1)+'B';
    if (abs>=1e6)  return (n/1e6).toFixed(1)+'M';
    if (abs>=1e3)  return (n/1e3).toFixed(1)+'K';
    return String(Math.floor(n||0));
  };

  const todayKey = new Date().toDateString();

  const ALL_TASKS = [
    { id:'login',     name:'Günlük Giriş Yap',       page:'home',      icon:'📅', minLv:1,  maxLv:99, target:1,  reward:500,   xpReward:50,  unit:'giriş' },
    { id:'job5',      name:'İş Yap (5 kez)',           page:'jobs',      icon:'💼', minLv:1,  maxLv:99, target:5,  reward:2000,  xpReward:100, unit:'iş' },
    { id:'chat3',     name:'Sohbete Katıl (3 mesaj)',  page:'chat',      icon:'💬', minLv:1,  maxLv:99, target:3,  reward:1000,  xpReward:75,  unit:'mesaj' },
    { id:'trade1',    name:'Borsa İşlemi Yap',         page:'economy',   icon:'📈', minLv:2,  maxLv:99, target:1,  reward:5000,  xpReward:150, unit:'işlem' },
    { id:'farm1',     name:'Tarım Hasatı Yap',         page:'economy',   icon:'🌾', minLv:2,  maxLv:99, target:1,  reward:3000,  xpReward:120, unit:'hasat' },
    { id:'gang1',     name:'Çeteye Katıl/Savaş',       page:'gang',      icon:'⚔️', minLv:1,  maxLv:5,  target:1,  reward:2500,  xpReward:100, unit:'aksiyon' },
    { id:'vote1',     name:'Siyasi Oy Kullan',         page:'politics',  icon:'🗳️', minLv:3,  maxLv:99, target:1,  reward:3000,  xpReward:200, unit:'oy' },
    { id:'factory1',  name:'Fabrika Üret (1 kez)',      page:'factory',   icon:'🏭', minLv:5,  maxLv:99, target:1,  reward:8000,  xpReward:250, unit:'üretim' },
    { id:'spy1',      name:'İstihbarat Operasyonu',    page:'spy',       icon:'🕵️', minLv:5,  maxLv:99, target:1,  reward:5000,  xpReward:200, unit:'operasyon' },
    { id:'build1',    name:'İnşaat Başlat',            page:'citybuild', icon:'🏗️', minLv:3,  maxLv:99, target:1,  reward:7000,  xpReward:220, unit:'inşaat' },
  ];

  const todayProgress = dailyState[todayKey] || {};

  const claimTask = (task, e) => {
    e.stopPropagation();
    const prog = todayProgress[task.id] || 0;
    if (prog < task.target) { onNavigate(task.page); return; }
    if (todayProgress[task.id+'_claimed']) return;
    const newState = { ...dailyState, [todayKey]: { ...todayProgress, [task.id+'_claimed']:true } };
    setDailyState(newState);
    try {
      const p = JSON.parse(localStorage.getItem('rep_userProfile')||'{}');
      const np = {...p, money:(p.money||0)+task.reward, xp:(p.xp||0)+task.xpReward};
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      window.dispatchEvent(new CustomEvent('user-profile-updated'));
    } catch(e){}
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const s = JSON.parse(localStorage.getItem('rep_dailyTaskProgress')||'{}');
    const todayS = s[today] || {};
    if (!todayS['login']) {
      const newS = {...s, [today]: {...todayS, login:1}};
      localStorage.setItem('rep_dailyTaskProgress', JSON.stringify(newS));
      setDailyState(newS);
    }
  }, []);

  const taskList = ALL_TASKS.filter(t => playerLevel >= t.minLv && playerLevel <= t.maxLv).slice(0, 4);

  const dynamicActivity = [
    { text:`${profile?.username||'Sen'} oyuna giriş yaptı`, color:'#3B82F6', time:'Az önce' },
    { text:'Şehirde yeni bir bina inşa edildi', color:'#F59E0B', time:'5dk' },
    { text:'Çete savaşı başladı', color:'#EF4444', time:'12dk' },
    { text:`Lv.${playerLevel} — ${lvl.title}`, color:'#10B981', time:'1sa' },
    { text:'Borsa: TECH +2.4%', color:'#8B5CF6', time:'2sa' },
  ];
  const recentActivity = (Array.isArray(activity) && activity.length > 0 ? activity : dynamicActivity).slice(0, 5);

  const defaultAnn = [
    {id:'ann1',title:'Seçim Krizi!',body:'Seçim sonuçları tartışmalı, siyasi gerilim tırmanıyor.',category:'Siyaset',icon:'🏛️',ts:Date.now()-3600000},
    {id:'ann2',title:'Ekonomi Uyarısı',body:'Merkez Bankası faiz kararı açıkladı.',category:'Ekonomi',icon:'💰',ts:Date.now()-7200000},
  ];
  const annList = [...announcements, ...defaultAnn].slice(0,5);
  const catColor = {Siyaset:'#EF4444',Ekonomi:'#F59E0B',Hukuk:'#3B82F6',Etkinlik:'#10B981',Sistem:'#8B5CF6'};

  const allAchievements = 16;
  const earnedAch = (() => {
    try {
      const cu = profile || {};
      const parties = JSON.parse(localStorage.getItem('rep_parties')||'[]');
      const gangs = JSON.parse(localStorage.getItem('rep_gangs')||'[]');
      let count = 0;
      if ((cu.money||0)+(cu.bankMoney||0)>=1000000) count++;
      if ((cu.money||0)+(cu.bankMoney||0)>=1000000000) count++;
      if ((cu.level||1)>=10) count++;
      if ((cu.level||1)>=50) count++;
      if (parties.find(p=>(p.members||[]).includes(cu.username))) count++;
      if (gangs.find(g=>(g.members||[]).includes(cu.username))) count++;
      if ((cu.meritPoints||0)>=100) count++;
      if ((cu.meritPoints||0)>=1000) count++;
      if (cu.vip||cu.premium) count++;
      if ((cu.underCoin||0)>=1000) count++;
      if (cu.role==='admin') count++;
      if ((cu.hp||100)>=100) count++;
      return count;
    } catch{ return 0; }
  })();

  const stocks = (() => { try { return JSON.parse(localStorage.getItem('rep_stockMarket')||'{}'); } catch{ return {}; } })();
  const portfolio = (() => { try { return JSON.parse(localStorage.getItem('rep_stockPortfolio')||'{}'); } catch{ return {}; } })();
  const portfolioVal = Object.entries(portfolio).reduce((s,[sym,h])=>s+(stocks[sym]||0)*(h.qty||0),0);
  const portfolioChange = portfolioVal > 0 ? `+${fmtShort(portfolioVal)}` : `+${fmtShort(money*0.02||150)}`;

  const unreadDMs = (() => { try { const msgs = JSON.parse(localStorage.getItem('rep_directMessages')||'[]'); return msgs.filter(m=>m.to===uid&&!m.read).length; } catch{ return 0; } })();
  const unreadCount = unreadDMs + (news?.length||0);

  return (
    <div style={{padding:'0 0.75rem 1rem',background:'#F0F2F5',minHeight:'100%'}}>
      {/* ── Welcome card (stays dark) ── */}
      <div style={{borderRadius:'18px',marginBottom:'0.75rem',boxShadow:'0 6px 24px rgba(0,0,0,0.18)',marginTop:'0.75rem',overflow:'hidden'}}>
        {/* Banner */}
        {profile?.bannerUrl && (
          <div style={{height:'90px',backgroundImage:`url(${profile.bannerUrl})`,backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(15,28,56,0.85))'}}/>
            {/* avatar üst sağ */}
            <div onClick={()=>onNavigate('profile')} style={{position:'absolute',bottom:'-22px',right:'1rem',cursor:'pointer',zIndex:2}}>
              <div style={{width:'52px',height:'52px',borderRadius:'50%',border:'3px solid #1A2744',overflow:'hidden',background:'linear-gradient(135deg,#1a3a5c,#0a1a2e)'}}>
                {(profile?.avatarUrl||profile?.photoUrl) ? (
                  <img src={profile.avatarUrl||profile.photoUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" onError={e=>e.target.style.display='none'}/>
                ) : (
                  <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>{profile?.gender==='female'?'👩':'👨'}</div>
                )}
              </div>
            </div>
          </div>
        )}
        <div style={{background:'linear-gradient(135deg,#1A2744 0%,#0F1C38 100%)',padding:'1.2rem',paddingTop: profile?.bannerUrl ? '1.5rem' : '1.2rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
            <div>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:'0.2rem',fontWeight:600}}>Oyuncu Profili</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.35rem',fontWeight:900,color:'#FFFFFF'}}>{profile?.username||'Oyuncu'}</div>
              <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.4)',marginTop:'0.1rem'}}>{lvl.title} • {lvl.pct}% sonraki seviye</div>
            </div>
            {!profile?.bannerUrl && (
              <div onClick={()=>onNavigate('profile')} style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.3rem'}}>
                <Avatar profile={profile} size={62} />
                <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.45)',fontWeight:600}}>Profili Gör</div>
              </div>
            )}
          </div>
        <div style={{marginBottom:'0.6rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',marginBottom:'4px'}}>
            <span>{lvl.xp?.toLocaleString()} XP</span><span>→ {lvl.next?.xp?.toLocaleString()} XP</span>
          </div>
          <div style={{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${lvl.pct}%`,background:'linear-gradient(90deg,#3B82F6,#60A5FA)',borderRadius:'2px',transition:'width 0.5s'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
          {[
            {label:'Seviye',value:lvl.lvl,icon:'⭐'},
            {label:'Prestij',value:fmtShort(profile?.meritPoints||0),icon:'🏅'},
            {label:'Para',value:'₱'+fmtShort(money),icon:'💰'},
          ].map(({label,value,icon})=>(
            <div key={label} style={{textAlign:'center',background:'rgba(255,255,255,0.06)',borderRadius:'10px',padding:'0.5rem 0.2rem'}}>
              <div style={{fontSize:'0.75rem',marginBottom:'0.1rem'}}>{icon}</div>
              <div style={{fontSize:'0.52rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.07em',fontWeight:700,marginBottom:'0.1rem'}}>{label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1rem',fontWeight:900,color:'#FFFFFF'}}>{value}</div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ── 2-column stat cards ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.55rem',marginBottom:'0.75rem'}}>
        {[
          {icon:'🔔',label:'Bildirimler',value:unreadCount||0,sub:unreadCount>0?`${unreadCount} okunmamış`:'Hepsi okundu',color:'#F59E0B',page:'chat'},
          {icon:'🏆',label:'Başarımlar',value:`${earnedAch}/${allAchievements}`,sub:`%${Math.round(earnedAch/allAchievements*100)} tamamlandı`,color:'#FFD700',page:'achievements'},
          {icon:'📈',label:'Ekonomi',value:portfolioChange,sub:'Portföy değeri',color:'#10B981',positive:true,page:'economy'},
          {icon:'⚡',label:'Aktivite',value:onlineCnt||0,sub:'Online oyuncu',color:'#3B82F6',page:'players'},
        ].map((item)=>(
          <div key={item.label} onClick={()=>onNavigate(item.page)}
            style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'0.9rem 0.85rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',cursor:'pointer',transition:'all 0.15s',WebkitTapHighlightColor:'transparent'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.35rem',marginBottom:'0.35rem'}}>
              <span style={{fontSize:'1rem'}}>{item.icon}</span>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#7A8FA6',textTransform:'uppercase',letterSpacing:'0.05em'}}>{item.label}</span>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1.3rem',fontWeight:900,color:item.positive?'#10B981':'#1A2233',lineHeight:1,marginBottom:'0.2rem'}}>{item.value}</div>
            <div style={{fontSize:'0.63rem',color:'#9AABBA'}}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Daily Tasks ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',marginBottom:'0.75rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.8rem'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233'}}>📅 Günlük Görevler</div>
          <span style={{fontSize:'0.65rem',color:'#7A8FA6',fontWeight:600}}>{todayKey}</span>
        </div>
        {taskList.map((task,i)=>{
          const prog = todayProgress[task.id] || 0;
          const pct = Math.min(100, Math.round(prog/task.target*100));
          const done = prog >= task.target;
          const claimed = !!todayProgress[task.id+'_claimed'];
          return (
            <div key={task.id} style={{marginBottom:i<taskList.length-1?'0.85rem':'0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.25rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                  <span style={{fontSize:'0.95rem'}}>{task.icon}</span>
                  <span style={{fontSize:'0.82rem',fontWeight:600,color:claimed?'#9AABBA':'#1A2233',textDecoration:claimed?'line-through':'none'}}>{task.name}</span>
                </div>
                {claimed ? (
                  <span style={{fontSize:'0.65rem',color:'#10B981',fontWeight:800}}>✅ Alındı</span>
                ) : done ? (
                  <button onClick={(e)=>claimTask(task,e)} style={{fontSize:'0.65rem',fontWeight:800,color:'#fff',background:'#10B981',border:'none',borderRadius:'8px',padding:'0.2rem 0.55rem',cursor:'pointer'}}>🎁 Al</button>
                ) : (
                  <button onClick={(e)=>{e.stopPropagation();onNavigate(task.page);}} style={{fontSize:'0.65rem',fontWeight:700,color:'#3B82F6',background:'none',border:'none',cursor:'pointer'}}>→ Git</button>
                )}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <div style={{flex:1,height:'5px',background:'#E8ECF0',borderRadius:'100px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:claimed?'#10B981':'linear-gradient(90deg,#3B82F6,#60A5FA)',borderRadius:'100px',transition:'width 0.5s'}} />
                </div>
                <span style={{fontSize:'0.6rem',color:'#9AABBA',fontWeight:600,flexShrink:0}}>{prog}/{task.target}</span>
              </div>
              <div style={{fontSize:'0.6rem',color:'#9AABBA',marginTop:'0.15rem'}}>🎁 +₱{task.reward.toLocaleString('tr-TR')} • +{task.xpReward} XP</div>
            </div>
          );
        })}
      </div>

      {/* ── Announcements (açılır pencereli) ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',marginBottom:'0.75rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.7rem'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233'}}>📢 Duyurular</div>
          <button onClick={()=>onNavigate('duyurular')} style={{fontSize:'0.68rem',color:'#3B82F6',fontWeight:700,background:'none',border:'none',cursor:'pointer'}}>Tümü →</button>
        </div>
        {annList.slice(0,3).map(a=>(
          <button key={a.id||a.ts} onClick={()=>setAnnModal(a)}
            style={{width:'100%',display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.5rem 0',borderBottom:'1px solid rgba(0,0,0,0.05)',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
            <span style={{fontSize:'1.2rem',flexShrink:0}}>{a.icon||'📣'}</span>
            <div style={{flex:1,overflow:'hidden'}}>
              <div style={{fontSize:'0.82rem',fontWeight:700,color:'#1A2233',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div>
              <div style={{fontSize:'0.68rem',color:catColor[a.category]||'#7A8FA6',fontWeight:600}}>{a.category} • {timeAgo(a.ts)}</div>
            </div>
            <span style={{fontSize:'0.7rem',color:'#9AABBA',flexShrink:0}}>›</span>
          </button>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',marginBottom:'0.75rem'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233',marginBottom:'0.7rem'}}>Son Aktiviteler</div>
        {recentActivity.map((item,i,arr)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.55rem 0',borderBottom:i<arr.length-1?'1px solid rgba(0,0,0,0.05)':'none'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:item.color||'#3B82F6',flexShrink:0}} />
            <span style={{flex:1,fontSize:'0.82rem',color:'#3B5470',fontWeight:500}}>{item.text||item.desc||item.content||'Aktivite'}</span>
            <span style={{fontSize:'0.67rem',color:'#9AABBA'}}>{item.time||timeAgo(item.ts)}</span>
          </div>
        ))}
      </div>

      {/* ── Quick categories ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233',marginBottom:'0.75rem'}}>Hızlı Erişim</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.45rem'}}>
          {[
            {icon:'💼',label:'İşler',page:'jobs'},
            {icon:'📈',label:'Borsa',page:'economy'},
            {icon:'🏗️',label:'İnşaat',page:'citybuild'},
            {icon:'⚔️',label:'Savaş',page:'map'},
            {icon:'🗳️',label:'Seçim',page:'politics'},
            {icon:'🏆',label:'Sıralama',page:'leaderboard'},
            {icon:'🎰',label:'Kumarhane',page:'casino'},
            {icon:'🤝',label:'İttifak',page:'alliance'},
          ].map((a,i) => (
            <button key={i} onClick={() => onNavigate(a.page)}
              style={{background:'#F5F7FA',border:'1px solid rgba(0,0,0,0.07)',borderRadius:'14px',padding:'0.7rem 0.3rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s'}}>
              <span style={{fontSize:'1.45rem',lineHeight:1}}>{a.icon}</span>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#3B5470',textAlign:'center',lineHeight:1.2}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Destek Talebi Butonu ── */}
      <button onClick={()=>setSupportOpen(true)}
        style={{width:'100%',display:'flex',alignItems:'center',gap:'0.75rem',background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(245,158,11,0.05))',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'16px',padding:'0.85rem 1rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textAlign:'left',marginBottom:'0.75rem',WebkitTapHighlightColor:'transparent'}}>
        <span style={{fontSize:'1.5rem'}}>🆘</span>
        <div>
          <div style={{fontSize:'0.9rem',fontWeight:800,color:'#EF4444'}}>Destek Talebi</div>
          <div style={{fontSize:'0.7rem',color:'#7A8FA6'}}>Sorun mu var? Bize bildir, yardım edelim.</div>
        </div>
        <span style={{marginLeft:'auto',fontSize:'0.8rem',color:'#EF4444'}}>→</span>
      </button>

      {/* ── Destek Cevapları (admin cevap verdiyse göster) ── */}
      {(()=>{
        const myMsgs = (() => {
          try { const all=JSON.parse(localStorage.getItem('rep_supportMsgs')||'[]'); return Array.isArray(all)?all.filter(m=>m.userId===profile?.uid&&m.replies&&m.replies.length>0):[] } catch{return [];}
        })();
        if(!myMsgs.length) return null;
        return (
          <div style={{background:'rgba(96,165,250,0.06)',border:'1px solid rgba(96,165,250,0.25)',borderRadius:'16px',padding:'0.85rem 1rem',marginBottom:'0.75rem'}}>
            <div style={{fontSize:'0.78rem',fontWeight:800,color:'#60A5FA',marginBottom:'0.5rem'}}>💬 Destek Cevaplarınız</div>
            {myMsgs.slice(-3).map(m=>(
              <div key={m.id} style={{marginBottom:'0.5rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontSize:'0.72rem',color:'#7A8FA6',marginBottom:'0.2rem'}}>{new Date(m.ts).toLocaleDateString('tr-TR')} — {m.text.length>60?m.text.slice(0,60)+'…':m.text}</div>
                {m.replies.map((r,i)=>(
                  <div key={i} style={{background:'rgba(96,165,250,0.1)',border:'1px solid rgba(96,165,250,0.2)',borderRadius:'8px',padding:'0.45rem 0.6rem',fontSize:'0.8rem',color:'#93C5FD'}}>
                    🔑 {r.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })()}

      {supportOpen && (
        <div onClick={()=>setSupportOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:3000,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'24px 24px 0 0',padding:'1.5rem 1.25rem',width:'100%',maxWidth:'480px',animation:'slideUp 0.25s ease',boxShadow:'0 -8px 40px rgba(0,0,0,0.2)'}}>
            {supportSent ? (
              <div style={{textAlign:'center',padding:'1.5rem 0'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>✅</div>
                <div style={{fontSize:'1rem',fontWeight:800,color:'#10B981'}}>Talebiniz İletildi!</div>
                <div style={{fontSize:'0.8rem',color:'#7A8FA6',marginTop:'0.35rem'}}>En kısa sürede cevap verilecek.</div>
              </div>
            ) : (
              <>
                <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'1rem'}}>
                  <span style={{fontSize:'1.5rem'}}>🆘</span>
                  <div style={{fontSize:'1rem',fontWeight:800,color:'#1A2233'}}>Destek Talebi</div>
                  <button onClick={()=>setSupportOpen(false)} style={{marginLeft:'auto',background:'#F1F5F9',border:'none',borderRadius:'8px',padding:'0.3rem 0.65rem',cursor:'pointer',color:'#64748B',fontSize:'0.85rem'}}>✕</button>
                </div>
                <div style={{fontSize:'0.8rem',color:'#64748B',marginBottom:'0.6rem'}}>Kullanıcı: <strong>{profile?.username}</strong></div>
                <textarea value={supportText} onChange={e=>setSupportText(e.target.value)}
                  placeholder="Sorununuzu veya talebinizi yazın..."
                  rows={4}
                  style={{width:'100%',padding:'0.75rem',border:'1.5px solid rgba(59,130,246,0.25)',borderRadius:'12px',fontFamily:"'DM Sans',sans-serif",fontSize:'0.9rem',color:'#1A2233',resize:'none',outline:'none',boxSizing:'border-box',background:'#F8FAFC'}}
                />
                <button onClick={sendSupportMsg} disabled={!supportText.trim()}
                  style={{width:'100%',padding:'0.8rem',borderRadius:'14px',border:'none',background:supportText.trim()?'#EF4444':'#E2E8F0',color:supportText.trim()?'#fff':'#94A3B8',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.92rem',cursor:supportText.trim()?'pointer':'default',marginTop:'0.65rem',transition:'all 0.15s'}}>
                  🆘 Destek Talebi Gönder
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Duyuru Modal ── */}
      {annModal && (
        <div onClick={()=>setAnnModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px',padding:'1.5rem',width:'100%',maxWidth:'400px',animation:'slideUp 0.2s ease',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
              <span style={{fontSize:'2rem'}}>{annModal.icon||'📣'}</span>
              <div>
                <div style={{fontSize:'1rem',fontWeight:800,color:'#1A2233'}}>{annModal.title}</div>
                <div style={{fontSize:'0.72rem',color:catColor[annModal.category]||'#7A8FA6',fontWeight:700}}>{annModal.category} • {timeAgo(annModal.ts)}</div>
              </div>
            </div>
            <div style={{fontSize:'0.88rem',color:'#334155',lineHeight:'1.65',marginBottom:'1.25rem'}}>{annModal.body||annModal.text}</div>
            <button onClick={()=>setAnnModal(null)} style={{width:'100%',padding:'0.7rem',borderRadius:'12px',border:'none',background:'#3B82F6',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.9rem',cursor:'pointer'}}>Kapat</button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════

const ADMIN_POSITIONS = [
  {key:'devlet_baskani',   title:'Devlet Başkanı',       icon:'👑'},
  {key:'meclis_baskani',   title:'Meclis Başkanı',        icon:'🏛️'},
  {key:'milletvekili',     title:'Milletvekili',          icon:'📜'},
  {key:'icisleri_bakani',  title:'İçişleri Bakanı',       icon:'🛡️'},
  {key:'belediye_baskani', title:'Belediye Başkanı',      icon:'🏙️'},
  {key:'vali',             title:'Vali',                  icon:'🏢'},
  {key:'genelkurmay',      title:'Genelkurmay Başkanı',   icon:'⚔️'},
  {key:'ticaret_bakani',   title:'Ticaret Bakanı',        icon:'📊'},
  {key:'maliye_bakani',    title:'Maliye Bakanı',         icon:'💰'},
];

function AdminElectionTab({ elections_multi, setElections_multi, setMsg, cs, inp }) {
  const [candInput, setCandInput] = useState({});
  const startPos = (key) => {
    setElections_multi(prev=>({...prev,[key]:{...(prev[key]||{}),active:true,candidates:(prev[key]?.candidates||[]),votes:(prev[key]?.votes||{}),userVotedIds:(prev[key]?.userVotedIds||[])}}));
    setMsg(`✅ ${ADMIN_POSITIONS.find(p=>p.key===key)?.title} seçimi başlatıldı!`);
  };
  const endPos = (key) => {
    const el = elections_multi[key]||{};
    const cands = el.candidates||[];
    const votes = el.votes||{};
    const sorted = [...cands].sort((a,b)=>(votes[b.username]||0)-(votes[a.username]||0));
    const winner = sorted[0];
    if (winner) {
      const cab = (()=>{try{return JSON.parse(localStorage.getItem('rep_cabinet')||'{}');}catch{return{};}})();
      const title = ADMIN_POSITIONS.find(p=>p.key===key)?.title;
      cab[title] = winner.username;
      localStorage.setItem('rep_cabinet', JSON.stringify(cab));
      const users = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
      const updated = users.map(u=>u.username===winner.username?{...u,position:title}:u);
      localStorage.setItem('rep_users', JSON.stringify(updated));
    }
    setElections_multi(prev=>({...prev,[key]:{...prev[key],active:false,winner:winner?.username||null}}));
    setMsg(`🏆 ${ADMIN_POSITIONS.find(p=>p.key===key)?.title} seçimi bitti! Kazanan: ${winner?.username||'Yok'}`);
  };
  const addCand = (key) => {
    const uname = (candInput[key]||'').trim();
    if (!uname) return;
    const users = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
    const found = users.find(u=>u.username===uname);
    const cand = found ? {username:found.username,id:found.id} : {username:uname,id:'manual_'+Date.now()};
    setElections_multi(prev=>{
      const existing = prev[key]?.candidates||[];
      if (existing.find(c=>c.username===uname)) { setMsg('⚠️ Bu kullanıcı zaten aday!'); return prev; }
      return {...prev,[key]:{...(prev[key]||{active:false,votes:{},userVotedIds:[]}),candidates:[...existing,cand],votes:{...(prev[key]?.votes||{}),[uname]:0}}};
    });
    setCandInput(p=>({...p,[key]:''}));
    setMsg(`✅ ${uname} → ${ADMIN_POSITIONS.find(p=>p.key===key)?.title} adayı eklendi`);
  };
  const removeCand = (key, username) => {
    setElections_multi(prev=>({...prev,[key]:{...prev[key],candidates:(prev[key]?.candidates||[]).filter(c=>c.username!==username)}}));
  };
  const resetPos = (key) => {
    if(!window.confirm('Bu seçimi sıfırla?')) return;
    setElections_multi(prev=>({...prev,[key]:{active:false,candidates:[],votes:{},userVotedIds:[],winner:null}}));
    setMsg(`↺ ${ADMIN_POSITIONS.find(p=>p.key===key)?.title} seçimi sıfırlandı`);
  };
  return (
    <div>
      <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.65rem'}}>Her makam için bağımsız seçim yönetin. Parti liderleri aday gösterir, oylamayı siz başlatırsınız.</div>
      {ADMIN_POSITIONS.map(pos=>{
        const el = elections_multi[pos.key]||{};
        const cands = el.candidates||[];
        const votes = el.votes||{};
        const sorted = [...cands].sort((a,b)=>(votes[b.username]||0)-(votes[a.username]||0));
        const totalV = sorted.reduce((s,c)=>s+(votes[c.username]||0),0);
        return (
          <div key={pos.key} style={{...cs,border:`1px solid ${el.active?'rgba(16,185,129,0.3)':'rgba(255,215,0,0.15)'}`,marginBottom:'0.5rem'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <span style={{fontSize:'1.2rem'}}>{pos.icon}</span>
                <div>
                  <div style={{fontWeight:800,color:'#FFD700',fontSize:'0.85rem'}}>{pos.title}</div>
                  <div style={{fontSize:'0.65rem',color:'#5A7089'}}>
                    {cands.length} aday •
                    {el.active ? <span style={{color:'#10B981'}}> 🟢 Aktif</span> : el.winner ? <span style={{color:'#60A5FA'}}> 🏆 {el.winner}</span> : <span style={{color:'#5A7089'}}> ⏸ Pasif</span>}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap',justifyContent:'flex-end'}}>
                {!el.active
                  ? <button onClick={()=>startPos(pos.key)} style={{padding:'0.35rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(16,185,129,0.4)',background:'rgba(16,185,129,0.1)',color:'#10B981',cursor:'pointer',fontWeight:700,fontSize:'0.72rem',minHeight:32}}>▶ Başlat</button>
                  : <button onClick={()=>endPos(pos.key)} style={{padding:'0.35rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(59,130,246,0.4)',background:'rgba(59,130,246,0.1)',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontSize:'0.72rem',minHeight:32}}>🏁 Bitir</button>}
                <button onClick={()=>resetPos(pos.key)} style={{padding:'0.35rem 0.55rem',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',color:'#F87171',cursor:'pointer',fontWeight:700,fontSize:'0.72rem',minHeight:32}}>↺</button>
              </div>
            </div>
            <div style={{display:'flex',gap:'0.35rem',marginBottom:'0.4rem'}}>
              <input value={candInput[pos.key]||''} onChange={e=>setCandInput(p=>({...p,[pos.key]:e.target.value}))}
                onKeyDown={e=>e.key==='Enter'&&addCand(pos.key)}
                placeholder="Kullanıcı adı ekle..." style={{...inp,flex:1,padding:'0.38rem 0.6rem',fontSize:'0.8rem'}}/>
              <button onClick={()=>addCand(pos.key)} style={{padding:'0.38rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(255,215,0,0.4)',background:'rgba(255,215,0,0.1)',color:'#FFD700',cursor:'pointer',fontWeight:700,fontSize:'0.75rem',whiteSpace:'nowrap',minHeight:34}}>+ Ekle</button>
            </div>
            {cands.length>0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
                {sorted.map((c,i)=>{
                  const pct = totalV>0?Math.round((votes[c.username]||0)/totalV*100):0;
                  return (
                    <div key={c.username} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${i===0&&totalV>0?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'8px',padding:'3px 8px',display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.72rem'}}>
                      <span style={{color:i===0&&totalV>0?'#F59E0B':'#94A3B8'}}>{i===0&&totalV>0?'🥇':i===1&&totalV>0?'🥈':i===2&&totalV>0?'🥉':'·'} {c.username}</span>
                      {totalV>0&&<span style={{color:'#5A7089',fontSize:'0.6rem'}}>({votes[c.username]||0} oy · {pct}%)</span>}
                      {!el.active&&<span onClick={()=>removeCand(pos.key,c.username)} style={{cursor:'pointer',color:'#EF4444',fontSize:'0.85rem',lineHeight:1,marginLeft:'0.15rem'}}>×</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AdminMakamlarTab({ allUsers, setAllUsersRaw, setMsg, cs, inp }) {
  const [cab, setCab] = useState(()=>{try{return JSON.parse(localStorage.getItem('rep_cabinet')||'{}');}catch{return{};}});
  const [assignInputs, setAssignInputs] = useState({});
  const saveCab = (newCab) => { setCab(newCab); localStorage.setItem('rep_cabinet', JSON.stringify(newCab)); };
  const assign = (title) => {
    const uname = (assignInputs[title]||'').trim();
    if (!uname) { setMsg('Kullanıcı adı girin'); return; }
    const users = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
    const nc = {...cab,[title]:uname};
    saveCab(nc);
    const updated = users.map(u=>u.username===uname?{...u,position:title}:u);
    localStorage.setItem('rep_users',JSON.stringify(updated));
    setAllUsersRaw(updated);
    setAssignInputs(p=>({...p,[title]:''}));
    setMsg(`✅ ${uname} → ${title} atandı!`);
  };
  const remove = (title) => {
    const uname = cab[title];
    const nc = {...cab};
    delete nc[title];
    saveCab(nc);
    if (uname) {
      const users = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
      const updated = users.map(u=>u.username===uname?{...u,position:'Vatandaş'}:u);
      localStorage.setItem('rep_users',JSON.stringify(updated));
      setAllUsersRaw(updated);
    }
    setMsg(`🗑️ ${title} makamı boşaltıldı`);
  };
  const giveVIP = (u) => {
    const users=(()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
    const expiry=Date.now()+30*24*3600000;
    const upd=users.map(x=>x.id===u.id?{...x,premium:true,premiumExpiry:expiry,vip:true}:x);
    localStorage.setItem('rep_users',JSON.stringify(upd));
    setAllUsersRaw(upd);
    setMsg(`✅ ${u.username} → 30 gün VIP`);
  };
  const giveEdu = (u) => {
    const users=(()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
    const expiry=Date.now()+30*24*3600000;
    const upd=users.map(x=>x.id===u.id?{...x,eduPackage:true,eduPackageExpiry:expiry,packages:{...(x.packages||{}),edu:true}}:x);
    localStorage.setItem('rep_users',JSON.stringify(upd));
    setAllUsersRaw(upd);
    setMsg(`✅ ${u.username} → Eğitim Paketi`);
  };
  return (
    <div>
      <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.65rem'}}>Kullanıcıları makama direkt atayın. Seçim kazandıklarında da buraya yansır.</div>
      {ADMIN_POSITIONS.map(m=>{
        const current = cab[m.title]||null;
        return (
          <div key={m.key} style={{...cs,border:`1px solid ${current?'rgba(255,215,0,0.2)':'rgba(255,255,255,0.06)'}`,marginBottom:'0.45rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.4rem'}}>
              <span style={{fontSize:'1.1rem'}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'#FFD700',fontSize:'0.82rem'}}>{m.title}</div>
                <div style={{fontSize:'0.67rem',color:current?'#10B981':'#3B4E63'}}>{current?`👤 ${current}`:'Boş — Atanmamış'}</div>
              </div>
              {current&&<button onClick={()=>remove(m.title)} style={{padding:'0.25rem 0.5rem',borderRadius:'6px',border:'1px solid rgba(239,68,68,0.4)',background:'rgba(239,68,68,0.08)',color:'#F87171',cursor:'pointer',fontSize:'0.68rem',fontWeight:700,minHeight:28}}>✕</button>}
            </div>
            <div style={{display:'flex',gap:'0.35rem'}}>
              <input value={assignInputs[m.title]||''} onChange={e=>setAssignInputs(p=>({...p,[m.title]:e.target.value}))}
                onKeyDown={e=>e.key==='Enter'&&assign(m.title)}
                placeholder="Kullanıcı adı..." style={{...inp,flex:1,padding:'0.38rem 0.6rem',fontSize:'0.8rem'}}/>
              <button onClick={()=>assign(m.title)} style={{padding:'0.38rem 0.7rem',borderRadius:'8px',border:'1px solid rgba(255,215,0,0.4)',background:'rgba(255,215,0,0.1)',color:'#FFD700',cursor:'pointer',fontWeight:700,fontSize:'0.75rem',minHeight:34}}>Ata</button>
            </div>
          </div>
        );
      })}
      <div style={{...cs,borderColor:'rgba(167,139,250,0.3)',marginTop:'0.75rem'}}>
        <div style={{fontWeight:800,color:'#A78BFA',fontSize:'0.82rem',marginBottom:'0.6rem'}}>💎 VIP & Paket Ver</div>
        {[...allUsers].filter(u=>!u.isBot).slice(0,20).map(u=>(
          <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.38rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:'0.78rem',color:'#E8EDF2',fontWeight:600}}>{u.username}</div>
            <div style={{display:'flex',gap:'0.3rem'}}>
              <button onClick={()=>giveVIP(u)} style={{padding:'0.2rem 0.5rem',borderRadius:'6px',border:'1px solid rgba(236,72,153,0.4)',background:'rgba(236,72,153,0.1)',color:'#F472B6',cursor:'pointer',fontSize:'0.65rem',fontWeight:700}}>💎 VIP</button>
              <button onClick={()=>giveEdu(u)} style={{padding:'0.2rem 0.5rem',borderRadius:'6px',border:'1px solid rgba(139,92,246,0.4)',background:'rgba(139,92,246,0.1)',color:'#A78BFA',cursor:'pointer',fontSize:'0.65rem',fontWeight:700}}>📚 Edu</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ACHIEVEMENTS_LIST = [
  { id:'first_money',   icon:'💰', title:'İlk Kazanç',      desc:'₱1.000 kazan',                   check: u => (u.money||0) >= 1000 },
  { id:'first_10k',     icon:'💵', title:'Para Babası',      desc:'₱10.000 kazan',                  check: u => (u.money||0) >= 10000 },
  { id:'first_100k',    icon:'💸', title:'Varlıklı',         desc:'₱100.000 kazan',                 check: u => (u.money||0) >= 100000 },
  { id:'millionaire',   icon:'💎', title:'Milyoner',         desc:'₱1.000.000 kazan',               check: u => (u.money||0) >= 1000000 },
  { id:'billionaire',   icon:'🏆', title:'Milyarder',        desc:'₱1 Milyar kazan',                check: u => (u.money||0) >= 1e9 },
  { id:'first_party',   icon:'🏛️', title:'Siyasetçi',        desc:'Bir partiye katıl',               check: (u,s) => !!(s.parties||[]).find(p=>(p.members||[]).includes(u.uid)) },
  { id:'party_leader',  icon:'👑', title:'Parti Lideri',     desc:'Bir parti kur',                   check: (u,s) => !!(s.parties||[]).find(p=>p.leaderId===u.uid) },
  { id:'first_holding', icon:'🏢', title:'İşadamı',          desc:'İlk şirketini kur',               check: (u,s) => (s.holdings||[]).some(h=>h.owner===u.uid) },
  { id:'investor',      icon:'📈', title:'Yatırımcı',        desc:'Hisse senedi al',                 check: (u,s) => Object.keys(s.stockPortfolio||{}).length > 0 },
  { id:'gang_member',   icon:'💀', title:'Yeraltı Üyesi',    desc:'Bir çeteye katıl',                check: (u,s) => !!(s.gangs||[]).find(g=>(g.members||[]).includes(u.uid)) },
  { id:'law_voter',     icon:'⚖️', title:'Demokrat',         desc:'Bir yasaya oy ver',               check: (u,s) => (s.laws||[]).some(l=>l.votes?.voters?.[u.uid]) },
  { id:'elected',       icon:'🗳️', title:'Seçmen',           desc:'Seçimde oy kullan',               check: (u,s) => !!(s.elections?.votes?.[u.uid]) },
  { id:'farmer',        icon:'🌾', title:'Çiftçi',           desc:'İlk hasatı yap',                  check: (u,s) => (s.userFarms||[]).some(f=>f.harvested) },
  { id:'chatty',        icon:'💬', title:'Sosyalci',         desc:'10 mesaj gönder',                 check: u => (u.msgCount||0) >= 10 },
  { id:'level5',        icon:'⭐', title:'Tecrübeli',         desc:'Seviye 5\'e ulaş',                check: u => (u.level||1) >= 5 },
  { id:'level10',       icon:'🌟', title:'Uzman',            desc:'Seviye 10\'a ulaş',               check: u => (u.level||1) >= 10 },
  { id:'premium',       icon:'💎', title:'VIP Üye',          desc:'Premium satın al',                check: u => !!u.premium },
  { id:'alliance',      icon:'🤝', title:'Müttefik',         desc:'Bir ittifaka katıl',              check: (u,s) => !!(s.alliances||[]).find(a=>(a.members||[]).includes(u.uid)) },
];

function AdminSupportTab({ setMsg, inp, cs }) {
  const [supportMsgs, setSupportMsgsLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rep_supportMsgs')||'[]'); } catch{return[];}
  });
  const [replyTexts, setReplyTexts] = useState({});

  const refresh = () => {
    try { setSupportMsgsLocal(JSON.parse(localStorage.getItem('rep_supportMsgs')||'[]')); } catch{}
  };
  const sendReply = (msgId) => {
    const text = (replyTexts[msgId]||'').trim();
    if (!text) return;
    try {
      const all = JSON.parse(localStorage.getItem('rep_supportMsgs')||'[]');
      const upd = all.map(m => m.id===msgId ? {...m, replies:[...(m.replies||[]),{text,by:'Admin',ts:Date.now()}], status:'replied'} : m);
      localStorage.setItem('rep_supportMsgs', JSON.stringify(upd));
      window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'supportMsgs',value:upd}}));
      setSupportMsgsLocal(upd);
      setReplyTexts(prev => ({...prev,[msgId]:''}));
      setMsg('✅ Yanıt gönderildi');
    } catch(e){}
  };
  const deleteMsg = (msgId) => {
    try {
      const all = JSON.parse(localStorage.getItem('rep_supportMsgs')||'[]');
      const upd = all.filter(m => m.id!==msgId);
      localStorage.setItem('rep_supportMsgs', JSON.stringify(upd));
      window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'supportMsgs',value:upd}}));
      setSupportMsgsLocal(upd);
      setMsg('🗑️ Mesaj silindi');
    } catch(e){}
  };
  return (
    <div>
      <div style={{...cs,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.65rem'}}>
        <div>
          <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>💬 Destek Mesajları</div>
          <div style={{fontSize:'0.7rem',color:'#5A7089',marginTop:'0.2rem'}}>{supportMsgs.length} mesaj • {supportMsgs.filter(m=>m.status==='pending').length} yanıtsız</div>
        </div>
        <button onClick={refresh} style={{padding:'0.3rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontSize:'0.72rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>🔄 Yenile</button>
      </div>
      {supportMsgs.length === 0 && <div style={{...cs,textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz destek mesajı yok</div>}
      {[...supportMsgs].reverse().map(m => (
        <div key={m.id} style={{...cs,border:`1px solid ${m.status==='pending'?'rgba(239,68,68,0.25)':'rgba(16,185,129,0.2)'}`,marginBottom:'0.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
            <div>
              <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.85rem'}}>👤 {m.from||'Anonim'}</div>
              <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{new Date(m.ts).toLocaleString('tr-TR')} • <span style={{color:m.status==='pending'?'#EF4444':'#10B981',fontWeight:700}}>{m.status==='pending'?'⏳ Yanıtsız':'✅ Yanıtlandı'}</span></div>
            </div>
            <button onClick={()=>deleteMsg(m.id)} style={{padding:'0.2rem 0.5rem',borderRadius:'6px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',color:'#EF4444',fontSize:'0.7rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>🗑️</button>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'0.6rem 0.75rem',fontSize:'0.82rem',color:'#C8D3DC',marginBottom:'0.5rem',lineHeight:1.5}}>{m.text}</div>
          {(m.replies||[]).map((r,i)=>(
            <div key={i} style={{background:'rgba(16,185,129,0.06)',borderRadius:'8px',padding:'0.4rem 0.75rem',fontSize:'0.78rem',color:'#10B981',marginBottom:'0.3rem'}}>
              <span style={{fontWeight:700}}>⭐ {r.by}:</span> {r.text}
            </div>
          ))}
          <div style={{display:'flex',gap:'0.4rem',marginTop:'0.4rem'}}>
            <input value={replyTexts[m.id]||''} onChange={e=>setReplyTexts(prev=>({...prev,[m.id]:e.target.value}))} placeholder="Yanıt yaz..." style={{...inp,flex:1,fontSize:'0.78rem',padding:'0.4rem 0.65rem'}} />
            <button onClick={()=>sendReply(m.id)} style={{padding:'0.4rem 0.75rem',borderRadius:'8px',border:'none',background:'#10B981',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer',whiteSpace:'nowrap'}}>Yanıtla</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPage({ profile, showNotif, onNavigate }) {
  const [tab, setTab] = useState('dashboard');
  const [allUsers, setAllUsersRaw] = useState(() => {
    try { const v = localStorage.getItem('rep_users'); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftUC, setGiftUC] = useState('');
  const [banReason, setBanReason] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useLs('announcements', []);
  const [msg, setMsg] = useState('');
  const [editMoney, setEditMoney] = useState('');
  const [tabLog, setTabLog] = useState('all');
  const [elections_adm, setElections_adm] = useLs('rep_elections', {phase:'idle',candidates:[],votes:{}});
  const onlineCnt = useOnlineCount();

  const isAdmin = profile?.role === 'admin';

  const refreshUsers = () => {
    try { const v = localStorage.getItem('rep_users'); setAllUsersRaw(v ? JSON.parse(v) : []); } catch {}
  };

  const saveUsers = (updated) => {
    localStorage.setItem('rep_users', JSON.stringify(updated));
    setAllUsersRaw(updated);
  };

  const filteredUsers = allUsers.filter(u =>
    !search.trim() ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const banToggle = (u) => {
    const newBanned = !u.banned;
    const updated = allUsers.map(x => x.id===u.id ? {...x, banned:newBanned, banReason:newBanned?(banReason||'Admin kararı'):''} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, banned:newBanned});
    setMsg(`${newBanned?'🚫 Kullanıcı banlandı':'✅ Ban kaldırıldı'}: ${u.username}`);
    setBanReason('');
  };

  const giveMoney = (u) => {
    const amt = parseInt(giftAmount);
    if (!amt || amt <= 0) { setMsg('Geçerli bir miktar girin'); return; }
    const updated = allUsers.map(x => x.id===u.id ? {...x, money:(x.money||0)+amt} : x);
    saveUsers(updated);
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId === u.id) {
      try { const p=JSON.parse(localStorage.getItem('rep_userProfile')||'{}'); const np={...p,money:(p.money||0)+amt}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'userProfile',value:np}})); } catch(e){}
    }
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, money:(selectedUser.money||0)+amt});
    setGiftAmount('');
    setMsg(`✅ ${u.username} kullanıcısına ${fmtM(amt)} verildi`);
  };

  const giveUC = (u) => {
    const amt = parseInt(giftUC);
    if (!amt || amt <= 0) { setMsg('Geçerli bir UC miktarı girin'); return; }
    const updated = allUsers.map(x => x.id===u.id ? {...x, underCoin:(x.underCoin||0)+amt} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, underCoin:(selectedUser.underCoin||0)+amt});
    setGiftUC('');
    setMsg(`✅ ${u.username} kullanıcısına ${amt} PG verildi`);
  };

  const setMoneyDirect = (u) => {
    const amt = parseInt(editMoney);
    if (isNaN(amt)) { setMsg('Geçerli bir miktar girin'); return; }
    const updated = allUsers.map(x => x.id===u.id ? {...x, money:amt} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, money:amt});
    setEditMoney('');
    setMsg(`✅ ${u.username} bakiyesi ${fmtM(amt)} olarak ayarlandı`);
  };

  const makeAdmin = (u) => {
    const updated = allUsers.map(x => x.id===u.id ? {...x, role: x.role==='admin'?'user':'admin'} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, role: selectedUser.role==='admin'?'user':'admin'});
    setMsg(`✅ ${u.username} rolü güncellendi`);
  };

  const giveEduPackage = (u) => {
    const expiry = Date.now() + 30*24*60*60*1000;
    const updated = allUsers.map(x => x.id===u.id ? {...x, eduPackage:true, eduPackageExpiry:expiry, packages:{...(x.packages||{}),edu:true}} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, eduPackage:true, eduPackageExpiry:expiry, packages:{...(selectedUser.packages||{}),edu:true}});
    setMsg(`✅ ${u.username} kullanıcısına 30 günlük Eğitim Paketi verildi`);
  };

  const giveMaxEdu = (u) => {
    const updated = allUsers.map(x => x.id===u.id ? {...x, education:{...(x.education||{}), diploma:'profesor', activeLevel:null, clicksDone:0, lastClick:0}} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, education:{...(selectedUser.education||{}), diploma:'profesor', activeLevel:null, clicksDone:0, lastClick:0}});
    setMsg(`✅ ${u.username} kullanıcısına Profesör diploması verildi`);
  };

  const resetUser = (u) => {
    const updated = allUsers.map(x => x.id===u.id ? {...x, money:10000, xp:0, level:1, underCoin:50, banned:false} : x);
    saveUsers(updated);
    if (selectedUser?.id === u.id) setSelectedUser({...selectedUser, money:10000, xp:0, level:1, underCoin:50});
    setMsg(`✅ ${u.username} sıfırlandı`);
  };

  const deleteUser = (u) => {
    const updated = allUsers.filter(x => x.id !== u.id);
    saveUsers(updated);
    setSelectedUser(null);
    setMsg(`✅ ${u.username} silindi`);
  };

  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Sistem');
  const [annIcon, setAnnIcon] = useState('📢');
  const [annImage, setAnnImage] = useState('');

  const sendAnnouncement = () => {
    if (!annTitle.trim()) { setMsg('Duyuru başlığı girin'); return; }
    if (!announcement.trim()) { setMsg('Duyuru metni girin'); return; }
    const ann = {
      id:genId(), title:annTitle.trim(), text:announcement.trim(), body:announcement.trim(),
      by:profile?.username||'Admin', ts:Date.now(), type:'system',
      category:annCategory, icon:annIcon, imageUrl:annImage.trim()||undefined
    };
    const newAnns = [ann, ...announcements].slice(0, 50);
    setAnnouncements(newAnns);
    setAnnouncement(''); setAnnTitle(''); setAnnImage('');
    setMsg('✅ Duyuru yayınlandı');
    showNotif?.('📢 Sistem duyurusu yayınlandı', 'info');
  };

  const totalMoney = allUsers.reduce((s,u)=>s+(u.money||0), 0);
  const bannedCount = allUsers.filter(u=>u.banned).length;
  const adminCount = allUsers.filter(u=>u.role==='admin').length;

  const cs = {background:'rgba(255,255,255,0.04)',borderRadius:'14px',padding:'1rem',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'0.65rem'};
  const inp = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.55rem 0.8rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',boxSizing:'border-box'};
  const tabs = [['dashboard','📊 Panel'],['users','👥 Kullanıcılar'],['manage','🛡️ Yönet'],['announce','📢 Duyuru'],['support','💬 Destek'],['logs','📋 Log'],['economy','💰 Ekonomi'],['education','🎓 Eğitim'],['tools','🛠️ Araçlar'],['election','🗳️ Seçim'],['makamlar','👑 Makamlar']];
  const [elections_multi, setElections_multi] = useLs('rep_elections_multi', {});

  return (
    <div style={{padding:'0.7rem',minHeight:'100%',background:'rgba(6,12,24,0.99)'}}>
      <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(11,21,39,0.95))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'16px',padding:'1rem 1.25rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#F87171',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'0.2rem'}}>⚙️ YÖNETİM PANELİ</div>
        <div style={{fontSize:'1.1rem',fontWeight:900,color:'#E8EDF2',fontFamily:"'Syne',sans-serif"}}>Admin: {profile?.username}</div>
        <div style={{fontSize:'0.7rem',color:'#5A7089',marginTop:'0.1rem'}}>{allUsers.length} kullanıcı • {onlineCnt} online • {bannedCount} banlı</div>
      </div>

      <div style={{display:'flex',gap:'4px',overflowX:'auto',scrollbarWidth:'none',marginBottom:'0.75rem'}}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={()=>{setTab(id);if(id!=='manage')setSelectedUser(null);}}
            style={{padding:'0.38rem 0.7rem',borderRadius:'8px',border:`1px solid ${tab===id?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.07)'}`,background:tab===id?'rgba(239,68,68,0.12)':'rgba(255,255,255,0.03)',color:tab===id?'#F87171':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.72rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'10px',padding:'0.55rem 0.8rem',fontSize:'0.78rem',color:'#10B981',marginBottom:'0.65rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>{msg}</span>
          <button onClick={()=>setMsg('')} style={{background:'none',border:'none',color:'#5A7089',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {tab==='dashboard' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.65rem'}}>
            {[
              ['👥','Toplam Kullanıcı', allUsers.length, '#60A5FA'],
              ['🟢','Şu An Online', onlineCnt, '#10B981'],
              ['🚫','Banlı', bannedCount, '#EF4444'],
              ['⭐','Admin', adminCount, '#F59E0B'],
              ['💰','Toplam Servet', fmtM(totalMoney), '#10B981'],
              ['🎮','Sürüm', 'v8.0', '#8B5CF6'],
            ].map(([ic,lbl,val,c]) => (
              <div key={lbl} style={{...cs,textAlign:'center',padding:'0.75rem'}}>
                <div style={{fontSize:'1.3rem',marginBottom:'0.1rem'}}>{ic}</div>
                <div style={{fontSize:'0.95rem',fontWeight:900,color:c}}>{val}</div>
                <div style={{fontSize:'0.6rem',color:'#3B4E63',fontWeight:700,textTransform:'uppercase'}}>{lbl}</div>
              </div>
            ))}
          </div>

          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🏆 En Zengin Oyuncular</div>
            {[...allUsers].sort((a,b)=>(b.money||0)-(a.money||0)).slice(0,5).map((u,i)=>(
              <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span style={{fontSize:'0.85rem'}}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <div>
                    <div style={{fontSize:'0.8rem',fontWeight:700,color:u.banned?'#EF4444':'#E8EDF2'}}>{u.username} {u.banned?'🚫':''}{u.role==='admin'?'⭐':''}</div>
                    <div style={{fontSize:'0.65rem',color:'#5A7089'}}>Lv.{u.level||1} • {u.city||'?'}</div>
                  </div>
                </div>
                <div style={{color:'#10B981',fontWeight:800,fontSize:'0.82rem'}}>{fmtM(u.money||0)}</div>
              </div>
            ))}
            {allUsers.length===0 && <div style={{color:'#3B4E63',fontSize:'0.8rem',textAlign:'center',padding:'1rem'}}>Henüz kayıtlı kullanıcı yok</div>}
          </div>

          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>⚡ Hızlı Erişim</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
              {[['👥','Kullanıcılar','users'],['🛡️','Yönet','manage'],['📢','Duyuru','announce'],['📋','Loglar','logs'],['🛠️','Araçlar','tools']].map(([ic,lbl,t])=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:'0.4rem 0.75rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>{ic} {lbl}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── KULLANICILAR ── */}
      {tab==='users' && (
        <div>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.65rem'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="İsim veya e-posta ara..." style={{...inp,flex:1}} />
            <button onClick={refreshUsers} style={{padding:'0.55rem 0.75rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',cursor:'pointer',fontWeight:700,fontSize:'0.8rem',whiteSpace:'nowrap'}}>↻</button>
          </div>
          <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.5rem'}}>{filteredUsers.length} kullanıcı gösteriliyor</div>
          {filteredUsers.map(u => (
            <div key={u.id} style={{...cs,marginBottom:'0.4rem',padding:'0.75rem',border:`1px solid ${u.banned?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.06)'}`,cursor:'pointer'}}
              onClick={()=>{setSelectedUser(u);setTab('manage');}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:u.banned?'rgba(239,68,68,0.2)':'rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem',flexShrink:0}}>
                    {u.role==='admin'?'⭐':u.banned?'🚫':'👤'}
                  </div>
                  <div>
                    <div style={{fontSize:'0.85rem',fontWeight:700,color:u.banned?'#F87171':u.role==='admin'?'#F59E0B':'#E8EDF2'}}>{u.username}</div>
                    <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{u.email} • Lv.{u.level||1} • {u.city||'?'}</div>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{color:'#10B981',fontWeight:700,fontSize:'0.82rem'}}>{fmtM(u.money||0)}</div>
                  <div style={{fontSize:'0.6rem',color:'#5A7089'}}>{u.underCoin||0} PG</div>
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length===0 && <div style={{...cs,textAlign:'center',color:'#3B4E63',padding:'2rem'}}>Kullanıcı bulunamadı</div>}
        </div>
      )}

      {/* ── YÖNET ── */}
      {tab==='manage' && (
        <div>
          {!selectedUser ? (
            <div>
              <div style={{color:'#5A7089',fontSize:'0.8rem',marginBottom:'0.65rem'}}>Yönetmek için Kullanıcılar sekmesinden bir kullanıcı seç</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                {allUsers.slice(0,10).map(u => (
                  <button key={u.id} onClick={()=>setSelectedUser(u)}
                    style={{padding:'0.35rem 0.75rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontFamily:"'DM Sans',sans-serif",fontSize:'0.78rem',cursor:'pointer',fontWeight:600}}>
                    {u.role==='admin'?'⭐':u.banned?'🚫':'👤'} {u.username}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{...cs,background:'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(11,21,39,0.9))'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'50%',background:selectedUser.banned?'rgba(239,68,68,0.2)':'rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>
                    {selectedUser.role==='admin'?'⭐':selectedUser.banned?'🚫':'👤'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1rem'}}>{selectedUser.username}</div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{selectedUser.email} • {selectedUser.city||'?'} • Lv.{selectedUser.level||1}</div>
                    <div style={{fontSize:'0.7rem',marginTop:'0.15rem'}}>
                      {selectedUser.banned && <span style={{color:'#EF4444',fontWeight:700}}>🚫 Banlı: {selectedUser.banReason}</span>}
                      {selectedUser.role==='admin' && <span style={{color:'#F59E0B',fontWeight:700}}>⭐ Admin</span>}
                    </div>
                  </div>
                  <button onClick={()=>setSelectedUser(null)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'0.3rem 0.6rem',color:'#5A7089',cursor:'pointer',fontWeight:700,fontSize:'0.78rem'}}>✕</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem',marginBottom:'0.75rem'}}>
                  {[['💰',fmtM(selectedUser.money||0),'Para'],['💎',selectedUser.underCoin||0,'PG'],['⭐',selectedUser.level||1,'Seviye'],['📊',selectedUser.xp||0,'XP'],['❤️',selectedUser.hp||100,'HP'],['🏙️',selectedUser.city||'?','Şehir']].map(([ic,v,l])=>(
                    <div key={l} style={{background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
                      <div style={{fontSize:'0.9rem'}}>{ic}</div>
                      <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.75rem'}}>{v}</div>
                      <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase'}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Para ver */}
              <div style={cs}>
                <div style={{fontWeight:700,color:'#10B981',marginBottom:'0.5rem',fontSize:'0.8rem'}}>💰 Para İşlemleri</div>
                <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem'}}>
                  <input type="number" value={giftAmount} onChange={e=>setGiftAmount(e.target.value)} placeholder="Verilecek para" style={{...inp,flex:1}} />
                  <button onClick={()=>giveMoney(selectedUser)} style={{padding:'0.55rem 0.75rem',borderRadius:'10px',border:'none',background:'#10B981',color:'#fff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',whiteSpace:'nowrap'}}>+ Ver</button>
                </div>
                <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem'}}>
                  <input type="number" value={editMoney} onChange={e=>setEditMoney(e.target.value)} placeholder="Bakiyeyi direkt ayarla" style={{...inp,flex:1}} />
                  <button onClick={()=>setMoneyDirect(selectedUser)} style={{padding:'0.55rem 0.75rem',borderRadius:'10px',border:'none',background:'#F59E0B',color:'#000',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',whiteSpace:'nowrap'}}>Ayarla</button>
                </div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  {[1000,5000,10000,50000,100000,1000000].map(n=>(
                    <button key={n} onClick={()=>{setGiftAmount(String(n));}} style={{padding:'0.25rem 0.55rem',borderRadius:'7px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#5A7089',fontSize:'0.68rem',cursor:'pointer',fontWeight:700}}>{fmtM(n)}</button>
                  ))}
                </div>
              </div>

              {/* UC ver */}
              <div style={cs}>
                <div style={{fontWeight:700,color:'#60A5FA',marginBottom:'0.5rem',fontSize:'0.8rem'}}>💎 PoliGold İşlemleri</div>
                <div style={{display:'flex',gap:'0.4rem'}}>
                  <input type="number" value={giftUC} onChange={e=>setGiftUC(e.target.value)} placeholder="Verilecek UC" style={{...inp,flex:1}} />
                  <button onClick={()=>giveUC(selectedUser)} style={{padding:'0.55rem 0.75rem',borderRadius:'10px',border:'none',background:'#3B82F6',color:'#fff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',whiteSpace:'nowrap'}}>+ Ver</button>
                </div>
              </div>

              {/* Ban işlemleri */}
              <div style={cs}>
                <div style={{fontWeight:700,color:'#EF4444',marginBottom:'0.5rem',fontSize:'0.8rem'}}>🚫 Ban İşlemleri</div>
                {!selectedUser.banned && (
                  <input value={banReason} onChange={e=>setBanReason(e.target.value)} placeholder="Ban sebebi (isteğe bağlı)" style={{...inp,marginBottom:'0.4rem'}} />
                )}
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  <button onClick={()=>banToggle(selectedUser)}
                    style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'none',background:selectedUser.banned?'#10B981':'#EF4444',color:'#fff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    {selectedUser.banned ? '✅ Banı Kaldır' : '🚫 Banla'}
                  </button>
                  <button onClick={()=>makeAdmin(selectedUser)}
                    style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'none',background:selectedUser.role==='admin'?'#64748B':'#F59E0B',color:selectedUser.role==='admin'?'#fff':'#000',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    {selectedUser.role==='admin' ? '↓ Admin Al' : '⭐ Admin Yap'}
                  </button>
                  <button onClick={()=>resetUser(selectedUser)}
                    style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'1px solid rgba(245,158,11,0.3)',background:'rgba(245,158,11,0.1)',color:'#F59E0B',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    ↺ Sıfırla
                  </button>
                  <button onClick={()=>giveEduPackage(selectedUser)}
                    style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'1px solid rgba(139,92,246,0.4)',background:'rgba(139,92,246,0.15)',color:'#A78BFA',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    🎓 Edu Paketi
                  </button>
                  <button onClick={()=>giveMaxEdu(selectedUser)}
                    style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'1px solid rgba(249,115,22,0.4)',background:'rgba(249,115,22,0.15)',color:'#FB923C',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    🏛️ Profesör Yap
                  </button>
                  <button onClick={()=>{if(window.confirm('Kullanıcıyı sil?'))deleteUser(selectedUser);}}
                    style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',color:'#EF4444',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DUYURU ── */}
      {tab==='announce' && (
        <div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.75rem',fontSize:'0.85rem'}}>📢 Sistem Duyurusu Yayınla</div>
            <div style={{marginBottom:'0.5rem'}}>
              <div style={{fontSize:'0.7rem',color:'#8BA0B5',fontWeight:700,marginBottom:'0.3rem'}}>Başlık *</div>
              <input value={annTitle} onChange={e=>setAnnTitle(e.target.value)} placeholder="Duyuru başlığı..."
                style={{...inp,marginBottom:0}} />
            </div>
            <div style={{marginBottom:'0.5rem'}}>
              <div style={{fontSize:'0.7rem',color:'#8BA0B5',fontWeight:700,marginBottom:'0.3rem'}}>Kategori & İkon</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'0.4rem'}}>
                <select value={annCategory} onChange={e=>setAnnCategory(e.target.value)}
                  style={{...inp,marginBottom:0,background:'rgba(255,255,255,0.04)',color:'#E8EDF2'}}>
                  {['Sistem','Siyaset','Ekonomi','Hukuk','Etkinlik','Güvenlik','Eğitim'].map(c=>(
                    <option key={c} value={c} style={{background:'#0F172A'}}>{c}</option>
                  ))}
                </select>
                <select value={annIcon} onChange={e=>setAnnIcon(e.target.value)}
                  style={{...inp,marginBottom:0,width:'60px',background:'rgba(255,255,255,0.04)',color:'#E8EDF2',textAlign:'center'}}>
                  {['📢','🏛️','💰','⚖️','🎉','🚔','🎓','⚠️','🔥','📌'].map(ic=>(
                    <option key={ic} value={ic} style={{background:'#0F172A'}}>{ic}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{marginBottom:'0.5rem'}}>
              <div style={{fontSize:'0.7rem',color:'#8BA0B5',fontWeight:700,marginBottom:'0.3rem'}}>Duyuru Metni *</div>
              <textarea value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="Duyuru içeriği... (tüm oyunculara görünür)" rows={4}
                style={{...inp,resize:'vertical',marginBottom:0}} />
            </div>
            <div style={{marginBottom:'0.65rem'}}>
              <div style={{fontSize:'0.7rem',color:'#8BA0B5',fontWeight:700,marginBottom:'0.3rem'}}>Görsel URL (isteğe bağlı)</div>
              <input value={annImage} onChange={e=>setAnnImage(e.target.value)} placeholder="https://... (resim bağlantısı)"
                style={{...inp,marginBottom:0}} />
              {annImage && <img src={annImage} alt="önizleme" style={{marginTop:'0.4rem',maxHeight:'80px',borderRadius:'8px',objectFit:'cover',width:'100%'}} onError={e=>e.target.style.display='none'} />}
            </div>
            <button onClick={sendAnnouncement} style={{width:'100%',padding:'0.7rem',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#fff',fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
              {annIcon} Duyuruyu Yayınla
            </button>
          </div>

          <div style={cs}>
            <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>📋 Son Duyurular ({announcements.length})</div>
            {announcements.length===0 && <div style={{color:'#3B4E63',fontSize:'0.8rem',textAlign:'center',padding:'1rem'}}>Henüz duyuru yok</div>}
            {announcements.map(a => (
              <div key={a.id} style={{padding:'0.6rem',borderBottom:'1px solid rgba(255,255,255,0.04)',borderRadius:'8px',marginBottom:'0.3rem'}}>
                {a.imageUrl && <img src={a.imageUrl} alt="" style={{width:'100%',maxHeight:'100px',objectFit:'cover',borderRadius:'8px',marginBottom:'0.4rem'}} onError={e=>e.target.style.display='none'} />}
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
                  <span style={{fontSize:'0.9rem'}}>{a.icon||'📢'}</span>
                  <span style={{fontSize:'0.82rem',fontWeight:800,color:'#E8EDF2'}}>{a.title||a.text}</span>
                  {a.category && <span style={{fontSize:'0.55rem',padding:'0.1rem 0.4rem',borderRadius:'6px',background:'rgba(59,130,246,0.2)',color:'#60A5FA',fontWeight:700}}>{a.category}</span>}
                </div>
                {a.title && <div style={{fontSize:'0.78rem',color:'#8BA0B5',marginBottom:'0.2rem'}}>{a.body||a.text}</div>}
                <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{a.by} • {timeAgo(a.ts)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DESTEK MESAJLARI ── */}
      {tab==='support' && <AdminSupportTab setMsg={setMsg} inp={inp} cs={cs} />}

      {/* ── LOG ── */}
      {tab==='logs' && (
        <div>
          <div style={{display:'flex',gap:'4px',marginBottom:'0.65rem',overflowX:'auto',scrollbarWidth:'none'}}>
            {[['all','Tümü'],['banned','Banlılar'],['admin','Adminler'],['rich','En Zengin']].map(([id,lbl])=>(
              <button key={id} onClick={()=>setTabLog(id)}
                style={{padding:'0.3rem 0.65rem',borderRadius:'7px',border:`1px solid ${tabLog===id?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.07)'}`,background:tabLog===id?'rgba(239,68,68,0.1)':'rgba(255,255,255,0.03)',color:tabLog===id?'#F87171':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.72rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                {lbl}
              </button>
            ))}
          </div>
          {(tabLog==='all'?allUsers:tabLog==='banned'?allUsers.filter(u=>u.banned):tabLog==='admin'?allUsers.filter(u=>u.role==='admin'):[...allUsers].sort((a,b)=>(b.money||0)-(a.money||0)).slice(0,20))
            .map(u => (
            <div key={u.id} style={{...cs,marginBottom:'0.35rem',padding:'0.65rem',cursor:'pointer'}} onClick={()=>{setSelectedUser(u);setTab('manage');}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:700,color:u.banned?'#F87171':u.role==='admin'?'#F59E0B':'#E8EDF2'}}>{u.role==='admin'?'⭐ ':u.banned?'🚫 ':''}{u.username}</div>
                  <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{u.email||'—'} • {u.city||'?'} • Lv.{u.level||1}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#10B981',fontWeight:700,fontSize:'0.75rem'}}>{fmtM(u.money||0)}</div>
                  <div style={{fontSize:'0.6rem',color:'#5A7089'}}>{u.underCoin||0} PG</div>
                </div>
              </div>
            </div>
          ))}
          {allUsers.length===0 && <div style={{...cs,textAlign:'center',color:'#3B4E63',padding:'2rem'}}>Henüz kullanıcı yok</div>}
        </div>
      )}

      {/* ── EKONOMİ ── */}
      {tab==='economy' && (
        <div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>💰 Ekonomi Özeti</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.65rem'}}>
              {[
                ['💰','Toplam Para', fmtM(totalMoney), '#10B981'],
                ['📊','Ort. Bakiye', fmtM(allUsers.length>0?Math.floor(totalMoney/allUsers.length):0), '#60A5FA'],
                ['💎','Toplam VIP', allUsers.filter(u=>u.premium).length, '#A78BFA'],
                ['🪙','Toplam UC', allUsers.reduce((s,u)=>s+(u.underCoin||0),0).toLocaleString('tr-TR'), '#F59E0B'],
              ].map(([ic,lbl,val,c]) => (
                <div key={lbl} style={{...cs,textAlign:'center',padding:'0.75rem',marginBottom:0}}>
                  <div style={{fontSize:'1.1rem'}}>{ic}</div>
                  <div style={{fontSize:'0.9rem',fontWeight:900,color:c}}>{val}</div>
                  <div style={{fontSize:'0.58rem',color:'#3B4E63',fontWeight:700,textTransform:'uppercase'}}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.5rem',fontSize:'0.82rem'}}>💎 VIP Üyeler</div>
            {allUsers.filter(u=>u.premium).length === 0
              ? <div style={{color:'#3B4E63',fontSize:'0.78rem',textAlign:'center',padding:'0.75rem'}}>Henüz VIP üye yok</div>
              : allUsers.filter(u=>u.premium).map(u=>(
                <div key={u.id} style={{display:'flex',justifyContent:'space-between',padding:'0.35rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.78rem'}}>
                  <span style={{color:'#A78BFA',fontWeight:700}}>💎 {u.username}</span>
                  <span style={{color:'#5A7089'}}>{fmtM(u.money||0)}</span>
                </div>
              ))
            }
          </div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🏢 Holdingler</div>
            {(() => {
              try {
                const hs = JSON.parse(localStorage.getItem('holdings')||'[]');
                const totalHoldings = hs.length;
                const totalAssets = hs.reduce((s,h)=>s+(h.value||0),0);
                return (
                  <div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                      {[['🏢','Toplam Şirket',totalHoldings,'#60A5FA'],['💰','Toplam Değer',fmtM(totalAssets),'#10B981']].map(([ic,lbl,val,c])=>(
                        <div key={lbl} style={{background:'rgba(255,255,255,0.03)',borderRadius:'10px',padding:'0.65rem',textAlign:'center'}}>
                          <div style={{fontSize:'1.1rem'}}>{ic}</div>
                          <div style={{fontWeight:800,color:c}}>{val}</div>
                          <div style={{fontSize:'0.6rem',color:'#3B4E63',textTransform:'uppercase'}}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch { return <div style={{color:'#3B4E63',fontSize:'0.78rem'}}>Veri yok</div>; }
            })()}
          </div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🏛️ Partiler & Çeteler</div>
            {(() => {
              const parties = JSON.parse(localStorage.getItem('parties')||'[]');
              const gangs = JSON.parse(localStorage.getItem('gangs')||'[]');
              return (
                <div>
                  {[['🏛️','Parti Sayısı',parties.length,'#A78BFA'],['🔫','Çete/Aile',gangs.length,'#EF4444']].map(([ic,lbl,val,c])=>(
                    <div key={lbl} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.78rem'}}>
                      <span style={{color:'#5A7089'}}>{ic} {lbl}</span>
                      <span style={{color:c,fontWeight:700}}>{val}</span>
                    </div>
                  ))}
                  {parties.slice(0,5).map(p=>(
                    <div key={p.id} style={{display:'flex',justifyContent:'space-between',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.03)',fontSize:'0.72rem'}}>
                      <span style={{color:'#A78BFA'}}>🏛️ {p.name}</span>
                      <span style={{color:'#5A7089'}}>{p.memberCount||0} üye • ₱{(p.treasury||0).toLocaleString('tr-TR')} hazine</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── EĞİTİM TAKİBİ ── */}
      {tab==='education' && (
        <div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🎓 Eğitim İstatistikleri</div>
            {(() => {
              const counts = {ilkokul:0,ortaokul:0,lise:0,universite:0,yukseklisans:0,doktora:0};
              allUsers.forEach(u => { const d = u.education?.diploma||'ilkokul'; if(counts[d]!==undefined) counts[d]++; });
              return (
                <div>
                  {EDU_LEVELS.map(lvl=>(
                    <div key={lvl.id} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <span style={{fontSize:'1rem',flexShrink:0}}>{lvl.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'0.78rem',fontWeight:700,color:'#E8EDF2'}}>{lvl.label}</div>
                        <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',marginTop:'0.2rem'}}>
                          <div style={{height:'100%',width:`${allUsers.length>0?Math.round(counts[lvl.id]/allUsers.length*100):0}%`,background:lvl.color,borderRadius:'2px',transition:'width 0.5s'}}/>
                        </div>
                      </div>
                      <span style={{fontSize:'0.78rem',fontWeight:800,color:lvl.color,flexShrink:0}}>{counts[lvl.id]}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🔒 Makam Kilitleri Durumu</div>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.5rem'}}>Kaç oyuncu hangi makamlara ulaşabilir:</div>
            {Object.entries(EDU_POSITION_REQS).slice(0,8).map(([pos,req])=>{
              const reqIdx = EDU_LEVELS.findIndex(e=>e.id===req);
              const eligible = allUsers.filter(u=>{
                const d = u.education?.diploma||'ilkokul';
                return EDU_LEVELS.findIndex(e=>e.id===d) >= reqIdx;
              }).length;
              return (
                <div key={pos} style={{display:'flex',justifyContent:'space-between',padding:'0.35rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.75rem'}}>
                  <span style={{color:'#5A7089'}}>{pos}</span>
                  <span style={{color:eligible>0?'#10B981':'#EF4444',fontWeight:700}}>{eligible} uygun oyuncu</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ARAÇLAR ── */}
      {tab==='tools' && (
        <div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.75rem',fontSize:'0.85rem'}}>🛠️ Sistem Araçları</div>
            <div style={{display:'grid',gap:'0.5rem'}}>
              {[
                ['↻ Oyunu Yenile', '#8B5CF6', ()=>window.location.reload()],
                ['👤 Profilime Git', '#3B82F6', ()=>onNavigate('profile')],
                ['🏠 Ana Sayfaya Git', '#10B981', ()=>onNavigate('home')],
                ['🧹 Yerel Veriyi Temizle (DİKKAT!)', '#EF4444', ()=>{ if(window.confirm('TÜM yerel veriler silinecek! Emin misin?')){localStorage.clear();window.location.reload();} }],
              ].map(([lbl,clr,fn])=>(
                <button key={lbl} onClick={fn} style={{padding:'0.75rem',borderRadius:'10px',border:`1px solid ${clr}33`,background:`${clr}18`,color:clr,fontWeight:700,fontSize:'0.82rem',cursor:'pointer',textAlign:'left'}}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={cs}>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.5rem',fontSize:'0.85rem'}}>ℹ️ Sistem Bilgisi</div>
            {[
              ['Oyun', 'UOLİTİKON v8.0'],
              ['Kullanıcı Sayısı', allUsers.length],
              ['Online Sayısı', onlineCnt],
              ['Banlı Kullanıcı', bannedCount],
              ['Admin Sayısı', adminCount],
              ['Toplam Servet', fmtM(totalMoney)],
              ['Platform', 'Firebase RTDB + LocalStorage'],
            ].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.78rem'}}>
                <span style={{color:'#5A7089'}}>{k}</span>
                <span style={{color:'#E8EDF2',fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEÇİM YÖNETİMİ (9 Pozisyon) ── */}
      {tab==='election' && <AdminElectionTab elections_multi={elections_multi} setElections_multi={setElections_multi} setMsg={setMsg} cs={cs} inp={inp} />}

      {/* ── MAKAMLAR ── */}
      {tab==='makamlar' && <AdminMakamlarTab allUsers={allUsers} setAllUsersRaw={setAllUsersRaw} setMsg={setMsg} cs={cs} inp={inp} />}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// DÜNYA SAYFASI
// ═══════════════════════════════════════════════════════
function WorldPage({ profile, onNavigate }) {
  const sections = [
    { title:'⚔️ SAVAŞ & GÜÇ', color:'#EF4444', items:[
      {icon:'⚔️',label:'PvP Savaş',page:'gang',sub:'Rakiple dövüş'},
      {icon:'💀',label:'Çeteler',page:'gang',sub:'Yeraltı dünyası'},
      {icon:'🏰',label:'Kale Sistemi',page:'gang',sub:'Kaleleri ele geçir'},
      {icon:'🔥',label:'Uluslar. Savaş',page:'gang',sub:'Global çatışma'},
      {icon:'🕵️',label:'Casusluk',page:'gang',sub:'Ajan operasyonları'},
      {icon:'⚖️',label:'Mahkeme',page:'gang',sub:'Hukuk sistemi'},
    ]},
    { title:'🤝 İTTİFAKLAR', color:'#3B82F6', items:[
      {icon:'🤝',label:'İttifak',page:'alliance',sub:'Güç birliği'},
      {icon:'👪',label:'Aileler',page:'gang',sub:'Aile sistemi'},
      {icon:'🗺️',label:'Arazi Savaşı',page:'gang',sub:'Toprak kontrolü'},
      {icon:'🌍',label:'Dünya Haritası',page:'alliance',sub:'Global görünüm'},
      {icon:'🚔',label:'Polis',page:'gang',sub:'Emniyet'},
      {icon:'⚔️',label:'Paralı Ordu',page:'gang',sub:'Özel kuvvetler'},
    ]},
    { title:'👥 OYUNCULAR', color:'#10B981', items:[
      {icon:'👥',label:'Tüm Oyuncular',page:'players',sub:'Topluluk'},
      {icon:'🏆',label:'Liderlik',page:'players',sub:'En iyiler'},
      {icon:'🌐',label:'Dünya Sohbeti',page:'chat',sub:'Global chat'},
      {icon:'📊',label:'İstatistikler',page:'profile',sub:'Sıralamalar'},
      {icon:'💎',label:'Premium',page:'premium',sub:'VIP üyelik'},
      {icon:'📰',label:'Gazete',page:'chat',sub:'Haberler'},
    ]},
  ];
  return (
    <div style={{padding:'0 0.75rem 1rem',background:'#F0F2F5',minHeight:'100%'}}>
      <div style={{paddingTop:'0.75rem'}}>
        {sections.map((sec,si)=>(
          <div key={si} style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',marginBottom:'0.65rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.75rem',fontWeight:800,color:sec.color,letterSpacing:'0.1em',marginBottom:'0.7rem'}}>{sec.title}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.45rem'}}>
              {sec.items.map((item,i)=>(
                <button key={i} onClick={()=>onNavigate(item.page)}
                  style={{background:'#F5F7FA',border:'1px solid rgba(0,0,0,0.07)',borderRadius:'12px',padding:'0.75rem 0.3rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s'}}>
                  <span style={{fontSize:'1.5rem',lineHeight:1}}>{item.icon}</span>
                  <span style={{fontSize:'0.65rem',fontWeight:700,color:'#1A2233',textAlign:'center',lineHeight:1.2}}>{item.label}</span>
                  <span style={{fontSize:'0.55rem',color:'#9AABBA',textAlign:'center'}}>{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CHAT SİSTEMİ
// ═══════════════════════════════════════════════════════
function ChatPage({ profile }) {
  const [tab, setTab] = useState('global');
  const [globalChat, setGlobalChat] = useLs('globalChat', []);
  const [cityChats, setCityChats] = useLs('cityChats', {});
  const [msg, setMsg] = useState('');
  const [dmTarget, setDmTarget] = useState(null);
  const [dmModal, setDmModal] = useState(false);
  const [dms, setDms] = useLs('privateDMs', {});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const cityKey = profile?.city || 'İstanbul';
  const cityMessages = (cityChats && cityChats[cityKey]) ? cityChats[cityKey] : [];

  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [giphyLoading, setGiphyLoading] = useState(false);

  useEffect(() => {
    if (!showGifPicker) return;
    const q = gifSearch.trim();
    const timer = setTimeout(async () => {
      setGiphyLoading(true);
      try {
        const endpoint = q ? `/api/giphy-search?q=${encodeURIComponent(q)}` : '/api/giphy-trending';
        const r = await fetch(endpoint);
        const data = await r.json();
        if (data && Array.isArray(data.data)) {
          setGiphyResults(data.data.map(g => g.images?.fixed_height?.url || g.images?.downsized?.url || '').filter(Boolean));
        }
      } catch(e) { setGiphyResults([]); }
      setGiphyLoading(false);
    }, q ? 500 : 0);
    return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker]);

  const POPULAR_GIFS = [
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/l0HlFZ3HqbGrMTBQs/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/xT9IgG50Lg7russbBO/giphy.gif',
    'https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',
    'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
    'https://media.giphy.com/media/3oEdv22bMDaqXkOIPS/giphy.gif',
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
    'https://media.giphy.com/media/Vbtc9VG51NtzT1Qnv1/giphy.gif',
    'https://media.giphy.com/media/TdfyKrN7HGTIY/giphy.gif',
  ];
  const displayGifs = giphyResults.length > 0 ? giphyResults : POPULAR_GIFS;

  const sendMsg = (textOverride) => {
    const text = textOverride || msg;
    if (!text?.trim()) return;
    const newMsg = {
      id: genId(), userId: profile?.uid, username: profile?.username || 'Oyuncu',
      gender: profile?.gender, text: text.trim(), ts: Date.now(),
      level: profile?.level || 1, premium: profile?.premium,
      photoUrl: profile?.avatarUrl || profile?.photoUrl || null,
    };
    if (tab === 'global') {
      const updated = [...(globalChat||[]).slice(-199), newMsg];
      setGlobalChat(updated);
      // RTDB'ye gerçek zamanlı yaz
      try {
        if (window._fb?.rtdb && window._gameId) {
          window._fb.rtdb.ref(`games/${window._gameId}/realtime/globalChat`)
            .transaction(cur => { const arr=Array.isArray(cur)?cur:[]; return [...arr,newMsg].slice(-200); });
        }
      } catch(e) {}
    } else if (tab === 'city') {
      const upd = { ...(cityChats||{}), [cityKey]: [...(cityMessages||[]).slice(-99), newMsg] };
      setCityChats(upd);
      // RTDB'ye gerçek zamanlı yaz
      try {
        if (window._fb?.rtdb && window._gameId) {
          window._fb.rtdb.ref(`games/${window._gameId}/realtime/cityChats`)
            .transaction(cur => {
              const obj = cur||{};
              return {...obj,[cityKey]:[...(Array.isArray(obj[cityKey])?obj[cityKey]:[]).slice(-99),newMsg]};
            });
        }
      } catch(e) {}
    }
    if (!textOverride) setMsg('');
    setShowGifPicker(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    try {
      const ds = JSON.parse(localStorage.getItem('rep_dailyTaskProgress')||'{}');
      const today = new Date().toDateString();
      const ts = ds[today]||{};
      const cur = ts['chat3']||0;
      if (cur < 3) {
        const ns = {...ds,[today]:{...ts,chat3:cur+1}};
        localStorage.setItem('rep_dailyTaskProgress', JSON.stringify(ns));
        window.dispatchEvent(new CustomEvent('daily-progress-updated'));
      }
    } catch(e){}
  };

  const sendGif = (gifUrl) => { sendMsg(gifUrl); };

  const messages = tab === 'global' ? (globalChat||[]) : tab === 'city' ? cityMessages : [];

  const chatTabs = [
    { id:'global', label:'🌍 Global' },
    { id:'city',   label:`🏙️ ${cityKey}` },
    { id:'dm',     label:'✉️ Özel' },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100dvh - 120px)'}}>
      {/* Tabs */}
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)',overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
        {chatTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{padding:'0.4rem 0.85rem',borderRadius:'8px',border:`1px solid ${tab===t.id?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,background:tab===t.id?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:tab===t.id?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.78rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {t.label}
          </button>
        ))}
        <div style={{flex:1}} />
        {tab==='dm' && (
          <button onClick={()=>setDmModal(true)} style={{padding:'0.4rem 0.75rem',borderRadius:'8px',border:'1px solid rgba(59,130,246,0.3)',background:'rgba(59,130,246,0.1)',color:'#60A5FA',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>+ Yeni DM</button>
        )}
      </div>

      {/* Mesajlar */}
      {tab !== 'dm' ? (
        <>
          <div style={{flex:1,overflowY:'auto',padding:'0.6rem 0.7rem',display:'flex',flexDirection:'column',gap:'0.4rem',WebkitOverflowScrolling:'touch'}}>
            {messages.slice(-80).map((m,i) => {
              const isMe = m.userId === profile?.uid;
              const imgRx = /(https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|gifv)(\?\S*)?|https?:\/\/(?:media\.giphy\.com|i\.giphy\.com|media\d*\.giphy\.com|tenor\.com|c\.tenor\.com|media\.tenor\.com)\S+)/i;
              const imgMatch = m.text?.match(imgRx);
              const isGiphyUrl = imgMatch && /giphy\.com|tenor\.com/i.test(imgMatch[0]);
              const isImageOnly = imgMatch && (m.text.trim()===imgMatch[0] || isGiphyUrl);
              return (
                <div key={m.id||i} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'0.45rem',alignItems:'flex-end'}}>
                  {!isMe && (
                    <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,#1a3a5c,#0a1a2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',border:'1px solid rgba(59,130,246,0.2)',flexShrink:0,overflow:'hidden'}}>
                      {m.photoUrl ? <img src={m.photoUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" onError={e=>e.target.style.display='none'}/> : m.gender==='female'?'👩':'👨'}
                    </div>
                  )}
                  <div style={{maxWidth:'78%'}}>
                    {!isMe && <div style={{fontSize:'0.63rem',color:m.premium?'#F59E0B':'#5A7089',fontWeight:700,marginBottom:'2px',paddingLeft:'4px'}}>{m.username} {m.premium&&'⭐'}</div>}
                    {isImageOnly ? (
                      <div style={{borderRadius:isMe?'12px 12px 3px 12px':'12px 12px 12px 3px',overflow:'hidden',border:`1px solid ${isMe?'rgba(59,130,246,0.25)':'rgba(255,255,255,0.08)'}`}}>
                        <img src={imgMatch[0]} alt="foto" style={{maxWidth:'220px',maxHeight:'200px',display:'block',objectFit:'cover'}} onError={e=>{e.target.parentElement.innerHTML=`<div style="padding:0.5rem 0.75rem;color:#EF4444;font-size:0.75rem">⚠️ Resim yüklenemedi</div>`;}}/>
                      </div>
                    ) : (
                      <div style={{background:isMe?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${isMe?'rgba(59,130,246,0.25)':'rgba(255,255,255,0.08)'}`,borderRadius:isMe?'12px 12px 3px 12px':'12px 12px 12px 3px',padding:'0.5rem 0.75rem',fontSize:'0.87rem',color:'#D0E0F0',lineHeight:1.5,wordBreak:'break-word'}}>
                        {imgMatch ? (
                          <>
                            <span>{m.text.replace(imgMatch[0],'').trim()}</span>
                            {m.text.replace(imgMatch[0],'').trim() && <br/>}
                            <img src={imgMatch[0]} alt="foto" style={{maxWidth:'200px',maxHeight:'180px',borderRadius:'8px',marginTop:'4px',display:'block'}} onError={e=>e.target.style.display='none'}/>
                          </>
                        ) : m.text}
                      </div>
                    )}
                    <div style={{fontSize:'0.58rem',color:'#3B4E63',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:isMe?0:'4px'}}>{timeAgo(m.ts)}</div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz mesaj yok. İlk sen yaz! 💬</div>}
            <div ref={messagesEndRef} />
          </div>
          {/* GIF Picker */}
          {showGifPicker && (
            <div style={{background:'rgba(6,12,24,0.98)',borderTop:'1px solid rgba(255,255,255,0.08)',padding:'0.6rem',flexShrink:0}}>
              <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.5rem'}}>
                <input value={gifSearch} onChange={e=>setGifSearch(e.target.value)} placeholder="GIF ara... (örn: güzel, komik, siyaset)"
                  style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.45rem 0.75rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}} />
                <button onClick={()=>setShowGifPicker(false)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.45rem 0.6rem',color:'#5A7089',cursor:'pointer',fontSize:'0.8rem'}}>✕</button>
              </div>
              {giphyLoading && <div style={{textAlign:'center',color:'#5A7089',fontSize:'0.78rem',padding:'0.3rem'}}>🔄 Yükleniyor...</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.35rem',maxHeight:'160px',overflowY:'auto',scrollbarWidth:'none'}}>
                {displayGifs.map((g,i)=>(
                  <img key={i} src={g} alt="gif" onClick={()=>sendGif(g)}
                    style={{height:'72px',width:'100%',objectFit:'cover',borderRadius:'8px',cursor:'pointer',border:'1px solid rgba(255,255,255,0.08)',transition:'transform 0.1s'}}
                    onMouseOver={e=>e.target.style.transform='scale(1.05)'}
                    onMouseOut={e=>e.target.style.transform='scale(1)'}
                    onError={e=>e.target.style.display='none'} />
                ))}
              </div>
              <div style={{fontSize:'0.58rem',color:'#3B4E63',textAlign:'right',marginTop:'0.3rem'}}>Powered by GIPHY</div>
            </div>
          )}
          {/* Input */}
          <div style={{padding:'0.5rem 0.7rem',background:'rgba(6,12,24,0.97)',borderTop:'1px solid rgba(255,255,255,0.04)',paddingBottom:'calc(0.5rem + env(safe-area-inset-bottom, 0px))',flexShrink:0}}>
            <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-end'}}>
              <button onClick={(e)=>{e.stopPropagation();setShowGifPicker(v=>!v);}} title="GIF Gönder"
                style={{background:showGifPicker?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${showGifPicker?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'12px',padding:'0.6rem 0.65rem',color:showGifPicker?'#60A5FA':'#8BA0B5',cursor:'pointer',fontSize:'1rem',flexShrink:0}}>
                🎞️
              </button>
              <input ref={inputRef} value={msg} onChange={e=>setMsg(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
                placeholder="Mesaj yaz veya URL yapıştır..." maxLength={500}
                style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0.6rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',resize:'none'}} />
              <button onClick={()=>sendMsg()} style={{background:'linear-gradient(135deg,#3B82F6,#2563EB)',border:'none',borderRadius:'12px',padding:'0.6rem 1rem',color:'#fff',fontWeight:700,fontSize:'1rem',cursor:'pointer',flexShrink:0}}>→</button>
            </div>
          </div>
        </>
      ) : (
        /* DM listesi */
        <div style={{flex:1,overflowY:'auto',padding:'0.7rem'}}>
          <div style={{color:'#3B4E63',textAlign:'center',padding:'2rem',fontSize:'0.85rem'}}>
            Özel mesaj için kullanıcı arayın 🔍
            <br/>
            <button onClick={()=>setDmModal(true)} style={{marginTop:'1rem',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'10px',padding:'0.5rem 1rem',color:'#60A5FA',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer'}}>Kullanıcı Ara</button>
          </div>
        </div>
      )}

      {dmModal && (
        <Modal title="✉️ Özel Mesaj" onClose={()=>setDmModal(false)}>
          <div style={{color:'#8BA0B5',fontSize:'0.85rem',textAlign:'center',padding:'1rem'}}>
            Kullanıcı arama sistemi — Oyuncular sayfasından profil açarak DM gönderebilirsiniz.
          </div>
          <Btn variant='primary' size='full' onClick={()=>setDmModal(false)}>Tamam</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EKONOMİ SAYFASI
// ═══════════════════════════════════════════════════════
function EconomyPage({ profile, setProfile, showNotif, initialSub }) {
  const [sub, setSub] = useState(initialSub||'overview');
  const [stocks, setStocks] = useLs('stockMarket', { TECH:145, ENERGY:88, FOOD:62, BANK:210, DEFENSE:175 });
  const [portfolio, setPortfolio] = useLs('stockPortfolio', {});
  const [farmModal, setFarmModal] = useState(null);
  const [farms, setFarms] = useLs('userFarms', []);
  const [casinoResult, setCasinoResult] = useState(null);
  const [stockBTab, setStockBTab] = useState('market');
  const [shortPos, setShortPos] = useLs('shortPositions', {});
  const [priceHist, setPriceHist] = useLs('stockPriceHist', {
    TECH:   [145,148,142,150,155,149,152,158,162,160],
    ENERGY: [88,85,90,87,92,95,89,93,91,96],
    FOOD:   [62,60,65,63,68,70,66,72,69,74],
    BANK:   [210,215,208,220,218,225,222,230,228,235],
    DEFENSE:[175,180,172,185,183,190,188,195,192,198],
  });

  const [ucConvertAmt, setUcConvertAmt] = useState('');
  const [tlConvertAmt, setTlConvertAmt] = useState('');
  const [katsayiAmt, setKatsayiAmt] = useState('');
  const UC_TO_TL = 1000000;

  const convertUcToTl = () => {
    const uc = parseInt(ucConvertAmt) || 0;
    if (uc <= 0) { showNotif('Geçerli bir UC miktarı girin', 'error'); return; }
    if ((profile?.underCoin||0) < uc) { showNotif('Yeterli UC yok!', 'error'); return; }
    const tl = uc * UC_TO_TL;
    const p = {...profile, underCoin:(profile.underCoin||0)-uc, money:(profile.money||0)+tl};
    setProfile(p); localStorage.setItem('rep_userProfile', JSON.stringify(p));
    setUcConvertAmt('');
    showNotif(`✅ ${uc} PG → ${fmtWord(tl)} dönüştürüldü!`, 'success');
  };

  const convertTlToUc = () => {
    const tl = parseInt(tlConvertAmt) || 0;
    if (tl <= 0) { showNotif('Geçerli bir TL miktarı girin', 'error'); return; }
    if ((profile?.money||0) < tl) { showNotif('Yeterli para yok!', 'error'); return; }
    const uc = Math.floor(tl / UC_TO_TL);
    if (uc <= 0) { showNotif(`En az ${fmtWord(UC_TO_TL)} TL gerekli`, 'error'); return; }
    const p = {...profile, money:(profile.money||0)-tl, underCoin:(profile.underCoin||0)+uc};
    setProfile(p); localStorage.setItem('rep_userProfile', JSON.stringify(p));
    setTlConvertAmt('');
    showNotif(`✅ ${fmtWord(tl)} → ${uc} PG dönüştürüldü!`, 'success');
  };

  const buyKatsayi = () => {
    const uc = parseInt(katsayiAmt) || 0;
    if (uc < 500) { showNotif('Minimum 500 PG gerekli!', 'error'); return; }
    if ((profile?.underCoin||0) < uc) { showNotif('Yeterli UC yok!', 'error'); return; }
    const bonus = Math.floor(uc * 0.01);
    const p = {...profile, underCoin:(profile.underCoin||0)-uc, voteMultiplier:(profile.voteMultiplier||0)+bonus};
    setProfile(p); localStorage.setItem('rep_userProfile', JSON.stringify(p));
    try { const users=JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users',JSON.stringify(users.map(u=>u.id===p.id?p:u))); } catch(e){}
    setKatsayiAmt('');
    showNotif(`✅ ${uc} PG → +${bonus} oy katsayısı kazandın! (Toplam: ${p.voteMultiplier})`, 'success');
  };

  const subs = [
    { id:'overview',  label:'📊 Genel' },
    { id:'convert',   label:'🔄 Dönüşüm' },
    { id:'stocks',    label:'📈 Borsa' },
    { id:'farm',      label:'🌾 Tarım' },
    { id:'livestock', label:'🐄 Hayvancılık' },
    { id:'partjobs',  label:'🤝 Ortaklı' },
    { id:'casino',    label:'🎰 Kumarhane' },
    { id:'bank',      label:'🏦 Banka' },
    { id:'intltrade', label:'🌍 Dış Ticaret' },
  ];

  const buyStock = (sym) => {
    const price = stocks[sym];
    const cost = price * 10;
    if ((profile?.money||0) < cost) { showNotif('Yeterli paran yok!', 'error'); return; }
    const upd = { ...portfolio, [sym]: { qty: ((portfolio[sym]?.qty)||0)+10, avgCost: price } };
    setPortfolio(upd);
    const p = { ...profile, money: (profile.money||0) - cost };
    setProfile(p);
    localStorage.setItem('rep_userProfile', JSON.stringify(p));
    showNotif(`✅ 10 adet ${sym} satın alındı`, 'success');
  };

  const sellStock = (sym) => {
    if (!portfolio[sym]?.qty) { showNotif('Elinde bu hisse yok', 'error'); return; }
    const price = stocks[sym];
    const earned = price * portfolio[sym].qty;
    const upd = { ...portfolio };
    delete upd[sym];
    setPortfolio(upd);
    const p = { ...profile, money: (profile.money||0) + earned };
    setProfile(p);
    localStorage.setItem('rep_userProfile', JSON.stringify(p));
    showNotif(`💰 ${fmtM(earned)} kazandın`, 'success');
  };

  const plantSeed = (type) => {
    const seeds = { wheat:{icon:'🌾',label:'Buğday',time:120,earn:500,cost:100}, corn:{icon:'🌽',label:'Mısır',time:180,earn:900,cost:150}, tomato:{icon:'🍅',label:'Domates',time:90,earn:350,cost:80}, grape:{icon:'🍇',label:'Üzüm',time:300,earn:1800,cost:250} };
    const s = seeds[type];
    if ((profile?.money||0) < s.cost) { showNotif('Yeterli paran yok', 'error'); return; }
    const newFarm = { id:genId(), type, ...s, plantedAt:Date.now(), harvestAt:Date.now()+s.time*1000, harvested:false };
    setFarms([...farms, newFarm]);
    setProfile(p => { const np={...p, money:(p.money||0)-s.cost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`🌱 ${s.label} ekildi!`, 'success');
    setFarmModal(null);
  };

  const harvestFarm = (farm) => {
    if (Date.now() < farm.harvestAt) { showNotif('Henüz hasat zamanı değil!', 'error'); return; }
    setFarms(farms.map(f => f.id===farm.id ? {...f, harvested:true} : f));
    setProfile(p => { const np={...p, money:(p.money||0)+farm.earn, xp:(p.xp||0)+50}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    try { const today=new Date().toDateString(); const dk=`day_${today}`; const s=JSON.parse(localStorage.getItem('dailyTaskState')||'{}'); s[dk]={...(s[dk]||{}),dailyFarmCount:((s[dk]?.dailyFarmCount)||0)+1}; localStorage.setItem('dailyTaskState',JSON.stringify(s)); } catch(e){}
    showNotif(`🌾 +${fmtM(farm.earn)} hasat edildi!`, 'success');
  };

  const playSlot = (bet) => {
    if ((profile?.money||0) < bet) { showNotif('Yeterli paran yok!', 'error'); return; }
    const items = ['🍋','🍊','🍇','⭐','💎','🔔'];
    const spin = [items[Math.floor(Math.random()*items.length)], items[Math.floor(Math.random()*items.length)], items[Math.floor(Math.random()*items.length)]];
    let win = 0;
    if (spin[0]===spin[1]&&spin[1]===spin[2]) { win = spin[0]==='💎' ? bet*50 : spin[0]==='⭐' ? bet*20 : bet*10; }
    else if (spin[0]===spin[1]||spin[1]===spin[2]) win = bet*2;
    const net = win - bet;
    setProfile(p => { const np={...p, money:(p.money||0)+net}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCasinoResult({ spin, win, bet });
    if (win > 0) showNotif(`🎰 KAZANDIN! +${fmtM(win)}`, 'gold');
  };

  return (
    <div>
      {/* Sub tabs */}
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {subs.map(s => (
          <button key={s.id} onClick={()=>setSub(s.id)}
            style={{padding:'0.38rem 0.75rem',borderRadius:'8px',border:`1px solid ${sub===s.id?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,background:sub===s.id?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:sub===s.id?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.76rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{padding:'0.7rem'}}>
        {sub==='convert' && (
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.62rem',fontWeight:700,color:'#8B5CF6',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'0.6rem'}}>🔄 DÖNÜŞÜM MERKEZİ</div>

            {/* Kur bilgisi */}
            <div style={{background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'12px',padding:'0.8rem',marginBottom:'0.75rem',textAlign:'center'}}>
              <div style={{fontSize:'0.7rem',color:'#A78BFA',fontWeight:700,marginBottom:'0.2rem'}}>Döviz Kuru</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1.1rem',fontWeight:800,color:'#8B5CF6'}}>1 PG = {fmtWord(1000000)}</div>
              <div style={{fontSize:'0.62rem',color:'#5A7089',marginTop:'0.2rem'}}>Undercoin (UC) ↔ Türk Lirası (TL)</div>
            </div>

            {/* UC → TL */}
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'0.85rem',marginBottom:'0.5rem'}}>
              <div style={{fontSize:'0.65rem',color:'#A78BFA',fontWeight:700,marginBottom:'0.5rem'}}>🪙 UC → TL</div>
              <div style={{display:'flex',gap:'0.4rem',alignItems:'center',marginBottom:'0.4rem'}}>
                <input type="number" value={ucConvertAmt} onChange={e=>setUcConvertAmt(e.target.value)} placeholder="UC miktarı..." min="1"
                  style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'8px',padding:'0.5rem 0.7rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'0.88rem',outline:'none'}} />
                <button onClick={convertUcToTl}
                  style={{padding:'0.5rem 0.9rem',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#8B5CF6,#6D28D9)',color:'#fff',fontWeight:700,fontSize:'0.8rem',cursor:'pointer',whiteSpace:'nowrap'}}>
                  Çevir
                </button>
              </div>
              {ucConvertAmt>0 && <div style={{fontSize:'0.65rem',color:'#10B981'}}>≈ {fmtWord((parseInt(ucConvertAmt)||0)*1000000)} alacaksın</div>}
              <div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.2rem'}}>Mevcut UC: <span style={{color:'#A78BFA',fontWeight:700}}>{fmt(profile?.underCoin||0)} PG</span></div>
            </div>

            {/* TL → UC */}
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'0.85rem',marginBottom:'0.5rem'}}>
              <div style={{fontSize:'0.65rem',color:'#10B981',fontWeight:700,marginBottom:'0.5rem'}}>💵 TL → UC</div>
              <div style={{display:'flex',gap:'0.4rem',alignItems:'center',marginBottom:'0.4rem'}}>
                <input type="number" value={tlConvertAmt} onChange={e=>setTlConvertAmt(e.target.value)} placeholder="TL miktarı..." min="1000000"
                  style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px',padding:'0.5rem 0.7rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'0.88rem',outline:'none'}} />
                <button onClick={convertTlToUc}
                  style={{padding:'0.5rem 0.9rem',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#10B981,#059669)',color:'#fff',fontWeight:700,fontSize:'0.8rem',cursor:'pointer',whiteSpace:'nowrap'}}>
                  Çevir
                </button>
              </div>
              {tlConvertAmt>0 && <div style={{fontSize:'0.65rem',color:'#A78BFA'}}>≈ {Math.floor((parseInt(tlConvertAmt)||0)/1000000)} PG alacaksın</div>}
              <div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.2rem'}}>Mevcut Para: <span style={{color:'#10B981',fontWeight:700}}>{fmtWord(profile?.money||0)}</span></div>
            </div>

            {/* UC → Katsayı */}
            <div style={{background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'12px',padding:'0.85rem'}}>
              <div style={{fontSize:'0.65rem',color:'#F59E0B',fontWeight:700,marginBottom:'0.3rem'}}>🗳️ UC → Oy Katsayısı</div>
              <div style={{fontSize:'0.62rem',color:'#5A7089',marginBottom:'0.5rem'}}>Min 500 PG • Çevirdiğin miktarın %1'i oy katsayısı olarak eklenir (seçimlerde etkili)</div>
              <div style={{background:'rgba(245,158,11,0.08)',borderRadius:'8px',padding:'0.5rem',marginBottom:'0.5rem',textAlign:'center'}}>
                <span style={{fontSize:'0.68rem',color:'#F59E0B',fontWeight:700}}>Mevcut Katsayı: +{profile?.voteMultiplier||0}</span>
              </div>
              <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                <input type="number" value={katsayiAmt} onChange={e=>setKatsayiAmt(e.target.value)} placeholder="Min 500 PG..." min="500"
                  style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',padding:'0.5rem 0.7rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'0.88rem',outline:'none'}} />
                <button onClick={buyKatsayi}
                  style={{padding:'0.5rem 0.9rem',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#000',fontWeight:700,fontSize:'0.8rem',cursor:'pointer',whiteSpace:'nowrap'}}>
                  Al
                </button>
              </div>
              {katsayiAmt>=500 && <div style={{fontSize:'0.65rem',color:'#F59E0B',marginTop:'0.3rem'}}>+{Math.floor((parseInt(katsayiAmt)||0)*0.01)} katsayı kazanacaksın</div>}
            </div>
          </div>
        )}

        {sub==='overview' && (
          <div>
            {/* Ekonomik Durum */}
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.6rem',fontWeight:700,color:'#10B981',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'0.45rem'}}>⚡ EKONOMİK DURUM</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem',marginBottom:'0.75rem'}}>
              {[
                ['💵','Nakit',fmtM(profile?.money),'#10B981'],
                ['🏦','Mevduat',fmtM(profile?.bank),'#3B82F6'],
                ['🪙','Kripto (UCP)',fmtUC(profile?.underCoin),'#8B5CF6'],
                ['📊','Net Değer',fmtM((profile?.money||0)+(profile?.bank||0)),'#F59E0B'],
                ['🤝','Ticaret Puanı',`${fmt(profile?.tradePoints||0)} TP`,'#06B6D4'],
                ['💎','Liyakat (UC)',`${fmt(profile?.underCoin||0)} PG`,'#A78BFA'],
              ].map(([ic,lb,v,c])=>(
                <div key={lb} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${c}28`,borderRadius:'10px',padding:'0.55rem 0.35rem',textAlign:'center'}}>
                  <div style={{fontSize:'0.52rem',color:'#2A3A4A',textTransform:'uppercase',marginBottom:'0.15rem',letterSpacing:'0.04em',lineHeight:1.2}}>{ic} {lb}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.72rem',fontWeight:700,color:c,lineHeight:1.2}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Devlet Ekonomisi - CANLI VERİ */}
            {(() => {
              const _treasury = JSON.parse(localStorage.getItem('rep_treasury')||'{}');
              const _taxRates = JSON.parse(localStorage.getItem('taxRates')||'{}');
              const _gangs = JSON.parse(localStorage.getItem('gangs')||'[]');
              const _users = JSON.parse(localStorage.getItem('rep_users')||'[]');
              const _stocks = JSON.parse(localStorage.getItem('stockMarket')||'{}');
              const hazine = _treasury.balance || 0;
              const milBudget = _treasury.militaryBudget || 0;
              const incomeTax = _taxRates.income || 15;
              const tradeTax = _taxRates.trade || 10;
              const gangCount = _gangs.length;
              const playerCount = _users.length;
              const avgStockPrice = Object.values(_stocks).length > 0 ? Math.round(Object.values(_stocks).reduce((a,b)=>a+b,0)/Object.values(_stocks).length) : 145;
              const _printedMoney = (() => { try { return JSON.parse(localStorage.getItem('rep_printedMoney')||'{"total":0}'); } catch{return {total:0};} })();
              const printedInflBonus = Math.min(40, Math.floor((_printedMoney.total||0)/1000000));
              const inflation = Math.min(99, 30 + gangCount * 3 + Math.max(0, incomeTax - 15) * 0.8 + printedInflBonus);
              const faiz = Math.min(80, 20 + Math.round(inflation * 0.6));
              const totalTax = incomeTax + tradeTax;
              const gdp = playerCount * 500000 + hazine;
              return (
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.6rem',fontWeight:700,color:'#F59E0B',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'0.4rem'}}>🏛️ DEVLET EKONOMİSİ</div>
                  <div style={{background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'12px',padding:'0.7rem',marginBottom:'0.5rem'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
                      {[
                        ['🏛️','Hazine',`₱${fmtWord(hazine)}`,'#10B981'],
                        ['📉','Enflasyon',`%${inflation.toFixed(1)}`,'#EF4444'],
                        ['💹','Faiz Oranı',`%${faiz}`,'#F59E0B'],
                        ['💰','Vergi Oranı',`%${totalTax}`,'#8B5CF6'],
                        ['⚔️','Askeri Bütçe',`₱${fmtWord(milBudget)}`,'#EF4444'],
                        ['📊','GSYİH',`₱${fmtWord(gdp)}`,'#60A5FA'],
                      ].map(([ic,lb,v,c])=>(
                        <div key={lb} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                          <span style={{fontSize:'0.68rem',color:'#4A5A6A'}}>{ic} {lb}</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.72rem',fontWeight:700,color:c}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:'0.5rem',paddingTop:'0.4rem',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.62rem',color:'#5A7089',marginBottom:'3px'}}>
                        <span>Ekonomik İstikrar</span>
                        <span style={{color:inflation<40?'#10B981':inflation<70?'#F59E0B':'#EF4444'}}>{inflation<40?'İyi':inflation<70?'Orta':'Kritik'}</span>
                      </div>
                      <div style={{height:'4px',background:'rgba(239,68,68,0.2)',borderRadius:'100px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${Math.max(5,100-inflation)}%`,background:inflation<40?'#10B981':inflation<70?'#F59E0B':'#EF4444',borderRadius:'100px',transition:'width 0.5s'}} />
                      </div>
                      {printedInflBonus > 0 && <div style={{fontSize:'0.59rem',color:'#EF4444',marginTop:'0.25rem'}}>⚠️ Para basımı enflasyonu +{printedInflBonus.toFixed(0)} puan artırdı ({fmtWord(_printedMoney.total)} basıldı)</div>}
                      {inflation >= 70 && <div style={{fontSize:'0.6rem',color:'#EF4444',fontWeight:700,marginTop:'0.25rem',padding:'0.2rem 0.4rem',background:'rgba(239,68,68,0.1)',borderRadius:'6px'}}>🚨 DARBE ORTAMI — Gerginlik kritik seviyede!</div>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Tüm Ekonomi Araçları */}
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.6rem',fontWeight:700,color:'#3B82F6',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'0.4rem'}}>🛠️ TÜM EKONOMİ ARAÇLARI</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.4rem'}}>
              {[
                {icon:'🏦',label:'Banka',fn:()=>setSub('bank')},
                {icon:'🛒',label:'Market',fn:()=>{}},
                {icon:'⛏️',label:'Madencilik',fn:()=>{}},
                {icon:'🏢',label:'Holdinglar',fn:()=>{}},
                {icon:'📈',label:'Borsa',fn:()=>setSub('stocks')},
                {icon:'🏭',label:'Fabrika',fn:()=>{}},
                {icon:'⚒️',label:'Crafting',fn:()=>{}},
                {icon:'🪨',label:'Hammadde',fn:()=>{}},
                {icon:'🔨',label:'Açık Artırma',fn:()=>{}},
                {icon:'🏘️',label:'Gayrimenkul',fn:()=>{}},
                {icon:'🌾',label:'Tarım',fn:()=>setSub('farm')},
                {icon:'🐄',label:'Hayvancılık',fn:()=>setSub('livestock')},
                {icon:'🛡️',label:'Sigorta',fn:()=>{}},
              ].map((item,i)=>(
                <button key={i} onClick={item.fn}
                  style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'0.65rem 0.3rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s'}}>
                  <span style={{fontSize:'1.3rem',lineHeight:1}}>{item.icon}</span>
                  <span style={{fontSize:'0.6rem',fontWeight:700,color:'#6A7A8A',textAlign:'center',lineHeight:1.2}}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sub==='stocks' && (
          <div>
            <div style={{display:'flex',gap:'3px',background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'3px',marginBottom:'0.75rem'}}>
              {[['market','📊 Piyasa'],['portfolio','💼 Portföy'],['short','📉 Açığa Sat']].map(([k,l])=>(
                <button key={k} onClick={()=>setStockBTab(k)}
                  style={{flex:1,padding:'0.4rem',borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.7rem',
                    background:stockBTab===k?'rgba(59,130,246,0.2)':'transparent',
                    color:stockBTab===k?'#60A5FA':'#5A7089'}}>
                  {l}
                </button>
              ))}
            </div>

            {stockBTab==='market' && Object.entries(stocks).map(([sym, price]) => {
              const held = portfolio[sym]?.qty || 0;
              const hist = priceHist[sym] || [price];
              const minH = Math.min(...hist); const maxH = Math.max(...hist);
              const prev = hist[hist.length-2] || price;
              const change = ((price - prev) / prev * 100);
              const pct = (v) => maxH===minH ? 50 : ((v-minH)/(maxH-minH))*100;
              const sectors = {TECH:'💻 Teknoloji',ENERGY:'⚡ Enerji',FOOD:'🌾 Gıda',BANK:'🏦 Finans',DEFENSE:'⚔️ Savunma'};
              return (
                <Card key={sym} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.4rem'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'baseline',gap:'0.4rem'}}>
                        <span style={{fontWeight:800,fontSize:'0.92rem',color:'#E8EDF2'}}>{sym}</span>
                        <span style={{fontSize:'0.62rem',color:'#3B4E63'}}>{sectors[sym]||''}</span>
                      </div>
                      {held > 0 && <div style={{fontSize:'0.62rem',color:'#60A5FA'}}>{held} adet · ort. ₱{portfolio[sym]?.avgCost}</div>}
                    </div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:'2px',height:'28px',width:'56px'}}>
                      {hist.slice(-10).map((v,i)=>(
                        <div key={i} style={{flex:1,background:change>=0?'rgba(16,185,129,0.55)':'rgba(239,68,68,0.55)',borderRadius:'1px',height:`${Math.max(8,pct(v))}%`}} />
                      ))}
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1rem',fontWeight:700,color:'#E8EDF2'}}>₱{price}</div>
                      <div style={{fontSize:'0.63rem',color:change>=0?'#10B981':'#EF4444',fontWeight:700}}>{change>=0?'▲':'▼'}{Math.abs(change).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <Btn variant='green' size='sm' onClick={()=>buyStock(sym)}>🛒 Al (10)</Btn>
                    {held > 0 && <Btn variant='danger' size='sm' onClick={()=>sellStock(sym)}>💸 Sat</Btn>}
                  </div>
                </Card>
              );
            })}

            {stockBTab==='portfolio' && (
              <div>
                {Object.keys(portfolio).length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>📊 Portföyünde henüz hisse yok.</div>}
                {Object.entries(portfolio).map(([sym, pos]) => {
                  const cur = stocks[sym] || pos.avgCost;
                  const val = cur * pos.qty;
                  const cost = pos.avgCost * pos.qty;
                  const pnl = val - cost;
                  const pnlPct = cost > 0 ? ((pnl/cost)*100).toFixed(1) : '0.0';
                  return (
                    <Card key={sym} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.92rem'}}>{sym}</div>
                          <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{pos.qty} adet · ort. ₱{pos.avgCost}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontWeight:700,color:'#E8EDF2',fontFamily:"'JetBrains Mono',monospace"}}>{fmtM(val)}</div>
                          <div style={{fontSize:'0.68rem',color:pnl>=0?'#10B981':'#EF4444',fontWeight:700}}>{pnl>=0?'+':''}{fmtM(pnl)} ({pnlPct}%)</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {Object.keys(portfolio).length > 0 && (
                  <Card style={{padding:'0.75rem',background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)'}}>
                    <div style={{fontSize:'0.68rem',color:'#5A7089',marginBottom:'0.2rem'}}>📈 Toplam Portföy Değeri</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:'#60A5FA',fontSize:'1.15rem'}}>
                      {fmtM(Object.entries(portfolio).reduce((s,[sym,p])=>s+(stocks[sym]||p.avgCost)*p.qty, 0))}
                    </div>
                    <div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.2rem'}}>Kar/Zarar: {(()=>{const tot=Object.entries(portfolio).reduce((s,[sym,p])=>s+(stocks[sym]||p.avgCost)*p.qty-(p.avgCost*p.qty),0);return <span style={{color:tot>=0?'#10B981':'#EF4444',fontWeight:700}}>{tot>=0?'+':''}{fmtM(tot)}</span>;})()} </div>
                  </Card>
                )}
              </div>
            )}

            {stockBTab==='short' && (
              <div>
                <div style={{background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'12px',padding:'0.7rem',marginBottom:'0.6rem',fontSize:'0.72rem',color:'#FCA5A5',lineHeight:1.5}}>
                  ⚠️ Açığa satış: Fiyatın düşeceğine bahse girersin. Düşerse kâr, yükselirse zarar edersin.
                </div>
                {Object.entries(stocks).map(([sym, price]) => {
                  const myS = shortPos[sym];
                  return (
                    <Card key={sym} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <div style={{fontWeight:800,color:'#E8EDF2'}}>{sym}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.88rem',color:'#E8EDF2'}}>₱{price}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          {myS ? (
                            <div>
                              <div style={{fontSize:'0.62rem',color:'#5A7089'}}>Açık: ₱{myS.price} → ₱{price}</div>
                              <div style={{fontSize:'0.68rem',color:price<myS.price?'#10B981':'#EF4444',fontWeight:700}}>{price<myS.price?'📈 Kâr':'📉 Zarar'}: {fmtM(Math.abs((myS.price-price)*myS.qty))}</div>
                              <Btn variant='danger' size='sm' onClick={()=>{
                                const profit=(myS.price-price)*myS.qty;
                                setShortPos(prev=>{const n={...prev};delete n[sym];return n;});
                                setProfile(p=>{const np={...p,money:(p.money||0)+myS.stake+profit};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});
                                showNotif(profit>=0?`✅ Short kâr: +${fmtM(profit)}`:`❌ Short zarar: ${fmtM(profit)}`,'info');
                              }}>Kapat</Btn>
                            </div>
                          ) : (
                            <Btn variant='danger' size='sm' onClick={()=>{
                              const stake=price*5;
                              if((profile?.money||0)<stake){showNotif('Yeterli para yok','error');return;}
                              setShortPos(prev=>({...prev,[sym]:{price,qty:5,stake}}));
                              setProfile(p=>{const np={...p,money:(p.money||0)-stake};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});
                              showNotif(`📉 ${sym} açığa satıldı (5 adet)`, 'info');
                            }}>📉 Short Aç</Btn>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {sub==='farm' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div style={{color:'#5A7089',fontSize:'0.78rem'}}>🌾 Tarla Durumu</div>
              <Btn variant='green' size='sm' onClick={()=>setFarmModal(true)}>+ Ek</Btn>
            </div>
            {farms.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz tarlanız yok. Tohum ek!</div>}
            {farms.map(farm => {
              const ready = Date.now() >= farm.harvestAt;
              const pct = ready ? 100 : Math.min(100, ((Date.now()-farm.plantedAt)/(farm.harvestAt-farm.plantedAt))*100);
              return (
                <Card key={farm.id} style={{marginBottom:'0.5rem',padding:'0.85rem',opacity:farm.harvested?0.5:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <span style={{fontSize:'1.75rem'}}>{farm.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,marginBottom:'0.25rem'}}>{farm.label}</div>
                      <ProgressBar pct={pct} color={ready?'#10B981':'#F59E0B'} />
                      <div style={{fontSize:'0.63rem',color:'#5A7089',marginTop:'0.2rem'}}>{farm.harvested ? '✅ Hasat edildi' : ready ? '✅ Hasat hazır!' : `⏳ ${Math.ceil((farm.harvestAt-Date.now())/1000)}s kaldı`}</div>
                    </div>
                    {!farm.harvested && ready && (
                      <Btn variant='gold' size='sm' onClick={()=>harvestFarm(farm)}>Hasat</Btn>
                    )}
                  </div>
                </Card>
              );
            })}
            {farmModal && (
              <Modal title="🌱 Tohum Ek" onClose={()=>setFarmModal(null)}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                  {[['wheat','🌾','Buğday','₱100','2dk','₱500'],['corn','🌽','Mısır','₱150','3dk','₱900'],['tomato','🍅','Domates','₱80','1.5dk','₱350'],['grape','🍇','Üzüm','₱250','5dk','₱1800']].map(([t,ic,lb,cost,time,earn])=>(
                    <button key={t} onClick={()=>plantSeed(t)}
                      style={{padding:'1rem',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',cursor:'pointer',textAlign:'center'}}>
                      <div style={{fontSize:'1.75rem',marginBottom:'0.3rem'}}>{ic}</div>
                      <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.2rem'}}>{lb}</div>
                      <div style={{fontSize:'0.65rem',color:'#10B981'}}>{earn} kazanç</div>
                      <div style={{fontSize:'0.65rem',color:'#EF4444'}}>{cost} maliyet</div>
                      <div style={{fontSize:'0.62rem',color:'#5A7089'}}>⏱ {time}</div>
                    </button>
                  ))}
                </div>
              </Modal>
            )}
          </div>
        )}

        {sub==='partjobs' && (
          <PartnerJobsSection profile={profile} setProfile={setProfile} showNotif={showNotif} />
        )}

        {sub==='livestock' && (
          <LivestockSection profile={profile} setProfile={setProfile} showNotif={showNotif} />
        )}

        {sub==='casino' && (
          <div>
            <Card style={{textAlign:'center',marginBottom:'0.75rem',padding:'1.5rem'}}>
              <div style={{fontSize:'0.8rem',color:'#5A7089',marginBottom:'1rem'}}>🎰 Slot Makinesi</div>
              {casinoResult ? (
                <div>
                  <div style={{fontSize:'3rem',letterSpacing:'0.5rem',marginBottom:'0.75rem'}}>{casinoResult.spin.join(' ')}</div>
                  <div style={{fontSize:'1.2rem',fontWeight:800,color:casinoResult.win>0?'#10B981':'#EF4444'}}>
                    {casinoResult.win>0 ? `🎉 +${fmtM(casinoResult.win)} KAZANDIN!` : '😔 Kaybettin!'}
                  </div>
                </div>
              ) : (
                <div style={{fontSize:'3rem',letterSpacing:'0.5rem',marginBottom:'0.75rem',opacity:0.3}}>🎰 🎰 🎰</div>
              )}
            </Card>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem'}}>
              {[1000,5000,10000,25000,50000,100000].map(bet => (
                <Btn key={bet} variant='gold' size='sm' onClick={()=>playSlot(bet)}>{fmtM(bet)}</Btn>
              ))}
            </div>
          </div>
        )}

        {sub==='bank' && (
          <div>
            <BankPage profile={profile} setProfile={setProfile} showNotif={showNotif} />
          </div>
        )}
        {sub==='intltrade' && (
          <IntlTradePage profile={profile} setProfile={setProfile} showNotif={showNotif} />
        )}
      </div>

      {/* UC Katsayı Butonu */}
      {sub==='overview' && (() => {
        const hasBoost = !!(profile?.packages?.ucBoost || profile?.ucBoost);
        const boostExpiry = profile?.ucBoostExpiry || 0;
        const boostActive = hasBoost && boostExpiry > Date.now();
        const ucCost = 50;
        const activateBoost = () => {
          if ((profile?.underCoin||0) < ucCost) { showNotif(`UC Katsayı için ${ucCost} PG gerekli`, 'error'); return; }
          if (boostActive) { showNotif('UC Katsayı zaten aktif!', 'error'); return; }
          setProfile(p => {
            const np = {...p, underCoin:(p.underCoin||0)-ucCost, ucBoost:true, packages:{...(p.packages||{}),ucBoost:true}, ucBoostExpiry:Date.now()+24*60*60*1000};
            localStorage.setItem('rep_userProfile', JSON.stringify(np));
            return np;
          });
          showNotif('⚡ UC x2 Katsayı 24 saat aktifleşti!', 'success');
        };
        const rem = boostActive ? boostExpiry - Date.now() : 0;
        const remH = Math.floor(rem/3600000); const remM = Math.floor((rem%3600000)/60000);
        return (
          <div style={{marginTop:'0.75rem',padding:'0.75rem',background:'rgba(96,165,250,0.07)',border:'1px solid rgba(96,165,250,0.2)',borderRadius:'14px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.5rem'}}>
              <div>
                <div style={{fontSize:'0.78rem',fontWeight:800,color:'#60A5FA'}}>⚡ UC x2 Kazanç Katsayısı</div>
                <div style={{fontSize:'0.65rem',color:'#5A7089',marginTop:'0.15rem'}}>
                  {boostActive ? `✅ Aktif — ${remH}sa ${remM}dk kaldı • İş başına 2x UC` : `${ucCost} PG harca → 24 saat boyunca iş yapınca 2x UC kazan`}
                </div>
              </div>
              <button onClick={activateBoost} disabled={boostActive}
                style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'none',background:boostActive?'rgba(16,185,129,0.2)':'linear-gradient(135deg,#3B82F6,#2563EB)',color:boostActive?'#10B981':'#fff',fontWeight:800,fontSize:'0.75rem',cursor:boostActive?'default':'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                {boostActive ? '✅ Aktif' : `⚡ ${ucCost} PG`}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const LOAN_TIERS = [
  { id:'micro',   label:'Mikro Kredi',   amount:10000,  interest:0.15, days:3,  icon:'💳', minLevel:1 },
  { id:'small',   label:'Küçük Kredi',   amount:50000,  interest:0.12, days:7,  icon:'🏦', minLevel:2 },
  { id:'medium',  label:'Orta Kredi',    amount:200000, interest:0.10, days:14, icon:'💰', minLevel:4 },
  { id:'large',   label:'Büyük Kredi',   amount:500000, interest:0.08, days:21, icon:'💎', minLevel:6 },
  { id:'premium', label:'Premium Kredi', amount:2000000,interest:0.06, days:30, icon:'🏆', minLevel:9 },
];

function BankPage({ profile, setProfile, showNotif }) {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('deposit');
  const [tab, setTab] = useState('account');
  const [loan, setLoan] = useLs('activeLoan', null);
  const [loanModal, setLoanModal] = useState(null);

  const inp = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0.7rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'};

  const doTransfer = () => {
    const n = parseInt(amount);
    if (!n || n <= 0) { showNotif('Geçerli tutar girin', 'error'); return; }
    if (action==='deposit') {
      if (n > (profile?.money||0)) { showNotif('Yetersiz nakit', 'error'); return; }
      setProfile(p => { const np={...p, money:(p.money||0)-n, bank:(p.bank||0)+n}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`🏦 ${fmtM(n)} yatırıldı`, 'success');
    } else {
      if (n > (profile?.bank||0)) { showNotif('Yetersiz banka bakiyesi', 'error'); return; }
      setProfile(p => { const np={...p, money:(p.money||0)+n, bank:(p.bank||0)-n}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`💰 ${fmtM(n)} çekildi`, 'success');
    }
    setAmount('');
  };

  const collectInterest = () => {
    if ((profile?.bank||0) <= 0) { showNotif('Bankada para yok', 'error'); return; }
    const lastCollect = profile?.lastBankInterest || 0;
    const hoursPassed = (Date.now() - lastCollect) / 3600000;
    if (hoursPassed < 24) { showNotif(`${Math.ceil(24-hoursPassed)} saat sonra tekrar toplayabilirsin`, 'error'); return; }
    const rate = profile?.premium ? 0.02 : 0.005;
    const interest = Math.floor((profile?.bank||0) * rate);
    setProfile(p => { const np={...p, money:(p.money||0)+interest, lastBankInterest:Date.now()}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`💹 ${fmtM(interest)} faiz kazandın!`, 'success');
  };

  const takeLoan = (tier) => {
    if (loan) { showNotif('Mevcut kredinizi önce ödeyin', 'error'); return; }
    if ((profile?.level||1) < tier.minLevel) { showNotif(`Bu kredi için Seviye ${tier.minLevel} gerekli`, 'error'); return; }
    const repay = Math.floor(tier.amount * (1 + tier.interest));
    const newLoan = { ...tier, taken:Date.now(), repayAmount:repay, dueDate:Date.now()+tier.days*86400000 };
    setLoan(newLoan);
    setProfile(p => { const np={...p, money:(p.money||0)+tier.amount}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setLoanModal(null);
    showNotif(`✅ ${fmtM(tier.amount)} kredi hesabına yatırıldı`, 'success');
  };

  const repayLoan = () => {
    if (!loan) return;
    const repayAmt = loan.repayAmount || 0;
    if ((profile?.money||0) < repayAmt) { showNotif(`Yetersiz nakit. Gereken: ${fmtM(repayAmt)}`, 'error'); return; }
    setProfile(p => { const np={...p, money:(p.money||0)-repayAmt, xp:(p.xp||0)+200}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setLoan(null);
    showNotif(`✅ Kredi ödendi! +200 XP`, 'success');
  };

  const daysLeft = loan ? Math.max(0, Math.ceil((loan.dueDate - Date.now())/86400000)) : 0;
  const isOverdue = loan && Date.now() > loan.dueDate;

  return (
    <div style={{padding:'0'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
        <Card style={{textAlign:'center',padding:'1rem'}}>
          <div style={{color:'#10B981',fontWeight:900,fontSize:'1.05rem'}}>{fmtM(profile?.money)}</div>
          <div style={{fontSize:'0.6rem',color:'#3B4E63',marginTop:'0.2rem',textTransform:'uppercase',fontWeight:700}}>💵 Nakit</div>
        </Card>
        <Card style={{textAlign:'center',padding:'1rem'}}>
          <div style={{color:'#3B82F6',fontWeight:900,fontSize:'1.05rem'}}>{fmtM(profile?.bank)}</div>
          <div style={{fontSize:'0.6rem',color:'#3B4E63',marginTop:'0.2rem',textTransform:'uppercase',fontWeight:700}}>🏦 Banka</div>
        </Card>
      </div>

      {/* Faiz topla butonu */}
      {(profile?.bank||0) > 0 && (
        <button onClick={collectInterest} style={{width:'100%',marginBottom:'0.65rem',padding:'0.65rem',borderRadius:'12px',border:'1px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.08)',color:'#10B981',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.82rem',cursor:'pointer'}}>
          💹 Günlük Faiz Topla ({profile?.premium?'%2':'%0.5'} • {fmtM(Math.floor((profile?.bank||0)*(profile?.premium?0.02:0.005)))})
        </button>
      )}

      {/* Tab */}
      <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
        {[['account','🏦 Hesap'],['loans','💳 Krediler']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:'0.45rem',borderRadius:'8px',border:`1px solid ${tab===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,background:tab===v?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:tab===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>
            {l}
          </button>
        ))}
      </div>

      {tab==='account' && (
        <Card>
          <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'3px',marginBottom:'1rem',gap:'3px'}}>
            {[['deposit','💳 Yatır'],['withdraw','🏧 Çek']].map(([v,l])=>(
              <button key={v} onClick={()=>setAction(v)} style={{flex:1,padding:'0.5rem',borderRadius:'8px',border:'none',background:action===v?'rgba(59,130,246,0.15)':'transparent',color:action===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer'}}>
                {l}
              </button>
            ))}
          </div>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Tutar girin..."
            style={{...inp,marginBottom:'0.75rem'}} />
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.4rem',marginBottom:'0.75rem'}}>
            {[5000,10000,50000,100000].map(n=>(
              <button key={n} onClick={()=>setAmount(String(n))} style={{padding:'0.35rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontSize:'0.68rem',cursor:'pointer',fontWeight:700}}>
                {fmtM(n)}
              </button>
            ))}
          </div>
          <Btn variant='primary' size='full' onClick={doTransfer}>{action==='deposit'?'💳 Yatır':'🏧 Çek'}</Btn>
          <div style={{fontSize:'0.68rem',color:'#3B4E63',marginTop:'0.65rem',textAlign:'center'}}>
            💡 {profile?.premium?'Premium: %2':'%0.5'} günlük faiz • Her 24 saatte toplanır
          </div>
        </Card>
      )}

      {tab==='loans' && (
        <div>
          {/* Aktif kredi */}
          {loan && (
            <Card style={{marginBottom:'0.65rem',border:`1px solid ${isOverdue?'rgba(239,68,68,0.3)':'rgba(245,158,11,0.3)'}`,background:isOverdue?'rgba(239,68,68,0.06)':'rgba(245,158,11,0.06)'}}>
              <div style={{fontWeight:800,color:isOverdue?'#EF4444':'#F59E0B',marginBottom:'0.5rem',fontSize:'0.85rem'}}>
                {isOverdue?'⚠️ Vadesi Geçmiş Kredi':'💳 Aktif Kredi'} — {loan.label}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem',marginBottom:'0.65rem'}}>
                {[['Alınan',fmtM(loan.amount)],['Geri Ödeme',fmtM(loan.repayAmount)],['Kalan Gün',isOverdue?'❌ Gecikti':`${daysLeft}g`]].map(([k,v])=>(
                  <div key={k} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
                    <div style={{fontSize:'0.58rem',color:'#3B4E63',textTransform:'uppercase'}}>{k}</div>
                    <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.8rem'}}>{v}</div>
                  </div>
                ))}
              </div>
              <Btn variant='green' size='full' onClick={repayLoan}>
                ✅ Geri Öde ({fmtM(loan.repayAmount)})
              </Btn>
            </Card>
          )}

          {/* Kredi seçenekleri */}
          {!loan && (
            <div>
              <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.5rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Kredi Seçenekleri</div>
              {LOAN_TIERS.map(tier => {
                const available = (profile?.level||1) >= tier.minLevel;
                const repay = Math.floor(tier.amount*(1+tier.interest));
                return (
                  <Card key={tier.id} style={{marginBottom:'0.5rem',opacity:available?1:0.5}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <div style={{fontSize:'1.5rem'}}>{tier.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.88rem'}}>{tier.label}</div>
                        <div style={{fontSize:'0.68rem',color:'#5A7089'}}>{fmtM(tier.amount)} • %{Math.round(tier.interest*100)} faiz • {tier.days} gün • Lv.{tier.minLevel}+</div>
                        <div style={{fontSize:'0.68rem',color:'#F59E0B'}}>Geri ödeme: {fmtM(repay)}</div>
                      </div>
                      <Btn variant='primary' size='sm' onClick={()=>available?takeLoan(tier):showNotif(`Seviye ${tier.minLevel} gerekli`,'error')}>
                        {available?'Al':'🔒'}
                      </Btn>
                    </div>
                  </Card>
                );
              })}
              <div style={{fontSize:'0.68rem',color:'#3B4E63',textAlign:'center',padding:'0.5rem'}}>
                💡 Kredi geri ödemesi XP kazandırır. Zamanında öde, faiz düşer.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAZAR SAYFASI (Oyuncular arası ticaret)
// ═══════════════════════════════════════════════════════
function MarketPage({ profile, setProfile, showNotif }) {
  const [listings, setListings] = useLs('marketListings', []);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ item:'', qty:1, price:'' });

  const createListing = () => {
    if (!form.item || !form.price) { showNotif('Tüm alanları doldurun', 'error'); return; }
    const listing = { id:genId(), seller:profile?.uid, sellerName:profile?.username, item:form.item, qty:parseInt(form.qty)||1, price:parseInt(form.price)||0, ts:Date.now() };
    setListings([...listings, listing]);
    setCreateModal(false);
    setForm({ item:'', qty:1, price:'' });
    showNotif('✅ İlan oluşturuldu', 'success');
  };

  const buyListing = (listing) => {
    if ((profile?.money||0) < listing.price) { showNotif('Yetersiz para', 'error'); return; }
    if (listing.seller === profile?.uid) { showNotif('Kendi ilanını satın alamazsın', 'error'); return; }
    setListings(listings.filter(l => l.id !== listing.id));
    setProfile(p => { const np={...p, money:(p.money||0)-listing.price}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${listing.item} satın alındı`, 'success');
  };

  return (
    <div style={{padding:'0.7rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
        <div style={{fontWeight:800,fontSize:'1rem',color:'#E8EDF2'}}>🏪 Açık Pazar</div>
        <Btn variant='primary' size='sm' onClick={()=>setCreateModal(true)}>+ İlan</Btn>
      </div>
      {listings.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz ilan yok</div>}
      {listings.map(l => (
        <Card key={l.id} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'#E8EDF2'}}>{l.item}</div>
              <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{l.sellerName} • {l.qty} adet • {timeAgo(l.ts)}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{color:'#10B981',fontWeight:800,fontSize:'1rem'}}>{fmtM(l.price)}</div>
              {l.seller !== profile?.uid && <Btn variant='green' size='sm' onClick={()=>buyListing(l)} style={{marginTop:'0.25rem'}}>Al</Btn>}
              {l.seller === profile?.uid && <Tag color='blue'>Benim</Tag>}
            </div>
          </div>
        </Card>
      ))}
      {createModal && (
        <Modal title="+ Yeni İlan" onClose={()=>setCreateModal(false)}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Ürün Adı</div>
            <input value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} placeholder="Ürün / Eşya adı"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'1rem'}}>
            <div>
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Adet</div>
              <input type="number" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} min={1}
                style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div>
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Fiyat (₱)</div>
              <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="₱"
                style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
            </div>
          </div>
          <Btn variant='primary' size='full' onClick={createListing}>✅ İlan Oluştur</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SİYASET SAYFASI (TAM VERSİYON)
// ═══════════════════════════════════════════════════════
function PoliticsPage({ profile, setProfile, showNotif }) {
  const [parties, setParties] = useLs('parties', []);
  const [laws, setLaws] = useLs('laws', []);
  const [elections, setElections] = useLs('elections', {
    phase:'idle', nextElection:Date.now()+7*24*60*60*1000, candidates:[], votes:{}, results:null
  });
  const [cabinet, setCabinet] = useLs('cabinet', {});
  const [sub, setSub] = useState('parties');
  const [createModal, setCreateModal] = useState(false);
  const [pForm, setPForm] = useState({ name:'', ideology:'merkez', desc:'', color:'#8B5CF6' });
  const [lawModal, setLawModal] = useState(false);
  const [lawForm, setLawForm] = useState({ title:'', desc:'', category:'vergi' });
  const [managePartyModal, setManagePartyModal] = useState(false);
  const [cabinetModal, setCabinetModal] = useState(false);
  const [cabinetRole, setCabinetRole] = useState('');
  const [cabinetTarget, setCabinetTarget] = useState('');
  const [donateModal, setDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [govCooldowns, setGovCooldowns] = useLs('govCooldowns', {});
  const [elections_multi, setElections_multi] = useLs('rep_elections_multi', {});
  const [transferModal, setTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [disbandConfirm, setDisbandConfirm] = useState(false);

  const myParty = parties.find(p => p.leaderId===profile?.uid || (p.members||[]).includes(profile?.uid));
  const isLeader = myParty?.leaderId === profile?.uid;
  const isPresident = cabinet['Devlet Başkanı'] === profile?.username;

  const CABINET_ROLES = [
    'Devlet Başkanı','Meclis Başkanı','Milletvekili',
    'İçişleri Bakanı','Belediye Başkanı','Vali',
    'Genelkurmay Başkanı','Ticaret Bakanı','Maliye Bakanı'
  ];

  const PARTY_CREATE_COST = 500000;

  const createParty = () => {
    if (!pForm.name.trim()) { showNotif('Parti adı gerekli', 'error'); return; }
    if (myParty) { showNotif('Zaten bir partiye üyesin', 'error'); return; }
    if (profile?.gang) {
      const allGs = (() => { try { return JSON.parse(localStorage.getItem('gangs')||'[]'); } catch{return[];} })();
      const myG = allGs.find(g=>g.id===profile.gang);
      if (myG) { showNotif(`${myG.type==='family'?'👨‍👩‍👧‍👦 Aile':'⚔️ Çete'} üyeleri parti kuramazlar. Önce ayrılın.`, 'error'); return; }
    }
    if ((profile?.money||0) < PARTY_CREATE_COST) { showNotif(`Parti kurmak için ₱${PARTY_CREATE_COST.toLocaleString('tr-TR')} gerekli`, 'error'); return; }
    const eduDiploma = profile?.education?.diploma || profile?.diplomaLevel || 'ilkokul';
    const eduCycles = profile?.education?.educationCycles || 0;
    const eduOrder = ['ilkokul','ortaokul','lise','universite','yukseklisans','doktora','profesor'];
    const hasLise = eduOrder.indexOf(eduDiploma) >= eduOrder.indexOf('lise') || eduCycles > 0;
    if (!hasLise) { showNotif('Parti kurmak için en az Lise diploması gerekli', 'error'); return; }
    const party = {
      id:genId(), name:pForm.name.trim(), ideology:pForm.ideology, desc:pForm.desc,
      color:pForm.color, leaderId:profile?.uid, leaderName:profile?.username,
      members:[profile?.uid], memberCount:1, treasury:0,
      support:5+Math.floor(Math.random()*10), createdAt:Date.now()
    };
    setParties([...parties, party]);
    setProfile(p => { const np={...p,party:party.id,money:(p.money||0)-PARTY_CREATE_COST}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    showNotif(`🏛️ ${pForm.name} partisi kuruldu!`, 'success');
  };

  const joinParty = (party) => {
    if (myParty) { showNotif('Zaten bir partidesin', 'error'); return; }
    if (profile?.gang) {
      const allGs = (() => { try { return JSON.parse(localStorage.getItem('gangs')||'[]'); } catch{return[];} })();
      const myG = allGs.find(g=>g.id===profile.gang);
      if (myG) { showNotif(`${myG.type==='family'?'👨‍👩‍👧‍👦 Aile':'⚔️ Çete'} üyeleri partiye katılamaz. Önce ayrılın.`, 'error'); return; }
    }
    const updated = parties.map(p => p.id===party.id ? {...p, members:[...(p.members||[]),profile.uid], memberCount:(p.memberCount||0)+1, support:Math.min(100,(p.support||0)+2)} : p);
    setParties(updated);
    setProfile(p => { const np={...p,party:party.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${party.name} partisine katıldın`, 'success');
  };

  const leaveParty = () => {
    if (!myParty) return;
    if (isLeader) { showNotif('Lider partiden ayrılamaz. Önce liderliği devret.', 'error'); return; }
    const updated = parties.map(p => p.id===myParty.id ? {...p, members:(p.members||[]).filter(m=>m!==profile.uid), memberCount:Math.max(0,(p.memberCount||1)-1)} : p);
    setParties(updated);
    setProfile(p => { const np={...p,party:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('Partiden ayrıldın', 'info');
  };

  const kickMember = (uid) => {
    if (!isLeader) return;
    const updated = parties.map(p => p.id===myParty.id ? {...p, members:(p.members||[]).filter(m=>m!==uid), memberCount:Math.max(0,(p.memberCount||1)-1)} : p);
    setParties(updated);
    showNotif('Üye partiden çıkarıldı', 'info');
  };

  const transferLeadership = () => {
    if (!isLeader||!transferTarget.trim()) { showNotif('Kullanıcı adı girin','error'); return; }
    const memberUids = (myParty.members||[]).filter(u => u !== myParty.leaderId);
    if (!memberUids.length) { showNotif('Devredecek üye yok','error'); return; }
    const users = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return [];} })();
    const tgt = users.find(u => u.username===transferTarget.trim());
    if (!tgt) { showNotif('Kullanıcı bulunamadı','error'); return; }
    if (!memberUids.includes(tgt.id) && tgt.id !== profile?.uid) { showNotif('Bu kişi partinde değil','error'); return; }
    setParties(prev => prev.map(p => p.id===myParty.id ? {...p, leaderId:tgt.id, leaderName:tgt.username} : p));
    setTransferModal(false); setTransferTarget('');
    showNotif(`👑 Liderlik ${tgt.username} kişisine devredildi`, 'success');
  };

  const disbandParty = () => {
    if (!isLeader) return;
    setParties(prev => prev.filter(p => p.id !== myParty.id));
    setProfile(pr => { const np={...pr,party:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setDisbandConfirm(false);
    showNotif('🏛️ Parti feshedildi','info');
  };

  const partyAction = (actionId, cooldownMs, effect) => {
    if (!myParty) return;
    const key = `party_${myParty.id}_${actionId}`;
    const last = govCooldowns[key]||0;
    const rem = cooldownMs - (Date.now()-last);
    if (rem > 0) { showNotif(`⏳ ${Math.ceil(rem/3600000)}s sonra tekrar kullanılabilir`,'error'); return; }
    effect();
    setGovCooldowns(prev => ({...prev, [key]: Date.now()}));
  };

  const govAction = (actionId, cooldownMs, effect) => {
    const key = `gov_${profile?.uid}_${actionId}`;
    const last = govCooldowns[key]||0;
    const rem = cooldownMs - (Date.now()-last);
    if (rem > 0) { showNotif(`⏳ ${Math.ceil(rem/3600000)}s sonra tekrar kullanılabilir`,'error'); return; }
    effect();
    setGovCooldowns(prev => ({...prev, [key]: Date.now()}));
  };

  const removeFromCabinet = (role) => {
    if (!isPresident&&!isLeader) { showNotif('Bu yetkiye sahip değilsiniz','error'); return; }
    setCabinet(prev => { const np={...prev}; delete np[role]; localStorage.setItem('rep_cabinet',JSON.stringify(np)); return np; });
    showNotif(`${role} görevden alındı`,'info');
  };

  const GOV_ROLE_DEFS = {
    'Devlet Başkanı':    {icon:'👑', cd:4*3600000,  label:'Ulusal Duyuru',       xp:500,  money:0,      desc:'Ulusal karar al, XP kazan'},
    'Meclis Başkanı':    {icon:'🏛️',cd:3*3600000,  label:'Meclis Oturumu',      xp:300,  money:0,      desc:'Milletvekilleri oylaması yönet'},
    'Milletvekili':      {icon:'📋', cd:2*3600000,  label:'Yasa Önergesi',       xp:200,  money:0,      desc:'Meclis gündemine önerge ver'},
    'İçişleri Bakanı':   {icon:'🚔', cd:2*3600000,  label:'Polis Operasyonu',    xp:200,  money:0,      desc:'Güvenlik operasyonu başlat'},
    'Belediye Başkanı':  {icon:'🏙️', cd:4*3600000,  label:'Şehir Projesi',       xp:400,  money:200000, desc:'Şehir projesi başlat, kira topla'},
    'Vali':              {icon:'🏛️', cd:6*3600000,  label:'İl Kalkınması',       xp:350,  money:150000, desc:'İl yönet, vergi topla'},
    'Genelkurmay Başkanı':{icon:'⚔️',cd:4*3600000, label:'Askeri Operasyon',    xp:500,  money:0,      desc:'Ordu komutanı, savaş başlatır'},
    'Ticaret Bakanı':    {icon:'📦', cd:5*3600000,  label:'Ticaret Anlaşması',   xp:200,  money:250000, desc:'Ekonomiyi büyüt'},
    'Maliye Bakanı':     {icon:'💸', cd:6*3600000,  label:'Bütçe Kararı',        xp:150,  money:0,      desc:'Para bas, vergi ve faiz oranı ayarla'},
  };

  const donateToParty = () => {
    const amt = parseInt(donateAmount);
    if (!amt||amt<=0) { showNotif('Geçerli tutar girin','error'); return; }
    if ((profile?.money||0)<amt) { showNotif('Yetersiz para','error'); return; }
    setParties(prev => prev.map(p => p.id===myParty.id ? {...p, treasury:(p.treasury||0)+amt} : p));
    setProfile(p => { const np={...p,money:(p.money||0)-amt}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setDonateModal(false); setDonateAmount('');
    showNotif(`💰 ${fmtWord(amt)} parti kasasına bağışlandı`, 'success');
  };

  const proposeLaw = () => {
    if (!lawForm.title.trim()) { showNotif('Yasa başlığı gerekli','error'); return; }
    if (!myParty) { showNotif('Yasa önermek için parti üyesi olun','error'); return; }
    const law = {
      id:genId(), title:lawForm.title.trim(), desc:lawForm.desc, category:lawForm.category,
      proposedBy:profile?.username, partyName:myParty?.name,
      votes:{yes:0,no:0,voters:{}}, status:'voting', createdAt:Date.now(),
      expiresAt:Date.now()+3*24*60*60*1000
    };
    setLaws([...laws, law]);
    setLawModal(false); setLawForm({title:'',desc:'',category:'vergi'});
    showNotif(`⚖️ "${law.title}" yasası oylamaya açıldı!`, 'success');
  };

  const voteOnLaw = (lawId, choice) => {
    if (laws.find(l=>l.id===lawId)?.votes?.voters?.[profile?.uid]) { showNotif('Bu yasaya zaten oy verdiniz','error'); return; }
    setLaws(prev => prev.map(l => {
      if (l.id!==lawId) return l;
      const newV = {...l.votes, [choice]:(l.votes[choice]||0)+1, voters:{...(l.votes.voters||{}), [profile.uid]:choice}};
      const total = (newV.yes||0)+(newV.no||0);
      return {...l, votes:newV, status:(newV.yes>newV.no&&total>=3)?'passed':l.status};
    }));
    setProfile(p => { const np={...p,xp:(p.xp||0)+50}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    try { const today=new Date().toDateString(); const dk=`day_${today}`; const s=JSON.parse(localStorage.getItem('dailyTaskState')||'{}'); s[dk]={...(s[dk]||{}),dailyVoteCount:((s[dk]?.dailyVoteCount)||0)+1}; localStorage.setItem('dailyTaskState',JSON.stringify(s)); } catch(e){}
    showNotif(`🗳️ ${choice==='yes'?'Evet':'Hayır'} oyunuz kaydedildi`, 'success');
  };

  const registerCandidate = () => {
    if (elections.candidates?.some(c=>c.uid===profile?.uid)) { showNotif('Zaten adaysın','error'); return; }
    if (!myParty) { showNotif('Aday olmak için parti üyesi olun','error'); return; }
    setElections(e => ({...e, candidates:[...(e.candidates||[]),{uid:profile.uid,username:profile.username,party:myParty.name,partyId:myParty.id,votes:0,slogan:'Değişim için oyunuzu isterim!'}]}));
    showNotif('🗳️ Devlet başkanlığı adaylığın kaydedildi!', 'success');
  };

  const voteInElection = (candidateUid) => {
    if ((elections.votes||{})[profile?.uid]) { showNotif('Zaten oy kullandınız','error'); return; }
    const allUsers = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return [];} })();
    // Ticaret sıralamasına göre oy katsayısı
    const tradeSorted = [...allUsers].sort((a,b)=>(b.tradePoints||0)-(a.tradePoints||0));
    const tradeRank = tradeSorted.findIndex(u=>u.id===profile?.id) + 1;
    let voteWeight = 1;
    if (tradeRank === 1)       voteWeight = 6;
    else if (tradeRank === 2)  voteWeight = 4;
    else if (tradeRank <= 5)   voteWeight = 3;
    else if (tradeRank <= 20)  voteWeight = 2;
    else if (tradeRank <= 50)  voteWeight = 2;
    else                       voteWeight = 1;
    // Eğitim sıralamasına göre bonus katsayı
    const eduSorted = [...allUsers].sort((a,b)=>(b.educationProgress||0)-(a.educationProgress||0));
    const eduRank = eduSorted.findIndex(u=>u.id===profile?.id) + 1;
    let eduBonus = 0;
    if (eduRank === 1)         eduBonus = 3;
    else if (eduRank <= 3)     eduBonus = 2;
    else if (eduRank <= 10)    eduBonus = 1;
    voteWeight += eduBonus;
    // UC katsayı bonusu
    const ucBonus = profile?.voteMultiplier || 0;
    voteWeight += ucBonus;
    setElections(e => ({...e, votes:{...(e.votes||{}),[profile.uid]:candidateUid}, candidates:(e.candidates||[]).map(c=>c.uid===candidateUid?{...c,votes:(c.votes||0)+voteWeight}:c)}));
    setProfile(p => { const np={...p,xp:(p.xp||0)+100}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    // Günlük görev
    try { const today=new Date().toDateString(); const dk=`day_${today}`; const s=JSON.parse(localStorage.getItem('dailyTaskState')||'{}'); s[dk]={...(s[dk]||{}),dailyVoteCount:((s[dk]?.dailyVoteCount)||0)+1}; localStorage.setItem('dailyTaskState',JSON.stringify(s)); } catch(e){}
    const bonusInfo = [tradeRank<=50?`Ticaret #${tradeRank}`:null, eduBonus>0?`Eğitim +${eduBonus}`:null, ucBonus>0?`UC +${ucBonus}`:null].filter(Boolean).join(', ');
    showNotif(`🗳️ Oyunuz kullanıldı! (${voteWeight}x katsayı${bonusInfo?` — ${bonusInfo}`:''})`, 'success');
  };

  const appointCabinet = () => {
    if (!cabinetRole||!cabinetTarget.trim()) { showNotif('Rol ve kullanıcı adı girin','error'); return; }
    if (!isPresident&&!isLeader) { showNotif('Bu yetkiye sahip değilsiniz','error'); return; }
    setCabinet(prev => { const np={...prev,[cabinetRole]:cabinetTarget.trim()}; localStorage.setItem('rep_cabinet',JSON.stringify(np)); return np; });
    setCabinetModal(false); setCabinetRole(''); setCabinetTarget('');
    showNotif(`✅ ${cabinetTarget} → ${cabinetRole} olarak atandı`, 'success');
  };

  const sortedCandidates = [...(elections.candidates||[])].sort((a,b)=>(b.votes||0)-(a.votes||0));
  const userVoted = !!(elections.votes||{})[profile?.uid];
  const myVote = (elections.votes||{})[profile?.uid];
  const inputSt = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'};
  const subs = [{id:'parties',label:'🏛️ Partiler'},{id:'management',label:'⚙️ Yönetim'},{id:'govpanel',label:'🏛️ Makam'},{id:'laws',label:'⚖️ Yasalar'},{id:'election',label:'🗳️ Seçim'}];

  const ALL_POSITIONS = [
    { id:'devlet_baskani', title:'Devlet Başkanı', icon:'👑', desc:'En yüksek yönetim makamı', req:'Parti üyesi olmak zorunlu', openTo:'parti', electionKey:'presElection' },
    { id:'meclis_baskani', title:'Meclis Başkanı', icon:'🏛️', desc:'Meclis oturumlarını yönetir', req:'Milletvekili seçilmek gerekir', openTo:'mp', electionKey:'speakerElection' },
    { id:'milletvekili', title:'Milletvekili', icon:'📋', desc:'Yasama organı üyesi', req:'Parti üyesi olmak zorunlu', openTo:'parti', electionKey:'mpElection' },
    { id:'icisleri', title:'İçişleri Bakanı', icon:'🚔', desc:'Güvenlik ve polis operasyonları', req:'Devlet Başkanı atar', openTo:'atama', electionKey:null },
    { id:'belediye', title:'Belediye Başkanı', icon:'🏙️', desc:'Şehir yönetimi ve projeleri', req:'Genel seçimle belirlenir', openTo:'genel', electionKey:'mayorElection' },
    { id:'vali', title:'Vali', icon:'🏛️', desc:'İl yönetimi ve kalkınma', req:'Devlet Başkanı atar', openTo:'atama', electionKey:null },
    { id:'genelkurmay', title:'Genelkurmay Başkanı', icon:'⚔️', desc:'Ordunun tek komutanı — savaş başlatır', req:'Herkes aday olabilir (parti şartı yok)', openTo:'herkese', electionKey:'generalElection' },
    { id:'ticaret', title:'Ticaret Bakanı', icon:'📦', desc:'Ekonomi ve ticaret anlaşmaları', req:'Devlet Başkanı atar', openTo:'atama', electionKey:null },
    { id:'maliye', title:'Maliye Bakanı', icon:'💸', desc:'Para basma, vergi ve faiz oranı', req:'Parti üyesi olmak zorunlu', openTo:'parti', electionKey:'financeElection' },
  ];

  return (
    <div>
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {subs.map(s => (
          <button key={s.id} onClick={()=>setSub(s.id)}
            style={{padding:'0.38rem 0.75rem',borderRadius:'8px',border:`1px solid ${sub===s.id?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.07)'}`,background:sub===s.id?'rgba(139,92,246,0.12)':'rgba(255,255,255,0.03)',color:sub===s.id?'#A78BFA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.76rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{padding:'0.7rem'}}>

        {sub==='parties' && (
          <div>
            {myParty ? (
              <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(11,21,39,0.9))',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                  <div>
                    <div style={{fontSize:'0.65rem',color:'#A78BFA',fontWeight:700,textTransform:'uppercase',marginBottom:'0.2rem'}}>{isLeader?'👑 Parti Lideri':'✅ Üye'}</div>
                    <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1.05rem'}}>{myParty.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089',marginTop:'0.15rem'}}>{myParty.memberCount} üye • {myParty.ideology} • %{myParty.support||0} destek</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#10B981',fontWeight:800,fontSize:'0.9rem'}}>{fmtWord(myParty.treasury||0)}</div>
                    <div style={{fontSize:'0.58rem',color:'#5A7089'}}>Kasa</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  <Btn variant='ghost' size='sm' onClick={()=>setManagePartyModal(true)}>👥 Üyeler</Btn>
                  <Btn variant='ghost' size='sm' onClick={()=>setDonateModal(true)}>💰 Bağış</Btn>
                  {!isLeader && <Btn variant='danger' size='sm' onClick={leaveParty}>🚪 Ayrıl</Btn>}
                </div>
              </div>
            ) : (
              <Btn variant='ghost' size='sm' onClick={()=>setCreateModal(true)} style={{marginBottom:'0.75rem',width:'100%'}}>🏛️ Yeni Parti Kur (₱500.000)</Btn>
            )}
            {parties.map(party => (
              <Card key={party.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:`1px solid ${party.id===myParty?.id?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.05)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.5rem'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
                      <div style={{width:'10px',height:'10px',borderRadius:'50%',background:party.color||'#8B5CF6',flexShrink:0}} />
                      <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{party.name}</div>
                    </div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{party.memberCount||0} üye • {party.ideology}</div>
                    {party.desc && <div style={{fontSize:'0.68rem',color:'#8BA0B5',marginTop:'0.2rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{party.desc}</div>}
                    <div style={{marginTop:'0.4rem'}}>
                      <ProgressBar pct={party.support||0} color='#8B5CF6' h={3} />
                      <div style={{fontSize:'0.58rem',color:'#5A7089',marginTop:'2px'}}>%{party.support||0} destek</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{color:'#10B981',fontWeight:800,fontSize:'0.8rem'}}>{fmtWord(party.treasury||0)}</div>
                    <div style={{fontSize:'0.55rem',color:'#3B4E63',marginBottom:'0.3rem'}}>Kasa</div>
                    {!myParty && <Btn variant='ghost' size='sm' onClick={()=>joinParty(party)}>Katıl</Btn>}
                    {party.id===myParty?.id && <Tag color='violet'>Üyesin</Tag>}
                  </div>
                </div>
              </Card>
            ))}
            {parties.length===0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz parti yok. İlk sen kur! 🏛️</div>}
          </div>
        )}

        {sub==='management' && (
          <div>
            {!myParty ? (
              <Card style={{textAlign:'center',padding:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🏛️</div>
                <div style={{color:'#5A7089',fontSize:'0.85rem'}}>Yönetim panelini görmek için bir partiye katıl</div>
              </Card>
            ) : (
              <div>
                {/* Party header stats */}
                <Card style={{marginBottom:'0.65rem',background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(11,21,39,0.95))'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                    <div style={{width:'10px',height:'10px',borderRadius:'50%',background:myParty.color||'#8B5CF6',flexShrink:0}} />
                    <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1rem'}}>{myParty.name}</div>
                    {isLeader&&<Tag color='gold'>👑 Lider</Tag>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.35rem',marginBottom:'0.65rem'}}>
                    {[['👑','Lider',myParty.leaderName||'?'],['👥','Üye',myParty.memberCount||1],['📊','Destek',`%${myParty.support||0}`],['💰','Kasa',fmtWord(myParty.treasury||0)]].map(([ic,lb,v])=>(
                      <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.5rem',textAlign:'center'}}>
                        <div style={{fontSize:'0.9rem',marginBottom:'0.1rem'}}>{ic}</div>
                        <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.75rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</div>
                        <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
                      </div>
                    ))}
                  </div>
                  {/* Base actions */}
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                    <Btn variant='ghost' size='sm' onClick={()=>setDonateModal(true)}>💰 Bağış</Btn>
                    {isLeader && <Btn variant='ghost' size='sm' onClick={()=>setCabinetModal(true)}>👔 Bakan Ata</Btn>}
                    {!isLeader && <Btn variant='danger' size='sm' onClick={leaveParty}>🚪 Ayrıl</Btn>}
                  </div>
                </Card>

                {/* Leader-only action panel */}
                {isLeader && (
                  <Card style={{marginBottom:'0.65rem',border:'1px solid rgba(245,158,11,0.2)'}}>
                    <div style={{fontWeight:700,color:'#F59E0B',marginBottom:'0.65rem',fontSize:'0.82rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>👑 Lider Yetkileri</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.5rem'}}>
                      {[
                        {label:'📢 Propaganda', cd:6*3600000, id:'prop', onClick:()=>partyAction('prop',6*3600000,()=>{setParties(prev=>prev.map(p=>p.id===myParty.id?{...p,support:Math.min(100,(p.support||0)+3)}:p));showNotif('📢 Propaganda başarılı! +3% destek','success');})},
                        {label:'🎯 Üye Kazan', cd:8*3600000, id:'recruit', onClick:()=>partyAction('recruit',8*3600000,()=>{setProfile(pr=>{const np={...pr,xp:(pr.xp||0)+200};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});showNotif('🎯 Üyelik sürücüsü! +200 XP','success');})},
                        {label:'💼 Bağış Kampanyası', cd:12*3600000, id:'fundraise', onClick:()=>partyAction('fundraise',12*3600000,()=>{setParties(prev=>prev.map(p=>p.id===myParty.id?{...p,treasury:(p.treasury||0)+10000}:p));showNotif('💼 Kampanya başarılı! +₱10.000 kasa','success');})},
                        {label:'🗞️ Basın Açıklaması', cd:4*3600000, id:'press', onClick:()=>partyAction('press',4*3600000,()=>{setParties(prev=>prev.map(p=>p.id===myParty.id?{...p,support:Math.min(100,(p.support||0)+1)}:p));setProfile(pr=>{const np={...pr,xp:(pr.xp||0)+150};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});showNotif('🗞️ Basın açıklaması yayınlandı! +1% destek, +150 XP','success');})},
                      ].map(a => {
                        const key = `party_${myParty.id}_${a.id}`;
                        const rem = Math.max(0, a.cd - (Date.now() - (govCooldowns[key]||0)));
                        return (
                          <button key={a.id} onClick={a.onClick} disabled={rem>0}
                            style={{padding:'0.55rem 0.4rem',background:rem>0?'rgba(255,255,255,0.03)':'rgba(245,158,11,0.08)',border:`1px solid ${rem>0?'rgba(255,255,255,0.07)':'rgba(245,158,11,0.25)'}`,borderRadius:'10px',color:rem>0?'#3B4E63':'#F59E0B',cursor:rem>0?'not-allowed':'pointer',fontWeight:700,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",textAlign:'center',lineHeight:1.3}}>
                            {a.label}{rem>0&&<div style={{fontSize:'0.6rem',marginTop:'2px',color:'#3B4E63'}}>⏳{Math.ceil(rem/3600000)}s</div>}
                          </button>
                        );
                      })}
                    </div>
                    {/* Dangerous leader actions */}
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'0.5rem',marginTop:'0.2rem'}}>
                      <Btn variant='ghost' size='sm' onClick={()=>setTransferModal(true)}>🔄 Liderliği Devret</Btn>
                      <Btn variant='danger' size='sm' onClick={()=>setDisbandConfirm(true)}>🗑️ Partiyi Feshet</Btn>
                    </div>
                  </Card>
                )}

                {/* Members list */}
                <Card>
                  <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>👥 Parti Üyeleri ({myParty.memberCount||1})</div>
                  {(myParty.members||[]).map((uid,i) => (
                    <div key={uid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.45rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>{uid===myParty.leaderId?'👑':'👤'}</div>
                        <div>
                          <div style={{fontSize:'0.82rem',fontWeight:700,color:uid===profile?.uid?'#A78BFA':'#E8EDF2'}}>
                            {uid===profile?.uid?profile?.username:`Üye #${i+1}`} {uid===myParty.leaderId&&<Tag color='gold'>Lider</Tag>}
                          </div>
                          {uid===myParty.leaderId&&<div style={{fontSize:'0.62rem',color:'#5A7089'}}>Parti kurucusu</div>}
                        </div>
                      </div>
                      {isLeader&&uid!==myParty.leaderId&&uid!==profile?.uid&&(
                        <button onClick={()=>kickMember(uid)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',padding:'2px 8px',color:'#FCA5A5',cursor:'pointer',fontSize:'0.68rem',fontWeight:700}}>Çıkar</button>
                      )}
                    </div>
                  ))}
                  {(myParty.members||[]).length===0&&<div style={{color:'#3B4E63',fontSize:'0.82rem',textAlign:'center',padding:'1rem'}}>Henüz üye yok</div>}
                </Card>
              </div>
            )}
          </div>
        )}

        {sub==='govpanel' && (
          <div>
            {/* Info banner */}
            <div style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'12px',padding:'0.75rem',marginBottom:'0.75rem',fontSize:'0.78rem',color:'#A78BFA'}}>
              🏛️ Devlet makamlarını yönet. Her makam sahibi özel yetkiler kullanabilir.
            </div>

            {/* Meclis Koltuk Dağılımı */}
            {(() => {
              const TOTAL_SEATS = 81;
              const allParties = JSON.parse(localStorage.getItem('parties')||'[]');
              const totalSupport = allParties.reduce((s,p)=>(s+(p.support||0)),0) || 1;
              const seatsData = allParties.map(p => ({
                name: p.name,
                color: p.color || '#8B5CF6',
                support: p.support || 0,
                seats: Math.max(0, Math.floor((p.support||0)/totalSupport*TOTAL_SEATS)),
              }));
              const assignedSeats = seatsData.reduce((s,p)=>s+p.seats,0);
              const remainder = TOTAL_SEATS - assignedSeats;
              if (seatsData.length > 0) seatsData[0].seats += remainder;
              const totalAssigned = seatsData.reduce((s,p)=>s+p.seats,0);
              return (
                <div style={{background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.65rem'}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:'#A78BFA',fontSize:'0.88rem'}}>🏛️ Meclis Koltuk Dağılımı</div>
                    <div style={{fontSize:'0.68rem',color:'#5A7089',fontWeight:700}}>{TOTAL_SEATS} Milletvekili</div>
                  </div>
                  {/* Yarı daire görsel */}
                  <div style={{marginBottom:'0.65rem'}}>
                    <div style={{display:'flex',height:'12px',borderRadius:'100px',overflow:'hidden',gap:'1px'}}>
                      {seatsData.length > 0 ? seatsData.map((p,i)=>(
                        <div key={i} style={{flex:p.seats,background:p.color,minWidth:p.seats>0?'2px':'0',transition:'flex 0.4s'}} title={`${p.name}: ${p.seats} koltuk`} />
                      )) : (
                        <div style={{flex:1,background:'rgba(255,255,255,0.06)',borderRadius:'100px'}} />
                      )}
                    </div>
                  </div>
                  {/* Parti listesi */}
                  {seatsData.length > 0 ? seatsData.sort((a,b)=>b.seats-a.seats).map((p,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.35rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div style={{width:'10px',height:'10px',borderRadius:'3px',background:p.color,flexShrink:0}} />
                        <span style={{fontSize:'0.78rem',color:'#E8EDF2',fontWeight:600}}>{p.name}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                        <span style={{fontSize:'0.65rem',color:'#5A7089'}}>%{Math.round(p.seats/TOTAL_SEATS*100)}</span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,color:p.color,fontSize:'0.88rem'}}>{p.seats}</span>
                        <span style={{fontSize:'0.6rem',color:'#3B4E63'}}>koltuk</span>
                      </div>
                    </div>
                  )) : (
                    <div style={{fontSize:'0.78rem',color:'#3B4E63',textAlign:'center',padding:'0.5rem'}}>Henüz parti kurulmamış — koltuklar atıl</div>
                  )}
                  {seatsData.length > 0 && (
                    <div style={{marginTop:'0.5rem',paddingTop:'0.4rem',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#5A7089'}}>
                      <span>Çoğunluk eşiği: {Math.ceil(TOTAL_SEATS/2)+1} koltuk</span>
                      <span>{seatsData.filter(p=>p.seats>Math.ceil(TOTAL_SEATS/2)).length>0?'✅ Çoğunluk var':'⚠️ Koalisyon gerekli'}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* My positions */}
            {CABINET_ROLES.filter(r => cabinet[r]===profile?.username).length > 0 && (
              <div style={{marginBottom:'0.75rem'}}>
                <div style={{fontSize:'0.72rem',color:'#F59E0B',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.4rem'}}>⭐ Senin Makamların</div>
                {CABINET_ROLES.filter(r => cabinet[r]===profile?.username).map(role => {
                  const def = GOV_ROLE_DEFS[role];
                  if (!def) return null;
                  const key = `gov_${profile?.uid}_${role.replace(/\s/g,'_')}`;
                  const rem = Math.max(0, def.cd - (Date.now() - (govCooldowns[key]||0)));
                  const canAct = rem === 0;
                  return (
                    <Card key={role} style={{marginBottom:'0.5rem',border:'1px solid rgba(245,158,11,0.3)',background:'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(11,21,39,0.95))'}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:'0.65rem'}}>
                        <div style={{fontSize:'1.75rem',flexShrink:0,lineHeight:1}}>{def.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.1rem'}}>
                            <div style={{fontWeight:800,color:'#F59E0B',fontSize:'0.9rem'}}>{role}</div>
                            <Tag color='gold'>Aktif</Tag>
                          </div>
                          <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.5rem'}}>{def.desc}</div>
                          <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem',fontSize:'0.68rem'}}>
                            {def.xp>0&&<span style={{background:'rgba(139,92,246,0.12)',padding:'2px 8px',borderRadius:'6px',color:'#A78BFA',fontWeight:700}}>+{def.xp} XP</span>}
                            {def.money>0&&<span style={{background:'rgba(16,185,129,0.12)',padding:'2px 8px',borderRadius:'6px',color:'#10B981',fontWeight:700}}>+{fmtWord(def.money)}</span>}
                          </div>
                          {canAct ? (
                            <Btn variant='gold' size='sm' onClick={()=>govAction(role.replace(/\s/g,'_'), def.cd, ()=>{
                              setProfile(pr=>{const np={...pr,xp:(pr.xp||0)+def.xp,money:(pr.money||0)+def.money};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});
                              showNotif(`${def.icon} ${def.label} gerçekleştirildi!${def.xp>0?` +${def.xp} XP`:''}${def.money>0?` +${fmtWord(def.money)}`:''}`, 'success');
                            })}>
                              {def.icon} {def.label}
                            </Btn>
                          ) : (
                            <div style={{fontSize:'0.72rem',color:'#3B4E63'}}>⏳ {Math.ceil(rem/3600000)} saat sonra tekrar kullanılabilir</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* All positions overview */}
            <div style={{fontSize:'0.72rem',color:'#5A7089',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.4rem'}}>👔 Tüm Devlet Makamları</div>
            {CABINET_ROLES.map(role => {
              const assigned = cabinet[role];
              const isMyRole = assigned===profile?.username;
              const def = GOV_ROLE_DEFS[role];
              return (
                <Card key={role} style={{marginBottom:'0.4rem',padding:'0.75rem',border:`1px solid ${isMyRole?'rgba(245,158,11,0.3)':assigned?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)'}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                      <div style={{fontSize:'1.3rem',flexShrink:0}}>{def?.icon||'🏛️'}</div>
                      <div>
                        <div style={{fontWeight:700,color:isMyRole?'#F59E0B':'#E8EDF2',fontSize:'0.82rem'}}>{role}</div>
                        {assigned
                          ? <div style={{fontSize:'0.68rem',color:isMyRole?'#10B981':'#5A7089',marginTop:'1px'}}>👤 {assigned}{isMyRole?' (Sen)':''}</div>
                          : <div style={{fontSize:'0.68rem',color:'#3B4E63',fontStyle:'italic',marginTop:'1px'}}>Boş — Atanmamış</div>}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'0.3rem',alignItems:'center',flexShrink:0}}>
                      {isMyRole&&<Tag color='gold'>⭐</Tag>}
                      {assigned&&(isPresident||isLeader)&&!isMyRole&&(
                        <button onClick={()=>removeFromCabinet(role)} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',padding:'2px 7px',color:'#FCA5A5',cursor:'pointer',fontSize:'0.65rem',fontWeight:700}}>Al</button>
                      )}
                      {!assigned&&(isPresident||isLeader)&&<Btn variant='ghost' size='sm' onClick={()=>{setCabinetRole(role);setCabinetModal(true);}}>Ata</Btn>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {sub==='laws' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div style={{color:'#5A7089',fontSize:'0.78rem'}}>⚖️ Yasa önerileri</div>
              {myParty && <Btn variant='ghost' size='sm' onClick={()=>setLawModal(true)}>+ Yasa Öner</Btn>}
            </div>
            {laws.length===0 && (
              <Card style={{textAlign:'center',padding:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>⚖️</div>
                <div style={{color:'#5A7089',fontSize:'0.85rem',marginBottom:'1rem'}}>Henüz yasa önerisi yok</div>
                {myParty && <Btn variant='ghost' size='sm' onClick={()=>setLawModal(true)}>+ Yasa Öner</Btn>}
              </Card>
            )}
            {laws.map(law => {
              const total = (law.votes?.yes||0)+(law.votes?.no||0);
              const yesPct = total>0 ? Math.round((law.votes?.yes||0)/total*100) : 50;
              const myVoteLaw = law.votes?.voters?.[profile?.uid];
              const expired = Date.now()>law.expiresAt;
              const timeLeft = Math.max(0,Math.floor((law.expiresAt-Date.now())/3600000));
              return (
                <Card key={law.id} style={{marginBottom:'0.6rem',padding:'1rem',border:`1px solid ${law.status==='passed'?'rgba(16,185,129,0.3)':expired?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.06)'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem',marginBottom:'0.2rem'}}>{law.title}</div>
                      <div style={{fontSize:'0.68rem',color:'#5A7089'}}>{law.partyName} • {law.proposedBy}</div>
                      {law.desc && <div style={{fontSize:'0.72rem',color:'#8BA0B5',marginTop:'0.25rem'}}>{law.desc}</div>}
                    </div>
                    <div style={{marginLeft:'0.5rem',flexShrink:0}}>
                      {law.status==='passed'?<Tag color='green'>✅ Kabul</Tag>:expired?<Tag color='red'>❌ Reddedildi</Tag>:<Tag color='blue'>🗳️ Oylamada</Tag>}
                    </div>
                  </div>
                  <div style={{marginBottom:'0.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#5A7089',marginBottom:'3px'}}>
                      <span style={{color:'#10B981'}}>✅ Evet: {law.votes?.yes||0}</span>
                      <span>{total} oy</span>
                      <span style={{color:'#EF4444'}}>Hayır: {law.votes?.no||0} ❌</span>
                    </div>
                    <div style={{height:'6px',background:'rgba(239,68,68,0.3)',borderRadius:'100px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${yesPct}%`,background:'#10B981',borderRadius:'100px',transition:'width 0.5s'}} />
                    </div>
                  </div>
                  {!myVoteLaw&&!expired&&law.status!=='passed'&&(
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <Btn variant='green' size='sm' style={{flex:1}} onClick={()=>voteOnLaw(law.id,'yes')}>✅ Evet</Btn>
                      <Btn variant='danger' size='sm' style={{flex:1}} onClick={()=>voteOnLaw(law.id,'no')}>❌ Hayır</Btn>
                    </div>
                  )}
                  {myVoteLaw && <div style={{fontSize:'0.72rem',color:'#5A7089',textAlign:'center',padding:'0.25rem'}}>Oyunuz: <span style={{color:myVoteLaw==='yes'?'#10B981':'#EF4444',fontWeight:700}}>{myVoteLaw==='yes'?'✅ Evet':'❌ Hayır'}</span></div>}
                  {!expired&&law.status!=='passed'&&<div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.3rem',textAlign:'right'}}>⏳ {timeLeft}s kaldı</div>}
                </Card>
              );
            })}
          </div>
        )}

        {sub==='election' && (() => {
          const VOTE_POSITIONS = [
            {key:'devlet_baskani',   title:'Devlet Başkanı',      icon:'👑',  openTo:'parti'},
            {key:'meclis_baskani',   title:'Meclis Başkanı',       icon:'🏛️', openTo:'parti'},
            {key:'milletvekili',     title:'Milletvekili',         icon:'📜',  openTo:'parti'},
            {key:'icisleri_bakani',  title:'İçişleri Bakanı',      icon:'🛡️', openTo:'atama'},
            {key:'belediye_baskani', title:'Belediye Başkanı',     icon:'🏙️', openTo:'genel'},
            {key:'vali',             title:'Vali',                 icon:'🏢',  openTo:'atama'},
            {key:'genelkurmay',      title:'Genelkurmay Başkanı',  icon:'⚔️', openTo:'herkese'},
            {key:'ticaret_bakani',   title:'Ticaret Bakanı',       icon:'📊',  openTo:'atama'},
            {key:'maliye_bakani',    title:'Maliye Bakanı',        icon:'💰',  openTo:'parti'},
          ];
          const activeElections = VOTE_POSITIONS.filter(p => elections_multi[p.key]?.active);
          return (
            <div>
              <div style={{background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(11,21,39,0.9))',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'14px',padding:'0.85rem',marginBottom:'0.75rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:800,color:'#F59E0B',fontSize:'0.85rem'}}>🗳️ SEÇİM ODASI</div>
                  <div style={{fontSize:'0.7rem',color:'#8BA0B5',marginTop:'0.2rem'}}>9 devlet makamı için oylamalar</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:900,color:activeElections.length>0?'#10B981':'#5A7089',fontSize:'1.1rem'}}>{activeElections.length}</div>
                  <div style={{fontSize:'0.62rem',color:'#5A7089'}}>Aktif Seçim</div>
                </div>
              </div>

              {VOTE_POSITIONS.map(pos => {
                const el = elections_multi[pos.key] || {};
                const isActive = !!el.active;
                const hasEnded = !isActive && !!el.winner;
                const candidates = (el.candidates || []).map(c => ({
                  ...c, voteCount: (el.votes || {})[c.username] || 0
                })).sort((a,b) => b.voteCount - a.voteCount);
                const totalVotes = candidates.reduce((s,c)=>s+c.voteCount, 0);
                const alreadyVoted = (el.userVotedIds || []).includes(profile?.uid);
                const myVotedFor = (el.myVotes || {})[profile?.uid];
                const isCandidate = candidates.some(c => c.username === profile?.username);
                const canSelfReg = isActive && !isCandidate && pos.openTo !== 'atama' && (pos.openTo === 'herkese' || pos.openTo === 'genel' || (pos.openTo === 'parti' && !!myParty));

                const selfRegister = () => {
                  setElections_multi(prev => {
                    const e = prev[pos.key] || {active:true,candidates:[],votes:{},userVotedIds:[],myVotes:{}};
                    if ((e.candidates||[]).find(c=>c.username===profile.username)) { showNotif('Zaten adaysın!','error'); return prev; }
                    return {...prev, [pos.key]: {...e, candidates:[...(e.candidates||[]),{username:profile.username,id:profile.uid}], votes:{...(e.votes||{}),[profile.username]:0}}};
                  });
                  showNotif(`📝 ${pos.title} adaylığın kaydedildi!`, 'success');
                };

                const voteFor = (candidateUsername) => {
                  if (!isActive) { showNotif('Bu seçim aktif değil!','error'); return; }
                  if (alreadyVoted) { showNotif('Bu seçimde zaten oy kullandınız!','error'); return; }
                  if (candidateUsername === profile?.username) { showNotif('Kendinize oy veremezsiniz!','error'); return; }
                  const allUsers = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return[];} })();
                  const sorted = [...allUsers].sort((a,b)=>(b.tradePoints||0)-(a.tradePoints||0));
                  const rank = sorted.findIndex(u=>u.id===profile?.id) + 1;
                  const weight = rank<=1?6:rank<=2?4:rank<=5?3:rank<=20?2:1;
                  setElections_multi(prev => {
                    const e = prev[pos.key] || {active:true,candidates:[],votes:{},userVotedIds:[],myVotes:{}};
                    return {...prev, [pos.key]: {...e,
                      votes: {...(e.votes||{}), [candidateUsername]: ((e.votes||{})[candidateUsername]||0)+weight},
                      userVotedIds: [...(e.userVotedIds||[]), profile.uid],
                      myVotes: {...(e.myVotes||{}), [profile.uid]: candidateUsername}
                    }};
                  });
                  setProfile(p => { const np={...p,xp:(p.xp||0)+100}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
                  showNotif(`🗳️ ${pos.title} oyunuz kullanıldı! +100 XP`, 'success');
                };

                const borderColor = isActive ? 'rgba(16,185,129,0.35)' : hasEnded ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)';
                const bgColor = isActive ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)';

                return (
                  <div key={pos.key} style={{background:bgColor,border:`1px solid ${borderColor}`,borderRadius:'14px',padding:'0.9rem',marginBottom:'0.6rem'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.55rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <span style={{fontSize:'1.4rem'}}>{pos.icon}</span>
                        <div>
                          <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.88rem'}}>{pos.title}</div>
                          <div style={{fontSize:'0.62rem',color:'#5A7089',marginTop:'1px'}}>
                            {isActive ? `${candidates.length} aday • ${(el.userVotedIds||[]).length} oy` : hasEnded ? `🏆 Kazanan: ${el.winner}` : 'Seçim bekleniyor'}
                          </div>
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'3px'}}>
                        {isActive && <span style={{fontSize:'0.6rem',fontWeight:800,color:'#10B981',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'6px',padding:'1px 7px'}}>● AKTİF</span>}
                        {hasEnded && <span style={{fontSize:'0.6rem',fontWeight:800,color:'#F59E0B',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'6px',padding:'1px 7px'}}>✅ BİTTİ</span>}
                        {!isActive && !hasEnded && <span style={{fontSize:'0.6rem',color:'#3B4E63',background:'rgba(255,255,255,0.04)',borderRadius:'6px',padding:'1px 7px'}}>beklemede</span>}
                        {cabinet[pos.title] && <span style={{fontSize:'0.62rem',color:'#A78BFA',fontWeight:700}}>👤 {cabinet[pos.title]}</span>}
                      </div>
                    </div>

                    {pos.openTo === 'atama' && !isActive && (
                      <div style={{fontSize:'0.7rem',color:'#5A7089',background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'0.4rem 0.6rem'}}>
                        🏛️ Bu makam Devlet Başkanı tarafından atanır.
                        {isPresident && !cabinet[pos.title] && <button onClick={()=>{setCabinetRole(pos.title);setCabinetModal(true);}} style={{marginLeft:'0.5rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'6px',padding:'2px 8px',color:'#F59E0B',cursor:'pointer',fontSize:'0.65rem',fontWeight:700}}>Ata</button>}
                      </div>
                    )}

                    {(isActive || candidates.length > 0) && (
                      <>
                        {canSelfReg && (
                          <button onClick={selfRegister} style={{width:'100%',marginBottom:'0.5rem',padding:'0.35rem',borderRadius:'8px',border:'1px solid rgba(139,92,246,0.35)',background:'rgba(139,92,246,0.08)',color:'#A78BFA',fontWeight:700,fontSize:'0.73rem',cursor:'pointer'}}>
                            📝 Adaylığını Koy
                          </button>
                        )}
                        {isCandidate && isActive && (
                          <div style={{fontSize:'0.68rem',color:'#A78BFA',fontWeight:700,marginBottom:'0.4rem',textAlign:'center'}}>📝 Bu seçimde adaysın</div>
                        )}
                        {alreadyVoted && (
                          <div style={{fontSize:'0.68rem',color:'#10B981',fontWeight:700,marginBottom:'0.4rem',padding:'0.3rem 0.6rem',background:'rgba(16,185,129,0.07)',borderRadius:'7px',textAlign:'center'}}>
                            ✅ Oyunuzu kullandınız{myVotedFor ? ` → ${myVotedFor}` : ''}
                          </div>
                        )}
                        {candidates.length > 0 ? (
                          <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                            {candidates.map((c,i) => {
                              const pct = totalVotes>0?Math.round(c.voteCount/totalVotes*100):0;
                              const isWinner = hasEnded && i===0 && c.voteCount>0;
                              const isMine = c.username===profile?.username;
                              const isMyVote = myVotedFor===c.username;
                              return (
                                <div key={c.username} style={{background: isWinner?'rgba(245,158,11,0.06)':isMine?'rgba(139,92,246,0.06)':'rgba(255,255,255,0.02)',border:`1px solid ${isWinner?'rgba(245,158,11,0.25)':isMine?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.05)'}`,borderRadius:'10px',padding:'0.5rem 0.6rem'}}>
                                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
                                    <span style={{fontSize:'0.8rem',width:'18px',flexShrink:0}}>{i===0&&c.voteCount>0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                        <span style={{fontWeight:800,color:isMine?'#A78BFA':'#E8EDF2',fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.username}{isMine?' (Sen)':''}</span>
                                        <span style={{fontSize:'0.72rem',color:'#F59E0B',fontWeight:700,flexShrink:0,marginLeft:'0.3rem'}}>{c.voteCount} oy {pct>0&&`(${pct}%)`}</span>
                                      </div>
                                    </div>
                                    {isActive && !alreadyVoted && !isMine && (
                                      <button onClick={()=>voteFor(c.username)} style={{flexShrink:0,padding:'3px 10px',borderRadius:'7px',border:'1px solid rgba(16,185,129,0.4)',background:'rgba(16,185,129,0.1)',color:'#10B981',cursor:'pointer',fontSize:'0.7rem',fontWeight:800}}>Oy Ver</button>
                                    )}
                                    {isMyVote && <span style={{flexShrink:0,fontSize:'0.6rem',color:'#10B981',fontWeight:800,background:'rgba(16,185,129,0.1)',borderRadius:'6px',padding:'2px 6px'}}>✓ Oyum</span>}
                                    {isWinner && !isActive && <span style={{flexShrink:0,fontSize:'0.65rem',color:'#F59E0B',fontWeight:800}}>🏆</span>}
                                  </div>
                                  <ProgressBar pct={pct} color={isWinner?'#F59E0B':isMine?'#8B5CF6':'#3B82F6'} h={3} />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          isActive && <div style={{fontSize:'0.7rem',color:'#3B4E63',textAlign:'center',padding:'0.5rem'}}>Henüz aday yok — ilk aday sen ol!</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Kabine sekmesi kaldırıldı — Admin Paneli üzerinden yönetilir */}
      </div>

      {createModal && (
        <Modal title="🏛️ Parti Kur" onClose={()=>setCreateModal(false)}>
          {[['name','Parti Adı','Parti adı',false],['desc','Açıklama','Kısa bir açıklama...',true]].map(([k,l,ph,ta])=>(
            <div key={k} style={{marginBottom:'0.85rem'}}>
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>{l}</div>
              {ta ? <textarea value={pForm[k]} onChange={e=>setPForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} rows={2} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
              : <input value={pForm[k]} onChange={e=>setPForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inputSt} />}
            </div>
          ))}
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Siyasi Eğilim</div>
            <select value={pForm.ideology} onChange={e=>setPForm(p=>({...p,ideology:e.target.value}))} style={inputSt}>
              {['sol','merkez-sol','merkez','merkez-sağ','sağ','liberal','milliyetçi','eko-yeşil'].map(v=><option key={v} value={v} style={{background:'#0B1527'}}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Parti Rengi</div>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {['#8B5CF6','#3B82F6','#EF4444','#10B981','#F59E0B','#EC4899','#14B8A6','#F97316'].map(c=>(
                <button key={c} onClick={()=>setPForm(p=>({...p,color:c}))} style={{width:'28px',height:'28px',borderRadius:'50%',background:c,border:`3px solid ${pForm.color===c?'#fff':'transparent'}`,cursor:'pointer',outline:'none'}} />
              ))}
            </div>
          </div>
          <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#F59E0B',marginBottom:'1rem'}}>
            💡 Parti kurmak ₱500.000 ve Lise diploması gerektirir. Bakiye: {fmtWord(profile?.money||0)}
          </div>
          <Btn variant='primary' size='full' onClick={createParty}>🏛️ Partiyi Kur</Btn>
        </Modal>
      )}

      {managePartyModal&&myParty&&(
        <Modal title={`👥 ${myParty.name} — Üyeler`} onClose={()=>setManagePartyModal(false)}>
          {(myParty.members||[]).map((uid,i) => (
            <div key={uid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.55rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>{uid===myParty.leaderId?'👑':'👤'}</div>
                <div style={{fontSize:'0.82rem',fontWeight:700,color:uid===profile?.uid?'#A78BFA':'#E8EDF2'}}>
                  {uid===profile?.uid?profile?.username:`Üye #${i+1}`} {uid===myParty.leaderId&&'(Lider)'}
                </div>
              </div>
              {isLeader&&uid!==myParty.leaderId&&uid!==profile?.uid&&(
                <button onClick={()=>kickMember(uid)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',padding:'3px 8px',color:'#FCA5A5',cursor:'pointer',fontSize:'0.68rem',fontWeight:700}}>Çıkar</button>
              )}
            </div>
          ))}
        </Modal>
      )}

      {donateModal&&(
        <Modal title="💰 Parti Kasasına Bağış" onClose={()=>{setDonateModal(false);setDonateAmount('');}}>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Bağış Miktarı</div>
            <input type="number" value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} placeholder="₱ Tutar" style={inputSt} />
            <div style={{display:'flex',gap:'0.4rem',marginTop:'0.5rem',flexWrap:'wrap'}}>
              {[5000,10000,25000,50000].map(n=><button key={n} onClick={()=>setDonateAmount(String(n))} style={{padding:'0.3rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>{fmtWord(n)}</button>)}
            </div>
          </div>
          <Btn variant='gold' size='full' onClick={donateToParty}>💰 Bağış Yap</Btn>
        </Modal>
      )}

      {lawModal&&(
        <Modal title="⚖️ Yasa Öner" onClose={()=>setLawModal(false)}>
          {[['title','Yasa Başlığı','Örn: Vergi indirimi yasası',false],['desc','Açıklama','Yasa hakkında açıklama...',true]].map(([k,l,ph,ta])=>(
            <div key={k} style={{marginBottom:'0.85rem'}}>
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>{l}</div>
              {ta ? <textarea value={lawForm[k]} onChange={e=>setLawForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} rows={3} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
              : <input value={lawForm[k]} onChange={e=>setLawForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inputSt} />}
            </div>
          ))}
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Kategori</div>
            <select value={lawForm.category} onChange={e=>setLawForm(p=>({...p,category:e.target.value}))} style={inputSt}>
              {['vergi','güvenlik','ekonomi','eğitim','sağlık','çevre','sosyal','diğer'].map(v=><option key={v} value={v} style={{background:'#0B1527'}}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </div>
          <Btn variant='primary' size='full' onClick={proposeLaw}>⚖️ Yasayı Öner</Btn>
        </Modal>
      )}

      {cabinetModal&&(
        <Modal title="👔 Bakanlık Ata" onClose={()=>{setCabinetModal(false);setCabinetRole('');setCabinetTarget('');}}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Bakanlık</div>
            <select value={cabinetRole} onChange={e=>setCabinetRole(e.target.value)} style={inputSt}>
              <option value="" style={{background:'#0B1527'}}>-- Seçin --</option>
              {CABINET_ROLES.map(r=><option key={r} value={r} style={{background:'#0B1527'}}>{r}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Kullanıcı Adı</div>
            <input value={cabinetTarget} onChange={e=>setCabinetTarget(e.target.value)} placeholder="Atanacak kullanıcı adı" style={inputSt} />
          </div>
          <Btn variant='primary' size='full' onClick={appointCabinet}>👔 Ata</Btn>
        </Modal>
      )}

      {transferModal&&(
        <Modal title="🔄 Liderliği Devret" onClose={()=>{setTransferModal(false);setTransferTarget('');}}>
          <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#F59E0B',marginBottom:'1rem'}}>
            ⚠️ Liderliği devrettikten sonra artık lider yetkilerine sahip olmayacaksın.
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Yeni Liderin Kullanıcı Adı</div>
            <input value={transferTarget} onChange={e=>setTransferTarget(e.target.value)} placeholder="Parti üyesinin kullanıcı adı" style={inputSt} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>{setTransferModal(false);setTransferTarget('');}}>İptal</Btn>
            <Btn variant='gold' size='md' onClick={transferLeadership}>🔄 Devret</Btn>
          </div>
        </Modal>
      )}

      {disbandConfirm&&(
        <Modal title="🗑️ Partiyi Feshet" onClose={()=>setDisbandConfirm(false)}>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#FCA5A5',marginBottom:'1rem'}}>
            ⚠️ Bu işlem geri alınamaz! <strong>{myParty?.name}</strong> partisi kalıcı olarak silinecek ve tüm üyeler partisiz kalacak.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>setDisbandConfirm(false)}>İptal</Btn>
            <Btn variant='red' size='md' onClick={disbandParty}>🗑️ Feshet</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BÖLGE SİSTEMİ (81 İL)
// ═══════════════════════════════════════════════════════
function TerritorySystem({ profile, setProfile, showNotif, myGang, gangs, setGangs, isGangLeader }) {
  const { dark } = useTheme();
  const [territories, setTerritories] = useLs('gangTerritories', {});
  const [warCooldowns, setWarCooldowns] = useLs('territoryWarCooldowns', {});
  const [attackModal, setAttackModal] = useState(null);
  const [tick, setTick] = useState(0);
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => { setTick(p=>p+1); setNowTs(Date.now()); }, 1000); return () => clearInterval(t); }, []);

  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const uid = profile?.uid || profile?.id;

  const captureProv = (city) => {
    if (!myGang) { showNotif('Çeteye katıl!', 'error'); return; }
    if (!isGangLeader) { showNotif('Sadece lider bölge alabilir!', 'error'); return; }
    const warKey = `war_${city}`;
    const now = Date.now();
    const noWarUntil = warCooldowns[warKey] || 0;
    if (now < noWarUntil) {
      const rem = Math.ceil((noWarUntil - now) / 3600000);
      showNotif(`⏳ Bu il için ${rem} saat sonra savaş açılabilir!`, 'error');
      return;
    }
    const current = territories[city];
    const cost = 150000;
    if ((profile?.money || 0) < cost) { showNotif(`Bölge almak için ₱${fmtWord(cost)} gerekli!`, 'error'); return; }
    const weapons = myGang?.weapons || 0;
    const myPower = (myGang?.power || 10) + (weapons * 5);
    if (current && current.gangId !== myGang.id) {
      const enemyGang = gangs.find(g => g.id === current.gangId);
      const enemyPower = (enemyGang?.power || 5) + ((enemyGang?.weapons || 0) * 5);
      const winChance = myPower / (myPower + enemyPower);
      const won = Math.random() < winChance;
      if (won) {
        const newTerritories = { ...territories, [city]: { gangId: myGang.id, gangName: myGang.name, capturedAt: now } };
        setTerritories(newTerritories);
        setGangs(prev => prev.map(g => {
          if (g.id === myGang.id) return { ...g, territory: (g.territory || 0) + 1, power: (g.power || 10) + 2 };
          if (g.id === current.gangId) {
            const newKey = `war_${city}_lost_${g.id}`;
            const newCds = { ...warCooldowns, [warKey]: now + 24*60*60*1000, [newKey]: now + 14*24*60*60*1000 };
            setWarCooldowns(newCds);
            return { ...g, territory: Math.max(0, (g.territory || 0) - 1) };
          }
          return g;
        }));
        setProfile(p => { const np={...p, money:(p.money||0)-cost, xp:(p.xp||0)+500}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
        showNotif(`🏆 ${city} fethedildi! +500 XP`, 'success');
        const evts = JSON.parse(localStorage.getItem('rep_gameEvents')||'[]');
        const myTerCount = Object.values(newTerritories).filter(t=>t.gangId===myGang.id).length;
        if (myTerCount >= 10) {
          evts.push({ id: genId(), type: 'security_crisis', title: '🚨 Güvenlik Krizi!', desc: `${myGang.name} çetesi ${myTerCount} ili kontrol ediyor. İçişleri Bakanlığı acil toplantı çağrısı yaptı!`, ts: now });
          localStorage.setItem('rep_gameEvents', JSON.stringify(evts.slice(-50)));
          window.dispatchEvent(new CustomEvent('game-event', { detail: evts[evts.length-1] }));
        }
      } else {
        setWarCooldowns(prev => ({ ...prev, [warKey]: now + 2*60*60*1000 }));
        setProfile(p => { const np={...p, money:(p.money||0)-cost, xp:(p.xp||0)+50}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
        showNotif(`❌ ${city} savunuldu! Para harcandı.`, 'error');
      }
    } else if (!current) {
      setTerritories(prev => ({ ...prev, [city]: { gangId: myGang.id, gangName: myGang.name, capturedAt: now } }));
      setGangs(prev => prev.map(g => g.id === myGang.id ? { ...g, territory: (g.territory || 0) + 1 } : g));
      setWarCooldowns(prev => ({ ...prev, [warKey]: now + 24*60*60*1000 }));
      setProfile(p => { const np={...p, money:(p.money||0)-cost, xp:(p.xp||0)+200}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`🗺️ ${city} alındı! +200 XP`, 'success');
    } else {
      showNotif('Bu bölge zaten sizin!', 'info');
    }
    setAttackModal(null);
  };

  const myTerritories = Object.entries(territories).filter(([,t]) => t.gangId === myGang?.id);
  const totalIncome = myTerritories.length * 5000;

  return (
    <div style={{padding:'0.7rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.65rem',color:'#EF4444',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>🗺️ BÖLGE KONTROLÜ</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.4rem'}}>
          {[['🗺️','Kontrol',myTerritories.length+' il'],['💰','Gelir',fmtWord(totalIncome)+'/saat'],['⚡','Güç',(myGang?.power||0)+((myGang?.weapons||0)*5)]].map(([ic,lb,v])=>(
            <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
              <div style={{fontSize:'0.85rem'}}>{ic}</div>
              <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.78rem'}}>{v}</div>
              <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
            </div>
          ))}
        </div>
        {!myGang && <div style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'#F87171',textAlign:'center'}}>Bölge almak için bir çeteye katıl!</div>}
        <div style={{marginTop:'0.5rem',fontSize:'0.65rem',color:'#5A7089'}}>💡 Bölge almak: ₱150.000 • Ele geçirme sonrası 1 gün savaş yok • Kaybedince 2 hafta savaş yok</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.45rem'}}>
        {CITIES.map(city => {
          const ter = territories[city];
          const isOurs = ter?.gangId === myGang?.id;
          const warKey = `war_${city}`;
          const noWarUntil = warCooldowns[warKey] || 0;
          const warRem = noWarUntil - nowTs;
          const warBlocked = warRem > 0;
          const ownerGang = ter ? gangs.find(g=>g.id===ter.gangId) : null;
          const warRemStr = (() => {
            if (!warBlocked) return '';
            const h = Math.floor(warRem / 3600000);
            const m = Math.floor((warRem % 3600000) / 60000);
            const s2 = Math.floor((warRem % 60000) / 1000);
            return h > 0 ? `${h}s ${m}dk` : m > 0 ? `${m}dk ${s2}sn` : `${s2}sn`;
          })();
          return (
            <div key={city} style={{background:isOurs?'rgba(16,185,129,0.08)':ter?'rgba(239,68,68,0.06)':card,border:`1px solid ${isOurs?'rgba(16,185,129,0.35)':ter?'rgba(239,68,68,0.2)':border}`,borderRadius:'10px',padding:'0.55rem 0.65rem',cursor:'pointer'}}
              onClick={()=>myGang&&isGangLeader&&!isOurs&&!warBlocked?setAttackModal(city):null}>
              <div style={{fontSize:'0.75rem',fontWeight:800,color:isOurs?'#10B981':ter?'#F87171':'#E8EDF2',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{city}</div>
              <div style={{fontSize:'0.6rem',color:'#5A7089',marginTop:'1px'}}>
                {isOurs?'✅ Bizim':ter?`⚔️ ${ter.gangName||'?'}`:warBlocked?'🕊️ Barış':'Boş'}
              </div>
              {warBlocked&&!isOurs&&<div style={{fontSize:'0.55rem',color:'#F59E0B',marginTop:'1px'}}>🛡️ {warRemStr} sonra açılır</div>}
            </div>
          );
        })}
      </div>

      {attackModal && (
        <Modal title={`⚔️ ${attackModal} Fethi`} onClose={()=>setAttackModal(null)}>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.75rem',marginBottom:'1rem',fontSize:'0.82rem',color:'#FCA5A5',lineHeight:1.6}}>
            <div style={{fontWeight:800,marginBottom:'0.3rem'}}>🗺️ {attackModal}</div>
            {territories[attackModal] ? (
              <div>⚔️ Mevcut sahip: <strong>{territories[attackModal].gangName}</strong><br/>Güç hesabına göre savaş sonucu belirlenir.</div>
            ) : (
              <div>Boş bölge! Hemen sahiplen.</div>
            )}
            <div style={{marginTop:'0.5rem',color:'#F59E0B'}}>💰 Maliyet: ₱150.000<br/>🔫 Silah bonusu: +{(myGang?.weapons||0)*5} güç</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>setAttackModal(null)}>İptal</Btn>
            <Btn variant='danger' size='md' onClick={()=>captureProv(attackModal)}>⚔️ Saldır</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SİLAH SİSTEMİ (Sadece Çeteler)
// ═══════════════════════════════════════════════════════
function WeaponSystem({ profile, setProfile, showNotif, myGang, gangs, setGangs, isGangLeader }) {
  const { dark } = useTheme();
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [buyQty, setBuyQty] = useState(1);

  const WEAPON_COST = 150000;
  const myWeapons = myGang?.weapons || 0;
  const gangPowerBonus = myWeapons * 5;

  const buyWeapons = () => {
    if (!myGang) { showNotif('Silah almak için çeteye katıl!', 'error'); return; }
    if (!isGangLeader) { showNotif('Silah sadece lider tarafından alınabilir!', 'error'); return; }
    const qty = Math.max(1, parseInt(buyQty) || 1);
    const total = qty * WEAPON_COST;
    if ((profile?.money || 0) < total) { showNotif(`Yetersiz para! Gerekli: ₱${fmtWord(total)}`, 'error'); return; }
    setGangs(prev => prev.map(g => g.id === myGang.id ? { ...g, weapons: (g.weapons || 0) + qty } : g));
    setProfile(p => { const np={...p, money:(p.money||0)-total, xp:(p.xp||0)+qty*50}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`🔫 ${qty} silah satın alındı! +${qty*50} XP`, 'success');
  };

  const sellWeapons = (qty) => {
    if (!isGangLeader) { showNotif('Silah satışı sadece lider yapabilir!', 'error'); return; }
    if (myWeapons < qty) { showNotif('Yeterli silah yok!', 'error'); return; }
    const gain = Math.floor(qty * WEAPON_COST * 0.7);
    setGangs(prev => prev.map(g => g.id === myGang.id ? { ...g, weapons: (g.weapons || 0) - qty } : g));
    setProfile(p => { const np={...p, money:(p.money||0)+gain}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`💰 ${qty} silah satıldı. +₱${fmtWord(gain)}`, 'success');
  };

  return (
    <div style={{padding:'0.7rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.65rem',color:'#EF4444',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.5rem'}}>🔫 SİLAH DEPOSU</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.4rem',marginBottom:'0.65rem'}}>
          {[['🔫','Silah',myWeapons],['⚡','Güç Bonusu',`+${gangPowerBonus}`],['💰','Birim Fiyat',fmtWord(WEAPON_COST)]].map(([ic,lb,v])=>(
            <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
              <div style={{fontSize:'0.85rem'}}>{ic}</div>
              <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.78rem'}}>{v}</div>
              <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:'0.68rem',color:'#5A7089',lineHeight:1.5}}>
          🔫 Her silah: <strong style={{color:'#FCA5A5'}}>₱150.000</strong> • Satarken %70 geri alırsın<br/>
          ⚡ Silah başına +5 güç (sınırsız) • Sadece çete liderleri satın alabilir
        </div>
      </div>

      {!myGang ? (
        <div style={{textAlign:'center',padding:'2rem',color:'#5A7089',fontSize:'0.85rem'}}>Silah almak için bir çeteye katıl!</div>
      ) : (
        <>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:'14px',padding:'1rem',marginBottom:'0.65rem'}}>
            <div style={{fontSize:'0.8rem',fontWeight:800,color:'#E8EDF2',marginBottom:'0.75rem'}}>🛒 Silah Satın Al</div>
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.65rem'}}>
              <div style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',display:'flex',alignItems:'center'}}>
                <button onClick={()=>setBuyQty(q=>Math.max(1,q-1))} style={{background:'none',border:'none',color:'#E8EDF2',padding:'0.5rem 0.75rem',cursor:'pointer',fontSize:'1rem'}}>-</button>
                <span style={{flex:1,textAlign:'center',color:'#E8EDF2',fontWeight:800,fontSize:'1rem'}}>{buyQty}</span>
                <button onClick={()=>setBuyQty(q=>q+1)} style={{background:'none',border:'none',color:'#E8EDF2',padding:'0.5rem 0.75rem',cursor:'pointer',fontSize:'1rem'}}>+</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:'2px'}}>
                <div style={{fontSize:'0.7rem',color:'#5A7089'}}>Toplam</div>
                <div style={{fontSize:'0.9rem',fontWeight:800,color:'#EF4444'}}>₱{fmtWord(buyQty*WEAPON_COST)}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.5rem',flexWrap:'wrap'}}>
              {[1,5,10,25].map(n=><button key={n} onClick={()=>setBuyQty(n)} style={{padding:'0.3rem 0.65rem',borderRadius:'8px',border:`1px solid ${buyQty===n?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.1)'}`,background:buyQty===n?'rgba(239,68,68,0.12)':'rgba(255,255,255,0.04)',color:buyQty===n?'#F87171':'#8BA0B5',fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>{n} adet</button>)}
            </div>
            <Btn variant='danger' size='full' onClick={buyWeapons} disabled={!isGangLeader}>{isGangLeader?`🔫 ${buyQty} Silah Al`:'Sadece lider alabilir'}</Btn>
          </div>

          {myWeapons > 0 && (
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:'14px',padding:'1rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:800,color:'#E8EDF2',marginBottom:'0.75rem'}}>💰 Silah Sat (%70 fiyat)</div>
              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                {[1,5,10].filter(n=>n<=myWeapons).map(n=>(
                  <button key={n} onClick={()=>sellWeapons(n)} disabled={!isGangLeader}
                    style={{flex:1,padding:'0.5rem',borderRadius:'10px',border:'1px solid rgba(245,158,11,0.25)',background:'rgba(245,158,11,0.08)',color:'#F59E0B',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                    {n} sat (+₱{fmtWord(n*WEAPON_COST*0.7)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// YETKİLERİM SAYFASI
// ═══════════════════════════════════════════════════════
function YetkilerimPage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [cabinet] = useLs('cabinet', {});
  const [elections] = useLs('elections', { phase:'idle', candidates:[], votes:{} });
  const [taxRates, setTaxRates] = useLs('taxRates', { income:15, trade:10, property:5, interest:5 });
  const [treasury, setTreasury] = useLs('rep_treasury', { balance:0, lastUpdated:0 });
  const [printAmt, setPrintAmt] = useState('');
  const [taxForm, setTaxForm] = useState({ income: taxRates.income||15, trade:taxRates.trade||10, property:taxRates.property||5, interest:taxRates.interest||5 });
  useEffect(() => {
    setTaxForm({ income: taxRates.income||15, trade:taxRates.trade||10, property:taxRates.property||5, interest:taxRates.interest||5 });
  }, [taxRates.income, taxRates.trade, taxRates.property, taxRates.interest]);
  const [actionCooldowns, setActionCooldowns] = useLs('yetkiCooldowns', {});
  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetAmt, setBudgetAmt] = useState('');

  const myPositions = Object.entries(cabinet).filter(([,name]) => name === profile?.username).map(([role]) => role);
  const isPresident = cabinet['Devlet Başkanı'] === profile?.username;
  const isSpeaker = cabinet['Meclis Başkanı'] === profile?.username;
  const isInterior = cabinet['İçişleri Bakanı'] === profile?.username;
  const isMayor = cabinet['Belediye Başkanı'] === profile?.username;
  const isGovenor = cabinet['Vali'] === profile?.username;
  const isGeneral = cabinet['Genelkurmay Başkanı'] === profile?.username;
  const isTrade = cabinet['Ticaret Bakanı'] === profile?.username;
  const isFinance = cabinet['Maliye Bakanı'] === profile?.username;
  const isMayorOrGov = isMayor || isGovenor;

  const yetkiAction = (key, cdMs, fn) => {
    const last = actionCooldowns[key] || 0;
    const rem = cdMs - (Date.now() - last);
    if (rem > 0) { showNotif(`⏳ ${Math.ceil(rem/3600000)} saat sonra tekrar`, 'error'); return; }
    fn();
    setActionCooldowns(prev => ({ ...prev, [key]: Date.now() }));
  };

  const printMoney = () => {
    if (!isFinance) { showNotif('Bu yetki Maliye Bakanına ait!', 'error'); return; }
    const amt = parseInt(printAmt);
    if (!amt || amt <= 0) { showNotif('Geçerli tutar girin', 'error'); return; }
    yetkiAction('printMoney', 24*3600000, () => {
      setTreasury(prev => ({ ...prev, balance: (prev.balance||0)+amt, lastUpdated: Date.now() }));
      // Basılan para miktarını kaydet (enflasyon hesabı için)
      try {
        const pm = JSON.parse(localStorage.getItem('rep_printedMoney')||'{"total":0,"history":[]}');
        pm.total = (pm.total||0) + amt;
        pm.history = [...(pm.history||[]), {amt, ts:Date.now(), by:profile.username}].slice(-20);
        localStorage.setItem('rep_printedMoney', JSON.stringify(pm));
        window.dispatchEvent(new CustomEvent('fb-sync', {detail:{key:'printedMoney',value:pm}}));
      } catch(e){}
      setPrintAmt('');
      // Enflasyon hesabı
      const _pm = JSON.parse(localStorage.getItem('rep_printedMoney')||'{"total":0}');
      const basimOrani = (_pm.total||0) / 100000000;
      const gdpEtkisi = Math.min(50, Math.floor(basimOrani * 15));
      const newInflation = Math.min(99, (JSON.parse(localStorage.getItem('rep_economy')||'{"inflation":5}').inflation || 5) + gdpEtkisi);
      const yuksekEnflasyon = newInflation >= 50;
      const kritikEnflasyon = newInflation >= 80;
      let ekonMsg = kritikEnflasyon
        ? '🆘 HİPERENFLASYON! Merkez Bankası acil tedbir almalı.'
        : yuksekEnflasyon
          ? '⚠️ Yüksek enflasyon! Faiz artışı ve sıkılaşma gerekebilir.'
          : `📊 Para arzı genişledi. TÜFE baskısı oluşabilir.`;
      showNotif(`💸 ${fmtWord(amt)} basıldı! Enflasyon: %${newInflation.toFixed(1)} — ${ekonMsg}`, kritikEnflasyon?'error':'success');
      const evts = JSON.parse(localStorage.getItem('rep_gameEvents')||'[]');
      evts.push({ id: genId(), type: 'money_printed', title: '💸 Para Arzı Genişletildi', desc: `Maliye Bakanı ${profile.username} merkez bankası kanalıyla ${fmtWord(amt)} bastı. Dolaşımdaki para arttı, TÜFE: %${newInflation.toFixed(1)}. ${kritikEnflasyon?'Hiperenflasyon tehlikesi!':yuksekEnflasyon?'Faiz kararı bekleniyor.':''}`, ts: Date.now() });
      localStorage.setItem('rep_gameEvents', JSON.stringify(evts.slice(-50)));
    });
  };

  const saveTaxRates = () => {
    if (!isFinance) { showNotif('Bu yetki Maliye Bakanına ait!', 'error'); return; }
    const income = Math.max(0, Math.min(50, parseInt(taxForm.income)||15));
    const trade = Math.max(0, Math.min(30, parseInt(taxForm.trade)||10));
    const property = Math.max(0, Math.min(25, parseInt(taxForm.property)||5));
    const interest = Math.max(0, Math.min(20, parseInt(taxForm.interest)||5));
    setTaxRates({ income, trade, property, interest });
    showNotif('✅ Vergi oranları güncellendi!', 'success');
  };

  const fundMilitary = () => {
    if (!isPresident) { showNotif('Bu yetki Devlet Başkanına ait!', 'error'); return; }
    const amt = parseInt(budgetAmt);
    if (!amt || amt <= 0) { showNotif('Geçerli tutar girin', 'error'); return; }
    if ((profile?.money||0) < amt) { showNotif('Yetersiz para!', 'error'); return; }
    yetkiAction('fundMilitary', 6*3600000, () => {
      setProfile(p => { const np={...p, money:(p.money||0)-amt}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      setTreasury(prev => ({ ...prev, militaryBudget: (prev.militaryBudget||0)+amt, lastUpdated: Date.now() }));
      setBudgetModal(false); setBudgetAmt('');
      showNotif(`⚔️ ₱${fmtWord(amt)} askeri bütçeye aktarıldı!`, 'success');
    });
  };

  // Gerginlik hesaplama (YetkilerimPage içi)
  const calcCurrentTension = () => {
    const _gangs = JSON.parse(localStorage.getItem('gangs')||'[]');
    const _taxRates = JSON.parse(localStorage.getItem('taxRates')||'{}');
    const _territory = JSON.parse(localStorage.getItem('gangTerritories')||'{}');
    const _wars = JSON.parse(localStorage.getItem('activeWars')||'[]');
    const gangCount = _gangs.length;
    const incomeTax = _taxRates.income || 15;
    const controlledRegions = Object.values(_territory).filter(v=>v).length;
    const activeWarCount = _wars.filter(w=>w.status==='active').length;
    return Math.min(100, Math.round(gangCount * 5 + controlledRegions * 8 + Math.max(0, incomeTax-15)*1.2 + activeWarCount*10));
  };
  const currentTension = calcCurrentTension();
  const coupEnabled = currentTension >= 75;

  const POSITION_POWERS = {
    'Devlet Başkanı': {
      icon: '👑', color: '#F59E0B',
      powers: [
        { key:'national_announce', label:'📢 Ulusal Duyuru', desc:'Tüm oyunculara acil duyuru yayınla (+500 XP)', cd:4*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+500};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); const evts=JSON.parse(localStorage.getItem('rep_gameEvents')||'[]'); evts.push({id:genId(),type:'announce',title:'📢 Cumhurbaşkanı Duyurusu',desc:`Devlet Başkanı ${profile.username} ulusal duyuru yayınladı!`,ts:Date.now()}); localStorage.setItem('rep_gameEvents',JSON.stringify(evts.slice(-50))); showNotif('📢 Ulusal duyuru yayınlandı! +500 XP','success'); }},
        { key:'appoint_gov', label:'🏛️ Vali/Bakan Ata', desc:'Şehir ve bakanlıklara yönetici ata', cd:8*3600000, action:()=>{ showNotif('🏛️ Atama yetkisi aktif. Kabine panelinden atama yapın.','info'); }},
        { key:'fund_military', label:'💰 Askeri Fon Ayır', desc:'Hazineden askeri bütçeye transfer', cd:0, action:()=>setBudgetModal(true) },
        { key:'ohal', label:'🚨 OHAL İlan Et', desc:'Olağanüstü hal — ordu yetkilerini genişletir (+1000 XP)', cd:72*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+1000};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); const evts=JSON.parse(localStorage.getItem('rep_gameEvents')||'[]'); evts.push({id:genId(),type:'ohal',title:'🚨 OHAL İlan Edildi!',desc:`Devlet Başkanı ${profile.username} Olağanüstü Hal ilan etti!`,ts:Date.now()}); localStorage.setItem('rep_gameEvents',JSON.stringify(evts.slice(-50))); showNotif('🚨 OHAL ilan edildi! Tüm oyuncular bilgilendirildi.','success'); }},
        { key:'tax_amnesty', label:'💳 Vergi Affı', desc:'Vergi borçlarını sıfırla, destek kazan (+600 XP)', cd:48*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+600};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('💳 Vergi affı yayınlandı! Halk memnuniyeti arttı. +600 XP','success'); }},
        { key:'press_conf', label:'🎙️ Basın Toplantısı', desc:'Uluslararası arenada prestij kazan (+400 XP)', cd:12*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+400};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🎙️ Basın toplantısı yapıldı! +400 XP','success'); }},
      ]
    },
    'Meclis Başkanı': {
      icon: '🏛️', color: '#8B5CF6',
      powers: [
        { key:'open_session', label:'🗳️ Meclis Oturumu Aç', desc:'Yasa oylaması başlat — 81 milletvekili oy kullanır (+300 XP)', cd:3*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+300};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); const evts=JSON.parse(localStorage.getItem('rep_gameEvents')||'[]'); evts.push({id:genId(),type:'session',title:'🏛️ Meclis Oturumu Açıldı',desc:`Meclis Başkanı ${profile.username} yasa oylaması başlattı!`,ts:Date.now()}); localStorage.setItem('rep_gameEvents',JSON.stringify(evts.slice(-50))); showNotif('🏛️ Meclis oturumu açıldı! +300 XP','success'); }},
        { key:'speaker_veto', label:'🚫 Yasa Veto Et', desc:'Onaylanmış kanunu iptal et', cd:12*3600000, action:()=>{ showNotif('🚫 Veto yetkisi kullanıldı! Yasa iptal edildi.','success'); }},
        { key:'confidence_vote', label:'📋 Güven Oyu', desc:'Hükümete güven oylaması yap (+500 XP)', cd:24*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+500};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('📋 Güven oyu oylaması başlatıldı! +500 XP','success'); }},
        { key:'emergency_session', label:'🔔 Acil Oturum', desc:'Kriz durumunda acil meclis topla (+400 XP)', cd:18*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+400};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🔔 Acil oturum çağrısı yapıldı! +400 XP','success'); }},
      ]
    },
    'İçişleri Bakanı': {
      icon: '🚔', color: '#EF4444',
      powers: [
        { key:'police_op', label:'🚔 Polis Operasyonu', desc:'Toplu güvenlik operasyonu (+200 XP)', cd:2*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+200};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🚔 Polis operasyonu başlatıldı! +200 XP','success'); }},
        { key:'gang_raid', label:'⚠️ Çete Baskını', desc:'Çete yuvalarına baskın — bölge geri al (+350 XP)', cd:6*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+350};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('⚠️ Çete baskını başarılı! +350 XP','success'); }},
        { key:'border_control', label:'🛂 Sınır Kontrolü', desc:'Yasadışı geçişleri durdur (+250 XP)', cd:10*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+250};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🛂 Sınır kontrolü güçlendirildi! +250 XP','success'); }},
        { key:'city_lockdown', label:'🔒 Şehir Kilidi', desc:'Suç oranı yüksek şehre sokağa çıkma yasağı (+500 XP)', cd:24*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+500};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🔒 Sokağa çıkma yasağı ilan edildi! +500 XP','success'); }},
        { key:'intel_share', label:'🔭 İstihbarat Paylaş', desc:'Güvenlik birimlerine bilgi aktar (+300 XP)', cd:8*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+300};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🔭 İstihbarat paylaşıldı! +300 XP','success'); }},
      ]
    },
    'Belediye Başkanı': {
      icon: '🏙️', color: '#3B82F6',
      powers: [
        { key:'city_project', label:'🏗️ Şehir Projesi', desc:'Altyapı projesi başlat (+400 XP)', cd:6*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+400};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🏗️ Şehir projesi başlatıldı! +400 XP','success'); }},
        { key:'local_tax', label:'💵 Yerel Vergi Topla', desc:'Şehir kasa geliri (+200K)', cd:12*3600000, action:()=>{ setProfile(p=>{const np={...p,money:(p.money||0)+200000};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('💵 Yerel vergi toplandı! +₱200.000','success'); }},
        { key:'city_fest', label:'🎉 Şehir Festivali', desc:'Halk mutluluğunu artır (+450 XP)', cd:48*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+450};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🎉 Şehir festivali düzenlendi! +450 XP','success'); }},
        { key:'metro_plan', label:'🚇 Ulaşım Planı', desc:'Şehir ulaşım projesi (+600 XP)', cd:72*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+600};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🚇 Ulaşım planı onaylandı! +600 XP','success'); }},
      ]
    },
    'Vali': {
      icon: '🏢', color: '#06B6D4',
      powers: [
        { key:'province_dev', label:'📈 İl Kalkınma', desc:'İl altyapı projesi (+350 XP)', cd:8*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+350};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('📈 İl kalkınma projesi başladı! +350 XP','success'); }},
        { key:'province_tax', label:'💰 İl Vergi Toplaması', desc:'İl vergi geliri (+150K)', cd:8*3600000, action:()=>{ setProfile(p=>{const np={...p,money:(p.money||0)+150000};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('💰 İl vergisi toplandı! +₱150.000','success'); }},
        { key:'province_security', label:'🛡️ İl Güvenliği', desc:'Valiliğe bağlı güvenlik kuvveti konuşlandır (+300 XP)', cd:12*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+300};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🛡️ İl güvenliği artırıldı! +300 XP','success'); }},
        { key:'province_invest', label:'🏭 Yatırım Çek', desc:'İle özel yatırım getir (+500 XP +100K)', cd:24*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+500,money:(p.money||0)+100000};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🏭 Yatırım başarıyla çekildi! +500 XP +₱100.000','success'); }},
      ]
    },
    'Genelkurmay Başkanı': {
      icon: '⚔️', color: '#EF4444',
      powers: [
        { key:'military_op', label:'🪖 Askeri Operasyon', desc:'Ordu sevk et, bölge güvenliğini sağla (+500 XP)', cd:4*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+500};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🪖 Askeri operasyon başlatıldı! +500 XP','success'); }},
        { key:'declare_war', label:'⚔️ Savaş İlan Et', desc:'Resmi savaş başlat — tüm oyuncular katılabilir', cd:24*3600000, action:()=>{ const evts=JSON.parse(localStorage.getItem('rep_gameEvents')||'[]'); evts.push({id:genId(),type:'war_declared',title:'⚔️ Savaş İlan Edildi!',desc:`Genelkurmay Başkanı ${profile.username} savaş ilan etti!`,ts:Date.now()}); localStorage.setItem('rep_gameEvents',JSON.stringify(evts.slice(-50))); showNotif('⚔️ Savaş ilan edildi!','success'); }},
        { key:'mobilize', label:'📣 Seferberlik İlan Et', desc:'Tüm ordu birimlerini hazır konuma al (+700 XP)', cd:36*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+700};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('📣 Seferberlik ilan edildi! +700 XP','success'); }},
        { key:'intel_op', label:'🔭 İstihbarat Operasyonu', desc:'Düşman güçleri hakkında bilgi topla (+400 XP)', cd:12*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+400};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🔭 İstihbarat operasyonu başarılı! +400 XP','success'); }},
        { key:'strategic_reserve', label:'🏦 Stratejik Rezerv', desc:'Askeri rezervleri aktive et (+300 XP +50K)', cd:18*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+300,money:(p.money||0)+50000};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🏦 Stratejik rezervler aktive edildi! +300 XP +₱50.000','success'); }},
      ]
    },
    'Ticaret Bakanı': {
      icon: '📦', color: '#10B981',
      powers: [
        { key:'trade_deal', label:'🤝 Ticaret Anlaşması', desc:'Ekonomiyi büyüt (+250K +200 XP)', cd:5*3600000, action:()=>{ setProfile(p=>{const np={...p,money:(p.money||0)+250000,xp:(p.xp||0)+200};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🤝 Ticaret anlaşması! +₱250.000 +200 XP','success'); }},
        { key:'monopoly_check', label:'🔍 Tekel Soruşturması', desc:'Şirket tekelini soruştur (+400 XP)', cd:12*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+400};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🔍 Tekel soruşturması başlatıldı! +400 XP','success'); }},
        { key:'export_drive', label:'🚢 İhracat Kampanyası', desc:'Ülke ihracatını artır (+500K)', cd:24*3600000, action:()=>{ setProfile(p=>{const np={...p,money:(p.money||0)+500000,xp:(p.xp||0)+300};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('🚢 İhracat kampanyası başarılı! +₱500.000 +300 XP','success'); }},
        { key:'market_reg', label:'📜 Piyasa Düzenleme', desc:'Fiyat denetimi uygula (+350 XP)', cd:16*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+350};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('📜 Piyasa düzenlemesi uygulandı! +350 XP','success'); }},
      ]
    },
    'Maliye Bakanı': {
      icon: '💸', color: '#F59E0B',
      powers: [
        { key:'print_money_btn', label:'🖨️ Para Bas', desc:'Hazineye para ekle (günde bir kez max 10M)', cd:0, action:()=>{} },
        { key:'set_tax', label:'📊 Vergi Oranı Ayarla', desc:'Gelir/Ticaret/Mülk/Faiz vergilerini düzenle', cd:0, action:()=>{} },
        { key:'budget_review', label:'📋 Bütçe Analizi', desc:'Devlet gelir-gider raporu (+300 XP)', cd:6*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+300};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('📋 Bütçe analizi tamamlandı! +300 XP','success'); }},
        { key:'bonds', label:'📄 Devlet Tahvili', desc:'Hazine bonosu çıkar, bütçe dengesi kur (+500 XP)', cd:48*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+500};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); setTreasury(prev=>({...prev,balance:(prev.balance||0)+5000000,lastUpdated:Date.now()})); showNotif('📄 Devlet tahvili çıkarıldı! +₱5.000.000 hazineye, +500 XP','success'); }},
        { key:'inflation_ctrl', label:'📉 Enflasyon Kontrolü', desc:'Merkez bankası faiz kararı al (+400 XP)', cd:24*3600000, action:()=>{ setProfile(p=>{const np={...p,xp:(p.xp||0)+400};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('📉 Faiz oranı güncellendi! +400 XP','success'); }},
      ]
    },
  };

  if (myPositions.length === 0) {
    return (
      <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
        <div style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'14px',padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🏛️</div>
          <div style={{fontWeight:800,color:'#A78BFA',fontSize:'1rem',marginBottom:'0.5rem'}}>Henüz Makamın Yok</div>
          <div style={{color:'#5A7089',fontSize:'0.82rem',lineHeight:1.6}}>
            Seçimlere katılarak veya Devlet Başkanı tarafından atanarak devlet makamı alabilirsin.<br/>
            Seçim sayfasına giderek aday ol!
          </div>
        </div>
        <div style={{marginTop:'1rem',background:card,border:`1px solid ${border}`,borderRadius:'14px',padding:'1rem'}}>
          <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>📋 Tüm Makamlar</div>
          {Object.entries(POSITION_POWERS).map(([pos, def]) => (
            <div key={pos} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.45rem 0',borderBottom:`1px solid ${border}`}}>
              <span style={{fontSize:'1.25rem'}}>{def.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.82rem'}}>{pos}</div>
                <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{def.powers.length} yetki</div>
              </div>
              <div style={{fontSize:'0.65rem',color:cabinet[pos]?'#10B981':'#3B4E63'}}>{cabinet[pos]||'Boş'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{background:'linear-gradient(135deg,rgba(245,200,66,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(245,200,66,0.25)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#F5C842',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>⭐ SENİN MAKAMLARLIN</div>
        <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
          {myPositions.map(pos => (
            <span key={pos} style={{background:'rgba(245,200,66,0.12)',border:'1px solid rgba(245,200,66,0.3)',borderRadius:'8px',padding:'3px 10px',fontSize:'0.72rem',color:'#F5C842',fontWeight:700}}>{pos}</span>
          ))}
        </div>
      </div>

      {myPositions.map(pos => {
        const def = POSITION_POWERS[pos];
        if (!def) return null;
        return (
          <div key={pos} style={{background:card,border:`1px solid ${border}`,borderRadius:'14px',padding:'1rem',marginBottom:'0.65rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.75rem'}}>
              <span style={{fontSize:'1.75rem'}}>{def.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,color:def.color,fontSize:'0.92rem'}}>{pos}</div>
                <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{def.powers.length} özel yetki</div>
              </div>
              {pos === 'Genelkurmay Başkanı' && (
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.6rem',color:'#5A7089',marginBottom:'2px'}}>Ülke Gerginliği</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.9rem',fontWeight:900,color:currentTension>=75?'#EF4444':currentTension>=50?'#F59E0B':'#10B981'}}>%{currentTension}</div>
                </div>
              )}
            </div>

            {/* Genelkurmay için Gerginlik Göstergesi + Darbe Butonu */}
            {pos === 'Genelkurmay Başkanı' && (
              <div style={{marginBottom:'0.75rem'}}>
                <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'0.75rem',marginBottom:'0.5rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.35rem'}}>
                    <div style={{fontSize:'0.72rem',color:'#5A7089',fontWeight:700}}>🌡️ Ülke Gerginlik Barometresi</div>
                    <span style={{fontSize:'0.62rem',fontWeight:800,color:currentTension>=75?'#EF4444':currentTension>=50?'#F59E0B':'#10B981',background:currentTension>=75?'rgba(239,68,68,0.12)':currentTension>=50?'rgba(245,158,11,0.12)':'rgba(16,185,129,0.12)',borderRadius:'5px',padding:'1px 7px'}}>
                      {currentTension>=75?'KRİTİK ⚠️':currentTension>=50?'YÜKSEK':'NORMAL'}
                    </span>
                  </div>
                  <div style={{height:'8px',background:'rgba(255,255,255,0.06)',borderRadius:'100px',overflow:'hidden',marginBottom:'0.3rem'}}>
                    <div style={{height:'100%',width:`${currentTension}%`,background:`linear-gradient(90deg,#10B981 0%,${currentTension>=50?'#F59E0B':'#10B981'} 50%,${currentTension>=75?'#EF4444':'transparent'} 100%)`,borderRadius:'100px',transition:'width 0.6s'}} />
                  </div>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',fontSize:'0.6rem',color:'#3B4E63'}}>
                    <span>Çete sayısı etkisi</span>
                    <span>•</span>
                    <span>Bölge kontrolü etkisi</span>
                    <span>•</span>
                    <span>Vergi oranı etkisi</span>
                  </div>
                </div>
                {/* Darbe Butonu */}
                <div style={{position:'relative'}}>
                  <button
                    onClick={() => {
                      if (!coupEnabled) { showNotif('❌ Darbe için ülke gerginliğinin %75\'e ulaşması gerekiyor!','error'); return; }
                      const cdKey = 'coup_attempt';
                      const last = actionCooldowns[cdKey] || 0;
                      const rem = 72*3600000 - (Date.now()-last);
                      if (rem > 0) { showNotif(`⏳ Darbe girişimi bekleme süresi: ${Math.ceil(rem/3600000)} saat`,'error'); return; }
                      setActionCooldowns(prev=>({...prev,[cdKey]:Date.now()}));
                      setProfile(p=>{const np={...p,xp:(p.xp||0)+5000,meritPoints:(p.meritPoints||0)+100};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});
                      const evts=JSON.parse(localStorage.getItem('rep_gameEvents')||'[]');
                      evts.push({id:genId(),type:'coup_attempt',title:'🎖️ DARBE GİRİŞİMİ!',desc:`Genelkurmay Başkanı ${profile.username} hükümete karşı darbe girişiminde bulundu! Gerginlik: %${currentTension}`,ts:Date.now()});
                      localStorage.setItem('rep_gameEvents',JSON.stringify(evts.slice(-50)));
                      window.dispatchEvent(new CustomEvent('game-event',{detail:evts[evts.length-1]}));
                      showNotif('🎖️ DARBE GİRİŞİMİ BAŞLADI! +5000 XP +100 Liyakat','success');
                    }}
                    style={{
                      width:'100%',padding:'0.75rem',
                      background:coupEnabled?'linear-gradient(135deg,#7C0000,#DC2626,#7C0000)':'rgba(255,255,255,0.04)',
                      border:`2px solid ${coupEnabled?'#EF4444':'rgba(255,255,255,0.1)'}`,
                      borderRadius:'12px',
                      color:coupEnabled?'#fff':'#3B4E63',
                      cursor:coupEnabled?'pointer':'not-allowed',
                      fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:'0.9rem',
                      letterSpacing:'0.05em',
                      transition:'all 0.3s',
                      opacity:coupEnabled?1:0.5,
                    }}>
                    {coupEnabled ? '🎖️ DARBE BAŞLAT — KRİTİK GERGİNLİK EŞIĞI AŞILDI' : `🔒 DARBE BUTONU — Gerginlik %${currentTension}/75 gerekli`}
                  </button>
                  {coupEnabled && (
                    <div style={{position:'absolute',top:'-6px',right:'8px',background:'#EF4444',borderRadius:'100px',padding:'1px 8px',fontSize:'0.58rem',fontWeight:900,color:'#fff',letterSpacing:'0.05em',animation:'pulse 1s infinite'}}>
                      AKTİF
                    </div>
                  )}
                </div>
              </div>
            )}

            {pos === 'Ticaret Bakanı' && (()=>{
              const pending = JSON.parse(localStorage.getItem('rep_pendingCompanies')||'[]');
              if (!pending.length) return (
                <div style={{marginBottom:'0.75rem',padding:'0.6rem 0.75rem',background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:'10px',fontSize:'0.72rem',color:'#10B981'}}>
                  ✅ Bekleyen şirket kurulum talebi yok.
                </div>
              );
              return (
                <div style={{marginBottom:'0.75rem',padding:'0.75rem',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px'}}>
                  <div style={{fontWeight:700,color:'#10B981',fontSize:'0.78rem',marginBottom:'0.5rem'}}>🏢 Şirket Kurulum Onayları ({pending.length})</div>
                  {pending.map(c=>{
                    const rem = Math.max(0,(c.pendingAt+24*3600000)-Date.now());
                    const h3=Math.floor(rem/3600000); const m3=Math.floor((rem%3600000)/60000);
                    return (
                      <div key={c.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'8px',padding:'0.5rem',marginBottom:'0.35rem',fontSize:'0.72rem'}}>
                        <div style={{fontWeight:700,color:'#E8EDF2'}}>{c.sectorIcon} {c.name}</div>
                        <div style={{color:'#5A7089',marginBottom:'0.3rem'}}>Sahip: {c.ownerName} · Sektör: {c.sectorLabel} · Değer: {fmtWord(c.value)}</div>
                        <div style={{color:'#F59E0B',fontSize:'0.65rem',marginBottom:'0.35rem'}}>⏳ Otomatik onay: {rem>0?`${h3}s ${m3}dk`:'Süre doldu'}</div>
                        <div style={{display:'flex',gap:'0.4rem'}}>
                          <button onClick={()=>{
                            const all=JSON.parse(localStorage.getItem('rep_pendingCompanies')||'[]');
                            const approved=all.filter(x=>x.id!==c.id);
                            localStorage.setItem('rep_pendingCompanies',JSON.stringify(approved));
                            const holdings=JSON.parse(localStorage.getItem('rep_holdings')||'[]');
                            const {pendingAt,tradeMin,...hClean}=c;
                            holdings.push(hClean);
                            localStorage.setItem('rep_holdings',JSON.stringify(holdings));
                            window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'pendingCompanies',value:approved}}));
                            window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'holdings',value:holdings}}));
                            showNotif(`✅ ${c.name} şirketi onaylandı!`,'success');
                          }} style={{flex:1,padding:'0.3rem',borderRadius:'6px',border:'1px solid rgba(16,185,129,0.4)',background:'rgba(16,185,129,0.12)',color:'#10B981',fontWeight:700,cursor:'pointer',fontSize:'0.68rem'}}>✅ Onayla</button>
                          <button onClick={()=>{
                            const all=JSON.parse(localStorage.getItem('rep_pendingCompanies')||'[]');
                            const rejected=all.filter(x=>x.id!==c.id);
                            localStorage.setItem('rep_pendingCompanies',JSON.stringify(rejected));
                            window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'pendingCompanies',value:rejected}}));
                            showNotif(`❌ ${c.name} şirketi reddedildi.`,'error');
                          }} style={{flex:1,padding:'0.3rem',borderRadius:'6px',border:'1px solid rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.08)',color:'#EF4444',fontWeight:700,cursor:'pointer',fontSize:'0.68rem'}}>❌ Reddet</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {pos === 'Maliye Bakanı' && (
              <div style={{marginBottom:'0.75rem',padding:'0.75rem',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px'}}>
                <div style={{fontWeight:700,color:'#F59E0B',marginBottom:'0.5rem',fontSize:'0.78rem'}}>🖨️ Para Basma (Merkez Bankası Yetkisi)</div>
                <div style={{fontSize:'0.65rem',color:'#5A7089',marginBottom:'0.5rem'}}>Aşırı para basımı enflasyonu artırır. Dikkatli kullanın.</div>
                <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
                  <input type="number" value={printAmt} onChange={e=>setPrintAmt(e.target.value)} placeholder="Basılacak tutar (₱)"
                    style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'0.5rem 0.75rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}} />
                  <button onClick={printMoney} style={{padding:'0.5rem 0.85rem',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',fontWeight:800,fontSize:'0.75rem',cursor:'pointer'}}>Bas</button>
                </div>

                {/* Belediye Hazine Talepleri */}
                {(()=>{
                  const reqs = JSON.parse(localStorage.getItem('rep_treasuryRequests')||'[]');
                  const pending = reqs.filter(r=>r.status==='bekliyor');
                  if(!pending.length) return <div style={{fontSize:'0.65rem',color:'#3B4E63',marginBottom:'0.5rem'}}>✅ Bekleyen belediye hazine talebi yok.</div>;
                  return (
                    <div style={{marginBottom:'0.5rem'}}>
                      <div style={{fontWeight:700,color:'#10B981',fontSize:'0.72rem',marginBottom:'0.4rem'}}>🏙️ Belediye Hazine Talepleri ({pending.length})</div>
                      {pending.slice(0,5).map(r=>(
                        <div key={r.id} style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.18)',borderRadius:'8px',padding:'0.5rem',marginBottom:'0.35rem',fontSize:'0.72rem'}}>
                          <div style={{fontWeight:700,color:'#E8EDF2'}}>{r.city} — {r.mayor}</div>
                          <div style={{color:'#5A7089',marginBottom:'0.3rem'}}>Tutar: <span style={{color:'#10B981',fontWeight:700}}>{fmtWord(r.amount)}</span> · {r.reason}</div>
                          <div style={{display:'flex',gap:'0.4rem'}}>
                            <button onClick={()=>{
                              const reqs2=JSON.parse(localStorage.getItem('rep_treasuryRequests')||'[]');
                              const city=r.city; const amt=r.amount;
                              const updated=reqs2.map(x=>x.id===r.id?{...x,status:'onaylandı',approvedBy:profile.username,approvedAt:Date.now()}:x);
                              localStorage.setItem('rep_treasuryRequests',JSON.stringify(updated));
                              const citySlug=city.toLowerCase().replace(/\s/g,'_');
                              const tKey=`cityTreasury_${citySlug}`;
                              const ct=JSON.parse(localStorage.getItem(tKey)||'{"balance":2500000}');
                              ct.balance=(ct.balance||0)+amt;
                              localStorage.setItem(tKey,JSON.stringify(ct));
                              setTreasury(prev=>({...prev,balance:(prev.balance||0)-amt}));
                              showNotif(`✅ ${city} belediyesine ${fmtWord(amt)} gönderildi!`,'success');
                            }} style={{flex:1,padding:'0.3rem',borderRadius:'6px',border:'1px solid rgba(16,185,129,0.4)',background:'rgba(16,185,129,0.12)',color:'#10B981',fontWeight:700,cursor:'pointer',fontSize:'0.68rem'}}>✅ Onayla & Gönder</button>
                            <button onClick={()=>{
                              const reqs2=JSON.parse(localStorage.getItem('rep_treasuryRequests')||'[]');
                              const updated=reqs2.map(x=>x.id===r.id?{...x,status:'reddedildi',rejectedBy:profile.username}:x);
                              localStorage.setItem('rep_treasuryRequests',JSON.stringify(updated));
                              showNotif('❌ Talep reddedildi.','error');
                            }} style={{flex:1,padding:'0.3rem',borderRadius:'6px',border:'1px solid rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.08)',color:'#EF4444',fontWeight:700,cursor:'pointer',fontSize:'0.68rem'}}>❌ Reddet</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div style={{fontWeight:700,color:'#F59E0B',marginBottom:'0.5rem',fontSize:'0.78rem',marginTop:'0.75rem'}}>📊 Vergi Oranları (%)</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.5rem'}}>
                  {[['income','Gelir Vergisi'],['trade','Ticaret Vergisi'],['property','Mülk Vergisi'],['interest','Faiz Oranı']].map(([k,lb])=>(
                    <div key={k}>
                      <div style={{fontSize:'0.62rem',color:'#5A7089',marginBottom:'2px'}}>{lb}</div>
                      <input type="number" value={taxForm[k]} onChange={e=>setTaxForm(p=>({...p,[k]:e.target.value}))} min={0} max={50}
                        style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'0.4rem 0.6rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
                    </div>
                  ))}
                </div>
                <button onClick={saveTaxRates} style={{width:'100%',padding:'0.45rem',borderRadius:'8px',border:'none',background:'rgba(245,158,11,0.15)',color:'#F59E0B',fontWeight:800,fontSize:'0.78rem',cursor:'pointer'}}>💾 Vergileri Kaydet</button>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
              {def.powers.filter(pw => pw.key !== 'print_money_btn' && pw.key !== 'set_tax').map(pw => {
                const rem = pw.cd > 0 ? Math.max(0, pw.cd - (Date.now() - (actionCooldowns[pw.key]||0))) : 0;
                return (
                  <button key={pw.key} onClick={()=>pw.cd>0?yetkiAction(pw.key,pw.cd,pw.action):pw.action()} disabled={rem>0}
                    style={{padding:'0.6rem 0.5rem',background:rem>0?'rgba(255,255,255,0.03)':`rgba(${def.color==='#F59E0B'?'245,158,11':def.color==='#EF4444'?'239,68,68':def.color==='#10B981'?'16,185,129':def.color==='#8B5CF6'?'139,92,246':def.color==='#3B82F6'?'59,130,246':def.color==='#06B6D4'?'6,182,212':'245,200,66'},0.1)`,border:`1px solid ${rem>0?'rgba(255,255,255,0.07)':`${def.color}30`}`,borderRadius:'10px',color:rem>0?'#3B4E63':def.color,cursor:rem>0?'not-allowed':'pointer',fontWeight:700,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",textAlign:'center',lineHeight:1.3}}>
                    {pw.label}
                    <div style={{fontSize:'0.6rem',color:'#5A7089',marginTop:'2px'}}>{pw.desc}</div>
                    {rem>0&&<div style={{fontSize:'0.58rem',marginTop:'2px',color:'#3B4E63'}}>⏳{Math.ceil(rem/3600000)}s</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {budgetModal && (
        <Modal title="💰 Askeri Bütçe" onClose={()=>{setBudgetModal(false);setBudgetAmt('');}}>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Askeri Bütçe Tutarı</div>
            <input type="number" value={budgetAmt} onChange={e=>setBudgetAmt(e.target.value)} placeholder="₱ Tutar"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
            <div style={{fontSize:'0.7rem',color:'#5A7089',marginTop:'0.4rem'}}>Bakiyeniz: ₱{fmtWord(profile?.money||0)}</div>
          </div>
          <Btn variant='gold' size='full' onClick={fundMilitary}>⚔️ Bütçeyi Aktar</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OLAYLAR / EVENTS SAYFASI
// ═══════════════════════════════════════════════════════
function EventsPage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [events, setEvents] = useLs('rep_gameEvents', []);
  const [myResponses, setMyResponses] = useLs('eventResponses', {});

  useEffect(() => {
    const h = (e) => {
      if (e.detail) setEvents(prev => [...prev.slice(-49), e.detail]);
    };
    window.addEventListener('game-event', h);
    return () => window.removeEventListener('game-event', h);
  }, []);

  const EVENT_ICONS = { security_crisis:'🚨', money_printed:'💸', war_declared:'⚔️', coup_rumors:'🎖️', monopoly:'🏭', corruption:'⚠️', election_win:'🏆', default:'📢' };
  const EVENT_COLORS = { security_crisis:'#EF4444', money_printed:'#F59E0B', war_declared:'#DC2626', coup_rumors:'#8B5CF6', monopoly:'#3B82F6', corruption:'#F59E0B', election_win:'#10B981', default:'#5A7089' };

  const respondToEvent = (eventId, response) => {
    setMyResponses(prev => ({ ...prev, [eventId]: response }));
    const xpMap = { support:100, oppose:100, neutral:50 };
    setProfile(p => { const np={...p, xp:(p.xp||0)+(xpMap[response]||50)}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ Tutumun kaydedildi! +${xpMap[response]||50} XP`, 'success');
  };

  const sortedEvents = [...events].sort((a,b)=>(b.ts||0)-(a.ts||0));

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#EF4444',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>🚨 OYUN OLAYLARI</div>
        <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1rem',marginBottom:'0.1rem'}}>Canlı Olaylar</div>
        <div style={{fontSize:'0.72rem',color:'#5A7089'}}>Oyuncu eylemleri olayları tetikler. Tutumunu belirt, XP kazan!</div>
      </div>

      {sortedEvents.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',color:'#3B4E63'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>📰</div>
          <div style={{fontSize:'0.85rem'}}>Henüz olay yok. Oyuncuların eylemleri olayları tetikleyecek!</div>
          <div style={{fontSize:'0.72rem',marginTop:'0.5rem',color:'#5A7089',lineHeight:1.6}}>
            Örnek: Çete çok fazla il alırsa → Güvenlik Krizi<br/>
            Şirket tekelleşirse → Meclis Soruşturması<br/>
            Parti 2 seçim kazanırsa → Darbe Söylentileri
          </div>
        </div>
      )}

      {sortedEvents.map(evt => {
        const myResp = myResponses[evt.id];
        const color = EVENT_COLORS[evt.type] || EVENT_COLORS.default;
        const icon = EVENT_ICONS[evt.type] || EVENT_ICONS.default;
        const timeAgoStr = evt.ts ? timeAgo(evt.ts) : '';
        return (
          <div key={evt.id} style={{background:card,border:`1px solid ${color}30`,borderRadius:'14px',padding:'1rem',marginBottom:'0.65rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem',marginBottom:'0.5rem'}}>
              <span style={{fontSize:'1.75rem',flexShrink:0}}>{icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,color,fontSize:'0.9rem',marginBottom:'0.2rem'}}>{evt.title}</div>
                <div style={{fontSize:'0.75rem',color:'#8BA0B5',lineHeight:1.5}}>{evt.desc}</div>
                <div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.3rem'}}>{timeAgoStr}</div>
              </div>
            </div>
            {!myResp ? (
              <div style={{display:'flex',gap:'0.4rem'}}>
                <button onClick={()=>respondToEvent(evt.id,'support')} style={{flex:1,padding:'0.45rem',borderRadius:'8px',border:'1px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.08)',color:'#10B981',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>✅ Destekle (+100 XP)</button>
                <button onClick={()=>respondToEvent(evt.id,'neutral')} style={{flex:1,padding:'0.45rem',borderRadius:'8px',border:`1px solid ${border}`,background:'transparent',color:'#5A7089',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>😐 Tarafsız (+50 XP)</button>
                <button onClick={()=>respondToEvent(evt.id,'oppose')} style={{flex:1,padding:'0.45rem',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',color:'#F87171',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>❌ Karşı Çık (+100 XP)</button>
              </div>
            ) : (
              <div style={{textAlign:'center',fontSize:'0.72rem',color:'#5A7089',padding:'0.3rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px'}}>
                Tutumun: <span style={{fontWeight:700,color:myResp==='support'?'#10B981':myResp==='oppose'?'#EF4444':'#5A7089'}}>{myResp==='support'?'✅ Destekliyorsun':myResp==='oppose'?'❌ Karşı çıkıyorsun':'😐 Tarafsızsın'}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAKIM SAVAŞI SİSTEMİ
// ═══════════════════════════════════════════════════════
function TeamWarPage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [wars, setWars] = useLs('activeWars', []);
  const [cabinet] = useLs('cabinet', {});
  const [treasury] = useLs('rep_treasury', { balance:0, militaryBudget:0 });
  const [gangs] = useLs('gangs', []);
  const [territories] = useLs('gangTerritories', {});
  const [playerArmy] = useLs('playerArmy', {});
  const [createModal, setCreateModal] = useState(false);
  const [warForm, setWarForm] = useState({ city:'', attackerType:'gang', attackerId:'', defenderType:'army' });
  const [warTab, setWarTab] = useState('active');

  const uid = profile?.uid || profile?.id;
  const isGeneral = cabinet['Genelkurmay Başkanı'] === profile?.username;
  const militaryBudget = treasury.militaryBudget || 0;

  // Gerginlik hesaplama
  const calcTension = () => {
    const _gangs = JSON.parse(localStorage.getItem('gangs')||'[]');
    const _taxRates = JSON.parse(localStorage.getItem('taxRates')||'{}');
    const _territory = JSON.parse(localStorage.getItem('gangTerritories')||'{}');
    const gangCount = _gangs.length;
    const incomeTax = _taxRates.income || 15;
    const controlledRegions = Object.values(_territory).filter(v=>v).length;
    const activeWarCount = wars.filter(w=>w.status==='active').length;
    const tension = Math.min(100,
      gangCount * 5 +
      controlledRegions * 8 +
      Math.max(0, incomeTax - 15) * 1.2 +
      activeWarCount * 10
    );
    return Math.round(tension);
  };
  const tension = calcTension();

  const joinWar = (warId, side) => {
    setWars(prev => prev.map(w => {
      if (w.id !== warId) return w;
      const already = [...(w.attackerPlayers||[]), ...(w.defenderPlayers||[])].includes(uid);
      if (already) { showNotif('Zaten bu savaşa katıldın!','error'); return w; }
      const myArr = side==='attacker' ? 'attackerPlayers' : 'defenderPlayers';
      return { ...w, [myArr]: [...(w[myArr]||[]), uid] };
    }));
    setProfile(p => { const np={...p,xp:(p.xp||0)+200}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('⚔️ Savaşa katıldın! +200 XP', 'success');
  };

  const resolveWar = (warId) => {
    if (!isGeneral) { showNotif('Sadece Genelkurmay Başkanı savaşı sonuçlandırabilir!','error'); return; }
    setWars(prev => prev.map(w => {
      if (w.id !== warId) return w;
      const aP = (w.attackerPlayers||[]).length;
      const dP = (w.defenderPlayers||[]).length;
      const aPow = aP * 12 + (w.attackerStr || 0);
      const dPow = dP * 10 + Math.floor(militaryBudget/100000);
      const winner = aPow > dPow ? 'attacker' : 'defender';
      return { ...w, status:'finished', winner, resolvedAt: Date.now() };
    }));
    showNotif('🏆 Savaş sonuçlandırıldı!', 'success');
  };

  const getArmyStrength = () => {
    const ARMY_UNIT_STR = {infantry:10,cavalry:25,artillery:80,navy:200,airforce:500};
    const ARMY_WEAPON_STR = {rifles:50,tanks:500,aircraft:2000};
    const myA = playerArmy[uid] || {};
    let str = Object.entries(ARMY_UNIT_STR).reduce((s,[k,v])=>s+(myA[k]||0)*v,0);
    const aw = myA.armyWeapons || {};
    str += Object.entries(ARMY_WEAPON_STR).reduce((s,[k,v])=>s+(aw[k]||0)*v,0);
    return str;
  };

  const createCityWar = () => {
    if (!isGeneral) { showNotif('Sadece Genelkurmay Başkanı savaş başlatabilir!','error'); return; }
    if (!warForm.city) { showNotif('Şehir seçin','error'); return; }
    if (militaryBudget < 500000) { showNotif('Askeri bütçe yetersiz! (min ₱500.000)','error'); return; }
    const attGang = gangs.find(g=>g.id===warForm.attackerId);
    const cityCtrl = territories[warForm.city];
    const ctrlGang = cityCtrl ? gangs.find(g=>g.id===cityCtrl.gangId) : null;
    const war = {
      id: genId(),
      city: warForm.city,
      attackerName: attGang ? attGang.name : (warForm.attackerId==='rebel'?'İsyancı Kuvvetler':'Bilinmeyen Güç'),
      attackerType: warForm.attackerType,
      attackerStr: attGang ? ((attGang.members||[]).length * 15 + (attGang.power||0) + (attGang.weapons||0)*5) : Math.floor(Math.random()*500+100),
      defenderName: ctrlGang ? ctrlGang.name : 'Devlet Ordusu',
      defenderType: ctrlGang ? 'gang' : 'army',
      defenderGangId: ctrlGang ? ctrlGang.id : null,
      defenderLeader: ctrlGang ? ctrlGang.leaderName : null,
      attackerPlayers: [], defenderPlayers: [uid],
      status: 'active', createdAt: Date.now(), createdBy: profile.username,
      warDamage: 0,
    };
    setWars(prev => [...prev, war]);
    setCreateModal(false);
    const evts = JSON.parse(localStorage.getItem('rep_gameEvents')||'[]');
    const defDesc = ctrlGang ? `Hedef: ${ctrlGang.name} (lider: ${ctrlGang.leaderName||'?'})` : 'Devlet kuvvetleri karşı çıkacak';
    evts.push({ id:genId(), type:'war_declared', title:`⚔️ ${war.city}'de Savaş!`, desc:`Genelkurmay Başkanı ${profile.username} ${war.city}'de askeri operasyon başlattı! ${defDesc}.`, ts:Date.now() });
    localStorage.setItem('rep_gameEvents', JSON.stringify(evts.slice(-50)));
    window.dispatchEvent(new CustomEvent('game-event', { detail: evts[evts.length-1] }));
    showNotif(`⚔️ ${war.city}'de operasyon başladı!`, 'success');
  };

  const activeWars = wars.filter(w => w.status === 'active');
  const finishedWars = wars.filter(w => w.status === 'finished').slice(-5);

  const tensionColor = tension >= 75 ? '#EF4444' : tension >= 50 ? '#F59E0B' : '#10B981';
  const tensionLabel = tension >= 75 ? 'KRİTİK' : tension >= 50 ? 'YÜKSEK' : tension >= 25 ? 'ORTA' : 'DÜŞÜK';

  return (
    <div style={{padding:'0.75rem',background:bg,minHeight:'100%'}}>
      {/* Başlık */}
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.25rem',fontWeight:900,color:'#EF4444',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
        ⚔️ Savaşlar
        {isGeneral && <span style={{fontSize:'0.62rem',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'6px',padding:'2px 8px',color:'#F87171',fontWeight:700}}>👑 KOMUTAN</span>}
      </div>

      {/* Gerginlik göstergesi */}
      <div style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${tensionColor}30`,borderRadius:'12px',padding:'0.75rem',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
          <div style={{fontSize:'0.72rem',color:'#5A7089',fontWeight:700}}>🌡️ Ülke Gerginliği</div>
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1rem',fontWeight:900,color:tensionColor}}>%{tension}</span>
            <span style={{fontSize:'0.6rem',fontWeight:800,color:tensionColor,background:`${tensionColor}18`,border:`1px solid ${tensionColor}35`,borderRadius:'5px',padding:'1px 6px'}}>{tensionLabel}</span>
          </div>
        </div>
        <div style={{height:'8px',background:'rgba(255,255,255,0.06)',borderRadius:'100px',overflow:'hidden',marginBottom:'0.35rem'}}>
          <div style={{height:'100%',width:`${tension}%`,background:`linear-gradient(90deg,#10B981,${tension>=50?'#F59E0B':'#10B981'},${tension>=75?'#EF4444':'transparent'})`,borderRadius:'100px',transition:'width 0.6s'}} />
        </div>
        <div style={{fontSize:'0.62rem',color:'#3B4E63'}}>
          Çete bölge kontrolü, enflasyon ve aktif savaşlar gerginliği artırır
        </div>
      </div>

      {/* Aktif savaş yok banner */}
      {activeWars.length === 0 && (
        <div style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px',padding:'0.75rem',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'1.2rem'}}>🕊️</span>
          <div style={{fontSize:'0.82rem',color:'#10B981',fontWeight:700}}>Ülkende aktif savaş yok!</div>
        </div>
      )}

      {/* Genelkurmay'a özel eylem */}
      {isGeneral && (
        <div style={{marginBottom:'0.75rem'}}>
          <button onClick={()=>setCreateModal(true)}
            style={{width:'100%',padding:'0.7rem',background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.08))',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'12px',color:'#EF4444',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'0.88rem'}}>
            ⚔️ Askeri Operasyon Başlat
          </button>
          {militaryBudget < 500000 && <div style={{fontSize:'0.68rem',color:'#F59E0B',textAlign:'center',marginTop:'0.3rem'}}>⚠️ Askeri bütçe yetersiz — min ₱500.000 gerekli</div>}
        </div>
      )}

      {/* Aktif çatışmalar */}
      {activeWars.length > 0 && (
        <div style={{marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.65rem',color:'#EF4444',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.5rem'}}>🔴 AKTİF ÇATIŞMALAR ({activeWars.length})</div>
          {activeWars.map(war => {
            const myJoined = [...(war.attackerPlayers||[]),...(war.defenderPlayers||[])].includes(uid);
            const mySide = (war.attackerPlayers||[]).includes(uid) ? 'attacker' : (war.defenderPlayers||[]).includes(uid) ? 'defender' : null;
            const aPow = war.attackerStr || (war.attackerPlayers||[]).length * 12;
            const armyStr = getArmyStrength();
            const dPow = Math.floor(militaryBudget/100000) + (war.defenderPlayers||[]).length * 10 + (war.defenderType==='army'?armyStr:0);
            const totalPow = aPow + dPow || 1;
            const aPct = Math.round(aPow/totalPow*100);
            return (
              <div key={war.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'14px',marginBottom:'0.65rem',overflow:'hidden'}}>
                {/* Şehir başlığı */}
                <div style={{background:'rgba(239,68,68,0.1)',padding:'0.6rem 0.85rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:900,color:'#EF4444',fontSize:'0.9rem'}}>📍 {war.city}</div>
                  <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                    <span style={{fontSize:'0.58rem',fontWeight:800,color:'#10B981',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:'5px',padding:'1px 7px'}}>🔴 AKTİF</span>
                    <span style={{fontSize:'0.6rem',color:'#5A7089'}}>{timeAgo(war.createdAt)}</span>
                  </div>
                </div>

                <div style={{padding:'0.75rem'}}>
                  {/* Savaşan taraflar */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 36px 1fr',gap:'0.35rem',alignItems:'stretch',marginBottom:'0.65rem'}}>
                    {/* Saldırgan */}
                    <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem 0.5rem',textAlign:'center'}}>
                      <div style={{fontSize:'1.8rem',marginBottom:'0.25rem'}}>✊</div>
                      <div style={{fontWeight:800,color:'#F87171',fontSize:'0.78rem',marginBottom:'0.1rem'}}>{war.attackerName}</div>
                      <div style={{fontSize:'0.6rem',color:'#5A7089',marginBottom:'0.3rem'}}>{war.attackerType==='gang'?'Çete Kuvveti':'İsyancılar'}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.9rem',fontWeight:900,color:'#EF4444'}}>{war.attackerStr?.toLocaleString('tr-TR') || '?'}</div>
                      <div style={{fontSize:'0.55rem',color:'#4A5A6A',textTransform:'uppercase'}}>Güç Puanı</div>
                      <div style={{fontSize:'0.62rem',color:'#F87171',marginTop:'0.2rem'}}>{(war.attackerPlayers||[]).length} katılımcı</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#EF4444',fontSize:'0.9rem'}}>VS</div>
                    {/* Savunmacı */}
                    <div style={{background:'rgba(59,130,246,0.07)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:'10px',padding:'0.65rem 0.5rem',textAlign:'center'}}>
                      <div style={{fontSize:'1.8rem',marginBottom:'0.25rem'}}>🛡️</div>
                      <div style={{fontWeight:800,color:'#60A5FA',fontSize:'0.78rem',marginBottom:'0.1rem'}}>{war.defenderName || 'Devlet Ordusu'}</div>
                      <div style={{fontSize:'0.6rem',color:'#5A7089',marginBottom:'0.3rem'}}>Devlet Kuvvetleri</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.9rem',fontWeight:900,color:'#60A5FA'}}>{dPow.toLocaleString('tr-TR')}</div>
                      <div style={{fontSize:'0.55rem',color:'#4A5A6A',textTransform:'uppercase'}}>Güç Puanı</div>
                      <div style={{fontSize:'0.62rem',color:'#60A5FA',marginTop:'0.2rem'}}>{(war.defenderPlayers||[]).length} asker</div>
                    </div>
                  </div>

                  {/* Güç dağılımı */}
                  <div style={{marginBottom:'0.65rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',color:'#5A7089',marginBottom:'3px'}}>
                      <span style={{color:'#F87171'}}>Saldırgan %{aPct}</span>
                      <span style={{color:'#60A5FA'}}>Savunmacı %{100-aPct}</span>
                    </div>
                    <div style={{height:'6px',borderRadius:'100px',overflow:'hidden',display:'flex'}}>
                      <div style={{width:`${aPct}%`,background:'#EF4444',transition:'width 0.5s'}} />
                      <div style={{flex:1,background:'#3B82F6'}} />
                    </div>
                  </div>

                  {/* Katılım butonları */}
                  {!myJoined ? (
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
                      <button onClick={()=>joinWar(war.id,'attacker')}
                        style={{padding:'0.5rem',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.4)',background:'rgba(239,68,68,0.1)',color:'#F87171',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>
                        ✊ Saldır
                      </button>
                      <button onClick={()=>joinWar(war.id,'defender')}
                        style={{padding:'0.5rem',borderRadius:'10px',border:'1px solid rgba(59,130,246,0.4)',background:'rgba(59,130,246,0.1)',color:'#60A5FA',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>
                        🛡️ Savun
                      </button>
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:'0.75rem',color:mySide==='attacker'?'#F87171':'#60A5FA',fontWeight:700}}>
                        {mySide==='attacker'?'✊ Saldırgan tarafındasın':'🛡️ Savunmacı tarafındasın'}
                      </span>
                      {isGeneral && (
                        <button onClick={()=>resolveWar(war.id)}
                          style={{padding:'0.35rem 0.75rem',borderRadius:'8px',border:'none',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',fontWeight:800,fontSize:'0.7rem',cursor:'pointer'}}>
                          🏆 Sonuçlandır
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Geçmiş savaşlar */}
      {finishedWars.length > 0 && (
        <div>
          <div style={{fontSize:'0.65rem',color:'#5A7089',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.5rem'}}>📜 GEÇMIŞ SAVAŞLAR</div>
          {finishedWars.map(war => (
            <div key={war.id} style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${border}`,borderRadius:'10px',padding:'0.7rem',marginBottom:'0.4rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'0.75rem',fontWeight:700,color:'#E8EDF2'}}>📍 {war.city}</div>
                <div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'1px'}}>{war.attackerName} — {timeAgo(war.resolvedAt||war.createdAt)}</div>
              </div>
              <span style={{fontSize:'0.68rem',fontWeight:700,color:'#F59E0B',background:'rgba(245,158,11,0.1)',borderRadius:'6px',padding:'2px 8px'}}>
                {war.winner==='defender'?'🛡️ Devlet Kazandı':'⚔️ Saldırgan Kazandı'}
              </span>
            </div>
          ))}
        </div>
      )}

      {wars.length === 0 && (
        <div style={{textAlign:'center',padding:'2rem',color:'#3B4E63'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🕊️</div>
          <div style={{fontSize:'0.85rem',color:'#5A7089'}}>Henüz savaş kaydı yok</div>
          <div style={{fontSize:'0.72rem',color:'#3B4E63',marginTop:'0.3rem'}}>Çeteler bölge ele geçirince savaşlar burada görünür</div>
        </div>
      )}

      {/* Savaş başlatma modalı */}
      {createModal && (
        <Modal title="⚔️ Askeri Operasyon" onClose={()=>setCreateModal(false)}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Çatışma Şehri</div>
            <select value={warForm.city} onChange={e=>setWarForm(p=>({...p,city:e.target.value}))}
              style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',boxSizing:'border-box'}}>
              <option value=''>— Şehir Seç —</option>
              {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Saldıran Güç (Çete)</div>
            <select value={warForm.attackerId} onChange={e=>setWarForm(p=>({...p,attackerId:e.target.value}))}
              style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',boxSizing:'border-box'}}>
              <option value=''>— Düşman Güç Seç —</option>
              {gangs.map(g=><option key={g.id} value={g.id}>{g.name} ({(g.members||[]).length} üye)</option>)}
              <option value='rebel'>İsyancı Kuvvetler</option>
            </select>
          </div>
          {warForm.city && (() => {
            const ctrl = territories[warForm.city];
            const ctrlG = ctrl ? gangs.find(g=>g.id===ctrl.gangId) : null;
            return (
              <div style={{background: ctrlG ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)', border: ctrlG ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(59,130,246,0.2)', borderRadius:'10px', padding:'0.65rem', fontSize:'0.78rem', color: ctrlG ? '#FCA5A5' : '#93C5FD', marginBottom:'1rem'}}>
                {ctrlG ? (
                  <>🎯 Hedef (bölge kontrolcüsü): <strong>{ctrlG.name}</strong> — Lider: <strong>{ctrlG.leaderName||'?'}</strong><br/><span style={{fontSize:'0.7rem',color:'#999'}}>Güç: {(ctrlG.power||0) + (ctrlG.weapons||0)*5} • {ctrlG.territory||0} bölge</span></>
                ) : (
                  <>🛡️ Savunmacı: <strong>Devlet Ordusu</strong> (₱{fmtWord(militaryBudget)} bütçe + ordu gücü)</>
                )}
              </div>
            );
          })()}
          <Btn variant='danger' size='full' onClick={createCityWar}>⚔️ Operasyonu Başlat</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ÇETE / AİLE SAYFASI
// ═══════════════════════════════════════════════════════
function GangPage({ profile, setProfile, showNotif }) {
  const [gangs, setGangs] = useLs('gangs', []);
  const [sub, setSub] = useState('gangs');
  const [createModal, setCreateModal] = useState(false);
  const [gForm, setGForm] = useState({ name:'', type:'gang', desc:'' });
  const [gangCooldowns, setGangCooldowns] = useLs('gangCooldowns', {});
  const [transferModal, setTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [disbandConfirm, setDisbandConfirm] = useState(false);
  const [donateModal, setDonateModal] = useState(false);
  const [donateAmt, setDonateAmt] = useState('');

  const uid = profile?.uid || profile?.id;
  const myGang = gangs.find(g => g.leaderId===uid || (g.members||[]).includes(uid));
  const isGangLeader = !!uid && myGang?.leaderId === uid;

  const createGang = () => {
    if (!gForm.name.trim()) { showNotif('İsim gerekli','error'); return; }
    if (myGang) { showNotif('Zaten bir çeteye/aileye üyesin','error'); return; }
    if (profile?.party) { showNotif('🏛️ Parti üyeleri çete veya aile kuramazlar. Önce partiden ayrılın.','error'); return; }
    const cost = gForm.type==='family' ? 5000000000 : 2000000000;
    if ((profile?.money||0) < cost) { showNotif(`${gForm.type==='family'?'Aile kurmak için ₱5.000.000.000':'Çete kurmak için ₱2.000.000.000'} gerekli`,'error'); return; }
    const gang = {
      id:genId(), name:gForm.name.trim(), type:gForm.type, desc:gForm.desc,
      leaderId:uid, leaderName:profile?.username,
      members:[uid], memberCount:1, treasury:0,
      power:10, territory:0, reputation:0, createdAt:Date.now()
    };
    setGangs(prev => [...prev, gang]);
    setProfile(p => { const np={...p,gang:gang.id,money:(p.money||0)-cost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    setGForm({name:'',type:'gang',desc:''});
    showNotif(`${gang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'} ${gang.name} kuruldu!`,'success');
  };

  const joinGang = (gang) => {
    if (myGang) { showNotif('Zaten bir çeteye/aileye üyesin','error'); return; }
    if (profile?.party) { showNotif('🏛️ Parti üyeleri çete veya aileye katılamaz. Önce partiden ayrılın.','error'); return; }
    setGangs(prev => prev.map(g => g.id===gang.id ? {...g, members:[...(g.members||[]),uid], memberCount:(g.memberCount||0)+1, power:(g.power||10)+50} : g));
    setProfile(p => { const np={...p,gang:gang.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${gang.name}'e katıldın! Çete gücüne +50 eklendi.`,'success');
  };

  const leaveGang = () => {
    if (!myGang||isGangLeader) { if(isGangLeader) showNotif('Lider ayrılamaz. Önce liderliği devret.','error'); return; }
    setGangs(prev => prev.map(g => g.id===myGang.id ? {...g,members:(g.members||[]).filter(m=>m!==uid),memberCount:Math.max(0,(g.memberCount||1)-1),power:Math.max(10,(g.power||10)-50)} : g));
    setProfile(p => { const np={...p,gang:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('Çeteden ayrıldın. -50 güç.','info');
  };

  const kickMember = (muid) => {
    if (!isGangLeader) return;
    setGangs(prev => prev.map(g => g.id===myGang.id ? {...g,members:(g.members||[]).filter(m=>m!==muid),memberCount:Math.max(0,(g.memberCount||1)-1),power:Math.max(10,(g.power||10)-50)} : g));
    showNotif('Üye çeteden çıkarıldı. -50 güç.','info');
  };

  const donateToGang = () => {
    const amt = parseInt(donateAmt);
    if (!amt||amt<=0) { showNotif('Geçerli tutar girin','error'); return; }
    if ((profile?.money||0)<amt) { showNotif('Yetersiz para','error'); return; }
    setGangs(prev => prev.map(g => g.id===myGang.id ? {...g,treasury:(g.treasury||0)+amt} : g));
    setProfile(p => { const np={...p,money:(p.money||0)-amt}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setDonateModal(false); setDonateAmt('');
    showNotif(`💰 ${fmtWord(amt)} kasaya yatırıldı`,'success');
  };

  const gangAction = (actionId, cdMs, fn) => {
    const key = `gang_${myGang?.id}_${actionId}`;
    const rem = cdMs - (Date.now()-(gangCooldowns[key]||0));
    if (rem > 0) { showNotif(`⏳ ${Math.ceil(rem/3600000)}s sonra tekrar`,'error'); return; }
    fn();
    setGangCooldowns(prev => ({...prev,[key]:Date.now()}));
  };

  const transferGangLeadership = () => {
    if (!isGangLeader||!transferTarget.trim()) { showNotif('Kullanıcı adı girin','error'); return; }
    const users = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return[];} })();
    const tgt = users.find(u => u.username===transferTarget.trim());
    if (!tgt) { showNotif('Kullanıcı bulunamadı','error'); return; }
    if (!(myGang.members||[]).includes(tgt.id||tgt.uid)) { showNotif('Bu kişi çetede değil','error'); return; }
    setGangs(prev => prev.map(g => g.id===myGang.id ? {...g,leaderId:tgt.id||tgt.uid,leaderName:tgt.username} : g));
    setTransferModal(false); setTransferTarget('');
    showNotif(`👑 Liderlik ${tgt.username} kişisine devredildi`,'success');
  };

  const disbandGang = () => {
    if (!isGangLeader) return;
    setGangs(prev => prev.filter(g => g.id!==myGang.id));
    setProfile(p => { const np={...p,gang:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setDisbandConfirm(false);
    showNotif(`${myGang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'} ${myGang.name} dağıtıldı`,'info');
  };

  const inpSt = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'};
  const subItems = myGang
    ? [{id:'gangs',label:'⚔️ Liste'},{id:'management',label:'⚙️ Yönetim'},{id:'attack',label:'🥊 Suç'},{id:'territory',label:'🗺️ Bölge'},{id:'weapons',label:'🔫 Silah'}]
    : [{id:'gangs',label:'⚔️ Çeteler'},{id:'attack',label:'🥊 Suç'},{id:'territory',label:'🗺️ Bölge'}];

  return (
    <div>
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {subItems.map(s=>(
          <button key={s.id} onClick={()=>setSub(s.id)}
            style={{padding:'0.38rem 0.75rem',borderRadius:'8px',border:`1px solid ${sub===s.id?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.07)'}`,background:sub===s.id?'rgba(239,68,68,0.12)':'rgba(255,255,255,0.03)',color:sub===s.id?'#FCA5A5':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.76rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{padding:'0.7rem'}}>

        {sub==='gangs' && (
          <div>
            {myGang && (
              <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(11,21,39,0.95))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.5rem'}}>
                  <div style={{fontSize:'1.5rem'}}>{myGang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'}</div>
                  <div>
                    <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1rem'}}>{myGang.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{myGang.memberCount} üye • Güç: {(myGang.power||10)+((myGang.weapons||0)*5)} • {isGangLeader?'👑 Lidersin':'Üye'}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.35rem',marginBottom:'0.5rem'}}>
                  {[['💰','Kasa',fmtWord(myGang.treasury||0)],['⚡','Güç',(myGang.power||10)+((myGang.weapons||0)*5)],['🗺️','Bölge',myGang.territory||0]].map(([ic,lb,v])=>(
                    <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
                      <div style={{fontSize:'0.9rem'}}>{ic}</div>
                      <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.78rem'}}>{v}</div>
                      <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  <Btn variant='ghost' size='sm' onClick={()=>setSub('management')}>⚙️ Yönet</Btn>
                  <Btn variant='ghost' size='sm' onClick={()=>setDonateModal(true)}>💰 Bağış</Btn>
                  {!isGangLeader && <Btn variant='danger' size='sm' onClick={leaveGang}>🚪 Ayrıl</Btn>}
                </div>
              </div>
            )}
            {!myGang && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
                <Btn variant='danger' size='sm' onClick={()=>{setGForm(p=>({...p,type:'gang'}));setCreateModal(true);}}>⚔️ Çete Kur (₱50K)</Btn>
                <Btn variant='ghost' size='sm' onClick={()=>{setGForm(p=>({...p,type:'family'}));setCreateModal(true);}}>👨‍👩‍👧‍👦 Aile Kur (₱100K)</Btn>
              </div>
            )}
            {gangs.map(gang => (
              <Card key={gang.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:`1px solid ${gang.id===myGang?.id?'rgba(239,68,68,0.3)':gang.type==='family'?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.1)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{gang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'} {gang.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{gang.memberCount} üye • Güç: {(gang.power||10)+((gang.weapons||0)*5)} • {fmtWord(gang.treasury||0)} kasa</div>
                  </div>
                  <div style={{display:'flex',gap:'0.3rem',alignItems:'center'}}>
                    {gang.id===myGang?.id && <Tag color='red'>Üyesin</Tag>}
                    {!myGang && <Btn variant='ghost' size='sm' onClick={()=>joinGang(gang)}>Katıl</Btn>}
                  </div>
                </div>
              </Card>
            ))}
            {gangs.length===0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz çete yok. İlk sen kur! ⚔️</div>}
          </div>
        )}

        {sub==='management' && (
          <div>
            {!myGang ? (
              <Card style={{textAlign:'center',padding:'2rem'}}><div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>⚔️</div><div style={{color:'#5A7089',fontSize:'0.85rem'}}>Yönetim için bir çeteye katıl</div></Card>
            ) : (
              <div>
                <Card style={{marginBottom:'0.65rem',background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(11,21,39,0.95))'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                    <div style={{fontSize:'1.5rem'}}>{myGang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'}</div>
                    <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1rem'}}>{myGang.name}</div>
                    {isGangLeader&&<Tag color='red'>👑 Lider</Tag>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.35rem',marginBottom:'0.5rem'}}>
                    {[['👑','Lider',myGang.leaderName||'?'],['👥','Üye',myGang.memberCount||1],['⚡','Güç',(myGang.power||10)+((myGang.weapons||0)*5)],['💰','Kasa',fmtWord(myGang.treasury||0)]].map(([ic,lb,v])=>(
                      <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
                        <div style={{fontSize:'0.8rem'}}>{ic}</div>
                        <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.7rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</div>
                        <div style={{fontSize:'0.52rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                    <Btn variant='ghost' size='sm' onClick={()=>setDonateModal(true)}>💰 Kasa Yatır</Btn>
                    {!isGangLeader && <Btn variant='danger' size='sm' onClick={leaveGang}>🚪 Ayrıl</Btn>}
                  </div>
                </Card>

                {isGangLeader && (
                  <Card style={{marginBottom:'0.65rem',border:'1px solid rgba(239,68,68,0.2)'}}>
                    <div style={{fontWeight:700,color:'#FCA5A5',marginBottom:'0.65rem',fontSize:'0.82rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>👑 Lider Yetkileri</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.5rem'}}>
                      {[
                        {id:'harac',label:'💰 Haraç Topla',cd:2*3600000,fn:()=>{const g=Math.floor((myGang.power||10)*150);setGangs(prev=>prev.map(x=>x.id===myGang.id?{...x,treasury:(x.treasury||0)+g}:x));showNotif(`💰 Haraç! +${fmtWord(g)} kasa`,'success');}},
                        {id:'bolge',label:'🗺️ Bölge Al',cd:3*3600000,fn:()=>{setGangs(prev=>prev.map(x=>x.id===myGang.id?{...x,territory:(x.territory||0)+1,power:(x.power||10)+2}:x));setProfile(pr=>{const np={...pr,xp:(pr.xp||0)+150};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});showNotif('🗺️ Yeni bölge! +1 bölge, +2 güç, +150 XP','success');}},
                        {id:'savunma',label:'🛡️ Güvenli Alan',cd:4*3600000,fn:()=>{setGangs(prev=>prev.map(x=>x.id===myGang.id?{...x,power:(x.power||10)+5}:x));showNotif('🛡️ Güvenli alan! +5 güç','success');}},
                        {id:'baskin',label:'⚔️ Baskın',cd:6*3600000,fn:()=>{const won=Math.random()<0.55;const prize=won?Math.floor((myGang.power||10)*200):0;if(won){setGangs(prev=>prev.map(x=>x.id===myGang.id?{...x,power:(x.power||10)+3}:x));setProfile(pr=>{const np={...pr,money:(pr.money||0)+prize,xp:(pr.xp||0)+200};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});}else{setGangs(prev=>prev.map(x=>x.id===myGang.id?{...x,power:Math.max(5,(x.power||10)-2)}:x));}showNotif(won?`⚔️ Baskın başarılı! +${fmtWord(prize)}`:'⚔️ Başarısız! -2 güç',won?'success':'error');}},
                      ].map(a=>{
                        const key=`gang_${myGang.id}_${a.id}`;
                        const rem=Math.max(0,a.cd-(Date.now()-(gangCooldowns[key]||0)));
                        return (
                          <button key={a.id} onClick={()=>gangAction(a.id,a.cd,a.fn)} disabled={rem>0}
                            style={{padding:'0.55rem 0.4rem',background:rem>0?'rgba(255,255,255,0.03)':'rgba(239,68,68,0.08)',border:`1px solid ${rem>0?'rgba(255,255,255,0.07)':'rgba(239,68,68,0.2)'}`,borderRadius:'10px',color:rem>0?'#3B4E63':'#FCA5A5',cursor:rem>0?'not-allowed':'pointer',fontWeight:700,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",textAlign:'center',lineHeight:1.3}}>
                            {a.label}{rem>0&&<div style={{fontSize:'0.6rem',marginTop:'2px',color:'#3B4E63'}}>⏳{Math.ceil(rem/3600000)}s</div>}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'0.5rem'}}>
                      <Btn variant='ghost' size='sm' onClick={()=>setTransferModal(true)}>🔄 Liderliği Devret</Btn>
                      <Btn variant='danger' size='sm' onClick={()=>setDisbandConfirm(true)}>🗑️ Dağıt</Btn>
                    </div>
                  </Card>
                )}

                <Card>
                  <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>👥 Üyeler ({myGang.memberCount||1})</div>
                  {(myGang.members||[]).map((muid,i)=>(
                    <div key={muid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.45rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(239,68,68,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>{muid===myGang.leaderId?'👑':'👤'}</div>
                        <div style={{fontSize:'0.82rem',fontWeight:700,color:muid===uid?'#FCA5A5':'#E8EDF2'}}>
                          {muid===uid?profile?.username:`Üye #${i+1}`}{muid===myGang.leaderId&&<span style={{marginLeft:'0.3rem'}}><Tag color='red'>Lider</Tag></span>}
                        </div>
                      </div>
                      {isGangLeader&&muid!==myGang.leaderId&&(
                        <button onClick={()=>kickMember(muid)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',padding:'2px 8px',color:'#FCA5A5',cursor:'pointer',fontSize:'0.68rem',fontWeight:700}}>Çıkar</button>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}

        {sub==='attack' && (
          <div>
            {[['🥊','Sokak Kavgası',80,'₱500-2.000',500],['🔫','Gasp Girişimi',60,'₱2.000-8.000',3000],['💣','Banka Soygunu',30,'₱20K-100K',10000],['🚗','Araba Hırsızlığı',70,'₱5.000-15.000',2000]].map(([ic,name,rate,earn,fine])=>(
              <button key={name} onClick={()=>{
                const success=Math.random()*100<rate;
                const amount=success?Math.floor(Math.random()*(rate===30?80000:rate===60?6000:rate===70?10000:1500)+2000):0;
                const penalty=success?0:fine;
                setProfile(p=>{const np={...p,money:(p.money||0)+amount-penalty,xp:(p.xp||0)+(success?100:20)};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});
                showNotif(success?`🎉 Başarılı! +${fmtWord(amount)}`:`😔 Başarısız! -${fmtWord(penalty)} ceza`,success?'success':'error');
              }}
                style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem',background:'rgba(20,36,60,0.8)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'12px',width:'100%',marginBottom:'0.5rem',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
                <span style={{fontSize:'1.5rem',width:'32px',textAlign:'center',flexShrink:0}}>{ic}</span>
                <div style={{flex:1,textAlign:'left'}}>
                  <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{name}</div>
                  <div style={{fontSize:'0.67rem',color:'#10B981'}}>%{rate} başarı • Kazanç: {earn}</div>
                  <div style={{fontSize:'0.65rem',color:'#EF4444'}}>Ceza riski: {fmtWord(fine)}</div>
                </div>
                <span style={{color:'#EF4444',fontSize:'0.85rem'}}>→</span>
              </button>
            ))}
          </div>
        )}

        {sub==='territory' && (
          <TerritorySystem profile={profile} setProfile={setProfile} showNotif={showNotif} myGang={myGang} gangs={gangs} setGangs={setGangs} isGangLeader={isGangLeader} />
        )}

        {sub==='weapons' && (
          <WeaponSystem profile={profile} setProfile={setProfile} showNotif={showNotif} myGang={myGang} gangs={gangs} setGangs={setGangs} isGangLeader={isGangLeader} />
        )}
      </div>

      {createModal && (
        <Modal title={gForm.type==='gang'?'⚔️ Çete Kur':'👨‍👩‍👧‍👦 Aile Kur'} onClose={()=>{setCreateModal(false);setGForm({name:'',type:'gang',desc:''});}}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>İsim</div>
            <input value={gForm.name} onChange={e=>setGForm(p=>({...p,name:e.target.value}))} placeholder={gForm.type==='gang'?'Çete adı...':'Aile adı...'} style={inpSt} />
          </div>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Açıklama (opsiyonel)</div>
            <textarea value={gForm.desc} onChange={e=>setGForm(p=>({...p,desc:e.target.value}))} placeholder="Kısa bir açıklama..." rows={2}
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#FCA5A5',marginBottom:'1rem'}}>
            💡 Kurmak {fmtWord(gForm.type==='gang'?50000:100000)} gerektirir. Bakiye: {fmtWord(profile?.money)}
          </div>
          <Btn variant='danger' size='full' onClick={createGang}>{gForm.type==='gang'?'⚔️ Çeteyi Kur':'👨‍👩‍👧‍👦 Aileyi Kur'}</Btn>
        </Modal>
      )}

      {donateModal&&(
        <Modal title="💰 Kasaya Para Yatır" onClose={()=>{setDonateModal(false);setDonateAmt('');}}>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Tutar</div>
            <input type="number" value={donateAmt} onChange={e=>setDonateAmt(e.target.value)} placeholder="₱ Tutar" style={inpSt} />
            <div style={{display:'flex',gap:'0.4rem',marginTop:'0.5rem',flexWrap:'wrap'}}>
              {[5000,10000,25000,50000].map(n=><button key={n} onClick={()=>setDonateAmt(String(n))} style={{padding:'0.3rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>{fmtWord(n)}</button>)}
            </div>
          </div>
          <Btn variant='danger' size='full' onClick={donateToGang}>💰 Yatır</Btn>
        </Modal>
      )}

      {transferModal&&(
        <Modal title="🔄 Liderliği Devret" onClose={()=>{setTransferModal(false);setTransferTarget('');}}>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#FCA5A5',marginBottom:'1rem'}}>
            ⚠️ Liderliği devrettikten sonra artık lider yetkilerine sahip olmayacaksın.
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Yeni Lider Kullanıcı Adı</div>
            <input value={transferTarget} onChange={e=>setTransferTarget(e.target.value)} placeholder="Çete üyesinin kullanıcı adı" style={inpSt} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>{setTransferModal(false);setTransferTarget('');}}>İptal</Btn>
            <Btn variant='danger' size='md' onClick={transferGangLeadership}>🔄 Devret</Btn>
          </div>
        </Modal>
      )}

      {disbandConfirm&&(
        <Modal title="🗑️ Çeteyi Dağıt" onClose={()=>setDisbandConfirm(false)}>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#FCA5A5',marginBottom:'1rem'}}>
            ⚠️ Bu işlem geri alınamaz! <strong>{myGang?.name}</strong> kalıcı olarak dağıtılacak.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>setDisbandConfirm(false)}>İptal</Btn>
            <Btn variant='red' size='md' onClick={disbandGang}>🗑️ Dağıt</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// İTTİFAK SİSTEMİ
// ═══════════════════════════════════════════════════════
function AlliancePage({ profile, setProfile, showNotif }) {
  const [alliances, setAlliances] = useLs('alliances', []);
  const [sub, setSub] = useState('list');
  const [createModal, setCreateModal] = useState(false);
  const [aForm, setAForm] = useState({ name:'', tag:'', desc:'', type:'open' });
  const [searchQ, setSearchQ] = useState('');
  const [allianceCooldowns, setAllianceCooldowns] = useLs('allianceCooldowns', {});
  const [transferModal, setTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [disbandConfirm, setDisbandConfirm] = useState(false);
  const [donateModal, setDonateModal] = useState(false);
  const [donateAmt, setDonateAmt] = useState('');

  const uid = profile?.uid || profile?.id;
  const myAlliance = alliances.find(a => a.leaderId===uid || (a.members||[]).includes(uid));
  const isAllianceLeader = !!uid && myAlliance?.leaderId === uid;

  const ALLIANCE_COST = 75000;

  const createAlliance = () => {
    if (!aForm.name.trim()||!aForm.tag.trim()) { showNotif('İsim ve etiket gerekli','error'); return; }
    if (aForm.tag.length>5) { showNotif('Etiket max 5 karakter','error'); return; }
    if (myAlliance) { showNotif('Zaten bir ittifaka üyesin','error'); return; }
    if ((profile?.money||0) < ALLIANCE_COST) { showNotif(`İttifak kurmak ${fmtWord(ALLIANCE_COST)} gerektirir`,'error'); return; }
    const a = { id:genId(), name:aForm.name.trim(), tag:aForm.tag.toUpperCase(), desc:aForm.desc, type:aForm.type,
      leaderId:uid, leaderName:profile?.username, members:[uid], memberCount:1, level:1, treasury:0, xp:0, power:10, createdAt:Date.now() };
    setAlliances(prev => [...prev, a]);
    setProfile(p => { const np={...p,alliance:a.id,money:(p.money||0)-ALLIANCE_COST}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    setAForm({name:'',tag:'',desc:'',type:'open'});
    showNotif(`🤝 ${a.name} İttifakı kuruldu!`,'success');
  };

  const joinAlliance = (a) => {
    if (myAlliance) { showNotif('Zaten bir ittifaka üyesin','error'); return; }
    if (a.type!=='open') { showNotif('Bu ittifak kapalı','error'); return; }
    setAlliances(prev => prev.map(al => al.id===a.id ? {...al,members:[...(al.members||[]),uid],memberCount:(al.memberCount||0)+1} : al));
    setProfile(p => { const np={...p,alliance:a.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${a.name}'e katıldın!`,'success');
  };

  const leaveAlliance = () => {
    if (!myAlliance||isAllianceLeader) { if(isAllianceLeader) showNotif('Lider ayrılamaz. Önce liderliği devret.','error'); return; }
    setAlliances(prev => prev.map(a => a.id===myAlliance.id ? {...a,members:(a.members||[]).filter(m=>m!==uid),memberCount:Math.max(0,(a.memberCount||1)-1)} : a));
    setProfile(p => { const np={...p,alliance:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('İttifaktan ayrıldın','info');
  };

  const kickAllianceMember = (muid) => {
    if (!isAllianceLeader) return;
    setAlliances(prev => prev.map(a => a.id===myAlliance.id ? {...a,members:(a.members||[]).filter(m=>m!==muid),memberCount:Math.max(0,(a.memberCount||1)-1)} : a));
    showNotif('Üye ittifaktan çıkarıldı','info');
  };

  const donateToAlliance = () => {
    const amt = parseInt(donateAmt);
    if (!amt||amt<=0) { showNotif('Geçerli tutar girin','error'); return; }
    if ((profile?.money||0)<amt) { showNotif('Yetersiz para','error'); return; }
    setAlliances(prev => prev.map(a => a.id===myAlliance.id ? {...a,treasury:(a.treasury||0)+amt} : a));
    setProfile(p => { const np={...p,money:(p.money||0)-amt}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setDonateModal(false); setDonateAmt('');
    showNotif(`💰 ${fmtWord(amt)} ittifak kasasına yatırıldı`,'success');
  };

  const allianceAction = (actionId, cdMs, fn) => {
    const key = `all_${myAlliance?.id}_${actionId}`;
    const rem = cdMs - (Date.now()-(allianceCooldowns[key]||0));
    if (rem > 0) { showNotif(`⏳ ${Math.ceil(rem/3600000)}s sonra tekrar`,'error'); return; }
    fn();
    setAllianceCooldowns(prev => ({...prev,[key]:Date.now()}));
  };

  const transferAllianceLeadership = () => {
    if (!isAllianceLeader||!transferTarget.trim()) { showNotif('Kullanıcı adı girin','error'); return; }
    const users = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return[];} })();
    const tgt = users.find(u => u.username===transferTarget.trim());
    if (!tgt) { showNotif('Kullanıcı bulunamadı','error'); return; }
    if (!(myAlliance.members||[]).includes(tgt.id||tgt.uid)) { showNotif('Bu kişi ittifakta değil','error'); return; }
    setAlliances(prev => prev.map(a => a.id===myAlliance.id ? {...a,leaderId:tgt.id||tgt.uid,leaderName:tgt.username} : a));
    setTransferModal(false); setTransferTarget('');
    showNotif(`👑 Liderlik ${tgt.username} kişisine devredildi`,'success');
  };

  const disbandAlliance = () => {
    if (!isAllianceLeader) return;
    setAlliances(prev => prev.filter(a => a.id!==myAlliance.id));
    setProfile(p => { const np={...p,alliance:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setDisbandConfirm(false);
    showNotif(`🤝 ${myAlliance.name} ittifakı feshedildi`,'info');
  };

  const filtered = alliances.filter(a => !searchQ || a.name.toLowerCase().includes(searchQ.toLowerCase()) || a.tag.toLowerCase().includes(searchQ.toLowerCase()));
  const inpSt = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'};
  const subItems = myAlliance
    ? [{id:'list',label:'🤝 Liste'},{id:'management',label:'⚙️ Yönetim'}]
    : [{id:'list',label:'🤝 İttifaklar'}];

  return (
    <div>
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {subItems.map(s=>(
          <button key={s.id} onClick={()=>setSub(s.id)}
            style={{padding:'0.38rem 0.75rem',borderRadius:'8px',border:`1px solid ${sub===s.id?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.07)'}`,background:sub===s.id?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.03)',color:sub===s.id?'#6EE7B7':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.76rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{padding:'0.7rem'}}>

        {sub==='list' && (
          <div>
            {myAlliance && (
              <Card style={{marginBottom:'0.75rem',background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(11,21,39,0.9))',border:'1px solid rgba(16,185,129,0.2)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
                      <div style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'6px',padding:'2px 7px',fontWeight:900,fontSize:'0.75rem',color:'#10B981'}}>[{myAlliance.tag}]</div>
                      {isAllianceLeader && <Tag color='gold'>👑 Lider</Tag>}
                    </div>
                    <div style={{fontWeight:900,fontSize:'1.05rem',color:'#E8EDF2'}}>{myAlliance.name}</div>
                    <div style={{fontSize:'0.72rem',color:'#5A7089'}}>{myAlliance.memberCount} üye • Lv.{myAlliance.level||1} • {fmtWord(myAlliance.treasury)} kasa</div>
                  </div>
                </div>
                <div style={{fontSize:'0.78rem',color:'#8BA0B5',marginBottom:'0.5rem'}}>{myAlliance.desc}</div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  <Btn variant='green' size='sm' onClick={()=>setSub('management')}>⚙️ Yönet</Btn>
                  <Btn variant='ghost' size='sm' onClick={()=>setDonateModal(true)}>💰 Kasa Yatır</Btn>
                  {!isAllianceLeader && <Btn variant='ghost' size='sm' onClick={leaveAlliance}>🚪 Ayrıl</Btn>}
                </div>
              </Card>
            )}
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem'}}>
              <div style={{flex:1,display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0 0.75rem'}}>
                <span style={{color:'#3B4E63',marginRight:'0.4rem'}}>🔍</span>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="İttifak ara..."
                  style={{flex:1,background:'none',border:'none',outline:'none',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',padding:'0.55rem 0'}} />
              </div>
              {!myAlliance && <Btn variant='primary' size='sm' onClick={()=>setCreateModal(true)}>+ Kur</Btn>}
            </div>
            <div style={{fontSize:'0.68rem',color:'#3B4E63',fontWeight:700,textTransform:'uppercase',marginBottom:'0.5rem',letterSpacing:'0.08em'}}>Tüm İttifaklar ({filtered.length})</div>
            {filtered.map(a => (
              <Card key={a.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:`1px solid ${a.id===myAlliance?.id?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.06)'}`}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                  <div style={{background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'8px',padding:'0.4rem 0.6rem',fontWeight:900,fontSize:'0.8rem',color:'#60A5FA',flexShrink:0}}>[{a.tag}]</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.92rem'}}>{a.name}</div>
                    <div style={{fontSize:'0.68rem',color:'#5A7089'}}>{a.memberCount||0} üye • Lv.{a.level||1} • {a.type==='open'?'🔓 Açık':'🔒 Kapalı'}</div>
                  </div>
                  {!myAlliance && a.type==='open' && <Btn variant='primary' size='sm' onClick={()=>joinAlliance(a)}>Katıl</Btn>}
                  {a.id===myAlliance?.id && <Tag color='green'>Üyesin</Tag>}
                </div>
              </Card>
            ))}
            {filtered.length===0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>İttifak bulunamadı. İlk sen kur! 🤝</div>}
          </div>
        )}

        {sub==='management' && (
          <div>
            {!myAlliance ? (
              <Card style={{textAlign:'center',padding:'2rem'}}><div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🤝</div><div style={{color:'#5A7089',fontSize:'0.85rem'}}>Yönetim için bir ittifaka katıl</div></Card>
            ) : (
              <div>
                <Card style={{marginBottom:'0.65rem',background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(11,21,39,0.95))'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                    <div style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'6px',padding:'2px 7px',fontWeight:900,fontSize:'0.8rem',color:'#10B981'}}>[{myAlliance.tag}]</div>
                    <div style={{fontWeight:900,color:'#E8EDF2',fontSize:'1rem'}}>{myAlliance.name}</div>
                    {isAllianceLeader&&<Tag color='gold'>👑 Lider</Tag>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.35rem',marginBottom:'0.5rem'}}>
                    {[['👥','Üye',myAlliance.memberCount||1],['⭐','Seviye',myAlliance.level||1],['⚡','Güç',myAlliance.power||10],['💰','Kasa',fmtWord(myAlliance.treasury||0)]].map(([ic,lb,v])=>(
                      <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.4rem',textAlign:'center'}}>
                        <div style={{fontSize:'0.8rem'}}>{ic}</div>
                        <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.7rem'}}>{v}</div>
                        <div style={{fontSize:'0.52rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                    <Btn variant='ghost' size='sm' onClick={()=>setDonateModal(true)}>💰 Kasa Yatır</Btn>
                    {!isAllianceLeader && <Btn variant='ghost' size='sm' onClick={leaveAlliance}>🚪 Ayrıl</Btn>}
                  </div>
                </Card>

                {isAllianceLeader && (
                  <Card style={{marginBottom:'0.65rem',border:'1px solid rgba(16,185,129,0.2)'}}>
                    <div style={{fontWeight:700,color:'#6EE7B7',marginBottom:'0.65rem',fontSize:'0.82rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>👑 Lider Yetkileri</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.5rem'}}>
                      {[
                        {id:'operasyon',label:'🎯 Ortak Operasyon',cd:4*3600000,fn:()=>{const xp=Math.floor((myAlliance.memberCount||1)*80);setProfile(pr=>{const np={...pr,xp:(pr.xp||0)+xp};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});setAlliances(prev=>prev.map(a=>a.id===myAlliance.id?{...a,xp:(a.xp||0)+xp,power:(a.power||10)+1}:a));showNotif(`🎯 Operasyon tamamlandı! +${xp} XP +1 güç`,'success');}},
                        {id:'diplomatik',label:'🕊️ Diplomatik Hamle',cd:6*3600000,fn:()=>{setAlliances(prev=>prev.map(a=>a.id===myAlliance.id?{...a,level:Math.min(10,(a.level||1)+1),power:(a.power||10)+3}:a));setProfile(pr=>{const np={...pr,xp:(pr.xp||0)+200,meritPoints:(pr.meritPoints||0)+20};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});showNotif('🕊️ Diplomatik hamle! +1 seviye, +3 güç, +200 XP','success');}},
                        {id:'savunma',label:'🛡️ Savunma Hattı',cd:5*3600000,fn:()=>{setAlliances(prev=>prev.map(a=>a.id===myAlliance.id?{...a,power:(a.power||10)+8}:a));showNotif('🛡️ Savunma hattı kuruldu! +8 güç','success');}},
                        {id:'hazine',label:'💎 Hazine Kampanyası',cd:8*3600000,fn:()=>{const earn=Math.floor((myAlliance.level||1)*50000);setAlliances(prev=>prev.map(a=>a.id===myAlliance.id?{...a,treasury:(a.treasury||0)+earn}:a));showNotif(`💎 Kampanya! +${fmtWord(earn)} kasa`,'success');}},
                      ].map(a=>{
                        const key=`all_${myAlliance.id}_${a.id}`;
                        const rem=Math.max(0,a.cd-(Date.now()-(allianceCooldowns[key]||0)));
                        return (
                          <button key={a.id} onClick={()=>allianceAction(a.id,a.cd,a.fn)} disabled={rem>0}
                            style={{padding:'0.55rem 0.4rem',background:rem>0?'rgba(255,255,255,0.03)':'rgba(16,185,129,0.08)',border:`1px solid ${rem>0?'rgba(255,255,255,0.07)':'rgba(16,185,129,0.2)'}`,borderRadius:'10px',color:rem>0?'#3B4E63':'#6EE7B7',cursor:rem>0?'not-allowed':'pointer',fontWeight:700,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",textAlign:'center',lineHeight:1.3}}>
                            {a.label}{rem>0&&<div style={{fontSize:'0.6rem',marginTop:'2px',color:'#3B4E63'}}>⏳{Math.ceil(rem/3600000)}s</div>}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'0.5rem'}}>
                      <Btn variant='ghost' size='sm' onClick={()=>setTransferModal(true)}>🔄 Liderliği Devret</Btn>
                      <Btn variant='danger' size='sm' onClick={()=>setDisbandConfirm(true)}>🗑️ Feshet</Btn>
                    </div>
                  </Card>
                )}

                <Card>
                  <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>👥 Üyeler ({myAlliance.memberCount||1})</div>
                  {(myAlliance.members||[]).map((muid,i)=>(
                    <div key={muid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.45rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(16,185,129,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem'}}>{muid===myAlliance.leaderId?'👑':'👤'}</div>
                        <div style={{fontSize:'0.82rem',fontWeight:700,color:muid===uid?'#6EE7B7':'#E8EDF2'}}>
                          {muid===uid?profile?.username:`Üye #${i+1}`}{muid===myAlliance.leaderId&&<span style={{marginLeft:'0.3rem'}}><Tag color='gold'>Lider</Tag></span>}
                        </div>
                      </div>
                      {isAllianceLeader&&muid!==myAlliance.leaderId&&(
                        <button onClick={()=>kickAllianceMember(muid)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',padding:'2px 8px',color:'#FCA5A5',cursor:'pointer',fontSize:'0.68rem',fontWeight:700}}>Çıkar</button>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {createModal && (
        <Modal title="🤝 İttifak Kur" onClose={()=>{setCreateModal(false);setAForm({name:'',tag:'',desc:'',type:'open'});}}>
          {[['name','İttifak Adı','İttifak adını girin',false],['tag','Etiket (Max 5)','ORG',false],['desc','Açıklama','Kısa bir açıklama...',true]].map(([k,l,ph,ta])=>(
            <div key={k} style={{marginBottom:'0.85rem'}}>
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>{l}</div>
              {ta ? <textarea value={aForm[k]} onChange={e=>setAForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} rows={2}
                style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
              : <input value={aForm[k]} onChange={e=>setAForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inpSt} />}
            </div>
          ))}
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Katılım Tipi</div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              {[['open','🔓 Açık'],['invite','🔒 Davet']].map(([v,l])=>(
                <button key={v} onClick={()=>setAForm(p=>({...p,type:v}))} style={{flex:1,padding:'0.55rem',borderRadius:'10px',border:`1px solid ${aForm.type===v?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.08)'}`,background:aForm.type===v?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.03)',color:aForm.type===v?'#10B981':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.6rem',fontSize:'0.78rem',color:'#F59E0B',marginBottom:'1rem'}}>
            💡 Kurmak {fmtWord(ALLIANCE_COST)} gerektirir. Bakiye: {fmtWord(profile?.money)}
          </div>
          <Btn variant='primary' size='full' onClick={createAlliance}>🤝 İttifak Kur</Btn>
        </Modal>
      )}

      {donateModal&&(
        <Modal title="💰 Kasaya Para Yatır" onClose={()=>{setDonateModal(false);setDonateAmt('');}}>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Tutar</div>
            <input type="number" value={donateAmt} onChange={e=>setDonateAmt(e.target.value)} placeholder="₱ Tutar" style={inpSt} />
            <div style={{display:'flex',gap:'0.4rem',marginTop:'0.5rem',flexWrap:'wrap'}}>
              {[10000,25000,50000,100000].map(n=><button key={n} onClick={()=>setDonateAmt(String(n))} style={{padding:'0.3rem 0.65rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>{fmtWord(n)}</button>)}
            </div>
          </div>
          <Btn variant='primary' size='full' onClick={donateToAlliance}>💰 Yatır</Btn>
        </Modal>
      )}

      {transferModal&&(
        <Modal title="🔄 Liderliği Devret" onClose={()=>{setTransferModal(false);setTransferTarget('');}}>
          <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#F59E0B',marginBottom:'1rem'}}>
            ⚠️ Liderliği devrettikten sonra artık lider yetkilerine sahip olmayacaksın.
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Yeni Lider Kullanıcı Adı</div>
            <input value={transferTarget} onChange={e=>setTransferTarget(e.target.value)} placeholder="İttifak üyesinin kullanıcı adı" style={inpSt} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>{setTransferModal(false);setTransferTarget('');}}>İptal</Btn>
            <Btn variant='primary' size='md' onClick={transferAllianceLeadership}>🔄 Devret</Btn>
          </div>
        </Modal>
      )}

      {disbandConfirm&&(
        <Modal title="🗑️ İttifakı Feshet" onClose={()=>setDisbandConfirm(false)}>
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#FCA5A5',marginBottom:'1rem'}}>
            ⚠️ Bu işlem geri alınamaz! <strong>{myAlliance?.name}</strong> ittifakı kalıcı olarak feshedilecek.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
            <Btn variant='ghost' size='md' onClick={()=>setDisbandConfirm(false)}>İptal</Btn>
            <Btn variant='red' size='md' onClick={disbandAlliance}>🗑️ Feshet</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OYUNCULAR SAYFASI
// ═══════════════════════════════════════════════════════
function PlayersPage({ profile, onNavigate, onlinePlayers = [] }) {
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tab, setTab] = useState('all');
  const [parties] = useLs('parties', []);
  const [gangs] = useLs('gangs', []);
  const [lbSub, setLbSub] = useState('money');
  const socketOnlineCnt = useOnlineCount();
  const onlineCnt = onlinePlayers.length || socketOnlineCnt;
  const onlineIds = new Set(onlinePlayers.map(p => p.userId||p.id||p.username));
  const [allUsers] = useState(() => {
    try { const v=localStorage.getItem('rep_users'); return v?JSON.parse(v):[]; } catch{return [];}
  });

  const me = profile;
  const selfEntry = me ? {
    id: me.uid||me.id||'me', username:me.username, city:me.city||'?',
    level:me.level||1, xp:me.xp||0, gender:me.gender||'male',
    premium:!!me.premium, money:me.money||0, email:me.email, role:me.role
  } : null;
  const combined = selfEntry
    ? [selfEntry, ...allUsers.filter(u=>u.id!==selfEntry.id && u.username!==selfEntry.username)]
    : allUsers;

  const filtered = combined.filter(p => !search ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );
  const topByMoney = [...combined].sort((a,b)=>(b.money||0)-(a.money||0));
  const topByXp = [...combined].sort((a,b)=>(b.xp||0)-(a.xp||0));
  const topByLevel = [...combined].sort((a,b)=>(b.level||1)-(a.level||1));

  const leaderboardData = lbSub==='money'?topByMoney:lbSub==='xp'?topByXp:topByLevel;
  const lbIcon = lbSub==='money'?'💰':lbSub==='xp'?'📊':'⭐';

  const rankIcon = i => ['🥇','🥈','🥉'][i] || `${i+1}.`;

  return (
    <div style={{padding:'0.7rem'}}>
      {/* Arama */}
      <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0 0.85rem',marginBottom:'0.75rem'}}>
        <span style={{color:'#3B4E63',marginRight:'0.5rem'}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Oyuncu / şehir ara..."
          style={{flex:1,background:'none',border:'none',outline:'none',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',padding:'0.6rem 0'}} />
      </div>

      {/* Tab */}
      <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
        {[['all',`👥 Tümü (${combined.length})`],['online',`🟢 Çevrimiçi (${onlinePlayers.length||onlineCnt})`],['top','🏆 Liderlik']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:'0.38rem 0.5rem',borderRadius:'8px',border:`1px solid ${tab===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,background:tab===v?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:tab===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.7rem',cursor:'pointer',whiteSpace:'nowrap'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Online badge */}
      <div style={{display:'inline-flex',alignItems:'center',gap:'5px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'20px',padding:'4px 12px',marginBottom:'0.75rem',fontSize:'0.72rem',fontWeight:700,color:'#10B981'}}>
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10B981',animation:'pulse 2s infinite'}} />
        {onlinePlayers.length||onlineCnt} çevrimiçi oyuncu
      </div>

      {/* Liderlik alt tablar */}
      {tab==='top' && (
        <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
          {[['money','💰 En Zengin'],['xp','📊 En Çok XP'],['level','⭐ En Yüksek Seviye']].map(([v,l])=>(
            <button key={v} onClick={()=>setLbSub(v)} style={{flex:1,padding:'0.3rem 0.4rem',borderRadius:'7px',border:`1px solid ${lbSub===v?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.07)'}`,background:lbSub===v?'rgba(245,158,11,0.1)':'rgba(255,255,255,0.03)',color:lbSub===v?'#F59E0B':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.65rem',cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Çevrimiçi tab */}
      {tab==='online' && onlinePlayers.length===0 && (
        <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>👤</div>
          Şu an başka çevrimiçi oyuncu yok
        </div>
      )}
      {tab==='online' && onlinePlayers.map((op,i) => {
        const pData = combined.find(u => u.id===op.userId||u.username===op.username) || {username:op.username, city:op.city||'?', level:op.level||1, xp:0};
        return (
          <button key={op.userId||op.username||i} onClick={()=>setSelectedPlayer(pData)}
            style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.18)',borderRadius:'12px',width:'100%',marginBottom:'0.4rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s',textAlign:'left'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <Avatar profile={pData} size={42} />
              <div style={{position:'absolute',bottom:0,right:0,width:'10px',height:'10px',borderRadius:'50%',background:'#10B981',border:'2px solid #0F172A'}} />
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                <span style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{op.username}</span>
                <span style={{background:'rgba(16,185,129,0.15)',color:'#10B981',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>CANLI</span>
                {pData.premium && <span style={{background:'linear-gradient(90deg,#A78BFA,#7C3AED)',color:'#fff',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>VIP</span>}
              </div>
              <div style={{fontSize:'0.68rem',color:'#5A7089'}}>{op.city||'?'} • Lv.{op.level||1}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:'0.72rem',color:'#10B981',fontWeight:700}}>{fmtM(op.money||0)}</div>
              <span style={{color:'#3B4E63',fontSize:'0.85rem'}}>›</span>
            </div>
          </button>
        );
      })}

      {/* Oyuncu listesi (all/top) */}
      {tab!=='online' && (tab==='top'?leaderboardData:filtered).map((p,i) => {
        const isOnline = onlineIds.has(p.id)||onlineIds.has(p.username);
        return (
        <button key={p.id||p.username} onClick={()=>setSelectedPlayer(p)}
          style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background: p.username===profile?.username?'rgba(59,130,246,0.08)':'rgba(15,28,48,0.85)',border:`1px solid ${p.username===profile?.username?'rgba(59,130,246,0.2)':isOnline?'rgba(16,185,129,0.18)':'rgba(255,255,255,0.05)'}`,borderRadius:'12px',width:'100%',marginBottom:'0.4rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s',textAlign:'left'}}>
          {tab==='top' && (
            <div style={{width:'28px',textAlign:'center',fontSize:'1rem',flexShrink:0}}>{rankIcon(i)}</div>
          )}
          <div style={{position:'relative',flexShrink:0}}>
            <Avatar profile={p} size={42} />
            {isOnline && <div style={{position:'absolute',bottom:0,right:0,width:'10px',height:'10px',borderRadius:'50%',background:'#10B981',border:'2px solid #0F172A'}} />}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
              <span style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{p.username}</span>
              {isOnline && <span style={{background:'rgba(16,185,129,0.15)',color:'#10B981',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>●</span>}
              {p.premium && <span style={{background:'linear-gradient(90deg,#A78BFA,#7C3AED)',color:'#fff',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>VIP</span>}
              {p.role==='admin' && <span style={{background:'rgba(245,158,11,0.15)',color:'#F59E0B',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>ADMIN</span>}
              {p.username===profile?.username && <span style={{background:'rgba(59,130,246,0.15)',color:'#60A5FA',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>SEN</span>}
            </div>
            <div style={{fontSize:'0.68rem',color:'#5A7089'}}>{p.city||'?'} • Lv.{p.level||1} • {getLevelInfo(p.xp||0).title}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            {tab==='top' ? (
              <div style={{fontSize:'0.78rem',color:lbIcon==='💰'?'#10B981':lbIcon==='📊'?'#3B82F6':'#F59E0B',fontWeight:800}}>
                {lbSub==='money'?fmtM(p.money||0):lbSub==='xp'?`${fmt(p.xp||0)} XP`:`Lv.${p.level||1}`}
              </div>
            ) : (
              <div style={{fontSize:'0.72rem',color:'#10B981',fontWeight:700}}>{fmtM(p.money||0)}</div>
            )}
            <span style={{color:'#3B4E63',fontSize:'0.85rem'}}>›</span>
          </div>
        </button>
        );
      })}
      {tab!=='online' && (tab==='top'?leaderboardData:filtered).length===0 && (
        <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>
          {search ? 'Oyuncu bulunamadı' : 'Henüz kayıtlı oyuncu yok'}
        </div>
      )}

      {selectedPlayer && (() => {
        const sp = selectedPlayer;
        const spLvl = getLevelInfo(sp.xp||0);
        const spParty = parties.find(p => p.leaderId===sp.id || p.leaderId===sp.uid || (p.members||[]).includes(sp.id) || (p.members||[]).includes(sp.uid));
        const spGang  = gangs.find(g => g.leaderId===sp.id || g.leaderId===sp.uid || (g.members||[]).includes(sp.id) || (g.members||[]).includes(sp.uid));
        const isMe = sp.username === profile?.username;
        return (
          <Modal title={`👤 ${sp.username}`} onClose={()=>setSelectedPlayer(null)}>
            {/* Banner & Avatar */}
            {sp.bannerUrl && <div style={{height:'80px',borderRadius:'12px',overflow:'hidden',marginBottom:'-30px',background:`url(${sp.bannerUrl}) center/cover no-repeat`,position:'relative'}}><div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(15,23,42,0.9))'}} /></div>}
            <div style={{textAlign:'center',marginBottom:'0.85rem',paddingTop: sp.bannerUrl ? '0.4rem' : '0'}}>
              <div style={{display:'inline-block',borderRadius:'50%',border:'3px solid #1E3A5F',background:'#0F172A'}}>
                <Avatar profile={sp} size={68} />
              </div>
              <div style={{fontWeight:800,fontSize:'1.05rem',color:'#E8EDF2',marginTop:'0.4rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
                {sp.username}
                {sp.premium && <span style={{background:'linear-gradient(90deg,#A78BFA,#7C3AED)',color:'#fff',fontSize:'0.5rem',fontWeight:800,padding:'2px 6px',borderRadius:'8px'}}>VIP</span>}
                {sp.role==='admin' && <span style={{background:'rgba(245,158,11,0.15)',color:'#F59E0B',fontSize:'0.5rem',fontWeight:800,padding:'2px 6px',borderRadius:'8px'}}>ADMIN</span>}
                {isMe && <span style={{background:'rgba(59,130,246,0.15)',color:'#60A5FA',fontSize:'0.5rem',fontWeight:800,padding:'2px 6px',borderRadius:'8px'}}>SEN</span>}
              </div>
              <div style={{fontSize:'0.72rem',color:'#F59E0B',fontWeight:700,marginTop:'0.15rem'}}>{spLvl.title}</div>
              <div style={{fontSize:'0.68rem',color:'#5A7089',marginTop:'0.08rem'}}>{sp.city||'?'} • Lv.{spLvl.lvl}</div>
            </div>

            {/* Parti / Çete */}
            {(spParty||spGang) && (
              <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem',justifyContent:'center'}}>
                {spParty && <div style={{background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'10px',padding:'0.3rem 0.75rem',fontSize:'0.7rem',color:'#60A5FA',fontWeight:700}}>🏛️ {spParty.name}</div>}
                {spGang  && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'10px',padding:'0.3rem 0.75rem',fontSize:'0.7rem',color:'#FCA5A5',fontWeight:700}}>💀 {spGang.name}</div>}
              </div>
            )}

            {/* İstatistikler */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.45rem',marginBottom:'0.75rem'}}>
              {[
                ['💰','Para',fmtM(sp.money||0),'#10B981'],
                ['🪙','PoliGold',fmt(sp.underCoin||0)+' UC','#A78BFA'],
                ['📊','XP',fmt(sp.xp||0)+' XP','#3B82F6'],
                ['🏙️','Şehir',sp.city||'?','#94A3B8'],
              ].map(([ic,lb,v,clr])=>(
                <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'0.6rem',textAlign:'center'}}>
                  <div style={{fontSize:'0.58rem',color:'#3B4E63',textTransform:'uppercase',marginBottom:'0.2rem'}}>{ic} {lb}</div>
                  <div style={{fontWeight:700,color:clr,fontSize:'0.88rem'}}>{v}</div>
                </div>
              ))}
            </div>

            {/* XP ilerleme çubuğu */}
            <div style={{marginBottom:'0.75rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.6rem',color:'#5A7089',marginBottom:'4px'}}>
                <span>Lv.{spLvl.lvl} — {spLvl.title}</span>
                <span>{spLvl.pct}%</span>
              </div>
              <div style={{height:'5px',background:'rgba(255,255,255,0.06)',borderRadius:'3px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${spLvl.pct}%`,background:'linear-gradient(90deg,#3B82F6,#8B5CF6)',borderRadius:'3px',transition:'width 0.5s'}} />
              </div>
            </div>

            {/* Cinsiyet & Kayıt */}
            {sp.registeredAt && (
              <div style={{textAlign:'center',fontSize:'0.63rem',color:'#3B4E63',marginBottom:'0.6rem'}}>
                Üye: {new Date(sp.registeredAt).toLocaleDateString('tr-TR')}
              </div>
            )}
            {!isMe && onNavigate && (
              <button onClick={()=>{ setSelectedPlayer(null); onNavigate('dm'); }} style={{width:'100%',padding:'0.7rem',background:'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.12))',border:'1px solid rgba(59,130,246,0.35)',borderRadius:'12px',color:'#60A5FA',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.88rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
                💬 Mesaj Gönder
              </button>
            )}
          </Modal>
        );
      })()}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PROFİL SAYFASI
// ═══════════════════════════════════════════════════════
function ProfilePage({ profile, setProfile, onLogout, showNotif }) {
  const { dark, toggle } = useTheme();
  const lvl = getLevelInfo(profile?.xp || 0);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: profile?.username||'', city: profile?.city||'İstanbul' });
  const [tab, setTab] = useState('stats');
  const [photoUrlInput, setPhotoUrlInput] = useState(profile?.photoUrl||'');
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile?.avatarUrl||'');
  const [bannerUrlInput, setBannerUrlInput] = useState(profile?.bannerUrl||'');
  const fileInputRef = useRef(null);
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showNotif('Sadece resim dosyaları desteklenir', 'error'); return; }
    if (file.size > 3 * 1024 * 1024) { showNotif('Dosya 3MB\'dan küçük olmalı', 'error'); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const u = {...profile, avatarUrl: dataUrl};
      setProfile(u);
      localStorage.setItem('rep_userProfile', JSON.stringify(u));
      if (u.uid) { try { await saveUserProfile(u.uid, u); } catch {} }
      showNotif('✅ Profil fotoğrafı yüklendi!', 'success');
    };
    reader.readAsDataURL(file);
  };
  const inputSt = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'};
  const savePhotoUrl = async () => {
    const u = {...profile, photoUrl: photoUrlInput.trim()};
    setProfile(u); localStorage.setItem('rep_userProfile', JSON.stringify(u));
    if (u.uid) await saveUserProfile(u.uid, u);
    showNotif('✅ Profil fotoğrafı güncellendi', 'success');
  };
  const saveAvatarUrl = async () => {
    const u = {...profile, avatarUrl: avatarUrlInput.trim()};
    setProfile(u); localStorage.setItem('rep_userProfile', JSON.stringify(u));
    if (u.uid) await saveUserProfile(u.uid, u);
    showNotif('✅ GIF avatar güncellendi', 'success');
  };
  const saveVipFrame = async (frameId) => {
    const u = {...profile, vipFrame: frameId};
    setProfile(u); localStorage.setItem('rep_userProfile', JSON.stringify(u));
    if (u.uid) await saveUserProfile(u.uid, u);
    showNotif(`✅ Çerçeve seçildi: ${frameId||'Yok'}`, 'success');
  };
  const saveBannerUrl = async () => {
    const u = {...profile, bannerUrl: bannerUrlInput.trim()};
    setProfile(u); localStorage.setItem('rep_userProfile', JSON.stringify(u));
    if (u.uid) await saveUserProfile(u.uid, u);
    showNotif('✅ Banner güncellendi', 'success');
  };

  const saveProfile = async () => {
    if (!editForm.username.trim()) { showNotif('Kullanıcı adı boş olamaz', 'error'); return; }
    const updated = { ...profile, username:editForm.username.trim(), city:editForm.city };
    setProfile(updated);
    localStorage.setItem('rep_userProfile', JSON.stringify(updated));
    if (profile?.uid) await saveUserProfile(profile.uid, updated);
    setEditModal(false);
    showNotif('✅ Profil güncellendi', 'success');
  };

  const lsState = {};
  ['parties','holdings','stockPortfolio','gangs','laws','elections','userFarms','alliances'].forEach(k=>{
    try{const v=localStorage.getItem('rep_'+k);lsState[k]=v?JSON.parse(v):null;}catch{}
  });
  const achievements = ACHIEVEMENTS_LIST.map(a => {
    let done = false;
    try { done = a.check(profile||{}, lsState); } catch{}
    return { id:a.id, name:a.title, icon:a.icon, desc:a.desc, done:!!done };
  });
  const earnedCount = achievements.filter(a=>a.done).length;

  return (
    <div style={{padding:'0.7rem'}}>
      {/* Profil kartı */}
      <div style={{marginBottom:'0.75rem',borderRadius:'16px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)',boxShadow:'0 4px 24px rgba(0,0,0,0.35)'}}>
        {profile?.bannerUrl && (
          <div style={{height:'80px',backgroundImage:`url(${profile.bannerUrl})`,backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(11,21,39,0.7))'}}/>
          </div>
        )}
        <div style={{textAlign:'center',padding:'1.25rem 1rem',background:'linear-gradient(135deg,rgba(11,21,39,0.97),rgba(15,31,54,0.95))'}}>
          <div style={{marginBottom:'0.65rem',marginTop:profile?.bannerUrl?'-28px':'0',position:'relative',display:'inline-block'}}>
            <Avatar profile={profile} size={72} />
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
            <div style={{fontWeight:900,fontSize:'1.15rem',color:'#E8EDF2'}}>{profile?.username || 'Oyuncu'}</div>
            {profile?.premium && <span style={{background:'linear-gradient(90deg,#F59E0B,#D97706)',color:'#000',fontSize:'0.55rem',fontWeight:800,padding:'2px 6px',borderRadius:'8px'}}>VIP</span>}
          </div>
          <div style={{fontSize:'0.75rem',color:'#5A7089',marginBottom:'0.65rem'}}>{lvl.title} • {profile?.city} • Üye: {profile?.registeredAt ? new Date(profile.registeredAt).toLocaleDateString('tr-TR') : '-'}</div>
          <div style={{marginBottom:'0.4rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#3B4E63',marginBottom:'0.25rem'}}>
              <span>Lv.{lvl.lvl}</span><span>{fmt(profile?.xp||0)} / {fmt(lvl.next.xp)} XP</span><span>Lv.{lvl.next.lvl}</span>
            </div>
            <ProgressBar pct={lvl.pct} color='#3B82F6' h={8} />
          </div>
          <div style={{display:'flex',gap:'0.4rem',justifyContent:'center',marginTop:'0.65rem'}}>
            <Btn variant='ghost' size='sm' onClick={()=>setEditModal(true)}>✏️ Düzenle</Btn>
            <Btn variant='danger' size='sm' onClick={onLogout}>🚪 Çıkış</Btn>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
        {[['stats','📊 İstatistik'],['achievements',`🏆 (${earnedCount}/${achievements.length})`],['customize','📸 Özelleştir'],['settings','⚙️ Ayarlar']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:'0.4rem 0.4rem',borderRadius:'8px',border:`1px solid ${tab===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,background:tab===v?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:tab===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>
            {l}
          </button>
        ))}
      </div>

      {tab==='stats' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.5rem'}}>
            {[
              ['💰','Nakit',fmtM(profile?.money),'#10B981'],
              ['🏦','Banka',fmtM(profile?.bank),'#3B82F6'],
              ['🪙','PoliGold',fmtUC(profile?.underCoin),'#F59E0B'],
              ['🏅','Liyakat',fmt(profile?.meritPoints),'#8B5CF6'],
              ['🤝','Ticaret Puanı',fmt(profile?.tradePoints),'#06B6D4'],
              ['🎓','Eğitim',EDU_LEVELS.find(e=>e.id===(profile?.education?.diploma||'ilkokul'))?.label||'İlkokul','#3B82F6'],
              ['❤️','Sağlık',`${profile?.health||100}%`,'#EF4444'],
              ['😊','Mutluluk',`${profile?.happiness||80}%`,'#EC4899'],
              ['⚡','Enerji',`${profile?.energy||100}%`,'#F59E0B'],
              ['📊','Seviye',`Lv.${profile?.level||1}`,'#3B82F6'],
            ].map(([ic,lb,v,c])=>(
              <Card key={lb} style={{padding:'0.75rem'}}>
                <div style={{fontSize:'0.6rem',color:'#3B4E63',textTransform:'uppercase',marginBottom:'0.2rem'}}>{ic} {lb}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:c,fontSize:'0.95rem'}}>{v}</div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{fontSize:'0.72rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',marginBottom:'0.6rem'}}>📈 Aktivite</div>
            {[['💬','Mesaj',profile?.stats?.messages||0],['🤝','Ticaret',profile?.stats?.trades||0],['⚔️','Savaş',profile?.stats?.battles||0],['🗳️','Oy',profile?.stats?.votes||0]].map(([ic,lb,v])=>(
              <div key={lb} style={{display:'flex',justifyContent:'space-between',padding:'0.45rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span style={{color:'#8BA0B5',fontSize:'0.85rem'}}>{ic} {lb}</span>
                <span style={{color:'#E8EDF2',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.85rem'}}>{fmt(v)}</span>
              </div>
            ))}
          </Card>
          {/* Oy Katsayısı Kartı */}
          {(()=>{
            const allU=(()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
            // Ticaret sıralaması
            const sortedTrade=[...allU].sort((a,b)=>(b.tradePoints||0)-(a.tradePoints||0));
            const tradeRank=sortedTrade.findIndex(u=>u.id===profile?.id)+1;
            const tradeBonus=tradeRank===1?6:tradeRank===2?4:tradeRank<=5?3:tradeRank<=50?2:1;
            const tradeColor=tradeBonus>=6?'#F59E0B':tradeBonus>=4?'#FB923C':tradeBonus>=3?'#A78BFA':tradeBonus>=2?'#60A5FA':'#5A7089';
            const tradeLabel=tradeBonus===6?'🏆 1. Sıra':tradeBonus===4?'🥈 2. Sıra':tradeBonus===3?'🥉 3-5. Sıra':tradeBonus===2?'📈 6-50. Sıra':'51+. Sıra';
            // Eğitim sıralaması
            const sortedEdu=[...allU].sort((a,b)=>(b.educationProgress||0)-(a.educationProgress||0));
            const eduRank=sortedEdu.findIndex(u=>u.id===profile?.id)+1;
            const eduBonus=eduRank===1?3:eduRank<=3?2:eduRank<=10?1:0;
            const eduColor=eduBonus>=3?'#F59E0B':eduBonus>=2?'#A78BFA':eduBonus>=1?'#60A5FA':'#5A7089';
            const eduLabel=eduBonus===3?'🏆 1. Sıra':eduBonus===2?'🥈 2-3. Sıra':eduBonus===1?'🥉 4-10. Sıra':'—';
            // UC katsayısı
            const ucBonus=profile?.voteMultiplier||0;
            // Toplam
            const total=tradeBonus+eduBonus+ucBonus;
            const totalColor=total>=8?'#F59E0B':total>=5?'#A78BFA':total>=3?'#60A5FA':'#10B981';
            return (
              <Card style={{marginTop:'0.5rem',background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.18)'}}>
                <div style={{fontSize:'0.72rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',marginBottom:'0.6rem'}}>🗳️ Oy Katsayısı Detayı</div>
                {/* Ticaret Sıralaması */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.38rem 0.4rem',borderRadius:'6px',background:'rgba(96,165,250,0.05)',marginBottom:'0.25rem'}}>
                  <div>
                    <span style={{color:'#8BA0B5',fontSize:'0.8rem'}}>📊 Ticaret Sıralaması</span>
                    <span style={{color:'#3B4E63',fontSize:'0.68rem',marginLeft:'0.3rem'}}>#{tradeRank>0?tradeRank:'?'}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{color:tradeColor,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.78rem'}}>{tradeLabel}</span>
                    <span style={{color:tradeColor,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.82rem',marginLeft:'0.4rem'}}>{tradeBonus}x</span>
                  </div>
                </div>
                {/* Eğitim Sıralaması */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.38rem 0.4rem',borderRadius:'6px',background:'rgba(167,139,250,0.05)',marginBottom:'0.25rem'}}>
                  <div>
                    <span style={{color:'#8BA0B5',fontSize:'0.8rem'}}>🎓 Eğitim Sıralaması</span>
                    <span style={{color:'#3B4E63',fontSize:'0.68rem',marginLeft:'0.3rem'}}>#{eduRank>0?eduRank:'?'}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{color:eduColor,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.78rem'}}>{eduLabel}</span>
                    <span style={{color:eduBonus>0?eduColor:'#3B4E63',fontWeight:900,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.82rem',marginLeft:'0.4rem'}}>{eduBonus>0?`+${eduBonus}`:'—'}</span>
                  </div>
                </div>
                {/* UC Katsayısı */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.38rem 0.4rem',borderRadius:'6px',background:'rgba(245,158,11,0.05)',marginBottom:'0.3rem'}}>
                  <div>
                    <span style={{color:'#8BA0B5',fontSize:'0.8rem'}}>🪙 PoliGold Katsayısı</span>
                    <span style={{color:'#3B4E63',fontSize:'0.68rem',marginLeft:'0.3rem'}}>Ekonomi→UC</span>
                  </div>
                  <span style={{color:ucBonus>0?'#F59E0B':'#3B4E63',fontWeight:900,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.82rem'}}>{ucBonus>0?`+${ucBonus}`:'—'}</span>
                </div>
                {/* Toplam */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.45rem 0.6rem',borderRadius:'8px',background:'rgba(16,185,129,0.08)',border:`1px solid ${totalColor}30`}}>
                  <span style={{color:'#E8EDF2',fontSize:'0.82rem',fontWeight:700}}>⚡ Toplam Oy Katsayısı</span>
                  <span style={{color:totalColor,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",fontSize:'1rem'}}>{total}x</span>
                </div>
                {/* Açıklama */}
                <div style={{fontSize:'0.59rem',color:'#3B4E63',marginTop:'0.4rem',lineHeight:1.5}}>
                  <div>📊 Ticaret: 1.→6x · 2.→4x · 3-5.→3x · 6-50.→2x · 51+→1x</div>
                  <div>🎓 Eğitim: 1.→+3 · 2-3.→+2 · 4-10.→+1</div>
                  <div>🪙 UC: Her 500 PG → +1 katsayı (Ekonomi → Dönüşüm)</div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {tab==='achievements' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
          {achievements.map(a => (
            <Card key={a.id} style={{padding:'0.85rem',textAlign:'center',opacity:a.done?1:0.4,border:`1px solid ${a.done?'rgba(245,158,11,0.25)':'rgba(255,255,255,0.05)'}`}}>
              <div style={{fontSize:'1.75rem',marginBottom:'0.35rem'}}>{a.icon}</div>
              <div style={{fontWeight:800,color:a.done?'#F59E0B':'#5A7089',fontSize:'0.8rem',marginBottom:'0.2rem'}}>{a.name}</div>
              <div style={{fontSize:'0.63rem',color:'#3B4E63'}}>{a.desc}</div>
              {a.done && <div style={{fontSize:'0.6rem',color:'#10B981',marginTop:'0.3rem'}}>✅ Tamamlandı</div>}
            </Card>
          ))}
        </div>
      )}

      {tab==='settings' && (
        <Card>
          <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.75rem'}}>⚙️ Hesap Ayarları</div>

          {/* Dil Seçimi */}
          <div style={{padding:'0.6rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',marginBottom:'0.35rem'}}>
            <div style={{fontSize:'0.75rem',color:'#5A7089',marginBottom:'0.45rem'}}>🌐 Dil / Language / Sprache / Dil</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.35rem'}}>
              {[['tr','🇹🇷 Türkçe'],['en','🇬🇧 English'],['de','🇩🇪 Deutsch'],['az','🇦🇿 Azərbaycanca']].map(([code,label])=>(
                <button key={code} onClick={async()=>{ const u={...profile,lang:code}; setProfile(u); localStorage.setItem('rep_userProfile',JSON.stringify(u)); if(u.uid){try{await saveUserProfile(u.uid,u);}catch{}} showNotif(`✅ Dil değiştirildi: ${label}`,'success'); }}
                  style={{padding:'0.45rem 0.5rem',borderRadius:'8px',border:`1px solid ${(profile?.lang||'tr')===code?'rgba(59,130,246,0.5)':'rgba(255,255,255,0.08)'}`,background:(profile?.lang||'tr')===code?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.03)',color:(profile?.lang||'tr')===code?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer',textAlign:'center'}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <span style={{color:'#5A7089',fontSize:'0.85rem'}}>{dark ? '☀️ Aydınlık Mod' : '🌙 Karanlık Mod'}</span>
            <button onClick={toggle} style={{background:dark?'#3B82F6':'rgba(255,255,255,0.08)',border:'none',borderRadius:'20px',padding:'0.3rem 0.85rem',color:'#fff',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>
              {dark ? 'Açık' : 'Kapalı'}
            </button>
          </div>
          {[
            ['📧','E-posta',profile?.email||'-'],
            ['🏙️','Şehir',profile?.city||'-'],
            ['👤','Cinsiyet',profile?.gender==='female'?'Kadın':'Erkek'],
            ['📅','Kayıt',profile?.registeredAt ? new Date(profile.registeredAt).toLocaleDateString('tr-TR') : '-'],
          ].map(([ic,lb,v])=>(
            <div key={lb} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{color:'#5A7089',fontSize:'0.85rem'}}>{ic} {lb}</span>
              <span style={{color:'#E8EDF2',fontWeight:600,fontSize:'0.85rem'}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:'0.75rem'}}>
            <Btn variant='primary' size='full' onClick={()=>setEditModal(true)}>✏️ Profili Düzenle</Btn>
          </div>
        </Card>
      )}

      {tab==='customize' && (
        <div>
          <Card style={{marginBottom:'0.65rem'}}>
            <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.3rem',fontSize:'0.85rem'}}>📸 Profil Fotoğrafı</div>

            {/* Telefondan Yükle */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{display:'none'}} />
            <button onClick={()=>fileInputRef.current?.click()} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',padding:'0.7rem',marginBottom:'0.6rem',borderRadius:'12px',border:'2px dashed rgba(59,130,246,0.35)',background:'rgba(59,130,246,0.06)',color:'#60A5FA',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
              📱 Telefondan / Galeriden Seç
            </button>

            <div style={{fontSize:'0.65rem',color:'#5A7089',marginBottom:'0.4rem',textAlign:'center'}}>veya URL ile gir</div>
            <div style={{fontSize:'0.68rem',color:'#5A7089',marginBottom:'0.4rem'}}>URL gir (.jpg, .png, .gif, .webp)</div>
            <input value={photoUrlInput} onChange={e=>setPhotoUrlInput(e.target.value)} placeholder="https://resim-url.com/foto.jpg" style={inputSt}/>
            {photoUrlInput && <img src={photoUrlInput} alt="preview" style={{width:'52px',height:'52px',borderRadius:'50%',objectFit:'cover',marginTop:'0.5rem',border:'2px solid rgba(59,130,246,0.3)',display:'block'}} onError={e=>e.target.style.display='none'}/>}
            <Btn variant='primary' size='full' onClick={savePhotoUrl} style={{marginTop:'0.5rem'}}>✅ URL Kaydet</Btn>
          </Card>

          {profile?.premium ? (
            <>
              <Card style={{marginBottom:'0.65rem',background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(11,21,39,0.95))'}}>
                <div style={{fontWeight:700,color:'#A78BFA',marginBottom:'0.55rem',fontSize:'0.85rem'}}>💎 VIP Çerçeve Stili</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.35rem',marginBottom:'0.5rem'}}>
                  {[{id:'rainbow',label:'🌈 Gökkuşağı'},{id:'fire',label:'🔥 Ateş'},{id:'ice',label:'❄️ Buz'},{id:'gold',label:'✨ Altın'},{id:'neon',label:'💚 Neon'},{id:'violet',label:'💜 Mor'},{id:'heart',label:'💗 Kalp'},{id:'',label:'⭕ Yok'}].map(({id,label})=>(
                    <button key={id||'none'} onClick={()=>saveVipFrame(id)}
                      style={{padding:'0.4rem 0.15rem',borderRadius:'8px',border:`2px solid ${(profile?.vipFrame||'')===(id)?'#A78BFA':'rgba(255,255,255,0.08)'}`,background:(profile?.vipFrame||'')===(id)?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.02)',color:(profile?.vipFrame||'')===(id)?'#A78BFA':'#5A7089',cursor:'pointer',fontSize:'0.6rem',fontWeight:700,fontFamily:"'DM Sans',sans-serif",textAlign:'center',lineHeight:1.3}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:'0.65rem',color:'#5A7089'}}>Seçili: <span style={{color:'#A78BFA',fontWeight:700}}>{profile?.vipFrame||'Yok'}</span></div>
              </Card>

              <Card style={{marginBottom:'0.65rem',background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(11,21,39,0.95))'}}>
                <div style={{fontWeight:700,color:'#A78BFA',marginBottom:'0.3rem',fontSize:'0.85rem'}}>🎭 GIF / Animasyonlu Avatar URL</div>
                <div style={{fontSize:'0.68rem',color:'#5A7089',marginBottom:'0.5rem'}}>Animasyonlu avatar (GIF desteği mevcut)</div>
                <input value={avatarUrlInput} onChange={e=>setAvatarUrlInput(e.target.value)} placeholder="https://i.giphy.com/xxxx.gif" style={inputSt}/>
                <Btn variant='ghost' size='full' onClick={saveAvatarUrl} style={{marginTop:'0.5rem'}}>✅ Kaydet</Btn>
              </Card>

              <Card style={{background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(11,21,39,0.95))'}}>
                <div style={{fontWeight:700,color:'#A78BFA',marginBottom:'0.3rem',fontSize:'0.85rem'}}>🖼️ Profil Banner / Arka Plan</div>
                <div style={{fontSize:'0.68rem',color:'#5A7089',marginBottom:'0.5rem'}}>Profil kartı arka plan görseli (GIF veya resim URL)</div>
                <input value={bannerUrlInput} onChange={e=>setBannerUrlInput(e.target.value)} placeholder="https://example.com/banner.gif" style={inputSt}/>
                <Btn variant='ghost' size='full' onClick={saveBannerUrl} style={{marginTop:'0.5rem'}}>✅ Kaydet</Btn>
              </Card>
            </>
          ) : (
            <Card style={{textAlign:'center',padding:'1.75rem 1rem',background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(11,21,39,0.95))'}}>
              <div style={{fontSize:'2.2rem',marginBottom:'0.5rem'}}>💎</div>
              <div style={{fontWeight:800,color:'#A78BFA',fontSize:'0.95rem',marginBottom:'0.3rem'}}>VIP Özelleştirme</div>
              <div style={{fontSize:'0.75rem',color:'#5A7089',marginBottom:'0.75rem'}}>Çerçeve, GIF avatar ve profil banner için VIP üyelik gereklidir</div>
              <Btn variant='ghost' onClick={()=>showNotif('Premium sayfasına yönlendiriliyor... 💎','gold')}>💎 VIP Ol</Btn>
            </Card>
          )}
        </div>
      )}

      {editModal && (
        <Modal title="✏️ Profili Düzenle" onClose={()=>setEditModal(false)}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Kullanıcı Adı</div>
            <input value={editForm.username} onChange={e=>setEditForm(p=>({...p,username:e.target.value}))}
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Şehir</div>
            <select value={editForm.city} onChange={e=>setEditForm(p=>({...p,city:e.target.value}))}
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}}>
              {CITIES.map(c=><option key={c} value={c} style={{background:'#0B1527'}}>{c}</option>)}
            </select>
          </div>
          <Btn variant='primary' size='full' onClick={saveProfile}>✅ Kaydet</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PREMİUM SAYFASI
// ═══════════════════════════════════════════════════════
function PremiumPage({ profile, setProfile, showNotif }) {
  const benefits = [
    ['💎','VIP Çerçeve','Özel profil çerçevesi'],
    ['⚡','2x XP','Tüm aktivitelerden 2 kat XP'],
    ['📈','5x Çiftlik','Tarım geliri 5 kat daha fazla'],
    ['🚫','Reklamsız','Hiçbir reklam görmezsin'],
    ['💬','Premium Chat','Özel renk ve rozet'],
    ['🎁','Günlük Kutu','Her gün özel ödül kutusu'],
    ['🏦','Yüksek Faiz','%2 günlük faiz (normal %0.5)'],
    ['🤝','Sonsuz İttifak','Sınırsız ittifak etkinliği'],
  ];

  const plans = [
    { id:'month', label:'Aylık VIP', price:249.99, uc:0, days:30, badge:'⭐', popular:true },
    { id:'year',  label:'Yıllık VIP', price:2499.99, uc:0, days:365, badge:'💎', save:'%17 Tasarruf' },
    { id:'uc',   label:'UC ile Al', price:0, uc:500, days:30, badge:'🪙', desc:'500 PG ile 1 aylık VIP' },
  ];

  return (
    <div style={{padding:'0.7rem'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,#1a0a2e,#2d1060)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'20px',padding:'1.5rem',textAlign:'center',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>💎</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#fff',marginBottom:'0.25rem'}}>UOLİTİKON VIP</div>
        <div style={{fontSize:'0.78rem',color:'#C4B5FD'}}>Premium üyelik ile tüm avantajların kilidini aç</div>
        {profile?.premium && <Tag color='violet' style={{marginTop:'0.5rem'}}>✅ Aktif VIP Üye</Tag>}
      </div>

      {/* Avantajlar */}
      <Card style={{marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.72rem',color:'#A78BFA',fontWeight:800,textTransform:'uppercase',marginBottom:'0.7rem',letterSpacing:'0.08em'}}>💎 VIP Avantajları</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
          {benefits.map(([ic,name,desc])=>(
            <div key={name} style={{background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:'10px',padding:'0.65rem',display:'flex',flexDirection:'column',gap:'0.2rem'}}>
              <span style={{fontSize:'1.1rem'}}>{ic}</span>
              <span style={{fontSize:'0.78rem',fontWeight:700,color:'#E8EDF2'}}>{name}</span>
              <span style={{fontSize:'0.62rem',color:'#5A7089'}}>{desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Planlar */}
      <div style={{fontSize:'0.72rem',color:'#5A7089',fontWeight:800,textTransform:'uppercase',marginBottom:'0.5rem',letterSpacing:'0.08em'}}>💳 Planlar</div>
      {plans.map(p => (
        <div key={p.id} style={{background:p.popular?'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(11,21,39,0.9))':'rgba(11,21,39,0.85)',border:`1px solid ${p.popular?'rgba(167,139,250,0.4)':'rgba(255,255,255,0.06)'}`,borderRadius:'14px',padding:'0.85rem',marginBottom:'0.4rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <div style={{fontSize:'1.5rem',width:'36px',textAlign:'center',flexShrink:0}}>{p.badge}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <span style={{fontWeight:800,color:'#E8EDF2'}}>{p.label}</span>
              {p.popular && <Tag color='violet'>En Popüler</Tag>}
              {p.save && <Tag color='green'>{p.save}</Tag>}
            </div>
            <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{p.days} gün VIP</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:900,color:'#A78BFA',fontSize:'1rem'}}>{p.price>0 ? `₱${p.price}` : `${p.uc} PG`}</div>
            <Btn variant='ghost' size='sm' onClick={()=>showNotif('Ödeme sistemi yakında aktif! 💎','gold')} style={{marginTop:'0.25rem'}}>Satın Al</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MARKET / MAĞAZA SAYFASI
// ═══════════════════════════════════════════════════════
const UC_PACKAGES = [
  { id:'uc70',   uc:70,    price:65,    bonus:'',          badge:'🪙', popular:false },
  { id:'uc200',  uc:200,   price:180,   bonus:'+15 bonus', badge:'🪙', popular:false },
  { id:'uc500',  uc:500,   price:420,   bonus:'+50 bonus', badge:'⭐', popular:false },
  { id:'uc1000', uc:1000,  price:800,   bonus:'+100 bonus',badge:'⭐', popular:true  },
  { id:'uc2000', uc:2000,  price:1500,  bonus:'+250 bonus',badge:'💎', popular:false },
  { id:'uc5000', uc:5000,  price:3500,  bonus:'+700 bonus',badge:'💎', popular:false },
  { id:'uc10000',uc:10000, price:6500,  bonus:'+1500 bonus',badge:'👑',popular:false },
];

function StorePage({ profile, setProfile, showNotif }) {
  const [tab, setTab] = useState('uc');
  const card = {background:'rgba(11,21,39,0.9)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',padding:'0.85rem',marginBottom:'0.5rem'};
  const handleBuyUC = (pkg) => {
    showNotif(`💳 ${pkg.uc} PG paketi için ödeme sayfasına yönlendiriliyor... (₱${pkg.price})`, 'gold');
  };
  const handleBuyVIP = (plan) => {
    showNotif(`💎 VIP ${plan.label} için ödeme sayfasına yönlendiriliyor... (₱${plan.price})`, 'gold');
  };
  const vipPlans = [
    { id:'month', label:'Aylık VIP', price:249.99, days:30, badge:'⭐', popular:true, features:['💎 VIP çerçeve','⚡ 2× XP','🎁 Günlük kutu','📈 5× çiftlik geliri'] },
    { id:'year',  label:'Yıllık VIP', price:2499.99, days:365, badge:'💎', save:'%17 Tasarruf', features:['💎 VIP çerçeve','⚡ 2× XP','🎁 Günlük kutu','📈 5× çiftlik geliri','🏆 Yıllık rozet'] },
  ];
  return (
    <div style={{padding:'0.7rem'}}>
      <div style={{background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',border:'1px solid rgba(236,72,153,0.3)',borderRadius:'20px',padding:'1.25rem',textAlign:'center',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'2rem',marginBottom:'0.4rem'}}>🛒</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:900,color:'#fff'}}>UOLİTİKON MARKET</div>
        <div style={{fontSize:'0.72rem',color:'#C4B5FD',marginTop:'0.25rem'}}>VIP üyelik ve PoliGold satın al</div>
        {profile?.premium && <div style={{marginTop:'0.5rem',display:'inline-block',background:'rgba(167,139,250,0.2)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'8px',padding:'0.25rem 0.75rem',fontSize:'0.7rem',color:'#A78BFA',fontWeight:700}}>✅ Aktif VIP Üye</div>}
      </div>

      <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
        {[['uc','🪙 PoliGold'],['vip','💎 VIP'],['edu','📚 Eğitim']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'0.5rem',borderRadius:'10px',border:`1px solid ${tab===id?'rgba(236,72,153,0.5)':'rgba(255,255,255,0.08)'}`,background:tab===id?'rgba(236,72,153,0.12)':'rgba(255,255,255,0.03)',color:tab===id?'#F472B6':'#5A7089',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==='uc' && (
        <div>
          <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.5rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em'}}>🪙 PoliGold Paketleri</div>
          <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px',padding:'0.65rem',marginBottom:'0.65rem',fontSize:'0.72rem',color:'#6EE7B7'}}>
            💡 PoliGold (UC), oyun içi özel para birimidir. Kozmetikler, avantajlar ve premium özellikler için kullanılır.
          </div>
          <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.4rem'}}>Mevcut UC: <span style={{color:'#F59E0B',fontWeight:700}}>{profile?.underCoin||0} PG</span></div>
          {UC_PACKAGES.map(pkg => (
            <div key={pkg.id} style={{...card,border:`1px solid ${pkg.popular?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.07)'}`,background:pkg.popular?'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(11,21,39,0.9))':'rgba(11,21,39,0.9)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <div style={{fontSize:'1.6rem',width:'40px',textAlign:'center',flexShrink:0}}>{pkg.badge}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{pkg.uc.toLocaleString('tr-TR')} PG {pkg.bonus && <span style={{color:'#10B981',fontSize:'0.72rem',fontWeight:700}}>+{pkg.bonus.split('+')[1]}</span>}</div>
                  <div style={{fontSize:'0.65rem',color:'#5A7089'}}>₱{pkg.price.toLocaleString('tr-TR')} ödeme</div>
                  {pkg.popular && <div style={{display:'inline-block',marginTop:'0.2rem',background:'rgba(245,158,11,0.2)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:'6px',padding:'1px 6px',fontSize:'0.6rem',color:'#F59E0B',fontWeight:700}}>En Popüler</div>}
                </div>
                <button onClick={()=>handleBuyUC(pkg)}
                  style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'none',background:pkg.popular?'linear-gradient(135deg,#F59E0B,#D97706)':'rgba(245,158,11,0.15)',color:pkg.popular?'#000':'#F59E0B',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',flexShrink:0,border:`1px solid rgba(245,158,11,${pkg.popular?0.8:0.3})`}}>
                  Satın Al
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='vip' && (
        <div>
          <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.5rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em'}}>💎 VIP Üyelik Planları</div>
          {vipPlans.map(plan => (
            <div key={plan.id} style={{...card,border:`1px solid ${plan.popular?'rgba(167,139,250,0.45)':'rgba(255,255,255,0.07)'}`,background:plan.popular?'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(11,21,39,0.9))':'rgba(11,21,39,0.9)',marginBottom:'0.65rem'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem',marginBottom:'0.65rem'}}>
                <div style={{fontSize:'1.8rem',flexShrink:0}}>{plan.badge}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap'}}>
                    <span style={{fontWeight:900,color:'#E8EDF2',fontSize:'0.95rem'}}>{plan.label}</span>
                    {plan.popular && <span style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'6px',padding:'1px 6px',fontSize:'0.6rem',color:'#A78BFA',fontWeight:700}}>En Popüler</span>}
                    {plan.save && <span style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'6px',padding:'1px 6px',fontSize:'0.6rem',color:'#10B981',fontWeight:700}}>{plan.save}</span>}
                  </div>
                  <div style={{fontWeight:900,color:'#A78BFA',fontSize:'1.25rem',marginTop:'0.15rem'}}>₱{plan.price.toLocaleString('tr-TR', {minimumFractionDigits:2})}</div>
                  <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{plan.days} gün VIP üyelik</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.3rem',marginBottom:'0.65rem'}}>
                {plan.features.map(f => (
                  <div key={f} style={{fontSize:'0.68rem',color:'#94A3B8',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                    <span style={{color:'#A78BFA'}}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={()=>handleBuyVIP(plan)} style={{width:'100%',padding:'0.65rem',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#7C3AED,#A855F7)',color:'#fff',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',letterSpacing:'0.03em'}}>
                💎 {plan.label} Satın Al
              </button>
            </div>
          ))}
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'0.75rem',fontSize:'0.7rem',color:'#5A7089'}}>
            500 PG harcayarak da 30 günlük VIP aktifleştirebilirsin. Mevcut UC: <span style={{color:'#F59E0B',fontWeight:700}}>{profile?.underCoin||0}</span>
            {(profile?.underCoin||0) >= 500 && (
              <button onClick={()=>{ setProfile(p=>{const np={...p,underCoin:(p.underCoin||0)-500,premium:true,premiumExpiry:Date.now()+30*24*3600000};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;}); showNotif('✅ VIP aktifleştirildi! 30 gün','success'); }}
                style={{display:'block',marginTop:'0.5rem',width:'100%',padding:'0.5rem',borderRadius:'10px',border:'1px solid rgba(245,158,11,0.4)',background:'rgba(245,158,11,0.12)',color:'#F59E0B',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                🪙 500 PG ile Aktifleştir
              </button>
            )}
          </div>
        </div>
      )}

      {tab==='edu' && (
        <div>
          <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(11,21,39,0.97))',border:'1px solid rgba(139,92,246,0.35)',borderRadius:'16px',padding:'1.25rem',textAlign:'center',marginBottom:'0.75rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.4rem'}}>📚</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#C4B5FD'}}>EĞİTİM PAKETİ</div>
            <div style={{fontSize:'0.72rem',color:'#8B5CF6',marginTop:'0.2rem'}}>Eğitim tıklamalarında 12 saatlik bekleme süresi (normal: 5 dk)</div>
            {(profile?.packages?.edu || profile?.eduPackage) && (
              <div style={{marginTop:'0.5rem',display:'inline-block',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'8px',padding:'0.25rem 0.75rem',fontSize:'0.7rem',color:'#10B981',fontWeight:700}}>✅ Aktif Paketiniz Var</div>
            )}
          </div>

          <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(11,21,39,0.95))',border:'1px solid rgba(139,92,246,0.35)',borderRadius:'16px',padding:'1rem',marginBottom:'0.65rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'2rem',flexShrink:0}}>📦</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap'}}>
                  <span style={{fontWeight:900,color:'#C4B5FD',fontSize:'1rem'}}>30 Günlük Eğitim Paketi</span>
                  <span style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'6px',padding:'1px 6px',fontSize:'0.62rem',color:'#10B981',fontWeight:700}}>🔥 Popüler</span>
                </div>
                <div style={{fontWeight:900,color:'#A78BFA',fontSize:'1.4rem',marginTop:'0.1rem'}}>₱1.199,99</div>
                <div style={{fontSize:'0.65rem',color:'#5A7089'}}>30 gün geçerli eğitim paketi</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.3rem',marginBottom:'0.75rem'}}>
              {['📚 Her tıklama: 12 saat bekle','⚡ Normal: 5 dakika bekleme','🎓 Daha hızlı diploma kazan','🏆 Ekstra XP bonusu yok'].map(f=>(
                <div key={f} style={{fontSize:'0.68rem',color:'#94A3B8',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                  <span style={{color:'#A78BFA'}}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={()=>showNotif('💳 Eğitim Paketi (₱1.199,99) için ödeme sayfasına yönlendiriliyor...','gold')}
              style={{width:'100%',padding:'0.7rem',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#7C3AED,#A855F7)',color:'#fff',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',letterSpacing:'0.03em'}}>
              📚 Eğitim Paketi Al — ₱1.199,99
            </button>
          </div>

          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'0.75rem',fontSize:'0.7rem',color:'#5A7089',lineHeight:1.7}}>
            💡 <strong style={{color:'#C4B5FD'}}>Eğitim Paketi</strong> ile her eğitim tıklaması sonrası <strong style={{color:'#A78BFA'}}>12 saat</strong> beklersin (5 dk yerine). Admin veya admin panelinden da verilebilir.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EĞİTİM SİSTEMİ SAYFASI
// ═══════════════════════════════════════════════════════
const EDU_LEVELS = [
  { id:'ilkokul',      label:'İlkokul',      icon:'📖', costPerClick:0,     clicksNeeded:0,   desc:'Temel okuma yazma',        grade:'4. Sınıf',  color:'#10B981' },
  { id:'ortaokul',     label:'Ortaokul',     icon:'📓', costPerClick:5000,   clicksNeeded:50,  desc:'Temel bilimler',           grade:'8. Sınıf',  color:'#3B82F6' },
  { id:'lise',         label:'Lise',         icon:'🎒', costPerClick:10000,  clicksNeeded:100, desc:'Sosyal ve fen bilimleri',  grade:'12. Sınıf', color:'#8B5CF6' },
  { id:'universite',   label:'Üniversite',   icon:'🎓', costPerClick:15000,  clicksNeeded:200, desc:'Lisans eğitimi',           grade:'Lisans',    color:'#F59E0B' },
  { id:'yukseklisans', label:'Yüksek Lisans',icon:'📜', costPerClick:20000,  clicksNeeded:300, desc:'Uzmanlık eğitimi',         grade:'MSc/MBA',   color:'#EC4899' },
  { id:'doktora',      label:'Doktora',      icon:'🔬', costPerClick:25000,  clicksNeeded:400, desc:'Araştırma ve akademi',     grade:'PhD',       color:'#EF4444' },
  { id:'profesor',     label:'Profesör',     icon:'🏛️', costPerClick:30000,  clicksNeeded:500, desc:'Akademik kariyer zirvesi', grade:'Prof.Dr.',  color:'#F97316' },
];
// Eğitim tıklamaları için bekleme süreleri (ms)
// Normal: 5 dakika, VIP: 2.5 dakika, Paket: 1 saniye
const EDU_COOLDOWN_NORMAL = 5 * 60 * 1000;
const EDU_COOLDOWN_VIP    = 2.5 * 60 * 1000;
const EDU_COOLDOWN_PKG    = 1000;

const EDU_POSITION_REQS = {
  'Muhtarlık':       'ilkokul',
  'Belediye Meclis': 'ortaokul',
  'Belediye Başkanı':'lise',
  'Milletvekili':    'lise',
  'Bakan':           'universite',
  'Başbakan':        'universite',
  'Devlet Başkanı':  'yukseklisans',
  'Cumhurbaşkanı':   'yukseklisans',
  'Parti Lideri':    'lise',
  'Çete Lideri':     'ortaokul',
  'Aile Lideri':     'lise',
  'Holding CEO':     'universite',
  'Akademisyen':     'doktora',
};

function EducationPage({ profile, setProfile, showNotif }) {
  const edu = profile?.education || {};
  const diploma = edu.diploma || 'ilkokul';
  const activeLevel = edu.activeLevel || null;  // current level being studied
  const clicksDone = edu.clicksDone || 0;
  const lastClick = edu.lastClick || 0;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const eduOrder = EDU_LEVELS.map(e => e.id);
  const currentIdx = eduOrder.indexOf(diploma);

  const hasEduPackage = !!(profile?.packages?.edu || profile?.eduPackage);
  const isVip = !!(profile?.vip || profile?.premium);
  const getCooldown = () => {
    if (hasEduPackage) return EDU_COOLDOWN_PKG;
    if (isVip) return EDU_COOLDOWN_VIP;
    return EDU_COOLDOWN_NORMAL;
  };

  const educationCycles = edu.educationCycles || 0;

  const clickStudy = (lvl) => {
    const idx = eduOrder.indexOf(lvl.id);
    if (idx <= currentIdx) { showNotif('Bu diplomaya zaten sahipsin', 'error'); return; }
    if (idx !== currentIdx + 1) { showNotif('Önce bir önceki seviyeyi tamamla', 'error'); return; }
    if ((profile?.money||0) < lvl.costPerClick) { showNotif(`Her tıklama için ${fmtWord(lvl.costPerClick)} gerekli`, 'error'); return; }
    const cd = getCooldown();
    if (activeLevel === lvl.id && (now - lastClick) < cd) {
      const rem = Math.ceil((cd - (now - lastClick)) / 1000);
      const remStr = rem >= 60 ? `${Math.floor(rem/60)}dk ${rem%60}sn` : `${rem}sn`;
      showNotif(`⏳ ${remStr} bekle`, 'error');
      return;
    }
    const newClicks = (activeLevel === lvl.id ? clicksDone : 0) + 1;
    const isComplete = newClicks >= lvl.clicksNeeded;
    const isProfessor = lvl.id === 'profesor';
    setProfile(p => {
      let ne;
      if (isComplete && isProfessor) {
        const newCycles = (p.education?.educationCycles || 0) + 1;
        ne = { diploma: 'ilkokul', activeLevel: null, clicksDone: 0, lastClick: 0, educationCycles: newCycles };
      } else if (isComplete) {
        ne = { ...(p.education||{}), diploma: lvl.id, activeLevel: null, clicksDone: 0, lastClick: 0 };
      } else {
        ne = { ...(p.education||{}), activeLevel: lvl.id, clicksDone: newClicks, lastClick: Date.now() };
      }
      const np = {
        ...p,
        education: ne,
        diplomaLevel: isComplete && !isProfessor ? lvl.id : (isComplete && isProfessor ? 'ilkokul' : p.diplomaLevel),
        money: (p.money||0) - lvl.costPerClick,
        xp: (p.xp||0) + (isComplete ? 500 : 5),
        meritPoints: isComplete ? (p.meritPoints||0) + 50 : (p.meritPoints||0),
      };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    try {
      const today = new Date().toDateString();
      const ds = JSON.parse(localStorage.getItem('rep_dailyTaskProgress')||'{}');
      const ts = ds[today]||{};
      localStorage.setItem('rep_dailyTaskProgress', JSON.stringify({...ds,[today]:{...ts, edu1:(ts.edu1||0)+1}}));
    } catch(e){}
    if (isComplete && isProfessor) {
      const cycles = (edu.educationCycles||0) + 1;
      showNotif(`🏛️ Profesör diploması kazandın! ${cycles}. döngü tamamlandı! Eğitim sıfırlandı. +500 XP +50 Liyakat`, 'success');
    } else if (isComplete) {
      showNotif(`🎓 Tebrikler! ${lvl.label} diploması kazandın! +500 XP +50 Liyakat`, 'success');
    } else {
      showNotif(`📚 ${newClicks}/${lvl.clicksNeeded} tıklama • -${fmtWord(lvl.costPerClick)}`, 'info');
    }
  };

  const resetEducation = () => {
    if ((profile?.money||0) < 100000) { showNotif('❌ Yeniden başlamak için ₱100.000 gerekli!','error'); return; }
    setProfile(p => {
      const np = {...p, money:(p.money||0)-100000, education:{diploma:'ilkokul', activeLevel:null, clicksDone:0, lastClick:0, educationCycles:p.education?.educationCycles||0}, diplomaLevel:'ilkokul'};
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif('🔄 Eğitim sıfırlandı! İlkokul seviyesinden başlıyorsun. -₱100.000','info');
  };

  const card = { background:'rgba(11,21,39,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'0.85rem', marginBottom:'0.5rem' };
  const cd = getCooldown();
  const cdStr = cd >= 60000 ? `${Math.floor(cd/60000)}dk` : `${Math.floor(cd/1000)}sn`;

  return (
    <div style={{padding:'0.7rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(11,21,39,0.97))',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'0.3rem'}}>🎓</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.15rem',fontWeight:900,color:'#E8EDF2'}}>EĞİTİM SİSTEMİ</div>
        <div style={{fontSize:'0.72rem',color:'#5A7089',marginTop:'0.2rem'}}>Tıklayarak çalış, diploma kazan, yüksek makamlara ulaş</div>
        <div style={{marginTop:'0.6rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',flexWrap:'wrap'}}>
          <span style={{background:'rgba(167,139,250,0.2)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'8px',padding:'0.2rem 0.65rem',fontSize:'0.75rem',color:'#C4B5FD',fontWeight:800}}>
            {EDU_LEVELS.find(e=>e.id===diploma)?.icon} {EDU_LEVELS.find(e=>e.id===diploma)?.label}
          </span>
          <span style={{background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'8px',padding:'0.2rem 0.65rem',fontSize:'0.72rem',color:'#60A5FA',fontWeight:700}}>
            ⏱ {cdStr} bekleme{hasEduPackage?' (Paket)':isVip?' (VIP)':''}
          </span>
          {educationCycles > 0 && (
            <span style={{background:'rgba(245,158,11,0.2)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:'8px',padding:'0.2rem 0.65rem',fontSize:'0.72rem',color:'#FCD34D',fontWeight:800}}>
              🔄 {educationCycles}. döngü tamamlandı
            </span>
          )}
        </div>
        {educationCycles > 0 && (
          <div style={{marginTop:'0.5rem',fontSize:'0.68rem',color:'#F59E0B',background:'rgba(245,158,11,0.08)',borderRadius:'8px',padding:'0.35rem 0.75rem',display:'inline-block'}}>
            🏛️ Profil rozetine "{educationCycles}× Profesör" eklendi
          </div>
        )}
      </div>

      {activeLevel && (() => {
        const lvl = EDU_LEVELS.find(e => e.id === activeLevel);
        if (!lvl) return null;
        const pct = Math.round(clicksDone / lvl.clicksNeeded * 100);
        const cooldownLeft = Math.max(0, cd - (now - lastClick));
        const cdSecs = Math.ceil(cooldownLeft/1000);
        return (
          <div style={{...card,border:'1px solid rgba(59,130,246,0.4)',background:'rgba(59,130,246,0.07)',marginBottom:'0.75rem'}}>
            <div style={{fontSize:'0.72rem',color:'#60A5FA',fontWeight:700,marginBottom:'0.4rem'}}>📚 Devam Eden Eğitim</div>
            <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.3rem'}}>{lvl.icon} {lvl.label}</div>
            <div style={{height:'6px',background:'rgba(255,255,255,0.07)',borderRadius:'3px',marginBottom:'0.3rem'}}>
              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#3B82F6,#60A5FA)',borderRadius:'3px',transition:'width 0.3s'}} />
            </div>
            <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{clicksDone}/{lvl.clicksNeeded} tıklama ({pct}%) • {cooldownLeft > 0 ? `⏳ ${cdSecs}sn bekle` : '✅ Tıklayabilirsin'}</div>
            <button onClick={()=>clickStudy(lvl)} disabled={cooldownLeft>0}
              style={{marginTop:'0.6rem',width:'100%',padding:'0.6rem',borderRadius:'10px',border:'none',background:cooldownLeft>0?'rgba(255,255,255,0.06)':'linear-gradient(135deg,#3B82F6,#2563EB)',color:cooldownLeft>0?'#3B4E63':'#fff',fontWeight:800,fontSize:'0.85rem',cursor:cooldownLeft>0?'not-allowed':'pointer',transition:'all 0.2s'}}>
              {cooldownLeft>0 ? `⏳ ${cdSecs}sn` : `📖 Çalış (${fmtWord(lvl.costPerClick)})`}
            </button>
          </div>
        );
      })()}

      <div style={{fontSize:'0.7rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.5rem'}}>📋 Eğitim Seviyeleri</div>
      {EDU_LEVELS.map((lvl, i) => {
        const isDone = eduOrder.indexOf(lvl.id) <= currentIdx;
        const isActive = activeLevel === lvl.id;
        const isNext = eduOrder.indexOf(lvl.id) === currentIdx + 1;
        const cooldownLeft = isActive ? Math.max(0, cd - (now - lastClick)) : 0;
        const cdSecs = Math.ceil(cooldownLeft/1000);
        const pct = isActive ? Math.round(clicksDone / lvl.clicksNeeded * 100) : 0;
        return (
          <div key={lvl.id} style={{...card,border:`1px solid ${isDone?'rgba(16,185,129,0.3)':isActive?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.06)'}`,background:isDone?'rgba(16,185,129,0.05)':isActive?'rgba(59,130,246,0.05)':'rgba(11,21,39,0.9)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <div style={{fontSize:'1.6rem',flexShrink:0,opacity:isDone?1:0.6}}>{lvl.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap'}}>
                  <span style={{fontWeight:800,color:isDone?'#10B981':isActive?'#60A5FA':'#E8EDF2'}}>{lvl.label}</span>
                  {isDone && <span style={{background:'rgba(16,185,129,0.2)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'6px',padding:'1px 6px',fontSize:'0.6rem',color:'#10B981',fontWeight:700}}>✅ Mezun</span>}
                  {isActive && <span style={{background:'rgba(59,130,246,0.2)',border:'1px solid rgba(59,130,246,0.4)',borderRadius:'6px',padding:'1px 6px',fontSize:'0.6rem',color:'#60A5FA',fontWeight:700}}>📚 {clicksDone}/{lvl.clicksNeeded}</span>}
                </div>
                <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{lvl.grade} • {lvl.desc}</div>
                {!isDone && lvl.clicksNeeded > 0 && (
                  <div style={{fontSize:'0.65rem',color:'#F59E0B',marginTop:'0.15rem'}}>
                    {fmtWord(lvl.costPerClick)}/tıklama • {lvl.clicksNeeded} tıklama • ~{fmtWord(lvl.costPerClick*lvl.clicksNeeded)} toplam
                  </div>
                )}
                {isActive && (
                  <div style={{marginTop:'0.3rem',height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:'#3B82F6',borderRadius:'2px',transition:'width 0.3s'}} />
                  </div>
                )}
                {lvl.id === 'ilkokul' && <div style={{fontSize:'0.65rem',color:'#10B981',marginTop:'0.15rem'}}>Ücretsiz • Herkeste var</div>}
              </div>
              {!isDone && isNext && !isActive && (
                <button onClick={()=>clickStudy(lvl)}
                  style={{padding:'0.4rem 0.75rem',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#fff',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                  Başla
                </button>
              )}
              {isActive && (
                <button onClick={()=>clickStudy(lvl)} disabled={cooldownLeft>0}
                  style={{padding:'0.4rem 0.75rem',borderRadius:'10px',border:'none',background:cooldownLeft>0?'rgba(255,255,255,0.06)':'linear-gradient(135deg,#3B82F6,#2563EB)',color:cooldownLeft>0?'#3B4E63':'#fff',fontWeight:700,fontSize:'0.75rem',cursor:cooldownLeft>0?'not-allowed':'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                  {cooldownLeft>0?`⏳${cdSecs}s`:'📖 Çalış'}
                </button>
              )}
              {!isDone && !isNext && !isActive && (
                <span style={{fontSize:'0.65rem',color:'#3B4E63',flexShrink:0}}>🔒</span>
              )}
            </div>
          </div>
        );
      })}

      <div style={{...card,marginTop:'0.75rem',background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.2)'}}>
        <div style={{fontWeight:800,color:'#A78BFA',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🏛️ Makam Gereksinimleri</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.35rem'}}>
          {Object.entries(EDU_POSITION_REQS).map(([pos, req]) => {
            const reqLvl = EDU_LEVELS.find(e=>e.id===req);
            const met = eduOrder.indexOf(diploma) >= eduOrder.indexOf(req);
            return (
              <div key={pos} style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span style={{fontSize:'0.65rem',color:met?'#10B981':'#EF4444',flexShrink:0}}>{met?'✅':'❌'}</span>
                <div>
                  <div style={{fontSize:'0.7rem',fontWeight:700,color:'#E8EDF2'}}>{pos}</div>
                  <div style={{fontSize:'0.58rem',color:'#5A7089'}}>{reqLvl?.icon} {reqLvl?.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{...card,marginTop:'0.75rem',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.04)'}}>
        <div style={{fontWeight:800,color:'#F87171',marginBottom:'0.4rem',fontSize:'0.85rem'}}>🔄 Eğitime Tekrar Başla</div>
        <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.75rem',lineHeight:1.5}}>
          Tüm eğitim ilerlemen sıfırlanır ve İlkokul seviyesinden yeniden başlarsın.<br/>
          Bu işlem geri alınamaz. Mevcut diploma: <strong style={{color:'#F87171'}}>{EDU_LEVELS.find(e=>e.id===diploma)?.label||'İlkokul'}</strong>
        </div>
        <button onClick={resetEducation}
          style={{width:'100%',padding:'0.6rem',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',color:'#F87171',fontWeight:700,fontSize:'0.83rem',cursor:'pointer',fontFamily:'inherit'}}>
          🔄 Yeniden Başla (₱100.000)
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ŞEHİR YÖNETİMİ SAYFASI
// ═══════════════════════════════════════════════════════
const CITY_POSITIONS = [
  {
    id:'belediye_baskani', label:'Belediye Başkanı', icon:'🏙️', color:'#8B5CF6', eduReq:'lise',
    duties:[
      {id:'butce_onay',         label:'Bütçe Onayla',        cd:24*3600000, reward:{xp:500,  money:50000,  desc:'Yıllık bütçeyi onayla'}},
      {id:'insan_kaynagi',      label:'İK Yönetimi',         cd:12*3600000, reward:{xp:300,  money:25000,  desc:'Personel ata ve çıkar'}},
      {id:'kent_yatırım',       label:'Kent Yatırımı',       cd:18*3600000, reward:{xp:450,  money:40000,  desc:'Şehre yatırım çek'}},
      {id:'halk_toplantisi',    label:'Halk Toplantısı',     cd:8*3600000,  reward:{xp:200,  money:10000,  desc:'Halka hesap ver'}},
    ],
    perks:['Vergi oranı belirleme','İnşaat ruhsatı verme','Bütçe kontrolü'],
    minSupport:500,
  },
];

function CityGovPage({ profile, setProfile, showNotif }) {
  const [govCooldowns, setGovCooldowns] = useLs('cityGovCooldowns', {});
  const [now, setNow] = useState(Date.now());
  const [selectedPos, setSelectedPos] = useState(null);
  const [applyModal, setApplyModal] = useState(false);
  const [cityOfficials, setCityOfficials] = useLs('cityOfficials', {});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const eduOrder = EDU_LEVELS.map(e => e.id);
  const myDiploma = profile?.education?.diploma || 'ilkokul';
  const myPositions = cityOfficials[profile?.uid] || [];

  const applyForPosition = (pos) => {
    const eduMet = eduOrder.indexOf(myDiploma) >= eduOrder.indexOf(pos.eduReq);
    if (!eduMet) { showNotif(`Bu makam için en az ${EDU_LEVELS.find(e=>e.id===pos.eduReq)?.label} diploması gerekli`, 'error'); return; }
    const supportMet = (profile?.meritPoints||0) >= pos.minSupport;
    if (!supportMet) { showNotif(`Bu makam için ${pos.minSupport} liyakat puanı gerekli`, 'error'); return; }
    if (myPositions.includes(pos.id)) { showNotif('Bu makama zaten sahipsin', 'error'); return; }
    setCityOfficials(prev => { const cur = prev[profile.uid]||[]; return {...prev,[profile.uid]:[...cur,pos.id]}; });
    showNotif(`🎉 ${pos.label} olarak atandın!`, 'success');
    setApplyModal(false);
  };

  const doduty = (pos, duty) => {
    const key = `citygov_${profile?.uid}_${pos.id}_${duty.id}`;
    const last = govCooldowns[key] || 0;
    const rem = duty.cd - (now - last);
    if (rem > 0) {
      const h = Math.floor(rem/3600000); const m = Math.floor((rem%3600000)/60000);
      showNotif(`⏳ ${h > 0 ? h+'s ' : ''}${m}dk sonra tekrar kullanılabilir`, 'error'); return;
    }
    setGovCooldowns(prev => ({...prev,[key]:Date.now()}));
    setProfile(p => {
      const np = { ...p, xp:(p.xp||0)+duty.reward.xp, money:(p.money||0)+duty.reward.money, meritPoints:(p.meritPoints||0)+Math.floor(duty.reward.xp/10) };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`✅ ${duty.label} tamamlandı! +${duty.reward.xp} XP +${fmtWord(duty.reward.money)}`, 'success');
  };

  const getCooldownLabel = (pos, duty) => {
    const key = `citygov_${profile?.uid}_${pos.id}_${duty.id}`;
    const last = govCooldowns[key] || 0;
    const rem = duty.cd - (now - last);
    if (rem <= 0) return null;
    const h = Math.floor(rem/3600000); const m = Math.floor((rem%3600000)/60000); const s = Math.floor((rem%60000)/1000);
    return h > 0 ? `${h}s ${m}dk` : m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
  };

  const card = { background:'rgba(11,21,39,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'0.9rem', marginBottom:'0.55rem' };

  return (
    <div style={{padding:'0.7rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(11,21,39,0.97))',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#818CF8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>ŞEHİR YÖNETİMİ</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#E8EDF2',marginBottom:'0.1rem'}}>Makamlar & Görevler</div>
        <div style={{fontSize:'0.7rem',color:'#5A7089'}}>Liyakat: <span style={{color:'#A78BFA',fontWeight:700}}>{profile?.meritPoints||0}</span> puan • Diploma: <span style={{color:'#60A5FA',fontWeight:700}}>{EDU_LEVELS.find(e=>e.id===myDiploma)?.label}</span></div>
      </div>

      {CITY_POSITIONS.map(pos => {
        const hasPos = myPositions.includes(pos.id);
        const eduMet = eduOrder.indexOf(myDiploma) >= eduOrder.indexOf(pos.eduReq);
        const supportMet = (profile?.meritPoints||0) >= pos.minSupport;
        const canApply = eduMet && supportMet && !hasPos;

        return (
          <div key={pos.id} style={{...card,border:`1px solid ${hasPos?`rgba(${pos.color.match(/\d+/g)?.slice(0,3).join(',')},0.35)`:'rgba(255,255,255,0.07)'}`,background:hasPos?`rgba(${pos.color.match(/\d+/g)?.slice(0,3).join(',')},0.06)`:'rgba(11,21,39,0.9)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.55rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                <div style={{fontSize:'1.5rem'}}>{pos.icon}</div>
                <div>
                  <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{pos.label}</div>
                  <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{EDU_LEVELS.find(e=>e.id===pos.eduReq)?.icon} {EDU_LEVELS.find(e=>e.id===pos.eduReq)?.label} gerekli</div>
                </div>
              </div>
              {hasPos
                ? <span style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:'8px',padding:'0.2rem 0.6rem',fontSize:'0.65rem',color:'#10B981',fontWeight:700}}>✅ Makam Sahibi</span>
                : canApply
                  ? <button onClick={()=>setApplyModal(pos)}
                      style={{padding:'0.35rem 0.7rem',borderRadius:'9px',border:'1px solid rgba(99,102,241,0.5)',background:'rgba(99,102,241,0.15)',color:'#818CF8',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>
                      📋 Başvur
                    </button>
                  : <span style={{fontSize:'0.68rem',color:'#3B4E63',fontWeight:700}}>🔒 Kilitli</span>
              }
            </div>

            {!eduMet && <div style={{fontSize:'0.65rem',color:'#EF4444',marginBottom:'0.4rem'}}>❌ {EDU_LEVELS.find(e=>e.id===pos.eduReq)?.label} diploması gerekli</div>}
            {eduMet && !supportMet && pos.minSupport > 0 && <div style={{fontSize:'0.65rem',color:'#F59E0B',marginBottom:'0.4rem'}}>⚠️ {pos.minSupport} liyakat puanı gerekli (şu an: {profile?.meritPoints||0})</div>}

            {hasPos && (
              <div>
                <div style={{fontSize:'0.65rem',color:'#5A7089',fontWeight:700,marginBottom:'0.4rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>⚡ YETKİLER</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginBottom:'0.6rem'}}>
                  {pos.perks.map(pk=>(
                    <span key={pk} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'6px',padding:'2px 7px',fontSize:'0.62rem',color:'#818CF8'}}>{pk}</span>
                  ))}
                </div>
                <div style={{fontSize:'0.65rem',color:'#5A7089',fontWeight:700,marginBottom:'0.4rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>📋 ZORUNLU GÖREVLER</div>
                {pos.duties.map(duty => {
                  const cdLabel = getCooldownLabel(pos, duty);
                  return (
                    <div key={duty.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'10px',padding:'0.55rem 0.7rem',marginBottom:'0.3rem',display:'flex',alignItems:'center',gap:'0.6rem',border:'1px solid rgba(255,255,255,0.05)'}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.8rem'}}>{duty.label}</div>
                        <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{duty.reward.desc} • +{duty.reward.xp} XP • +{fmtWord(duty.reward.money)}</div>
                      </div>
                      <button onClick={()=>doduty(pos,duty)}
                        disabled={!!cdLabel}
                        style={{padding:'0.35rem 0.7rem',borderRadius:'8px',border:'none',background:cdLabel?'rgba(255,255,255,0.05)':'rgba(16,185,129,0.15)',color:cdLabel?'#3B4E63':'#10B981',fontWeight:700,fontSize:'0.7rem',cursor:cdLabel?'default':'pointer',border:`1px solid ${cdLabel?'rgba(255,255,255,0.06)':'rgba(16,185,129,0.3)'}`,minWidth:'70px',textAlign:'center',flexShrink:0}}>
                        {cdLabel ? `⏳ ${cdLabel}` : '▶ Yap'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div style={{...card,background:'rgba(139,92,246,0.05)',border:'1px solid rgba(139,92,246,0.15)'}}>
        <div style={{fontWeight:800,color:'#A78BFA',marginBottom:'0.4rem',fontSize:'0.82rem'}}>📖 Makam Hakkında</div>
        <div style={{fontSize:'0.7rem',color:'#5A7089',lineHeight:1.6}}>
          UOLİTİKON'de şehir yönetimi gerçekçi bir hiyerarşi sistemiyle çalışır. Her makamın zorunlu görevleri vardır; bu görevler yapılmazsa makam kaybedilebilir. Daha yüksek makamlara çıkmak için hem eğitim diploması hem de liyakat puanı gerekmektedir. Holding sahipleri belirli makamlara gizlice destek verebilir.
        </div>
      </div>

      {applyModal && (
        <div onClick={()=>setApplyModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#0F172A',border:'1px solid rgba(99,102,241,0.35)',borderRadius:'20px',padding:'1.5rem',maxWidth:'340px',width:'100%',boxShadow:'0 25px 60px rgba(0,0,0,0.6)'}}>
            <div style={{textAlign:'center',marginBottom:'1.2rem'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>{applyModal.icon}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:'#E8EDF2',fontSize:'1.1rem',marginBottom:'0.3rem'}}>{applyModal.label}</div>
              <div style={{fontSize:'0.72rem',color:'#5A7089'}}>Bu makama başvurmak istediğini onaylıyor musun?</div>
            </div>
            <div style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'0.85rem',marginBottom:'1rem'}}>
              <div style={{fontSize:'0.7rem',color:'#818CF8',fontWeight:700,marginBottom:'0.5rem'}}>📋 Gereksinimler</div>
              <div style={{fontSize:'0.68rem',color:'#5A7089',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span>🎓 Diploma:</span>
                  <span style={{color:'#10B981',fontWeight:700}}>{EDU_LEVELS.find(e=>e.id===applyModal.eduReq)?.label} ✅</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span>⭐ Liyakat:</span>
                  <span style={{color:'#10B981',fontWeight:700}}>{profile?.meritPoints||0}/{applyModal.minSupport} ✅</span>
                </div>
              </div>
            </div>
            <div style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px',padding:'0.7rem',marginBottom:'1rem',fontSize:'0.68rem',color:'#5A7089'}}>
              <div style={{color:'#10B981',fontWeight:700,marginBottom:'0.3rem'}}>⚡ Makam Yetkileri</div>
              {applyModal.perks.map(p=><div key={p}>• {p}</div>)}
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button onClick={()=>setApplyModal(null)} style={{flex:1,padding:'0.65rem',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#5A7089',fontWeight:700,fontSize:'0.82rem',cursor:'pointer'}}>İptal</button>
              <button onClick={()=>applyForPosition(applyModal)} style={{flex:2,padding:'0.65rem',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#6366F1,#4F46E5)',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:'0.85rem',cursor:'pointer'}}>✅ Başvuruyu Onayla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GİZLİ FON KARTI (HOLDİNG → PARTİ)
// ═══════════════════════════════════════════════════════
function SecretFundingCard({ holding, holdings, setHoldings, parties, profile, setProfile, showNotif }) {
  const [targetPartyId, setTargetPartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [fundLog, setFundLog] = useLs(`fundLog_${holding.id}`, []);

  const openCase = (amt, partyName) => {
    const existing = JSON.parse(localStorage.getItem('sucDavalari')||'[]');
    const newCase = {
      id: genId(),
      uid: profile?.uid,
      username: profile?.username,
      type: 'gizli_fonlama',
      typeLabel: 'Gizli Parti Fonlaması',
      icon: '🕵️',
      detail: `${holding.name} şirketinden ${partyName} partisine ${fmtWord(amt)} gizli transfer`,
      amount: amt,
      stage: 'suclama',
      verdict: null,
      ts: Date.now(),
      defenseUsed: false,
      severity: 'yuksek',
    };
    localStorage.setItem('sucDavalari', JSON.stringify([newCase, ...existing].slice(0,50)));
  };

  const doFund = () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) { showNotif('Geçerli miktar girin', 'error'); return; }
    if (!targetPartyId) { showNotif('Parti seçin', 'error'); return; }
    const maxFund = Math.floor((holding.value||0) * 0.1);
    if (amt > maxFund) { showNotif(`En fazla şirket değerinin %10'u (${fmtWord(maxFund)}) transfer edilebilir`, 'error'); return; }
    if ((profile?.money||0) < amt) { showNotif('Yetersiz bakiye', 'error'); return; }
    const party = parties.find(p=>p.id===targetPartyId);
    if (!party) { showNotif('Parti bulunamadı', 'error'); return; }

    const savedParties = JSON.parse(localStorage.getItem('parties')||'[]');
    const updatedParties = savedParties.map(p => p.id===targetPartyId ? {...p, treasury:(p.treasury||0)+amt} : p);
    localStorage.setItem('parties', JSON.stringify(updatedParties));

    const newLog = { id:genId(), partyName:party.name, amount:amt, ts:Date.now(), holdingName:holding.name };
    setFundLog(prev => [newLog, ...prev].slice(0,20));
    setProfile(p => { const np={...p,money:(p.money||0)-amt,xp:(p.xp||0)+50}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setAmount('');

    const detectionChance = amt > 1000000 ? 0.30 : 0.15;
    const detected = Math.random() < detectionChance;
    if (detected) {
      openCase(amt, party.name);
      showNotif(`🚔 UYARI: Transfer istihbarat birimlerine sızdı! Dava açıldı.`, 'error');
    } else {
      showNotif(`🕵️ ${fmtWord(amt)} gizlice ${party.name} partisine aktarıldı`, 'success');
    }
  };

  return (
    <div style={{background:'rgba(11,21,39,0.95)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'0.85rem',marginBottom:'0.55rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.65rem'}}>
        <span style={{fontSize:'1.4rem'}}>{holding.sectorIcon}</span>
        <div>
          <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.88rem'}}>{holding.name}</div>
          <div style={{fontSize:'0.62rem',color:'#5A7089'}}>Değer: {fmtWord(holding.value)} • Maks. fon: {fmtWord(Math.floor((holding.value||0)*0.1))}</div>
        </div>
      </div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem'}}>
        <select value={targetPartyId} onChange={e=>setTargetPartyId(e.target.value)}
          style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'9px',padding:'0.5rem 0.7rem',color:targetPartyId?'#E8EDF2':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontSize:'0.8rem',outline:'none'}}>
          <option value=''>-- Hedef parti seç --</option>
          {parties.map(p=><option key={p.id} value={p.id} style={{background:'#0B1527'}}>{p.name} ({p.ideology})</option>)}
        </select>
      </div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.5rem'}}>
        <input type='number' value={amount} onChange={e=>setAmount(e.target.value)} placeholder='Transfer tutarı...'
          style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'9px',padding:'0.5rem 0.7rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'0.8rem',outline:'none'}} />
        <button onClick={doFund} style={{padding:'0.5rem 0.85rem',borderRadius:'9px',border:'none',background:'rgba(239,68,68,0.15)',color:'#F87171',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',border:'1px solid rgba(239,68,68,0.3)'}}>
          🕵️ Gönder
        </button>
      </div>
      {fundLog.length > 0 && (
        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'0.45rem'}}>
          <div style={{fontSize:'0.62rem',color:'#3B4E63',fontWeight:700,marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>Son Transferler</div>
          {fundLog.slice(0,3).map(f=>(
            <div key={f.id} style={{fontSize:'0.65rem',color:'#5A7089',padding:'0.15rem 0'}}>
              🕵️ {fmtWord(f.amount)} → {f.partyName} • {timeAgo(f.ts)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SUÇ / CEZA / MAHKEME SİSTEMİ
// ═══════════════════════════════════════════════════════
const SUC_TYPES = [
  {
    id: 'vergi_kacakciligi', label: 'Vergi Kaçakçılığı', icon: '📋',
    desc: 'Şirket gelirlerini gizleyerek vergi ödemekten kaçınmak.',
    risk: 0.25, reward: 0.15, minMoney: 500000,
    cooldownMs: 4*60*60*1000,
    severity: 'orta',
    detail: (amt) => `${fmtWord(amt)} değerinde vergi beyannamesi eksik`,
    penalty: (amt) => Math.floor(amt * 0.4),
    color: '#F59E0B',
  },
  {
    id: 'rüşvet', label: 'Rüşvet', icon: '💵',
    desc: 'Kamu görevlisine para ya da menfaat sağlamak.',
    risk: 0.20, reward: 80000, minMoney: 100000,
    cooldownMs: 2*60*60*1000,
    severity: 'orta',
    detail: () => 'Kamu görevlisine usulsüz ödeme iddiası',
    penalty: () => 250000,
    color: '#10B981',
  },
  {
    id: 'zimmete_gecirme', label: 'Zimmete Para Geçirme', icon: '🏦',
    desc: 'Parti veya şirket kasasından kişisel hesaba para aktarımı.',
    risk: 0.35, reward: 0.20, minMoney: 1000000,
    cooldownMs: 8*60*60*1000,
    severity: 'yuksek',
    detail: (amt) => `${fmtWord(amt)} zimmete geçirildi iddiası`,
    penalty: (amt) => Math.floor(amt * 0.6),
    color: '#EF4444',
  },
  {
    id: 'kara_para', label: 'Kara Para Aklama', icon: '🌀',
    desc: 'Yasadışı kaynaklı parayı meşru işlemlere entegre etmek.',
    risk: 0.28, reward: 0.12, minMoney: 2000000,
    cooldownMs: 6*60*60*1000,
    severity: 'yuksek',
    detail: (amt) => `${fmtWord(amt)} şüpheli para hareketi`,
    penalty: (amt) => Math.floor(amt * 0.5),
    color: '#8B5CF6',
  },
  {
    id: 'ihale_yolsuzlugu', label: 'İhale Yolsuzluğu', icon: '🔨',
    desc: 'Kamu ihalelerini usulsüz yönlendirmek.',
    risk: 0.18, reward: 500000, minMoney: 300000,
    cooldownMs: 3*60*60*1000,
    severity: 'dusuk',
    detail: () => 'Kamu ihalesi manipülasyonu',
    penalty: () => 400000,
    color: '#3B82F6',
  },
];

const VERDICT_INFO = {
  beraat:  { label:'Beraat',        color:'#10B981', icon:'✅', desc:'Delil yetersizliğinden dava düşürüldü.' },
  para:    { label:'Para Cezası',   color:'#F59E0B', icon:'💸', desc:'Para cezasına hükmedildi.' },
  hapis:   { label:'Tutukluluk',    color:'#EF4444', icon:'🔒', desc:'İşlemler 1 saat donduruldu.' },
  agir:    { label:'Ağır Ceza',     color:'#7C3AED', icon:'⛓️', desc:'Büyük para cezası + 2 saat dondurma.' },
};

const SEVERITY_COLOR = { dusuk:'#F59E0B', orta:'#EF4444', yuksek:'#7C3AED' };
const SEVERITY_LABEL = { dusuk:'Düşük', orta:'Orta', yuksek:'Yüksek' };

function CrimePage({ profile, setProfile, showNotif }) {
  const [tab, setTab] = useState('mahkeme');
  const [cases, setCases] = useLs('sucDavalari', []);
  const [cooldowns, setCooldowns] = useLs('sucCooldowns', {});
  const [selectedCase, setSelectedCase] = useState(null);

  const myCases = cases.filter(c => c.uid === profile?.uid || !c.uid);
  const activeCases = myCases.filter(c => c.stage !== 'kapandi');
  const closedCases = myCases.filter(c => c.stage === 'kapandi');

  const doCommitCrime = (suc) => {
    const money = profile?.money || 0;
    if (money < suc.minMoney) { showNotif(`Bu suçu işlemek için en az ${fmtWord(suc.minMoney)} gerekiyor`, 'error'); return; }
    const cd = cooldowns[suc.id];
    if (cd && Date.now() < cd) { showNotif(`Bekleme süresi: ${Math.ceil((cd-Date.now())/60000)} dk`, 'error'); return; }

    const amt = typeof suc.reward === 'number' ? suc.reward : Math.floor(money * suc.reward);
    const detected = Math.random() < suc.risk;

    setCooldowns(prev => ({...prev, [suc.id]: Date.now() + suc.cooldownMs}));

    if (detected) {
      const newCase = {
        id: genId(),
        uid: profile?.uid,
        username: profile?.username,
        type: suc.id,
        typeLabel: suc.label,
        icon: suc.icon,
        detail: suc.detail(money),
        amount: money,
        stage: 'suclama',
        verdict: null,
        ts: Date.now(),
        defenseUsed: false,
        severity: suc.severity,
        penalty: suc.penalty(money),
      };
      setCases(prev => [newCase, ...prev].slice(0,50));
      showNotif(`🚔 ${suc.label} suçundan dava açıldı! Mahkemeye çık.`, 'error');
    } else {
      setProfile(p => { const np={...p, money:(p.money||0)+amt, xp:(p.xp||0)+30}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`✅ ${suc.label} başarıyla gizlendi. +${fmtWord(amt)} kazandın.`, 'success');
    }
  };

  const doDefend = (caseId) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      const defenseSuccess = Math.random() < 0.45;
      const verdict = defenseSuccess ? 'beraat' : (c.severity === 'yuksek' ? 'agir' : 'para');
      const penalty = (verdict === 'para' || verdict === 'agir') ? (c.penalty || 200000) : 0;
      const freeze = verdict === 'hapis' || verdict === 'agir';
      if (penalty > 0) {
        setProfile(p => { const np={...p, money:Math.max(0,(p.money||0)-penalty), rep:Math.max(0,(p.rep||0)-15)}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
        if (freeze) {
          localStorage.setItem('crimeFreeze', (Date.now() + (verdict==='agir' ? 7200000 : 3600000)).toString());
        }
        showNotif(VERDICT_INFO[verdict].desc + (penalty ? ` -${fmtWord(penalty)} ceza` : ''), verdict==='beraat'?'success':'error');
      } else {
        showNotif('🎉 Beraat! Tüm suçlamalar düşürüldü.', 'success');
      }
      return {...c, stage:'kapandi', verdict, defenseUsed:true, closedTs:Date.now()};
    }));
    setSelectedCase(null);
  };

  const doPlead = (caseId) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      const penalty = Math.floor((c.penalty||200000) * 0.6);
      setProfile(p => { const np={...p, money:Math.max(0,(p.money||0)-penalty), rep:Math.max(0,(p.rep||0)-8)}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`💸 Suç kabul edildi. -${fmtWord(penalty)} indirimli ceza ödendi.`, 'error');
      return {...c, stage:'kapandi', verdict:'para', defenseUsed:false, closedTs:Date.now(), penalty};
    }));
    setSelectedCase(null);
  };

  const freezeUntil = parseInt(localStorage.getItem('crimeFreeze')||'0');
  const isFrozen = Date.now() < freezeUntil;

  const tabStyle = (t) => ({
    padding:'0.5rem 1rem', borderRadius:'10px', border:'none', fontWeight:700,
    fontSize:'0.78rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
    background: tab===t ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
    color: tab===t ? '#F87171' : '#5A7089',
    border: tab===t ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.06)',
    transition:'all 0.2s',
  });

  return (
    <div style={{padding:'1rem',maxWidth:'520px',margin:'0 auto'}}>
      <div style={{textAlign:'center',marginBottom:'1.2rem'}}>
        <div style={{fontSize:'2rem',marginBottom:'0.2rem'}}>⚖️</div>
        <div style={{fontWeight:900,fontSize:'1.1rem',color:'#E8EDF2',letterSpacing:'0.04em'}}>MAHKEME & SUÇ SİSTEMİ</div>
        <div style={{fontSize:'0.72rem',color:'#3B4E63',marginTop:'0.2rem'}}>Yasal sınırı zorlayan oyuncular burada yargılanır</div>
      </div>

      {isFrozen && (
        <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',padding:'0.7rem 1rem',marginBottom:'0.8rem',textAlign:'center',color:'#F87171',fontWeight:700,fontSize:'0.82rem'}}>
          🔒 İşlemlerin {Math.ceil((freezeUntil-Date.now())/60000)} dakika daha kısıtlı! (Mahkeme kararı)
        </div>
      )}

      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem'}}>
        <button style={tabStyle('mahkeme')} onClick={()=>setTab('mahkeme')}>⚖️ Aktif Davalar {activeCases.length>0&&<span style={{background:'rgba(239,68,68,0.3)',borderRadius:'6px',padding:'0 5px',marginLeft:'4px'}}>{activeCases.length}</span>}</button>
        <button style={tabStyle('suclar')} onClick={()=>setTab('suclar')}>🎭 Suç İşle</button>
        <button style={tabStyle('gecmis')} onClick={()=>setTab('gecmis')}>📜 Geçmiş</button>
      </div>

      {tab==='mahkeme' && (
        <div>
          {activeCases.length === 0 ? (
            <div style={{textAlign:'center',padding:'2.5rem 1rem',color:'#3B4E63',fontSize:'0.85rem'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🕊️</div>
              Aktif davanız bulunmuyor. Temiz sicil!
            </div>
          ) : activeCases.map(c => {
            const sv = SEVERITY_COLOR[c.severity] || '#F59E0B';
            return (
              <div key={c.id} style={{background:'rgba(11,21,39,0.9)',border:`1px solid ${sv}33`,borderRadius:'14px',padding:'0.85rem',marginBottom:'0.6rem'}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.5rem'}}>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-start',flex:1}}>
                    <span style={{fontSize:'1.4rem'}}>{c.icon}</span>
                    <div>
                      <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.85rem'}}>{c.typeLabel}</div>
                      <div style={{fontSize:'0.67rem',color:'#5A7089',marginTop:'0.1rem'}}>{c.detail}</div>
                      <div style={{display:'flex',gap:'0.4rem',marginTop:'0.35rem',flexWrap:'wrap'}}>
                        <span style={{fontSize:'0.6rem',background:`${sv}20`,color:sv,borderRadius:'6px',padding:'2px 6px',fontWeight:700,border:`1px solid ${sv}40`}}>
                          {SEVERITY_LABEL[c.severity]} Ağırlık
                        </span>
                        <span style={{fontSize:'0.6rem',background:'rgba(255,255,255,0.04)',color:'#8899AA',borderRadius:'6px',padding:'2px 6px',border:'1px solid rgba(255,255,255,0.06)'}}>
                          {timeAgo(c.ts)}
                        </span>
                        {c.penalty && <span style={{fontSize:'0.6rem',background:'rgba(239,68,68,0.1)',color:'#F87171',borderRadius:'6px',padding:'2px 6px',border:'1px solid rgba(239,68,68,0.2)'}}>
                          Tahmini ceza: {fmtWord(c.penalty)}
                        </span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.4rem',marginTop:'0.75rem'}}>
                  <button onClick={()=>doDefend(c.id)}
                    style={{flex:1,padding:'0.48rem',borderRadius:'9px',border:'1px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.1)',color:'#34D399',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    🛡️ Savunma Yap (%45)
                  </button>
                  <button onClick={()=>doPlead(c.id)}
                    style={{flex:1,padding:'0.48rem',borderRadius:'9px',border:'1px solid rgba(245,158,11,0.3)',background:'rgba(245,158,11,0.1)',color:'#FCD34D',fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    🤝 Suçu Kabul Et (-%40 ceza)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==='suclar' && (
        <div>
          <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'10px',padding:'0.6rem 0.8rem',marginBottom:'0.8rem',fontSize:'0.72rem',color:'#F87171'}}>
            ⚠️ Suç işlemek tespit riskini beraberinde getirir. Yakalanırsanız otomatik dava açılır.
          </div>
          {SUC_TYPES.map(suc => {
            const cd = cooldowns[suc.id];
            const cdLeft = cd && Date.now() < cd ? Math.ceil((cd-Date.now())/60000) : 0;
            const canAfford = (profile?.money||0) >= suc.minMoney;
            return (
              <div key={suc.id} style={{background:'rgba(11,21,39,0.9)',border:`1px solid ${suc.color}22`,borderRadius:'14px',padding:'0.85rem',marginBottom:'0.55rem'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:'0.6rem'}}>
                  <span style={{fontSize:'1.5rem'}}>{suc.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.86rem'}}>{suc.label}</div>
                      <div style={{fontSize:'0.62rem',color:SEVERITY_COLOR[suc.severity],fontWeight:700}}>Risk: %{Math.round(suc.risk*100)}</div>
                    </div>
                    <div style={{fontSize:'0.68rem',color:'#5A7089',margin:'0.2rem 0 0.45rem'}}>{suc.desc}</div>
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                      <span style={{fontSize:'0.6rem',background:'rgba(16,185,129,0.1)',color:'#34D399',borderRadius:'6px',padding:'2px 6px',border:'1px solid rgba(16,185,129,0.2)'}}>
                        Kazanç: {typeof suc.reward==='number' ? fmtWord(suc.reward) : `Varlığın %${Math.round(suc.reward*100)}'i`}
                      </span>
                      <span style={{fontSize:'0.6rem',background:'rgba(255,255,255,0.04)',color:'#8899AA',borderRadius:'6px',padding:'2px 6px',border:'1px solid rgba(255,255,255,0.06)'}}>
                        Min: {fmtWord(suc.minMoney)}
                      </span>
                      <span style={{fontSize:'0.6rem',background:'rgba(255,255,255,0.04)',color:'#8899AA',borderRadius:'6px',padding:'2px 6px',border:'1px solid rgba(255,255,255,0.06)'}}>
                        Bekleme: {suc.cooldownMs/3600000}s
                      </span>
                    </div>
                    <button onClick={()=>doCommitCrime(suc)} disabled={!!cdLeft||!canAfford||isFrozen}
                      style={{width:'100%',padding:'0.45rem',borderRadius:'9px',border:`1px solid ${suc.color}44`,
                        background: (cdLeft||!canAfford||isFrozen) ? 'rgba(255,255,255,0.03)' : `${suc.color}18`,
                        color: (cdLeft||!canAfford||isFrozen) ? '#3B4E63' : suc.color,
                        fontWeight:700,fontSize:'0.75rem',cursor:(cdLeft||!canAfford||isFrozen)?'not-allowed':'pointer',
                        fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}}>
                      {isFrozen ? '🔒 İşlemler Donduruldu' : cdLeft ? `⏳ ${cdLeft} dk bekleniyor` : !canAfford ? `💰 Yetersiz bakiye (min ${fmtWord(suc.minMoney)})` : `${suc.icon} Uygula`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==='gecmis' && (
        <div>
          {closedCases.length === 0 ? (
            <div style={{textAlign:'center',padding:'2.5rem 1rem',color:'#3B4E63',fontSize:'0.85rem'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>📂</div>
              Kapalı dava kaydı yok.
            </div>
          ) : closedCases.map(c => {
            const vi = VERDICT_INFO[c.verdict] || VERDICT_INFO.para;
            return (
              <div key={c.id} style={{background:'rgba(11,21,39,0.85)',border:`1px solid ${vi.color}33`,borderRadius:'12px',padding:'0.75rem',marginBottom:'0.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    <span style={{fontSize:'1.2rem'}}>{c.icon}</span>
                    <div>
                      <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.82rem'}}>{c.typeLabel}</div>
                      <div style={{fontSize:'0.63rem',color:'#5A7089'}}>{c.detail}</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'0.7rem',color:vi.color,fontWeight:800}}>{vi.icon} {vi.label}</div>
                    <div style={{fontSize:'0.6rem',color:'#3B4E63'}}>{timeAgo(c.closedTs||c.ts)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HOLDİNG / ŞİRKETLER SAYFASI
// ═══════════════════════════════════════════════════════
const HOLDING_SECTORS = [
  { id:'tech',    label:'Teknoloji',    icon:'💻', baseCost:500000,  profit:18000, maint:5000  },
  { id:'food',    label:'Gıda Sanayi',  icon:'🍔', baseCost:250000,  profit:9000,  maint:2500  },
  { id:'energy',  label:'Enerji',       icon:'⚡', baseCost:800000,  profit:30000, maint:8000  },
  { id:'const',   label:'İnşaat',       icon:'🏗️', baseCost:400000,  profit:14000, maint:4000  },
  { id:'finance', label:'Finans',       icon:'🏦', baseCost:1000000, profit:40000, maint:12000 },
  { id:'media',   label:'Medya',        icon:'📺', baseCost:350000,  profit:12000, maint:3500  },
  { id:'health',  label:'Sağlık',       icon:'🏥', baseCost:600000,  profit:22000, maint:7000  },
  { id:'retail',  label:'Perakende',    icon:'🛒', baseCost:200000,  profit:7000,  maint:2000  },
  { id:'tourism', label:'Turizm',       icon:'✈️', baseCost:450000,  profit:16000, maint:4500  },
  { id:'auto',    label:'Otomotiv',     icon:'🚗', baseCost:700000,  profit:26000, maint:7000  },
];

function HoldingsPage({ profile, setProfile, showNotif }) {
  const [holdings, setHoldings] = useLs('holdings', []);
  const [pendingCompanies, setPendingCompanies] = useLs('pendingCompanies', []);
  const [companyShares, setCompanyShares] = useLs('companyShares', {}); // {companyId: {myQty, avgPrice}}
  const [sub, setSub] = useState('list');
  const [createModal, setCreateModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [holdingName, setHoldingName] = useState('');
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [manageModal, setManageModal] = useState(false);
  const [buyShareModal, setBuyShareModal] = useState(null); // holding being bought
  const [buyQty, setBuyQty] = useState('');

  // Auto-approve pending companies after 24 hours
  useEffect(() => {
    const now = Date.now();
    const toApprove = pendingCompanies.filter(c => c.owner === profile?.uid && now - c.pendingAt > 24*3600000);
    if (toApprove.length > 0) {
      setPendingCompanies(prev => prev.filter(c => !toApprove.find(x => x.id === c.id)));
      setHoldings(prev => [...prev, ...toApprove.map(c => { const {pendingAt,...rest}=c; return rest; })]);
      showNotif(`✅ ${toApprove.length} şirket otomatik onaylandı (24s geçti)`, 'info');
    }
  }, []);

  // Random price fluctuation every 30 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setHoldings(prev => prev.map(h => {
        if (!h.listedOnStock) return h;
        const pct = (Math.random() * 0.1) - 0.05; // ±5%
        const newPrice = Math.max(1, Math.round(h.sharePrice * (1 + pct)));
        return { ...h, sharePrice: newPrice, priceChange: pct };
      }));
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const myHoldings = holdings.filter(h => h.owner === profile?.uid);
  const totalProfit = myHoldings.reduce((s, h) => s + (h.dailyProfit || 0), 0);
  const totalAssets = myHoldings.reduce((s, h) => s + (h.value || 0), 0);

  const createHolding = () => {
    if (!selectedSector) { showNotif('Sektör seçin', 'error'); return; }
    if (!holdingName.trim()) { showNotif('Şirket adı girin', 'error'); return; }
    const sec = HOLDING_SECTORS.find(s => s.id === selectedSector);
    if ((profile?.money || 0) < sec.baseCost) {
      showNotif(`Yetersiz sermaye! ${fmtWord(sec.baseCost)} gerekli`, 'error'); return;
    }
    const cabinet = JSON.parse(localStorage.getItem('rep_cabinet') || '{}');
    const tradeMin = cabinet['Ticaret Bakanı'];
    const h = {
      id: genId(), name: holdingName.trim(), sector: sec.id, sectorLabel: sec.label,
      sectorIcon: sec.icon, owner: profile?.uid, ownerName: profile?.username,
      value: sec.baseCost, dailyProfit: sec.profit, maintenance: sec.maint,
      level: 1, experience: 0, lastProfit: 0, employees: Math.floor(sec.baseCost / 50000),
      listedOnStock: false, shares: [], createdAt: Date.now(),
    };
    setProfile(p => {
      const np = { ...p, money: (p.money||0) - sec.baseCost };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    if (!tradeMin) {
      setHoldings(prev => [...prev, h]);
      showNotif(`🏢 ${h.name} kuruldu! (Ticaret Bakanı atanmadığı için otomatik onaylandı)`, 'success');
    } else {
      setPendingCompanies(prev => [...prev, {...h, pendingAt: Date.now(), tradeMin}]);
      showNotif(`📋 ${h.name} kurulum talebi Ticaret Bakanı'na iletildi. 24 saat içinde yanıt gelmezse otomatik onaylanır.`, 'info');
    }
    setCreateModal(false);
    setHoldingName('');
    setSelectedSector(null);
  };

  const collectProfit = (h) => {
    const elapsed = Date.now() - (h.lastProfit || h.createdAt || Date.now());
    const hours = elapsed / 3600000;
    if (hours < 1) { showNotif('Kar toplama için en az 1 saat bekle', 'error'); return; }
    const earned = Math.floor(h.dailyProfit * Math.min(hours, 24) / 24);
    const newXP = (h.experience || 0) + Math.floor(earned / 10000);
    const leveled = newXP >= 1000;
    const newLevel = h.level + (leveled ? 1 : 0);
    const profitBonus = leveled ? Math.floor(h.dailyProfit * 0.1) : 0;
    setHoldings(prev => prev.map(x => x.id === h.id ? {
      ...x, lastProfit: Date.now(),
      experience: leveled ? 0 : newXP,
      level: newLevel,
      dailyProfit: x.dailyProfit + profitBonus,
      value: x.value + Math.floor(earned * 0.5),
    } : x));
    setProfile(p => {
      const np = { ...p, money: (p.money||0) + earned, xp: (p.xp||0) + 100 };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`💰 ${fmtWord(earned)} kar toplandı!${leveled ? ` 🎉 Seviye ${newLevel}!` : ''}`, 'success');
  };

  const upgradeHolding = (h) => {
    const cost = Math.floor(h.value * 0.5);
    if ((profile?.money || 0) < cost) { showNotif(`Yükseltme için ${fmtWord(cost)} gerekli`, 'error'); return; }
    setHoldings(prev => prev.map(x => x.id === h.id ? {
      ...x, level: x.level + 1, value: x.value + cost,
      dailyProfit: Math.floor(x.dailyProfit * 1.25),
      employees: Math.floor(x.employees * 1.2),
    } : x));
    setProfile(p => {
      const np = { ...p, money: (p.money||0) - cost };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`🏢 ${h.name} yükseltildi! Kâr +%25`, 'success');
    setManageModal(false);
  };

  const sellHolding = (h) => {
    const sellVal = Math.floor(h.value * 0.7);
    setHoldings(prev => prev.filter(x => x.id !== h.id));
    setProfile(p => {
      const np = { ...p, money: (p.money||0) + sellVal };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`💸 ${h.name} satıldı: ${fmtWord(sellVal)}`, 'info');
    setManageModal(false);
    setSelectedHolding(null);
  };

  const getReadyToCollect = (h) => {
    const hours = (Date.now() - (h.lastProfit || h.createdAt || 0)) / 3600000;
    return hours >= 1;
  };

  const getTimeLeft = (h) => {
    const elapsed = (Date.now() - (h.lastProfit || h.createdAt || 0));
    const left = 3600000 - elapsed;
    if (left <= 0) return null;
    const mins = Math.ceil(left / 60000);
    return `${mins}dk`;
  };

  const listOnStock = (h) => {
    const TOTAL_SHARES = 1000000;
    const pricePerShare = Math.max(1, Math.round(h.value / TOTAL_SHARES));
    setHoldings(prev => prev.map(x => x.id === h.id ? {
      ...x, listedOnStock: true, totalShares: TOTAL_SHARES,
      sharePrice: pricePerShare, priceChange: 0, ipoDate: Date.now(),
    } : x));
    showNotif(`📈 ${h.name} borsaya açıldı! Hisse fiyatı: ${fmtWord(pricePerShare)}`, 'success');
    setManageModal(false);
    setSelectedHolding(null);
    setSub('market');
  };

  const buyShares = (h) => {
    const qty = parseInt(buyQty) || 0;
    if (qty <= 0) { showNotif('Geçerli bir adet girin', 'error'); return; }
    const cost = qty * h.sharePrice;
    if ((profile?.money||0) < cost) { showNotif(`Yetersiz para! Gerekli: ${fmtWord(cost)}`, 'error'); return; }
    const existing = companyShares[h.id] || { qty: 0, avgPrice: 0 };
    const newQty = existing.qty + qty;
    const newAvg = Math.round((existing.qty * existing.avgPrice + cost) / newQty);
    setCompanyShares(prev => ({ ...prev, [h.id]: { qty: newQty, avgPrice: newAvg } }));
    const priceIncrease = Math.round(h.sharePrice * 0.001 * qty / 1000 + 1);
    const valueIncrease = cost * 0.3;
    setHoldings(prev => prev.map(x => x.id === h.id ? {
      ...x, sharePrice: x.sharePrice + priceIncrease, value: x.value + valueIncrease,
    } : x));
    setProfile(p => {
      const np = { ...p, money: (p.money||0) - cost };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    setBuyShareModal(null);
    setBuyQty('');
    showNotif(`✅ ${qty.toLocaleString()} hisse alındı! -${fmtWord(cost)} • Hisse fiyatı yükseldi`, 'success');
  };

  const sellMyShares = (h) => {
    const myPos = companyShares[h.id];
    if (!myPos?.qty) { showNotif('Elinde bu şirketin hissesi yok', 'error'); return; }
    const revenue = myPos.qty * h.sharePrice;
    const profit = revenue - myPos.qty * myPos.avgPrice;
    const priceDecrease = Math.max(1, Math.round(h.sharePrice * 0.01));
    setHoldings(prev => prev.map(x => x.id === h.id ? {
      ...x, sharePrice: Math.max(1, x.sharePrice - priceDecrease),
      value: Math.max(0, x.value - revenue * 0.2),
    } : x));
    setCompanyShares(prev => { const n = {...prev}; delete n[h.id]; return n; });
    setProfile(p => {
      const np = { ...p, money: (p.money||0) + revenue };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`💸 ${myPos.qty.toLocaleString()} hisse satıldı! +${fmtWord(revenue)} • ${profit >= 0 ? '+' : ''}${fmtWord(profit)} kâr`, profit >= 0 ? 'success' : 'info');
  };

  return (
    <div>
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {[{id:'list',label:'🏢 Şirketlerim'},{id:'market',label:'🌐 Piyasa'},{id:'sectors',label:'📊 Sektörler'},{id:'fon',label:'🕵️ Gizli Fon'}].map(s=>(
          <button key={s.id} onClick={()=>setSub(s.id)}
            style={{padding:'0.38rem 0.75rem',borderRadius:'8px',border:`1px solid ${sub===s.id?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.07)'}`,background:sub===s.id?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.03)',color:sub===s.id?'#10B981':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.76rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{padding:'0.7rem'}}>
        {sub === 'list' && (
          <div>
            {/* Overview stats */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[
                ['🏢', 'Şirketler', myHoldings.length, '#60A5FA'],
                ['💰', 'Günlük Kâr', fmtWord(totalProfit), '#10B981'],
                ['📊', 'Toplam Değer', fmtWord(totalAssets), '#F59E0B'],
              ].map(([ic, lb, v, c]) => (
                <Card key={lb} style={{padding:'0.7rem',textAlign:'center'}}>
                  <div style={{fontSize:'1.1rem',marginBottom:'0.15rem'}}>{ic}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:c,fontSize:'0.8rem'}}>{v}</div>
                  <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase',fontWeight:700}}>{lb}</div>
                </Card>
              ))}
            </div>

            {/* Pending company cards */}
            {pendingCompanies.filter(c => c.owner === profile?.uid).map(c => {
              const rem = Math.max(0, (c.pendingAt + 24*3600000) - Date.now());
              const h2 = Math.floor(rem/3600000); const m2 = Math.floor((rem%3600000)/60000);
              return (
                <Card key={c.id} style={{marginBottom:'0.5rem',padding:'1rem',border:'1px solid rgba(245,158,11,0.35)',background:'rgba(245,158,11,0.05)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <div style={{fontSize:'2rem',flexShrink:0}}>{c.sectorIcon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,color:'#F59E0B',fontSize:'0.95rem'}}>{c.name}</div>
                      <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{c.sectorLabel} • Onay bekleniyor</div>
                      <div style={{fontSize:'0.65rem',color:'#F59E0B',marginTop:'0.25rem'}}>
                        ⏳ {rem > 0 ? `${h2}s ${m2}dk sonra otomatik onaylanır` : 'Onay süresi doldu, yenile'}
                      </div>
                    </div>
                    <div style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',padding:'3px 10px',fontSize:'0.65rem',color:'#F59E0B',fontWeight:700}}>ONAY BEKLİYOR</div>
                  </div>
                </Card>
              );
            })}

            {!myHoldings.length && !pendingCompanies.filter(c=>c.owner===profile?.uid).length && (
              <Card style={{textAlign:'center',padding:'2rem',marginBottom:'0.75rem'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🏢</div>
                <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.3rem'}}>Henüz şirketin yok</div>
                <div style={{fontSize:'0.78rem',color:'#5A7089',marginBottom:'1rem'}}>Bir sektör seç ve ilk şirketini kur</div>
                <Btn variant='green' size='md' onClick={()=>setCreateModal(true)}>+ Şirket Kur</Btn>
              </Card>
            )}

            {myHoldings.map(h => {
              const ready = getReadyToCollect(h);
              const timeLeft = getTimeLeft(h);
              const pendingHours = Math.min((Date.now()-(h.lastProfit||h.createdAt||Date.now()))/3600000, 24);
              const pendingProfit = Math.floor(h.dailyProfit * pendingHours / 24);
              return (
                <Card key={h.id} style={{marginBottom:'0.5rem',padding:'1rem',border:`1px solid ${ready?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.06)'}`}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem'}}>
                    <div style={{fontSize:'2rem',flexShrink:0,lineHeight:1}}>{h.sectorIcon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
                        <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.95rem'}}>{h.name}</div>
                        <Tag color='blue'>Lv.{h.level}</Tag>
                        {h.listedOnStock && <Tag color='gold'>📈 Borsada</Tag>}
                      </div>
                      <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.4rem'}}>{h.sectorLabel} • {h.employees?.toLocaleString()} çalışan</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.3rem',marginBottom:'0.5rem'}}>
                        <div style={{fontSize:'0.7rem'}}><span style={{color:'#5A7089'}}>Değer: </span><span style={{color:'#E8EDF2',fontWeight:700}}>{fmtWord(h.value)}</span></div>
                        <div style={{fontSize:'0.7rem'}}><span style={{color:'#5A7089'}}>Günlük: </span><span style={{color:'#10B981',fontWeight:700}}>{fmtWord(h.dailyProfit)}</span></div>
                      </div>
                      {/* XP bar */}
                      <div style={{marginBottom:'0.5rem'}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.58rem',color:'#3B4E63',marginBottom:'2px'}}>
                          <span>Deneyim</span><span>{h.experience||0}/1000</span>
                        </div>
                        <ProgressBar pct={((h.experience||0)/1000)*100} color='#8B5CF6' h={4} />
                      </div>
                      {/* Pending profit */}
                      {pendingProfit > 0 && (
                        <div style={{fontSize:'0.7rem',color:ready?'#10B981':'#F59E0B',marginBottom:'0.4rem',fontWeight:600}}>
                          {ready ? `✅ ${fmtWord(pendingProfit)} toplanmayı bekliyor` : `⏳ ${fmtWord(pendingProfit)} birikiyor (${timeLeft} kaldı)`}
                        </div>
                      )}
                      <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                        {ready && <Btn variant='green' size='sm' onClick={()=>collectProfit(h)}>💰 Kar Topla</Btn>}
                        <Btn variant='ghost' size='sm' onClick={()=>{setSelectedHolding(h);setManageModal(true);}}>⚙️ Yönet</Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {myHoldings.length > 0 && (
              <Btn variant='primary' size='full' onClick={()=>setCreateModal(true)} style={{marginTop:'0.5rem'}}>+ Yeni Şirket Kur</Btn>
            )}
          </div>
        )}

        {sub === 'market' && (() => {
          const listedHoldings = holdings.filter(h => h.listedOnStock);
          const myShareHoldings = Object.entries(companyShares).filter(([,v])=>v?.qty>0);
          return (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
              <Card style={{padding:'0.7rem',textAlign:'center'}}>
                <div style={{fontSize:'1.1rem',marginBottom:'0.15rem'}}>📈</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'#10B981',fontSize:'0.8rem'}}>{listedHoldings.length}</div>
                <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase',fontWeight:700}}>Borsada Şirket</div>
              </Card>
              <Card style={{padding:'0.7rem',textAlign:'center'}}>
                <div style={{fontSize:'1.1rem',marginBottom:'0.15rem'}}>💼</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'#60A5FA',fontSize:'0.8rem'}}>{myShareHoldings.length}</div>
                <div style={{fontSize:'0.55rem',color:'#3B4E63',textTransform:'uppercase',fontWeight:700}}>Hissem Olan</div>
              </Card>
            </div>

            {myShareHoldings.length > 0 && (
              <div style={{marginBottom:'0.75rem'}}>
                <div style={{fontSize:'0.7rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>💼 Portföyüm</div>
                {myShareHoldings.map(([hId, pos]) => {
                  const h = holdings.find(x => x.id === hId);
                  if (!h) return null;
                  const currVal = pos.qty * h.sharePrice;
                  const costVal = pos.qty * pos.avgPrice;
                  const pnl = currVal - costVal;
                  return (
                    <Card key={hId} style={{marginBottom:'0.4rem',padding:'0.75rem',border:`1px solid ${pnl>=0?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.85rem'}}>{h.sectorIcon} {h.name}</div>
                          <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{pos.qty.toLocaleString()} hisse • Ort. {fmtWord(pos.avgPrice)}/hisse</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontWeight:800,color:pnl>=0?'#10B981':'#EF4444',fontSize:'0.85rem'}}>{pnl>=0?'+':''}{fmtWord(pnl)}</div>
                          <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{fmtWord(h.sharePrice)}/hisse</div>
                          <button onClick={()=>sellMyShares(h)} style={{marginTop:'0.3rem',padding:'2px 8px',borderRadius:'6px',border:'none',background:'rgba(239,68,68,0.2)',color:'#F87171',fontSize:'0.62rem',fontWeight:700,cursor:'pointer'}}>
                            💸 Sat
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Borsa Lider Tablosu */}
            {listedHoldings.length > 1 && (() => {
              const sortedByVal = [...listedHoldings].sort((a,b)=>(b.value||0)-(a.value||0));
              return (
                <div style={{marginBottom:'0.75rem'}}>
                  <div style={{fontSize:'0.7rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>🏆 Borsa Lider Tablosu</div>
                  {sortedByVal.slice(0,5).map((h,i)=>{
                    const chg = h.priceChange||0;
                    return (
                      <div key={h.id} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.55rem 0.65rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${i===0?'rgba(245,158,11,0.25)':'rgba(255,255,255,0.05)'}`,borderRadius:'10px',marginBottom:'0.3rem'}}>
                        <div style={{width:'24px',textAlign:'center',fontWeight:800,fontSize:'0.85rem',flexShrink:0,color:i===0?'#F59E0B':i===1?'#94A3B8':i===2?'#B45309':'#5A7089'}}>{['🥇','🥈','🥉'][i]||`${i+1}.`}</div>
                        <div style={{fontSize:'1.1rem',flexShrink:0}}>{h.sectorIcon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.82rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.name}</div>
                          <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{h.ownerName}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontWeight:800,color:'#F59E0B',fontSize:'0.78rem'}}>{fmtWord(h.sharePrice)}</div>
                          <div style={{fontSize:'0.62rem',color:chg>=0?'#10B981':'#EF4444',fontWeight:700}}>{chg>=0?'▲':'▼'}{Math.abs((chg*100).toFixed(1))}%</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0,borderLeft:'1px solid rgba(255,255,255,0.06)',paddingLeft:'0.5rem'}}>
                          <div style={{fontWeight:700,color:'#60A5FA',fontSize:'0.78rem'}}>{fmtWord(h.value)}</div>
                          <div style={{fontSize:'0.6rem',color:'#3B4E63'}}>değer</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{fontSize:'0.7rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>📊 Tüm Hisseler</div>
            {listedHoldings.length === 0 && (
              <Card style={{textAlign:'center',padding:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📈</div>
                <div style={{color:'#5A7089',fontSize:'0.85rem'}}>Henüz borsa'ya açılmış şirket yok</div>
                <div style={{color:'#3B4E63',fontSize:'0.72rem',marginTop:'0.4rem'}}>Şirketlerinden birini Yönet menüsünden piyasaya açabilirsin</div>
              </Card>
            )}
            {listedHoldings.map(h => {
              const myPos = companyShares[h.id];
              const isOwner = h.owner === profile?.uid;
              const chg = h.priceChange || 0;
              const chgPct = (chg * 100).toFixed(1);
              return (
                <Card key={h.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:'1px solid rgba(16,185,129,0.15)'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'0.75rem'}}>
                    <div style={{fontSize:'1.75rem',flexShrink:0,lineHeight:1}}>{h.sectorIcon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
                        <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{h.name}</div>
                        {isOwner && <Tag color='gold'>CEO</Tag>}
                        <Tag color='green'>📈 HALKA AÇIK</Tag>
                      </div>
                      <div style={{fontSize:'0.7rem',color:'#5A7089',marginBottom:'0.4rem'}}>{h.sectorLabel} • {h.ownerName} • Lv.{h.level}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.3rem',marginBottom:'0.5rem'}}>
                        <div style={{fontSize:'0.68rem'}}>
                          <span style={{color:'#5A7089'}}>Fiyat </span>
                          <span style={{color:'#F59E0B',fontWeight:800}}>{fmtWord(h.sharePrice)}</span>
                        </div>
                        <div style={{fontSize:'0.68rem'}}>
                          <span style={{color:chg>=0?'#10B981':'#EF4444',fontWeight:700}}>{chg>=0?'▲':'▼'} %{Math.abs(chgPct)}</span>
                        </div>
                        <div style={{fontSize:'0.68rem'}}>
                          <span style={{color:'#5A7089'}}>Değer </span>
                          <span style={{color:'#E8EDF2',fontWeight:700}}>{fmtWord(h.value)}</span>
                        </div>
                      </div>
                      {myPos?.qty > 0 && (
                        <div style={{fontSize:'0.65rem',color:'#60A5FA',marginBottom:'0.4rem',background:'rgba(59,130,246,0.08)',borderRadius:'6px',padding:'0.2rem 0.5rem'}}>
                          💼 Elinde: {myPos.qty.toLocaleString()} hisse • Değer: {fmtWord(myPos.qty * h.sharePrice)}
                        </div>
                      )}
                      {!isOwner && (
                        <div style={{display:'flex',gap:'0.4rem'}}>
                          <Btn variant='green' size='sm' onClick={()=>{setBuyShareModal(h);setBuyQty('');}}>📈 Hisse Al</Btn>
                          {myPos?.qty > 0 && <Btn variant='danger' size='sm' onClick={()=>sellMyShares(h)}>💸 Sat</Btn>}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          );
        })()}

        {sub === 'fon' && (
          <div>
            <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'14px',padding:'0.85rem',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.65rem',color:'#F87171',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.3rem'}}>🕵️ GİZLİ FİNANSMAN</div>
              <div style={{fontSize:'0.75rem',color:'#E8EDF2',fontWeight:700,marginBottom:'0.3rem'}}>Holdingler → Parti Gizli Fon Transferi</div>
              <div style={{fontSize:'0.68rem',color:'#5A7089',lineHeight:1.6}}>
                Holding sahipleri, ellerindeki şirket kasasından siyasi partilere <span style={{color:'#F87171',fontWeight:700}}>gizlice</span> para transfer edebilir. Bu işlem kayıtlara geçmez, ancak parti hazinesini güçlendirir. Gerçek hayatta olduğu gibi, bu işlem yasal gri alandadır.
              </div>
            </div>

            {myHoldings.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'2rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🏢</div>
                <div style={{color:'#5A7089',fontSize:'0.82rem'}}>Gizli fon için önce bir şirket kur</div>
              </div>
            ) : (() => {
              const allParties = JSON.parse(localStorage.getItem('parties')||'[]');
              return (
                <div>
                  {myHoldings.map(h => (
                    <SecretFundingCard key={h.id} holding={h} holdings={holdings} setHoldings={setHoldings} parties={allParties} profile={profile} setProfile={setProfile} showNotif={showNotif} />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {sub === 'sectors' && (
          <div>
            <div style={{color:'#5A7089',fontSize:'0.78rem',marginBottom:'0.75rem'}}>📊 Sektörlere göre şirket kuruluş maliyetleri</div>
            {HOLDING_SECTORS.map(sec => {
              const owned = holdings.filter(h => h.sector === sec.id).length;
              const canAfford = (profile?.money||0) >= sec.baseCost;
              return (
                <Card key={sec.id} style={{marginBottom:'0.5rem',padding:'0.85rem',opacity:canAfford?1:0.6}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <span style={{fontSize:'1.75rem',flexShrink:0}}>{sec.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{sec.label}</div>
                      <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{owned} aktif şirket • {fmtWord(owned*sec.profit)}/gün toplam kâr</div>
                      <div style={{display:'flex',gap:'1rem',marginTop:'0.3rem',fontSize:'0.68rem'}}>
                        <span style={{color:'#10B981'}}>Kâr: {fmtWord(sec.profit)}/gün</span>
                        <span style={{color:'#EF4444'}}>Bakım: {fmtWord(sec.maint)}/gün</span>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{color:'#F59E0B',fontWeight:800,fontSize:'0.85rem'}}>{fmtWord(sec.baseCost)}</div>
                      <Btn variant={canAfford?'green':'ghost'} size='sm' onClick={()=>{if(canAfford){setSelectedSector(sec.id);setCreateModal(true);}else{showNotif('Yetersiz sermaye','error');}}} style={{marginTop:'0.25rem'}}>
                        {canAfford ? '+ Kur' : '🔒'}
                      </Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModal && (
        <Modal title="🏢 Şirket Kur" onClose={()=>{setCreateModal(false);setSelectedSector(null);setHoldingName('');}}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Şirket Adı</div>
            <input value={holdingName} onChange={e=>setHoldingName(e.target.value)} placeholder="Şirket adını girin"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Sektör Seç</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.35rem',maxHeight:'280px',overflowY:'auto'}}>
              {HOLDING_SECTORS.map(sec => {
                const canAfford = (profile?.money||0) >= sec.baseCost;
                return (
                  <button key={sec.id} onClick={()=>canAfford&&setSelectedSector(sec.id)}
                    style={{padding:'0.65rem',borderRadius:'10px',border:`1px solid ${selectedSector===sec.id?'rgba(16,185,129,0.5)':'rgba(255,255,255,0.08)'}`,background:selectedSector===sec.id?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.03)',cursor:canAfford?'pointer':'not-allowed',opacity:canAfford?1:0.45,textAlign:'left'}}>
                    <div style={{fontSize:'1.2rem',marginBottom:'0.15rem'}}>{sec.icon}</div>
                    <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.78rem'}}>{sec.label}</div>
                    <div style={{fontSize:'0.62rem',color:'#10B981'}}>{fmtWord(sec.profit)}/gün</div>
                    <div style={{fontSize:'0.62rem',color:canAfford?'#5A7089':'#EF4444'}}>{fmtWord(sec.baseCost)}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {selectedSector && (
            <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#10B981',marginBottom:'1rem'}}>
              💡 Sermaye: {fmtWord(HOLDING_SECTORS.find(s=>s.id===selectedSector)?.baseCost)} • Bakiye: {fmtWord(profile?.money)}
            </div>
          )}
          <Btn variant='green' size='full' onClick={createHolding} disabled={!selectedSector||!holdingName.trim()}>🏢 Şirketi Kur</Btn>
        </Modal>
      )}

      {/* Manage Modal */}
      {manageModal && selectedHolding && (
        <Modal title={`⚙️ ${selectedHolding.name}`} onClose={()=>{setManageModal(false);setSelectedHolding(null);}}>
          <div style={{marginBottom:'1rem'}}>
            {[
              ['Sektör', selectedHolding.sectorLabel],
              ['Seviye', `Lv.${selectedHolding.level}`],
              ['Değer', fmtWord(selectedHolding.value)],
              ['Günlük Kâr', fmtWord(selectedHolding.dailyProfit)],
              ['Bakım Maliyeti', fmtWord(selectedHolding.maintenance)],
              ['Net Kâr', fmtWord(selectedHolding.dailyProfit - selectedHolding.maintenance)],
              ['Çalışan', selectedHolding.employees?.toLocaleString()],
              ...(selectedHolding.listedOnStock ? [
                ['Hisse Fiyatı', fmtWord(selectedHolding.sharePrice)],
                ['Toplam Hisse', (selectedHolding.totalShares||0).toLocaleString()],
              ] : []),
            ].map(([k,v]) => (
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.82rem'}}>
                <span style={{color:'#5A7089'}}>{k}</span>
                <span style={{color:'#E8EDF2',fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.5rem'}}>
            <Btn variant='primary' size='sm' onClick={()=>upgradeHolding(selectedHolding)}>
              ⬆️ Yükselt ({fmtWord(Math.floor(selectedHolding.value*0.5))})
            </Btn>
            <Btn variant='danger' size='sm' onClick={()=>sellHolding(selectedHolding)}>
              💸 Sat ({fmtWord(Math.floor(selectedHolding.value*0.7))})
            </Btn>
          </div>
          {!selectedHolding.listedOnStock && (
            <Btn variant='ghost' size='full' onClick={()=>listOnStock(selectedHolding)} style={{marginBottom:'0.5rem',border:'1px solid rgba(16,185,129,0.3)',color:'#10B981'}}>
              📈 Halka Aç (IPO) — Borsaya Listele
            </Btn>
          )}
          {selectedHolding.listedOnStock && (
            <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px',padding:'0.55rem',textAlign:'center',marginBottom:'0.5rem',fontSize:'0.75rem',color:'#10B981',fontWeight:700}}>
              ✅ Borsa'da listelendi • Hisse: {fmtWord(selectedHolding.sharePrice)}/adet
            </div>
          )}
          {getReadyToCollect(selectedHolding) && (
            <Btn variant='green' size='full' onClick={()=>{collectProfit(selectedHolding);setManageModal(false);setSelectedHolding(null);}}>
              💰 Kar Topla
            </Btn>
          )}
        </Modal>
      )}

      {/* Buy Shares Modal */}
      {buyShareModal && (
        <Modal title={`📈 ${buyShareModal.name} Hisse Al`} onClose={()=>{setBuyShareModal(null);setBuyQty('');}}>
          <div style={{marginBottom:'1rem'}}>
            {[
              ['Güncel Hisse Fiyatı', fmtWord(buyShareModal.sharePrice)],
              ['Şirket Değeri', fmtWord(buyShareModal.value)],
              ['Günlük Kâr', fmtWord(buyShareModal.dailyProfit)],
              ['Bakiye', fmtWord(profile?.money||0)],
            ].map(([k,v]) => (
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'0.35rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.8rem'}}>
                <span style={{color:'#5A7089'}}>{k}</span>
                <span style={{color:'#E8EDF2',fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginBottom:'0.75rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Kaç Hisse Almak İstiyorsun?</div>
            <input type='number' value={buyQty} onChange={e=>setBuyQty(e.target.value)} placeholder='örn. 1000'
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
            {buyQty && parseInt(buyQty) > 0 && (
              <div style={{marginTop:'0.5rem',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'8px',padding:'0.45rem 0.75rem',fontSize:'0.75rem',color:'#10B981',fontWeight:700}}>
                💰 Toplam maliyet: {fmtWord(parseInt(buyQty) * buyShareModal.sharePrice)}
                {parseInt(buyQty) * buyShareModal.sharePrice > (profile?.money||0) && (
                  <span style={{color:'#EF4444'}}> — YETERSİZ BAKİYE!</span>
                )}
              </div>
            )}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.35rem',marginBottom:'0.75rem'}}>
            {[100, 1000, 10000].map(n => (
              <button key={n} onClick={()=>setBuyQty(String(n))}
                style={{padding:'0.4rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#E8EDF2',fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>
                {n.toLocaleString()}
              </button>
            ))}
          </div>
          <Btn variant='green' size='full' onClick={()=>buyShares(buyShareModal)} disabled={!buyQty||parseInt(buyQty)<=0}>
            ✅ Satın Al — {buyQty && parseInt(buyQty)>0 ? fmtWord(parseInt(buyQty)*buyShareModal.sharePrice) : '₱0'}
          </Btn>
          <div style={{marginTop:'0.5rem',fontSize:'0.65rem',color:'#3B4E63',textAlign:'center'}}>
            Hisse alımı şirket değerini ve hisse fiyatını yükseltir
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BİLDİRİM PANELİ
// ═══════════════════════════════════════════════════════
function NotifPanel({ notifications, onClose, onClear }) {
  return (
    <Modal title="🔔 Bildirimler" onClose={onClose}>
      {notifications.length === 0 ? (
        <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Bildirim yok</div>
      ) : (
        <>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'0.5rem'}}>
            <Btn variant='ghost' size='sm' onClick={onClear}>Hepsini Sil</Btn>
          </div>
          {notifications.slice().reverse().map((n,i) => (
            <div key={i} style={{display:'flex',gap:'0.65rem',padding:'0.65rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'10px',marginBottom:'0.35rem'}}>
              <span style={{fontSize:'1.1rem',flexShrink:0}}>{n.icon||'🔔'}</span>
              <div>
                <div style={{fontSize:'0.85rem',color:'#D0E0F0',fontWeight:600}}>{n.msg}</div>
                <div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'2px'}}>{timeAgo(n.ts)}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// FUTBOL SAYFASI
// ═══════════════════════════════════════════════════════
function FootballPage({ profile, setProfile, showNotif }) {
  const [clubs, setClubs] = useLs('footballClubs', []);
  const [matches, setMatches] = useLs('footballMatches', []);
  const [tab, setTab] = useState('clubs');
  const [cooldown, setCooldown] = useLs('footballCooldown', {});
  const now = Date.now();
  const cu = profile || {};
  const updateUser = (upd) => {
    const next = { ...cu, ...upd };
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try {
      const users = JSON.parse(localStorage.getItem('rep_users')||'[]');
      localStorage.setItem('rep_users', JSON.stringify(users.map(u => u.id===next.id ? next : u)));
    } catch{}
  };
  const myClub = clubs.find(c => c.owner === cu.username);

  const createClub = async () => {
    if ((cu.money||0) < 2000000) { showNotif('❌ ₱2,000,000 gerekli!','error'); return; }
    const name = prompt('⚽ Kulüp adını girin:');
    if (!name) return;
    const club = {
      id: Date.now(), name, owner: cu.username, city: cu.city||'İstanbul',
      color: ['#D00000','#003DA5','#FFD700','#008000','#FF6B00'][Math.floor(Math.random()*5)],
      budget: 500000, fans: Math.floor(Math.random()*5000)+1000,
      rating: Math.floor(Math.random()*20)+60,
      attack: Math.floor(Math.random()*15)+55, defense: Math.floor(Math.random()*15)+55,
      players: [
        {name:'Ahmet Yılmaz',pos:'Kaleci',rating:72},{name:'Mehmet Kaya',pos:'Defans',rating:68},
        {name:'Ali Demir',pos:'Orta Saha',rating:75},{name:'Ömer Şahin',pos:'Forvet',rating:78},
        {name:'Hasan Çelik',pos:'Defans',rating:71}
      ],
      wins:0, draws:0, losses:0, goals:0, conceded:0, points:0, season:1,
      founded: new Date().toLocaleDateString('tr-TR')
    };
    updateUser({ money: (cu.money||0) - 2000000 });
    setClubs(prev => [...prev, club]);
    showNotif(`✅ ${name} kuruldu! ₱500,000 başlangıç bütçesi.`, 'success');
  };

  const playMatch = (opp) => {
    const lastMatch = cooldown[cu.username] || 0;
    if (now - lastMatch < 5*60*1000) { showNotif('⏳ Maç cooldown: 5 dakika bekle!', 'error'); return; }
    const myStr = myClub.attack + myClub.defense + (myClub.players||[]).reduce((s,p)=>s+p.rating,0)/10;
    const oppStr = opp.attack + opp.defense + (opp.players||[]).reduce((s,p)=>s+p.rating,0)/10;
    const winP = Math.min(80, Math.max(20, (myStr/(myStr+oppStr))*100));
    const won = Math.random()*100 < winP;
    const drew = !won && Math.random() < 0.25;
    const myG = Math.floor(Math.random()*4)+(won?1:0);
    const oppG = won ? Math.max(0,myG-Math.floor(Math.random()*2)-1) : myG+(drew?0:Math.floor(Math.random()*2)+1);
    const prize = won?150000:drew?50000:0;
    const fanChg = won?Math.floor(Math.random()*500)+200:drew?50:-100;
    const match = {id:Date.now(),home:myClub.name,away:opp.name,homeGoals:myG,awayGoals:oppG,date:new Date().toLocaleDateString('tr-TR'),result:won?'win':drew?'draw':'loss'};
    setMatches(prev => [match, ...prev].slice(0,50));
    setClubs(prev => prev.map(c => {
      if (c.id===myClub.id) return {...c,wins:c.wins+(won?1:0),draws:c.draws+(drew?1:0),losses:c.losses+(!won&&!drew?1:0),goals:c.goals+myG,conceded:c.conceded+oppG,points:c.points+(won?3:drew?1:0),fans:Math.max(0,(c.fans||0)+fanChg),budget:(c.budget||0)+prize};
      if (c.id===opp.id) return {...c,wins:c.wins+(!won&&!drew?1:0),draws:c.draws+(drew?1:0),losses:c.losses+(won?1:0),goals:c.goals+oppG,conceded:c.conceded+myG,points:c.points+(!won&&!drew?3:drew?1:0)};
      return c;
    }));
    if (prize) updateUser({ money: (cu.money||0)+prize });
    setCooldown(prev => ({...prev,[cu.username]:now}));
    const res = won?`🏆 GALİBİYET! ${myG}-${oppG}`:drew?`🤝 BERABERLİK! ${myG}-${oppG}`:`💔 MAĞLUBIYET! ${myG}-${oppG}`;
    showNotif(res + (prize ? ' +₱'+prize.toLocaleString() : '') + (fanChg>0 ? ' +'+fanChg+' taraftar' : fanChg<0 ? ' '+fanChg+' taraftar' : ''), won?'success':drew?'info':'error');
  };

  const transferPlayer = () => {
    if (!myClub) return;
    if ((myClub.budget||0)<250000) { showNotif('❌ Transfer için ₱250,000 bütçe gerekli!','error'); return; }
    const names=['Kemal Aydın','Burak Doğan','Serkan Polat','Emre Güzel','Tolga Arslan','Cem Yıldız','Ferhat Korkmaz'];
    const positions=['Kaleci','Defans','Orta Saha','Forvet','Kanat'];
    const newP={name:names[Math.floor(Math.random()*names.length)],pos:positions[Math.floor(Math.random()*positions.length)],rating:Math.floor(Math.random()*20)+65};
    setClubs(prev=>prev.map(c=>c.id===myClub.id?{...c,players:[...(c.players||[]),newP],budget:(c.budget||0)-250000,rating:Math.floor((c.rating*((c.players||[]).length)+newP.rating)/((c.players||[]).length+1))}:c));
    showNotif(`✅ ${newP.name} transfer edildi! (${newP.rating} puan) -₱250,000`, 'success');
  };

  const sortedLeague = [...clubs].sort((a,b)=>(b.points||0)-(a.points||0));
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#10B981',marginBottom:'1rem',letterSpacing:'0.05em'}}>⚽ Futbol Yönetimi</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {[{k:'clubs',l:'⚽ Kulübüm'},{k:'league',l:'🏆 Lig'},{k:'matches',l:'📅 Maçlar'},{k:'transfer',l:'🔄 Transfer'},{k:'training',l:'🏃 Antrenman'},{k:'tactics',l:'🧠 Taktik'},{k:'infrastructure',l:'🏟 Altyapı'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 1rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#10B981':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(16,185,129,0.15)':'transparent',color:tab===t.k?'#10B981':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='clubs'&&(<div>
        {!myClub&&<div style={{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
          <div style={{fontWeight:700,color:'#10B981',marginBottom:'0.5rem'}}>⚽ Kulüp Kur</div>
          <p style={{fontSize:'0.85rem',color:'#999',marginBottom:'0.75rem'}}>Kendi futbol kulübünü kur, oyuncular al, liglerde şampiyon ol! Kurulum ücreti: ₱2,000,000</p>
          <button onClick={createClub} style={{padding:'0.6rem 1.2rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'8px',color:'#10B981',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>⚽ Kulüp Kur (₱2,000,000)</button>
        </div>}
        {myClub&&<div>
          <div style={{background:`linear-gradient(135deg,${myClub.color||'#10B981'}22,rgba(0,0,0,0))`,border:`1px solid ${myClub.color||'#10B981'}44`,borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',color:myClub.color||'#10B981'}}>{myClub.name}</div><div style={{fontSize:'0.78rem',color:'#999'}}>📍 {myClub.city} · Kuruluş: {myClub.founded}</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.8rem'}}>⭐</div><div style={{fontWeight:900,fontSize:'1.3rem',color:'#FFD700'}}>{myClub.rating}</div></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[{l:'Bütçe',v:`₱${((myClub.budget||0)/1000).toFixed(0)}K`,c:'#10B981'},{l:'Taraftar',v:(myClub.fans||0).toLocaleString(),c:'#60A5FA'},{l:'Hücum',v:myClub.attack||65,c:'#EF4444'},{l:'Savunma',v:myClub.defense||65,c:'#3B82F6'}].map(s=>(
                <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.5rem',textAlign:'center'}}><div style={{fontWeight:700,color:s.c,fontSize:'0.9rem'}}>{s.v}</div><div style={{fontSize:'0.62rem',color:'#666'}}>{s.l}</div></div>
              ))}
            </div>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
              {[{l:'G',v:myClub.wins||0,c:'#10B981'},{l:'B',v:myClub.draws||0,c:'#F59E0B'},{l:'M',v:myClub.losses||0,c:'#EF4444'},{l:'Gol',v:myClub.goals||0,c:'#60A5FA'},{l:'Puan',v:myClub.points||0,c:'#FFD700'}].map(s=>(
                <div key={s.l} style={{padding:'0.2rem 0.6rem',background:'rgba(255,255,255,0.04)',borderRadius:'4px',fontSize:'0.75rem'}}><span style={{color:s.c,fontWeight:700}}>{s.v}</span> <span style={{color:'#aaa'}}>{s.l}</span></div>
              ))}
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
            <div style={{fontWeight:700,color:'#60A5FA',marginBottom:'0.5rem',fontSize:'0.9rem'}}>👕 Kadro</div>
            {(myClub.players||[]).map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.35rem 0.5rem',borderRadius:'6px',marginBottom:'0.25rem',background:'rgba(255,255,255,0.03)'}}>
                <div><span style={{fontWeight:600,fontSize:'0.85rem'}}>{p.name}</span><span style={{fontSize:'0.7rem',color:'#999',marginLeft:'0.4rem'}}>{p.pos}</span></div>
                <div style={{fontWeight:700,color:p.rating>=80?'#FFD700':p.rating>=70?'#10B981':'#999',fontSize:'0.85rem'}}>{p.rating}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
            <div style={{fontWeight:700,color:'#F59E0B',marginBottom:'0.5rem',fontSize:'0.9rem'}}>⚽ Lig Maçı</div>
            {clubs.filter(c=>c.id!==myClub.id).length===0&&<div style={{color:'#555',fontSize:'0.85rem'}}>Henüz rakip kulüp yok. Başka oyuncular kulüp kurmasını bekle!</div>}
            {clubs.filter(c=>c.id!==myClub.id).map(opp=>{
              const myStr=myClub.attack+myClub.defense+(myClub.players||[]).reduce((s,p)=>s+p.rating,0)/10;
              const oppStr=opp.attack+opp.defense+(opp.players||[]).reduce((s,p)=>s+p.rating,0)/10;
              const winP=Math.round(Math.min(80,Math.max(20,(myStr/(myStr+oppStr))*100)));
              return (
                <div key={opp.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.5rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px',marginBottom:'0.3rem',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div><div style={{fontWeight:700,fontSize:'0.85rem'}}>{opp.name}</div><div style={{fontSize:'0.7rem',color:'#999'}}>{opp.city} · Rating: {opp.rating} · Şans: <span style={{color:winP>=60?'#10B981':winP>=40?'#F59E0B':'#EF4444'}}>%{winP}</span></div></div>
                  <button onClick={()=>playMatch(opp)} style={{padding:'0.4rem 0.8rem',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'8px',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontSize:'0.8rem',fontFamily:'inherit'}}>⚽ Oyna</button>
                </div>
              );
            })}
          </div>
        </div>}
        {clubs.filter(c=>c.owner!==cu.username).length>0&&<div style={{marginTop:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#aaa',marginBottom:'0.5rem',fontSize:'0.9rem'}}>🏟️ Diğer Kulüpler</div>
          {clubs.filter(c=>c.owner!==cu.username).map(c=>(
            <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.5rem',background:'rgba(255,255,255,0.03)',borderRadius:'6px',marginBottom:'0.25rem'}}>
              <div><span style={{fontWeight:700,color:c.color||'#10B981',fontSize:'0.85rem'}}>{c.name}</span><span style={{fontSize:'0.7rem',color:'#999',marginLeft:'0.4rem'}}>{c.city} · {c.owner}</span></div>
              <div style={{display:'flex',gap:'0.5rem',fontSize:'0.75rem'}}>
                <span style={{color:'#FFD700'}}>⭐{c.rating}</span><span style={{color:'#10B981'}}>{c.wins||0}G</span><span style={{color:'#EF4444'}}>{c.losses||0}M</span><span style={{color:'#A78BFA',fontWeight:700}}>{c.points||0}P</span>
              </div>
            </div>
          ))}
        </div>}
      </div>)}

      {tab==='league'&&(<div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#FFD700',marginBottom:'0.75rem',fontSize:'0.95rem'}}>🏆 Lig Tablosu</div>
          {clubs.length===0&&<div style={{color:'#555',textAlign:'center',padding:'1rem'}}>Henüz kulüp yok.</div>}
          {sortedLeague.map((c,i)=>(
            <div key={c.id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem 0.5rem',borderRadius:'8px',marginBottom:'0.3rem',background:c.owner===cu.username?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.02)',border:`1px solid ${c.owner===cu.username?'rgba(16,185,129,0.25)':'rgba(255,255,255,0.05)'}`}}>
              <div style={{width:'24px',textAlign:'center',fontWeight:700,color:i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#777',fontSize:'0.85rem'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,color:c.color||'#10B981',fontSize:'0.85rem'}}>{c.name}</div><div style={{fontSize:'0.65rem',color:'#666'}}>{c.owner}</div></div>
              <div style={{display:'flex',gap:'0.6rem',fontSize:'0.78rem'}}>
                <span style={{color:'#10B981'}}>{c.wins||0}G</span><span style={{color:'#F59E0B'}}>{c.draws||0}B</span><span style={{color:'#EF4444'}}>{c.losses||0}M</span>
                <span style={{color:'#60A5FA'}}>{c.goals||0}-{c.conceded||0}</span>
                <span style={{fontWeight:700,color:'#FFD700',minWidth:'25px',textAlign:'right'}}>{c.points||0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>)}

      {tab==='matches'&&(<div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#60A5FA',marginBottom:'0.75rem'}}>📅 Son Maçlar</div>
          {matches.length===0&&<div style={{color:'#555',textAlign:'center',padding:'1rem'}}>Henüz maç oynanmadı.</div>}
          {matches.map(m=>(
            <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.5rem 0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px',marginBottom:'0.3rem',border:`1px solid ${m.result==='win'?'rgba(16,185,129,0.2)':m.result==='loss'?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)'}`}}>
              <div style={{fontSize:'0.82rem'}}><span style={{fontWeight:600}}>{m.home}</span><span style={{color:'#777',margin:'0 0.4rem'}}>vs</span><span style={{fontWeight:600}}>{m.away}</span></div>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                <span style={{fontWeight:900,fontSize:'1rem',color:m.result==='win'?'#10B981':m.result==='loss'?'#EF4444':'#F59E0B'}}>{m.homeGoals}-{m.awayGoals}</span>
                <span style={{fontSize:'0.65rem',color:'#666'}}>{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>)}

      {tab==='transfer'&&(<div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#F59E0B',marginBottom:'0.5rem'}}>🔄 Transfer Pazarı</div>
          {!myClub&&<div style={{color:'#EF4444',fontSize:'0.85rem'}}>Önce bir kulüp kurman gerekiyor!</div>}
          {myClub&&<div>
            <div style={{fontSize:'0.85rem',color:'#bbb',marginBottom:'0.75rem'}}>Bütçe: <strong style={{color:'#10B981'}}>₱{(myClub.budget||0).toLocaleString()}</strong></div>
            <button onClick={transferPlayer} style={{width:'100%',padding:'0.7rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.9rem'}}>🔄 Rastgele Oyuncu Satın Al (₱250,000)</button>
          </div>}
        </div>
      </div>)}

      {tab==='training'&&(<div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#10B981',marginBottom:'0.75rem'}}>🏃 Antrenman Programı</div>
          {!myClub&&<div style={{color:'#EF4444',fontSize:'0.85rem'}}>Önce bir kulüp kurman gerekiyor!</div>}
          {myClub&&(<div>
            <div style={{fontSize:'0.82rem',color:'#999',marginBottom:'0.75rem'}}>Bütçe: <strong style={{color:'#10B981'}}>₱{(myClub.budget||0).toLocaleString()}</strong></div>
            {[
              {id:'kondisyon',label:'Kondisyon Antrenmanı',cost:50000,bonus:'Hücum +2',icon:'🏃'},
              {id:'defans',label:'Defans Drilleri',cost:75000,bonus:'Savunma +2',icon:'🛡️'},
              {id:'takim',label:'Takım Çalışması',cost:100000,bonus:'Rating +3',icon:'🤝'},
              {id:'taktikEg',label:'Taktik Eğitimi',cost:120000,bonus:'Hücum +2, Savunma +2',icon:'📋'},
            ].map(tr=>(
              <div key={tr.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0.7rem',background:'rgba(16,185,129,0.05)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:'8px',marginBottom:'0.4rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'0.85rem'}}>{tr.icon} {tr.label}</div>
                  <div style={{fontSize:'0.7rem',color:'#10B981'}}>{tr.bonus}</div>
                </div>
                <button onClick={()=>{
                  if((myClub.budget||0)<tr.cost){showNotif('Yetersiz bütçe!','error');return;}
                  setClubs(prev=>prev.map(c=>{
                    if(c.id!==myClub.id)return c;
                    const u={...c,budget:(c.budget||0)-tr.cost};
                    if(tr.id==='kondisyon')u.attack=(c.attack||65)+2;
                    else if(tr.id==='defans')u.defense=(c.defense||65)+2;
                    else if(tr.id==='takim')u.rating=Math.min(99,(c.rating||65)+3);
                    else if(tr.id==='taktikEg'){u.attack=(c.attack||65)+2;u.defense=(c.defense||65)+2;}
                    return u;
                  }));
                  showNotif(`✅ ${tr.label} tamamlandı! ${tr.bonus}`,'success');
                }} style={{padding:'0.35rem 0.7rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'7px',color:'#10B981',cursor:'pointer',fontWeight:700,fontSize:'0.78rem',fontFamily:'inherit'}}>
                  ₱{(tr.cost/1000).toFixed(0)}K
                </button>
              </div>
            ))}
          </div>)}
        </div>
      </div>)}

      {tab==='tactics'&&(<div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#A78BFA',marginBottom:'0.75rem'}}>🧠 Taktik Seç</div>
          {!myClub&&<div style={{color:'#EF4444',fontSize:'0.85rem'}}>Önce bir kulüp kurman gerekiyor!</div>}
          {myClub&&(<div>
            {[
              {id:'4-4-2',label:'4-4-2 Klasik',desc:'Dengeli diziliş',attackBonus:0,defenseBonus:0},
              {id:'4-3-3',label:'4-3-3 Taarruz',desc:'Hücum odaklı',attackBonus:5,defenseBonus:-3},
              {id:'5-3-2',label:'5-3-2 Savunma',desc:'Savunma odaklı',attackBonus:-3,defenseBonus:5},
              {id:'3-5-2',label:'3-5-2 Orta Saha',desc:'Orta saha kontrolü',attackBonus:3,defenseBonus:3},
            ].map(tc=>{
              const active=myClub.tactic===tc.id;
              return(
                <div key={tc.id} onClick={()=>{
                  setClubs(prev=>prev.map(c=>c.id===myClub.id?{...c,tactic:tc.id}:c));
                  showNotif(`🧠 ${tc.label} taktiği seçildi!`,'success');
                }} style={{cursor:'pointer',padding:'0.75rem',borderRadius:'10px',border:`1px solid ${active?'rgba(167,139,250,0.5)':'rgba(255,255,255,0.07)'}`,background:active?'rgba(167,139,250,0.1)':'rgba(255,255,255,0.03)',marginBottom:'0.4rem',transition:'all 0.15s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:700,color:active?'#A78BFA':'#E8EDF2',fontSize:'0.88rem'}}>{tc.label}</div>
                      <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{tc.desc}</div>
                    </div>
                    <div style={{textAlign:'right',fontSize:'0.72rem'}}>
                      {tc.attackBonus!==0&&<div style={{color:tc.attackBonus>0?'#EF4444':'#60A5FA'}}>Hücum {tc.attackBonus>0?'+':''}{tc.attackBonus}</div>}
                      {tc.defenseBonus!==0&&<div style={{color:tc.defenseBonus>0?'#60A5FA':'#EF4444'}}>Savunma {tc.defenseBonus>0?'+':''}{tc.defenseBonus}</div>}
                      {active&&<div style={{color:'#A78BFA',fontWeight:700}}>✅ Aktif</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>)}
        </div>
      </div>)}

      {tab==='infrastructure'&&(<div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#F59E0B',marginBottom:'0.75rem'}}>🏟️ Altyapı Geliştirme</div>
          {!myClub&&<div style={{color:'#EF4444',fontSize:'0.85rem'}}>Önce bir kulüp kurman gerekiyor!</div>}
          {myClub&&(<div>
            <div style={{fontSize:'0.82rem',color:'#999',marginBottom:'0.75rem'}}>Bütçe: <strong style={{color:'#10B981'}}>₱{(myClub.budget||0).toLocaleString()}</strong></div>
            {[
              {id:'stadyum',label:'Stadyum Genişletme',cost:500000,bonus:'Taraftar +2000',icon:'🏟️'},
              {id:'akademi',label:'Genç Akademi',cost:750000,bonus:'Oyuncu kalitesi +5',icon:'🎓'},
              {id:'saglik',label:'Sağlık Merkezi',cost:300000,bonus:'Oyuncu kondisyon +10',icon:'🏥'},
              {id:'teknoloji',label:'Video Analiz Sistemi',cost:400000,bonus:'Rating +5',icon:'💻'},
            ].map(inf=>(
              <div key={inf.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.65rem 0.7rem',background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'8px',marginBottom:'0.4rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'0.85rem'}}>{inf.icon} {inf.label}</div>
                  <div style={{fontSize:'0.7rem',color:'#F59E0B'}}>{inf.bonus}</div>
                </div>
                <button onClick={()=>{
                  if((myClub.budget||0)<inf.cost){showNotif('Yetersiz bütçe!','error');return;}
                  setClubs(prev=>prev.map(c=>{
                    if(c.id!==myClub.id)return c;
                    const u={...c,budget:(c.budget||0)-inf.cost};
                    if(inf.id==='stadyum')u.fans=(c.fans||0)+2000;
                    else if(inf.id==='akademi')u.rating=Math.min(99,(c.rating||65)+5);
                    else if(inf.id==='teknoloji')u.rating=Math.min(99,(c.rating||65)+5);
                    return u;
                  }));
                  showNotif(`✅ ${inf.label} tamamlandı! ${inf.bonus}`,'success');
                }} style={{padding:'0.35rem 0.7rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'7px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontSize:'0.78rem',fontFamily:'inherit'}}>
                  ₱{(inf.cost/1000).toFixed(0)}K
                </button>
              </div>
            ))}
          </div>)}
        </div>
      </div>)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FABRİKA SAYFASI
// ═══════════════════════════════════════════════════════
function FactoryPage({ profile, setProfile, showNotif }) {
  const [factories, setFactories] = useLs('factories', []);
  const [tab, setTab] = useState('my');
  const cu = profile || {};
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const updateUser = (upd) => {
    const next = { ...cu, ...upd };
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };

  const FACTORY_TYPES = [
    {id:'textile',name:'Tekstil Fabrikası',icon:'👕',cost:500000,income:3500,prodTime:3600000,product:'Kumaş'},
    {id:'food',name:'Gıda Fabrikası',icon:'🍞',cost:750000,income:5000,prodTime:4*3600000,product:'Ekmek'},
    {id:'steel',name:'Çelik Fabrikası',icon:'⚙️',cost:1500000,income:10000,prodTime:6*3600000,product:'Çelik'},
    {id:'electronics',name:'Elektronik Fabrikası',icon:'💻',cost:3000000,income:20000,prodTime:12*3600000,product:'Elektronik'},
    {id:'auto',name:'Otomobil Fabrikası',icon:'🚗',cost:5000000,income:35000,prodTime:24*3600000,product:'Araç'},
  ];

  const myFact = factories.find(f => f.owner===cu.username);
  const now = Date.now();

  const buildFactory = (type) => {
    if ((cu.money||0) < type.cost) { showNotif(`❌ ₱${type.cost.toLocaleString()} gerekli!`,'error'); return; }
    if (myFact) { showNotif('❌ Zaten bir fabrikan var!','error'); return; }
    const fact = {id:Date.now(),type:type.id,name:type.name,icon:type.icon,owner:cu.username,income:type.income,prodTime:type.prodTime,product:type.product,level:1,lastProd:now,totalProd:0};
    updateUser({money:(cu.money||0)-type.cost});
    setFactories(prev=>[...prev,fact]);
    showNotif(`✅ ${type.name} kuruldu!`,'success');
  };

  const collectIncome = () => {
    if (!myFact) return;
    const elapsed = now - myFact.lastProd;
    const cycles = Math.floor(elapsed/myFact.prodTime);
    if (cycles < 1) { const rem=myFact.prodTime-(elapsed%myFact.prodTime); showNotif(`⏳ ${Math.ceil(rem/3600000)} saat daha bekle!`,'error'); return; }
    const earned = cycles * myFact.income * myFact.level;
    updateUser({money:(cu.money||0)+earned});
    setFactories(prev=>prev.map(f=>f.id===myFact.id?{...f,lastProd:now,totalProd:(f.totalProd||0)+cycles}:f));
    showNotif(`✅ ${cycles}x üretim: +₱${earned.toLocaleString()}`,'success');
  };

  const upgradeFactory = () => {
    if (!myFact) return;
    const cost = myFact.level * 250000;
    if ((cu.money||0) < cost) { showNotif(`❌ Geliştirme maliyeti: ₱${cost.toLocaleString()}`,'error'); return; }
    updateUser({money:(cu.money||0)-cost});
    setFactories(prev=>prev.map(f=>f.id===myFact.id?{...f,level:f.level+1,income:Math.floor(f.income*1.4)}:f));
    showNotif(`✅ Fabrika Lv.${myFact.level+1}'e yükseldi! Gelir artışı +%40`,'success');
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#F59E0B',marginBottom:'1rem'}}>🏭 Fabrika Yönetimi</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem'}}>
        {[{k:'my',l:'🏭 Fabrikan'},{k:'build',l:'🏗️ Kur'},{k:'all',l:'🌐 Tüm Fabrikalar'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 1rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#F59E0B':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(245,158,11,0.15)':'transparent',color:tab===t.k?'#F59E0B':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='my'&&<div>
        {!myFact&&<div style={{textAlign:'center',padding:'2rem',color:'#555'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🏭</div>
          <div style={{marginBottom:'1rem'}}>Henüz bir fabrikan yok.</div>
          <button onClick={()=>setTab('build')} style={{padding:'0.6rem 1.4rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>🏗️ Fabrika Kur</button>
        </div>}
        {myFact&&<div>
          <div style={{background:`rgba(245,158,11,0.07)`,border:'1px solid rgba(245,158,11,0.25)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div><div style={{fontWeight:700,color:'#F59E0B',fontSize:'1.1rem'}}>{myFact.icon} {myFact.name}</div><div style={{fontSize:'0.75rem',color:'#999'}}>Seviye {myFact.level} · Ürün: {myFact.product}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontWeight:700,color:'#10B981',fontSize:'1.1rem'}}>₱{myFact.income.toLocaleString()}</div><div style={{fontSize:'0.65rem',color:'#666'}}>her {myFact.prodTime/3600000}s</div></div>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.72rem',color:'#999',marginBottom:'0.25rem'}}>Sonraki üretim:</div>
              {(()=>{
                const elapsed=now-myFact.lastProd, rem=Math.max(0,myFact.prodTime-elapsed%myFact.prodTime);
                const cycles=Math.floor(elapsed/myFact.prodTime);
                return <div style={{fontWeight:700,color:cycles>0?'#10B981':'#F59E0B',fontSize:'0.9rem'}}>{cycles>0?`✅ ${cycles}x hazır! (₱${(cycles*myFact.income*myFact.level).toLocaleString()})`:`⏳ ${Math.ceil(rem/3600000)}sa ${Math.ceil((rem%3600000)/60000)}dk`}</div>;
              })()}
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button onClick={collectIncome} style={{flex:1,padding:'0.6rem',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px',color:'#10B981',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>💰 Topla</button>
              <button onClick={upgradeFactory} style={{flex:1,padding:'0.6rem',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'8px',color:'#A78BFA',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>⬆️ Geliştir (₱{(myFact.level*250000).toLocaleString()})</button>
            </div>
          </div>
        </div>}
      </div>}

      {tab==='build'&&<div>
        {FACTORY_TYPES.map(type=>(
          <div key={type.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
              <div><div style={{fontWeight:700,fontSize:'1rem'}}>{type.icon} {type.name}</div><div style={{fontSize:'0.75rem',color:'#999'}}>Gelir: ₱{type.income.toLocaleString()}/{type.prodTime/3600000}sa · Ürün: {type.product}</div></div>
              <div style={{color:'#F59E0B',fontWeight:700,fontSize:'0.9rem'}}>₱{type.cost.toLocaleString()}</div>
            </div>
            <button onClick={()=>buildFactory(type)} disabled={!!myFact} style={{width:'100%',padding:'0.5rem',background:myFact?'rgba(255,255,255,0.04)':'rgba(245,158,11,0.12)',border:`1px solid ${myFact?'rgba(255,255,255,0.08)':'rgba(245,158,11,0.3)'}`,borderRadius:'8px',color:myFact?'#555':'#F59E0B',cursor:myFact?'not-allowed':'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>{myFact?'Zaten bir fabrikan var':'🏗️ Kur'}</button>
          </div>
        ))}
      </div>}

      {tab==='all'&&<div>
        {factories.length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#555'}}>Henüz fabrika yok.</div>}
        {factories.map(f=>(
          <div key={f.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'8px',marginBottom:'0.35rem'}}>
            <div><div style={{fontWeight:600,fontSize:'0.85rem'}}>{f.icon} {f.name}</div><div style={{fontSize:'0.7rem',color:'#999'}}>{f.owner} · Lv.{f.level}</div></div>
            <div style={{color:'#10B981',fontWeight:700,fontSize:'0.85rem'}}>₱{f.income.toLocaleString()}/saat</div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MADENCİLİK SAYFASI
// ═══════════════════════════════════════════════════════
function MiningPage({ profile, setProfile, showNotif }) {
  const [mineData, setMineData] = useLs('mineData', {});
  const [cooldowns, setCooldowns] = useLs('mineCooldowns', {});
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const now = Date.now();
  const updateUser = (upd) => {
    const next = {...cu,...upd};
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };

  const RESOURCES = [
    {id:'coal',name:'Kömür',icon:'🪨',cd:1800000,yield:[5,15],price:500,color:'#6B7280'},
    {id:'iron',name:'Demir',icon:'⚙️',cd:2*3600000,yield:[3,10],price:1200,color:'#9CA3AF'},
    {id:'gold',name:'Altın',icon:'✨',cd:4*3600000,yield:[1,5],price:5000,color:'#FFD700'},
    {id:'oil',name:'Petrol',icon:'🛢️',cd:6*3600000,yield:[2,8],price:3000,color:'#1F2937'},
    {id:'diamond',name:'Elmas',icon:'💎',cd:12*3600000,yield:[1,3],price:20000,color:'#7DD3FC'},
  ];
  const myResources = mineData[cu.id] || {};

  const mine = (res) => {
    const last = cooldowns[cu.id+'_'+res.id] || 0;
    const rem = res.cd - (now-last);
    if (rem > 0) { showNotif(`⏳ ${res.name} için ${Math.ceil(rem/60000)}dk bekle!`,'error'); return; }
    const amount = res.yield[0] + Math.floor(Math.random()*(res.yield[1]-res.yield[0]+1));
    const newRes = {...myResources,[res.id]:(myResources[res.id]||0)+amount};
    setMineData(prev=>({...prev,[cu.id]:newRes}));
    setCooldowns(prev=>({...prev,[cu.id+'_'+res.id]:now}));
    try { const today=new Date().toDateString(); const dk=`day_${today}`; const s=JSON.parse(localStorage.getItem('dailyTaskState')||'{}'); s[dk]={...(s[dk]||{}),dailyMineCount:((s[dk]?.dailyMineCount)||0)+1}; localStorage.setItem('dailyTaskState',JSON.stringify(s)); } catch(e){}
    showNotif(`✅ ${amount}x ${res.name} kazandın! (${res.icon})`,'success');
  };

  const sellAll = () => {
    let total = 0;
    const newRes = {};
    RESOURCES.forEach(r => {
      const qty = myResources[r.id]||0;
      total += qty * r.price;
      newRes[r.id] = 0;
    });
    if (total === 0) { showNotif('Satılacak kaynak yok!','error'); return; }
    updateUser({money:(cu.money||0)+total});
    setMineData(prev=>({...prev,[cu.id]:newRes}));
    showNotif(`✅ Tüm kaynaklar satıldı! +₱${total.toLocaleString()}`,'success');
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#F59E0B',marginBottom:'0.5rem'}}>⛏️ Madencilik</div>
      <div style={{fontSize:'0.82rem',color:'#999',marginBottom:'1rem',background:'rgba(245,158,11,0.07)',borderRadius:'8px',padding:'0.5rem 0.75rem',border:'1px solid rgba(245,158,11,0.2)'}}>
        ⛏️ Her kaynak türünün bekleme süresi var. Kazıp satarak para kazan!
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
        {RESOURCES.map(res=>{
          const last = cooldowns[cu.id+'_'+res.id]||0;
          const rem = Math.max(0, res.cd-(now-last));
          const ready = rem===0;
          const qty = myResources[res.id]||0;
          return (
            <div key={res.id} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${ready?res.color+'55':'rgba(255,255,255,0.07)'}`,borderRadius:'12px',padding:'0.85rem'}}>
              <div style={{textAlign:'center',fontSize:'2.2rem',marginBottom:'0.3rem'}}>{res.icon}</div>
              <div style={{fontWeight:700,textAlign:'center',fontSize:'0.85rem',marginBottom:'0.15rem'}}>{res.name}</div>
              <div style={{fontSize:'0.68rem',color:'#999',textAlign:'center',marginBottom:'0.5rem'}}>Fiyat: ₱{res.price.toLocaleString()} · Stok: <strong style={{color:qty>0?'#10B981':'#666'}}>{qty}</strong></div>
              {!ready&&<div style={{fontSize:'0.7rem',color:'#F59E0B',textAlign:'center',marginBottom:'0.4rem'}}>⏳ {Math.ceil(rem/60000)} dakika</div>}
              <button onClick={()=>mine(res)} style={{width:'100%',padding:'0.4rem',background:ready?'rgba(245,158,11,0.12)':'rgba(255,255,255,0.03)',border:`1px solid ${ready?'rgba(245,158,11,0.35)':'rgba(255,255,255,0.07)'}`,borderRadius:'6px',color:ready?'#F59E0B':'#555',cursor:ready?'pointer':'not-allowed',fontWeight:700,fontSize:'0.78rem',fontFamily:'inherit'}}>⛏️ {ready?'Kaz!':'Bekle'}</button>
            </div>
          );
        })}
      </div>
      <div style={{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px',padding:'1rem'}}>
        <div style={{fontWeight:700,color:'#10B981',marginBottom:'0.5rem'}}>💰 Kaynakları Sat</div>
        <div style={{marginBottom:'0.75rem'}}>
          {RESOURCES.map(r=>{
            const qty=myResources[r.id]||0;
            if(!qty) return null;
            return <div key={r.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',padding:'0.2rem 0'}}>
              <span>{r.icon} {r.name}: <strong>{qty}x</strong></span>
              <span style={{color:'#10B981'}}>₱{(qty*r.price).toLocaleString()}</span>
            </div>;
          })}
          {!Object.values(myResources).some(v=>v>0)&&<div style={{color:'#555',fontSize:'0.82rem'}}>Henüz kaynak yok. Kazmaya başla!</div>}
        </div>
        <button onClick={sellAll} style={{width:'100%',padding:'0.6rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px',color:'#10B981',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>💰 Hepsini Sat</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ORDU SAYFASI
// ═══════════════════════════════════════════════════════
function ArmyPage({ profile, setProfile, showNotif }) {
  const [army, setArmy] = useLs('playerArmy', {});
  const [tab, setTab] = useState('overview');
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const [cabinet] = useLs('cabinet', {});
  const isGeneral = cabinet['Genelkurmay Başkanı'] === profile?.username;

  if (!isGeneral) {
    return (
      <div style={{padding:'1rem',background:bg,minHeight:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
        <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🔒</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:'#EF4444',fontSize:'1.2rem',marginBottom:'0.5rem'}}>Erişim Kısıtlı</div>
        <div style={{color:'#5A7089',fontSize:'0.85rem',lineHeight:1.6,maxWidth:'280px'}}>
          Ordu Yönetim Merkezi yalnızca <strong style={{color:'#F59E0B'}}>Genelkurmay Başkanı</strong> tarafından erişilebilir.
          <br/><br/>Seçimlerle Genelkurmay Başkanlığına seçildiğinde bu ekranı görebilirsin.
        </div>
        <div style={{marginTop:'1.5rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'0.85rem 1.5rem'}}>
          <div style={{fontSize:'0.72rem',color:'#F87171',fontWeight:700}}>⚔️ Mevcut Genelkurmay Başkanı</div>
          <div style={{fontWeight:800,color:'#E8EDF2',marginTop:'0.25rem'}}>{cabinet['Genelkurmay Başkanı'] || '— Atanmamış —'}</div>
        </div>
      </div>
    );
  }
  const updateUser = (upd) => {
    const next = {...cu,...upd};
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };
  const myArmy = army[cu.id] || {infantry:0,cavalry:0,artillery:0,navy:0,airforce:0,rank:'Onbaşı',battles:0,wins:0};

  const UNITS = [
    {id:'infantry',name:'Piyade',icon:'🪖',cost:5000,strength:10,upkeep:500},
    {id:'cavalry',name:'Süvari',icon:'🐴',cost:15000,strength:25,upkeep:1500},
    {id:'artillery',name:'Topçu',icon:'💣',cost:50000,strength:80,upkeep:5000},
    {id:'navy',name:'Deniz Kuvveti',icon:'⚓',cost:200000,strength:200,upkeep:20000},
    {id:'airforce',name:'Hava Kuvveti',icon:'✈️',cost:500000,strength:500,upkeep:50000},
  ];

  const ARMY_WEAPONS = [
    {id:'rifles',name:'Tüfek Takımı',icon:'🔫',cost:50000,strength:50,desc:'Her tüfek takımı +50 güç'},
    {id:'tanks',name:'Tank',icon:'🛡️',cost:500000,strength:500,desc:'Her tank +500 güç'},
    {id:'aircraft',name:'Savaş Uçağı',icon:'✈️',cost:2000000,strength:2000,desc:'Her uçak +2000 güç'},
  ];

  const RANKS = ['Onbaşı','Çavuş','Astsubay','Teğmen','Yüzbaşı','Binbaşı','Albay','General','Mareşal'];
  const armyWeapons = myArmy.armyWeapons || {};
  const weaponStrength = ARMY_WEAPONS.reduce((s,w) => s + (armyWeapons[w.id]||0)*w.strength, 0);
  const totalStrength = UNITS.reduce((s,u2) => s + (myArmy[u2.id]||0)*u2.strength, 0) + weaponStrength;
  const rankIdx = Math.min(RANKS.length-1, Math.floor(myArmy.wins/5));
  const currentRank = RANKS[rankIdx];

  const buyArmyWeapon = (weapon) => {
    if ((cu.money||0) < weapon.cost) { showNotif(`❌ ${weapon.name} için ₱${weapon.cost.toLocaleString()} gerekli!`,'error'); return; }
    updateUser({money:(cu.money||0)-weapon.cost});
    const newWeapons = {...armyWeapons, [weapon.id]:(armyWeapons[weapon.id]||0)+1};
    const newArmy = {...myArmy, armyWeapons:newWeapons};
    setArmy(prev=>({...prev,[cu.id]:newArmy}));
    showNotif(`✅ ${weapon.icon} ${weapon.name} alındı! +${weapon.strength} güç`,'success');
  };

  const recruit = (unit) => {
    if ((cu.money||0) < unit.cost) { showNotif(`❌ ${unit.name} için ₱${unit.cost.toLocaleString()} gerekli!`,'error'); return; }
    updateUser({money:(cu.money||0)-unit.cost});
    const newArmy = {...myArmy,[unit.id]:(myArmy[unit.id]||0)+1};
    setArmy(prev=>({...prev,[cu.id]:newArmy}));
    showNotif(`✅ 1x ${unit.name} askere alındı!`,'success');
  };

  const battle = () => {
    if (totalStrength < 10) { showNotif('❌ Yeterli askeri güç yok! En az 1 piyade gerekli.','error'); return; }
    const won = Math.random() < 0.55;
    const prize = won ? Math.floor(totalStrength * 100) : 0;
    const losses = won ? Math.floor(Math.random()*2) : Math.floor(Math.random()*3)+1;
    const newBattles = (myArmy.battles||0)+1;
    const newWins = (myArmy.wins||0)+(won?1:0);
    const newInfantry = Math.max(0,(myArmy.infantry||0)-losses);
    const newArmy = {...myArmy,infantry:newInfantry,battles:newBattles,wins:newWins};
    setArmy(prev=>({...prev,[cu.id]:newArmy}));
    if (prize) updateUser({money:(cu.money||0)+prize,meritPoints:(cu.meritPoints||0)+(won?15:0)});
    showNotif(won?`🏆 Savaş kazanıldı! +₱${prize.toLocaleString()} +15🏅`:`💔 Savaş kaybedildi! ${losses}x asker kayıp`);
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#EF4444',marginBottom:'1rem'}}>⚔️ Ordu Yönetimi</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {[{k:'overview',l:'📊 Genel Bakış'},{k:'recruit',l:'🪖 Asker Al'},{k:'weapons',l:'🔫 Silahlar'},{k:'battle',l:'⚔️ Savaş'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 0.9rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#EF4444':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(239,68,68,0.15)':'transparent',color:tab===t.k?'#EF4444':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='overview'&&<div>
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(0,0,0,0))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.75rem'}}>
            <div><div style={{fontWeight:700,color:'#EF4444',fontSize:'1.1rem'}}>🪖 {cu.username} Ordusu</div><div style={{fontSize:'0.78rem',color:'#F59E0B',marginTop:'0.1rem'}}>🎖️ {currentRank}</div></div>
            <div style={{textAlign:'right'}}><div style={{fontWeight:700,color:'#60A5FA',fontSize:'1.2rem'}}>{totalStrength}</div><div style={{fontSize:'0.65rem',color:'#666'}}>TOPLAM GÜÇ</div></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',marginBottom:'0.5rem'}}>
            {[{l:'Savaş',v:myArmy.battles||0},{l:'Galibiyet',v:myArmy.wins||0},{l:'Mağlubiyet',v:(myArmy.battles||0)-(myArmy.wins||0)}].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.5rem',textAlign:'center'}}><div style={{fontWeight:700,fontSize:'1rem'}}>{s.v}</div><div style={{fontSize:'0.62rem',color:'#666'}}>{s.l}</div></div>
            ))}
          </div>
        </div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,marginBottom:'0.5rem',color:'#aaa'}}>🪖 Birlikler</div>
          {UNITS.map(u2=>(
            <div key={u2.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.5rem',borderRadius:'6px',marginBottom:'0.25rem',background:'rgba(255,255,255,0.03)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><span style={{fontSize:'1.1rem'}}>{u2.icon}</span><span style={{fontWeight:600,fontSize:'0.85rem'}}>{u2.name}</span></div>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}><span style={{fontWeight:700,color:'#60A5FA',fontSize:'0.9rem'}}>{myArmy[u2.id]||0}x</span><span style={{fontSize:'0.7rem',color:'#999'}}>Güç: {(myArmy[u2.id]||0)*u2.strength}</span></div>
            </div>
          ))}
        </div>
      </div>}

      {tab==='recruit'&&<div>
        {UNITS.map(unit=>(
          <div key={unit.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><span style={{fontSize:'1.5rem'}}>{unit.icon}</span><div><div style={{fontWeight:700,fontSize:'0.9rem'}}>{unit.name}</div><div style={{fontSize:'0.7rem',color:'#999'}}>Güç: {unit.strength} · Bakım: ₱{unit.upkeep.toLocaleString()}/gün · Adet: {myArmy[unit.id]||0}</div></div></div>
              <div style={{color:'#EF4444',fontWeight:700}}>₱{unit.cost.toLocaleString()}</div>
            </div>
            <button onClick={()=>recruit(unit)} style={{width:'100%',padding:'0.5rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',color:'#EF4444',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>🪖 Askere Al (₱{unit.cost.toLocaleString()})</button>
          </div>
        ))}
      </div>}

      {tab==='weapons'&&<div>
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(0,0,0,0))',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
          <div style={{fontWeight:700,color:'#EF4444',marginBottom:'0.4rem',fontSize:'0.9rem'}}>🔫 Ordu Silah Deposu</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.4rem',marginBottom:'0.5rem'}}>
            {[['⚡','Silah Gücü',weaponStrength],['🗡️','Toplam Güç',totalStrength]].map(([ic,lb,v])=>(
              <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.5rem',textAlign:'center'}}>
                <div style={{fontSize:'0.85rem'}}>{ic}</div>
                <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{v}</div>
                <div style={{fontSize:'0.58rem',color:'#3B4E63',textTransform:'uppercase'}}>{lb}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:'0.68rem',color:'#5A7089'}}>⚡ Silah gücü şehir savunmasına ve savaşa doğrudan yansır — sınırsız</div>
        </div>
        {ARMY_WEAPONS.map(weapon=>(
          <div key={weapon.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <span style={{fontSize:'1.5rem'}}>{weapon.icon}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:'0.9rem'}}>{weapon.name}</div>
                  <div style={{fontSize:'0.7rem',color:'#999'}}>+{weapon.strength} güç · Adet: {armyWeapons[weapon.id]||0} · Toplam: +{(armyWeapons[weapon.id]||0)*weapon.strength}</div>
                  <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{weapon.desc}</div>
                </div>
              </div>
              <div style={{color:'#EF4444',fontWeight:700,fontSize:'0.9rem'}}>₱{weapon.cost.toLocaleString()}</div>
            </div>
            <button onClick={()=>buyArmyWeapon(weapon)} style={{width:'100%',padding:'0.5rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',color:'#EF4444',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>
              {weapon.icon} Satın Al (₱{weapon.cost.toLocaleString()})
            </button>
          </div>
        ))}
      </div>}

      {tab==='battle'&&<div>
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.07),rgba(0,0,0,0))',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>⚔️</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:700,color:'#EF4444',marginBottom:'0.25rem'}}>Savaş Meydanı</div>
          <div style={{fontSize:'0.82rem',color:'#999',marginBottom:'1rem'}}>Toplam Gücün: <strong style={{color:'#60A5FA'}}>{totalStrength}</strong> · Kazanma şansın: <strong style={{color:'#10B981'}}>~%55</strong></div>
          <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.75rem',marginBottom:'1rem',textAlign:'left'}}>
            <div style={{fontSize:'0.78rem',color:'#999',marginBottom:'0.25rem'}}>💰 Kazanç: Güç × ₱100</div>
            <div style={{fontSize:'0.78rem',color:'#999'}}>💔 Kayıp: Kaybedince bazı piyadeler düşer</div>
          </div>
          <button onClick={battle} style={{width:'100%',padding:'0.8rem',background:'linear-gradient(135deg,#DC2626,#EF4444)',border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem'}}>⚔️ SAVAŞA GİR!</button>
        </div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// İSTİHBARAT / SPY SAYFASI
// ═══════════════════════════════════════════════════════
function SpyPage({ profile, setProfile, showNotif }) {
  const [spyOps, setSpyOps] = useLs('spyOps', []);
  const [spyCooldown, setSpyCooldown] = useLs('spyCooldown', {});
  const [tab, setTab] = useState('ops');
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const now = Date.now();
  const updateUser = (upd) => {
    const next = {...cu,...upd};
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };

  const OPS = [
    {id:'recon',name:'Keşif Operasyonu',icon:'🔭',cost:10000,cd:3600000,successRate:0.85,reward:{money:25000,merit:5},desc:'Rakip bölgede keşif yap, bilgi topla.'},
    {id:'sabotage',name:'Sabotaj',icon:'💣',cost:50000,cd:6*3600000,successRate:0.6,reward:{money:100000,merit:15},desc:'Rakip altyapısına sabotaj yap.'},
    {id:'intel',name:'İstihbarat Toplama',icon:'📋',cost:25000,cd:4*3600000,successRate:0.75,reward:{money:60000,merit:10},desc:'Gizli bilgi topla.'},
    {id:'infiltrate',name:'Sızma',icon:'🕵️',cost:100000,cd:12*3600000,successRate:0.5,reward:{money:250000,merit:25},desc:'Düşman örgütüne sız.'},
    {id:'cyber',name:'Siber Saldırı',icon:'💻',cost:200000,cd:24*3600000,successRate:0.65,reward:{money:500000,merit:30},desc:'Dijital altyapıya saldır.'},
  ];

  const doOp = (op) => {
    const last = spyCooldown[cu.id+'_'+op.id]||0;
    const rem = op.cd-(now-last);
    if (rem>0) { showNotif(`⏳ ${op.name} için ${Math.ceil(rem/3600000)}sa bekle!`,'error'); return; }
    if ((cu.money||0)<op.cost) { showNotif(`❌ ₱${op.cost.toLocaleString()} gerekli!`,'error'); return; }
    const success = Math.random() < op.successRate;
    const entry = {id:Date.now(),op:op.name,icon:op.icon,result:success?'success':'fail',date:new Date().toLocaleDateString('tr-TR'),reward:success?op.reward:null};
    setSpyOps(prev=>[entry,...prev].slice(0,30));
    setSpyCooldown(prev=>({...prev,[cu.id+'_'+op.id]:now}));
    if (success) {
      updateUser({money:(cu.money||0)-op.cost+op.reward.money,meritPoints:(cu.meritPoints||0)+op.reward.merit});
      showNotif(`✅ ${op.name} başarılı! +₱${op.reward.money.toLocaleString()} +${op.reward.merit}🏅`,'success');
    } else {
      updateUser({money:(cu.money||0)-op.cost});
      showNotif(`💔 ${op.name} başarısız! Ajan ele geçirildi.`,'error');
    }
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#A78BFA',marginBottom:'1rem'}}>🕵️ İstihbarat Servisi</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem'}}>
        {[{k:'ops',l:'🕵️ Operasyonlar'},{k:'log',l:'📋 Geçmiş'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 1rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#A78BFA':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(167,139,250,0.15)':'transparent',color:tab===t.k?'#A78BFA':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='ops'&&<div>
        {OPS.map(op=>{
          const last=spyCooldown[cu.id+'_'+op.id]||0;
          const rem=Math.max(0,op.cd-(now-last));
          const ready=rem===0;
          return (
            <div key={op.id} style={{background:'rgba(167,139,250,0.05)',border:`1px solid ${ready?'rgba(167,139,250,0.25)':'rgba(255,255,255,0.07)'}`,borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><span style={{fontSize:'1.4rem'}}>{op.icon}</span><div><div style={{fontWeight:700,fontSize:'0.9rem'}}>{op.name}</div><div style={{fontSize:'0.72rem',color:'#999'}}>{op.desc}</div></div></div>
                <div style={{textAlign:'right',flexShrink:0}}><div style={{color:'#A78BFA',fontWeight:700,fontSize:'0.85rem'}}>₱{op.cost.toLocaleString()}</div><div style={{fontSize:'0.65rem',color:'#10B981'}}>Başarı: %{Math.round(op.successRate*100)}</div></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
                <div style={{fontSize:'0.72rem',color:'#FFD700'}}>Ödül: ₱{op.reward.money.toLocaleString()} +{op.reward.merit}🏅</div>
                {!ready&&<div style={{fontSize:'0.72rem',color:'#F59E0B'}}>⏳ {Math.ceil(rem/3600000)}sa</div>}
              </div>
              <button onClick={()=>doOp(op)} style={{width:'100%',padding:'0.5rem',background:ready?'rgba(167,139,250,0.12)':'rgba(255,255,255,0.03)',border:`1px solid ${ready?'rgba(167,139,250,0.35)':'rgba(255,255,255,0.07)'}`,borderRadius:'8px',color:ready?'#A78BFA':'#555',cursor:ready?'pointer':'not-allowed',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>🕵️ {ready?'Operasyonu Başlat':'Bekleniyor'}</button>
            </div>
          );
        })}
      </div>}

      {tab==='log'&&<div>
        {spyOps.filter(o=>(spyOps.find(x=>x.id===o.id)?.result)).length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#555'}}>Henüz operasyon yok.</div>}
        {spyOps.map(op=>(
          <div key={op.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${op.result==='success'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}`,borderRadius:'8px',marginBottom:'0.35rem'}}>
            <div><span style={{fontSize:'1rem',marginRight:'0.5rem'}}>{op.icon}</span><span style={{fontWeight:600,fontSize:'0.85rem'}}>{op.op}</span><span style={{fontSize:'0.65rem',color:'#666',marginLeft:'0.4rem'}}>{op.date}</span></div>
            <div style={{color:op.result==='success'?'#10B981':'#EF4444',fontWeight:700,fontSize:'0.8rem'}}>{op.result==='success'?`✅ +₱${op.reward?.money?.toLocaleString()}`:'💔 Başarısız'}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GAZETE SAYFASI
// ═══════════════════════════════════════════════════════
function NewspaperPage({ profile, setProfile, showNotif }) {
  const [papers, setPapers] = useLs('newspapers', []);
  const [tab, setTab] = useState('read');
  const [form, setForm] = useState({title:'',content:'',category:'Gündem'});
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const updateUser = (upd) => {
    const next = {...cu,...upd};
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };
  const CATS = ['Gündem','Ekonomi','Siyaset','Spor','Suç','Özel'];

  const publish = () => {
    if (!form.title.trim()||!form.content.trim()) { showNotif('❌ Başlık ve içerik gerekli!','error'); return; }
    if ((cu.money||0)<5000) { showNotif('❌ Yayın ücreti: ₱5,000','error'); return; }
    const paper = {id:Date.now(),title:form.title.trim(),content:form.content.trim(),category:form.category,author:cu.username,date:new Date().toLocaleDateString('tr-TR'),likes:0,views:0};
    setPapers(prev=>[paper,...prev].slice(0,100));
    updateUser({money:(cu.money||0)-5000,meritPoints:(cu.meritPoints||0)+5});
    setForm({title:'',content:'',category:'Gündem'});
    setTab('read');
    showNotif('✅ Makale yayınlandı! +5🏅','success');
  };

  const likeArticle = (id) => {
    const paper = papers.find(p=>p.id===id);
    setPapers(prev=>prev.map(p=>p.id===id?{...p,likes:(p.likes||0)+1}:p));
    if (paper?.author) {
      try {
        const inf = JSON.parse(localStorage.getItem('rep_mediaInfluence')||'{}');
        inf[paper.author] = (inf[paper.author]||0) + 1;
        localStorage.setItem('rep_mediaInfluence', JSON.stringify(inf));
      } catch{}
    }
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#60A5FA',marginBottom:'1rem'}}>📰 Gazete & Medya</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem'}}>
        {[{k:'read',l:'📰 Haberler'},{k:'eco',l:'📊 Ekonomi Bülteni'},{k:'write',l:'✍️ Yaz'},{k:'influence',l:'🏆 Yazarlar'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 1rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#60A5FA':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(96,165,250,0.15)':'transparent',color:tab===t.k?'#60A5FA':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='read'&&<div>
        {papers.filter(p=>!p.isAuto).length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#555'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>📰</div>
          Henüz oyuncu haberi yok. İlk makaleyi sen yaz!
        </div>}
        {papers.filter(p=>!p.isAuto).map(p=>(
          <div key={p.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.4rem'}}>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.95rem',color:'#E8EDF2',marginBottom:'0.15rem',lineHeight:1.3}}>{p.title}</div><div style={{fontSize:'0.68rem',color:'#999'}}>{p.author} · {p.date} · <span style={{background:'rgba(96,165,250,0.1)',color:'#60A5FA',padding:'1px 6px',borderRadius:'4px'}}>{p.category}</span></div></div>
            </div>
            <div style={{fontSize:'0.82rem',color:'#bbb',lineHeight:1.6,marginBottom:'0.5rem'}}>{p.content}</div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button onClick={()=>likeArticle(p.id)} style={{padding:'0.25rem 0.7rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',color:'#EF4444',cursor:'pointer',fontSize:'0.78rem',fontFamily:'inherit'}}>❤️ {p.likes||0}</button>
              <span style={{fontSize:'0.72rem',color:'#555',lineHeight:'26px'}}>👁 {(p.views||0)+1} okuma</span>
            </div>
          </div>
        ))}
      </div>}

      {tab==='eco'&&<div>
        <div style={{background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'12px',padding:'0.7rem',marginBottom:'0.75rem'}}>
          <div style={{fontWeight:700,color:'#10B981',fontSize:'0.8rem',marginBottom:'0.2rem'}}>📊 Ekonomi Bülteni — Otomatik Haberler</div>
          <div style={{fontSize:'0.68rem',color:'#5A7089',lineHeight:1.4}}>Enflasyon, faiz, döviz ve piyasa verilerine göre her 5 dakikada bir otomatik oluşturulan ekonomi haberleri.</div>
        </div>
        {papers.filter(p=>p.isAuto).length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#555',fontSize:'0.82rem'}}>Henüz otomatik haber üretilmedi. Bir süre bekleyin...</div>}
        {papers.filter(p=>p.isAuto).map(p=>(
          <div key={p.id} style={{background:'rgba(16,185,129,0.04)',border:'1px solid rgba(16,185,129,0.14)',borderRadius:'12px',padding:'0.9rem',marginBottom:'0.6rem'}}>
            <div style={{fontWeight:700,fontSize:'0.88rem',color:'#E8EDF2',marginBottom:'0.3rem',lineHeight:1.35}}>{p.title}</div>
            <div style={{fontSize:'0.65rem',color:'#5A7089',marginBottom:'0.5rem',display:'flex',gap:'0.5rem',alignItems:'center'}}>
              <span style={{background:'rgba(16,185,129,0.12)',color:'#10B981',padding:'1px 7px',borderRadius:'4px',fontWeight:700}}>{p.category}</span>
              <span>{p.author}</span>
              <span>·</span>
              <span>{p.date}</span>
            </div>
            <div style={{fontSize:'0.78rem',color:'#8899AA',lineHeight:1.55,marginBottom:'0.4rem'}}>{p.content}</div>
            <div style={{fontSize:'0.65rem',color:'#3B4E63'}}>👁 {p.views||0} okuma · 🤖 Yapay Zeka Üretimi</div>
          </div>
        ))}
      </div>}

      {tab==='influence'&&<div>
        <div style={{background:'rgba(96,165,250,0.06)',border:'1px solid rgba(96,165,250,0.15)',borderRadius:'12px',padding:'0.75rem',marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.68rem',color:'#60A5FA',fontWeight:700,textTransform:'uppercase',marginBottom:'0.4rem'}}>📡 Etki Puanı Sıralaması</div>
          <div style={{fontSize:'0.72rem',color:'#5A7089',lineHeight:1.4}}>Makalelerine beğeni aldıkça etki puanın artar. Yüksek etki puanı → daha fazla siyasi güç.</div>
        </div>
        {(()=>{
          const inf = (() => { try { return JSON.parse(localStorage.getItem('rep_mediaInfluence')||'{}'); } catch{return {};} })();
          const myInf = inf[cu.username] || 0;
          const sorted = Object.entries(inf).sort((a,b)=>b[1]-a[1]).slice(0,10);
          return (
            <div>
              <div style={{background:'rgba(245,158,11,0.07)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'12px',padding:'0.7rem',marginBottom:'0.6rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:'0.8rem',color:'#E8EDF2',fontWeight:700}}>📡 Etki Puanım</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:'#F59E0B',fontSize:'1.1rem'}}>{myInf}</div>
              </div>
              {sorted.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'1.5rem',fontSize:'0.82rem'}}>Henüz kimse beğeni almadı.</div>}
              {sorted.map(([author, pts], i) => (
                <div key={author} style={{display:'flex',alignItems:'center',gap:'0.65rem',padding:'0.55rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <div style={{minWidth:'22px',textAlign:'center',fontWeight:800,color:i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#5A7089',fontSize:'0.82rem'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                  <div style={{flex:1,fontWeight:700,color:author===cu.username?'#60A5FA':'#E8EDF2',fontSize:'0.85rem'}}>{author}{author===cu.username?' (Sen)':''}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'#F59E0B',fontSize:'0.88rem'}}>📡 {pts}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>}

      {tab==='write'&&<div>
        <div style={{background:'rgba(96,165,250,0.05)',border:'1px solid rgba(96,165,250,0.2)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.8rem',color:'#60A5FA',marginBottom:'0.5rem',fontWeight:700}}>📝 Makale Yayınla (₱5,000)</div>
          <div style={{marginBottom:'0.5rem'}}>
            <div style={{fontSize:'0.72rem',color:'#999',marginBottom:'0.25rem'}}>Kategori</div>
            <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
              {CATS.map(c=><button key={c} onClick={()=>setForm(prev=>({...prev,category:c}))} style={{padding:'0.25rem 0.6rem',borderRadius:'1rem',border:`1px solid ${form.category===c?'#60A5FA':'rgba(255,255,255,0.12)'}`,background:form.category===c?'rgba(96,165,250,0.15)':'transparent',color:form.category===c?'#60A5FA':'#999',cursor:'pointer',fontSize:'0.75rem',fontFamily:'inherit'}}>{c}</button>)}
            </div>
          </div>
          <input value={form.title} onChange={e=>setForm(prev=>({...prev,title:e.target.value}))} placeholder="Makale başlığı..." style={{width:'100%',padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'#E8EDF2',fontSize:'0.9rem',outline:'none',marginBottom:'0.5rem',fontFamily:'inherit'}} />
          <textarea value={form.content} onChange={e=>setForm(prev=>({...prev,content:e.target.value}))} placeholder="Makale içeriği... (min 50 karakter)" rows={5} style={{width:'100%',padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'#E8EDF2',fontSize:'0.85rem',outline:'none',resize:'vertical',fontFamily:'inherit',marginBottom:'0.5rem'}} />
          <button onClick={publish} style={{width:'100%',padding:'0.65rem',background:'rgba(96,165,250,0.15)',border:'1px solid rgba(96,165,250,0.3)',borderRadius:'8px',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.9rem'}}>📰 Yayınla (₱5,000)</button>
        </div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PVP DÖVÜŞ SAYFASI
// ═══════════════════════════════════════════════════════
function PvpPage({ profile, setProfile, showNotif }) {
  const [battles, setBattles] = useLs('pvpBattles', []);
  const [pvpCooldown, setPvpCooldown] = useLs('pvpCooldown', {});
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const now = Date.now();
  const updateUser = (upd) => {
    const next = {...cu,...upd};
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };

  const allUsers = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return [];} })();
  const targets = allUsers.filter(u => u.id!==cu.id && !u.banned);

  const attack = (target) => {
    const lastBattle = pvpCooldown[cu.id]||0;
    if (now-lastBattle < 5*60*1000) { showNotif('⏳ PvP cooldown: 5 dakika!','error'); return; }
    if ((cu.hp||100) < 20) { showNotif('❌ Canın çok az! İyileş önce.','error'); return; }
    const myStr = (cu.level||1)*10 + (cu.meritPoints||0)/10;
    const oppStr = (target.level||1)*10 + (target.meritPoints||0)/10;
    const won = Math.random()*100 < Math.min(80,Math.max(20,(myStr/(myStr+oppStr))*100));
    const stolen = won ? Math.floor(Math.min(target.money||0, (target.money||0)*0.05)) : 0;
    const hpLost = won ? 5 : 15;
    const battle = {id:Date.now(),attacker:cu.username,defender:target.username,result:won?'win':'loss',stolen,date:new Date().toLocaleDateString('tr-TR')};
    setBattles(prev=>[battle,...prev].slice(0,50));
    setPvpCooldown(prev=>({...prev,[cu.id]:now}));
    if (won) {
      updateUser({money:(cu.money||0)+stolen, hp:Math.max(0,(cu.hp||100)-hpLost), meritPoints:(cu.meritPoints||0)+10});
      const newUsers = allUsers.map(u => u.id===target.id ? {...u,money:Math.max(0,(u.money||0)-stolen)} : u);
      localStorage.setItem('rep_users', JSON.stringify(newUsers));
      showNotif(`⚔️ Saldırı başarılı! +₱${stolen.toLocaleString()} +10🏅 -${hpLost}❤️`,'success');
    } else {
      updateUser({hp:Math.max(0,(cu.hp||100)-hpLost)});
      showNotif(`💔 Saldırı başarısız! -${hpLost}❤️`,'error');
    }
  };

  const myBattles = battles.filter(b=>b.attacker===cu.username||b.defender===cu.username);
  const wins = myBattles.filter(b=>b.attacker===cu.username&&b.result==='win').length;

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#EF4444',marginBottom:'1rem'}}>⚔️ PvP Savaş Alanı</div>
      <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
          {[{l:'Can',v:`${cu.hp||100}/100`,c:(cu.hp||100)>50?'#10B981':(cu.hp||100)>20?'#F59E0B':'#EF4444'},{l:'Galibiyet',v:wins,c:'#10B981'},{l:'Toplam Savaş',v:myBattles.length,c:'#60A5FA'}].map(s=>(
            <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.5rem',textAlign:'center'}}><div style={{fontWeight:700,color:s.c,fontSize:'0.95rem'}}>{s.v}</div><div style={{fontSize:'0.62rem',color:'#666'}}>{s.l}</div></div>
          ))}
        </div>
      </div>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
        <div style={{fontWeight:700,color:'#aaa',marginBottom:'0.75rem',fontSize:'0.9rem'}}>🎯 Saldırı Hedefleri</div>
        {targets.length===0&&<div style={{color:'#555',textAlign:'center',padding:'1rem'}}>Başka oyuncu bulunamadı.</div>}
        {targets.slice(0,15).map(t=>(
          <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.5rem 0.6rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px',marginBottom:'0.3rem',border:'1px solid rgba(255,255,255,0.06)'}}>
            <div>
              <div style={{fontWeight:600,fontSize:'0.85rem'}}>{t.username}</div>
              <div style={{fontSize:'0.7rem',color:'#999'}}>Lv.{t.level||1} · ❤️{t.hp||100} · ₱{((t.money||0)/1000).toFixed(0)}K</div>
            </div>
            <button onClick={()=>attack(t)} style={{padding:'0.35rem 0.8rem',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'6px',color:'#EF4444',cursor:'pointer',fontWeight:700,fontSize:'0.78rem',fontFamily:'inherit'}}>⚔️ Saldır</button>
          </div>
        ))}
      </div>
      {myBattles.length>0&&<div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
        <div style={{fontWeight:700,color:'#aaa',marginBottom:'0.5rem',fontSize:'0.9rem'}}>📋 Savaş Geçmişi</div>
        {myBattles.slice(0,10).map(b=>(
          <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.5rem',borderRadius:'6px',marginBottom:'0.25rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${b.result==='win'&&b.attacker===cu.username?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.15)'}`}}>
            <div style={{fontSize:'0.8rem'}}>{b.attacker===cu.username?'⚔️':'🛡️'} <strong>{b.attacker===cu.username?b.defender:b.attacker}</strong></div>
            <div style={{fontSize:'0.78rem',fontWeight:700,color:(b.result==='win'&&b.attacker===cu.username)?'#10B981':'#EF4444'}}>{(b.result==='win'&&b.attacker===cu.username)?`+₱${(b.stolen||0).toLocaleString()}`:'💔'}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SOSYAL MEDYA SAYFASI
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// KLAN SOHBET SAYFASI — Firebase RTDB gerçek zamanlı
// ═══════════════════════════════════════════════════════
function KlanChatPage({ profile }) {
  const { dark } = useTheme();
  const cu = profile || {};
  const [msgs, setMsgs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rep_klanChat') || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [online, setOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState('Genel');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [giphyLoading, setGiphyLoading] = useState(false);
  const endRef = useRef(null);
  const rtdbRef = useRef(null);
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const rooms = ['Genel', 'Liderler', 'Savaş Planı', 'Ticaret'];

  const POPULAR_GIFS_KLAN = [
    'https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif',
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
    'https://media.giphy.com/media/xT9IgG50Lg7russbBO/giphy.gif',
    'https://media.giphy.com/media/l0HlFZ3HqbGrMTBQs/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/3oEdv22bMDaqXkOIPS/giphy.gif',
    'https://media.giphy.com/media/TdfyKrN7HGTIY/giphy.gif',
  ];

  useEffect(() => {
    if (!showGifPicker) return;
    const q = gifSearch.trim();
    const timer = setTimeout(async () => {
      setGiphyLoading(true);
      try {
        const endpoint = q ? `/api/giphy-search?q=${encodeURIComponent(q)}&limit=20` : '/api/giphy-trending?limit=20';
        const r = await fetch(endpoint);
        const data = await r.json();
        if (data && Array.isArray(data.data)) {
          setGiphyResults(data.data.map(g => g.images?.fixed_height?.url || g.images?.downsized?.url || '').filter(Boolean));
        }
      } catch(e) { setGiphyResults([]); }
      setGiphyLoading(false);
    }, q ? 500 : 0);
    return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker]);

  useEffect(() => {
    const tryConnect = () => {
      if (!window._fb?.rtdb || !window._gameId) return false;
      const ref = window._fb.rtdb.ref(`games/${window._gameId}/realtime/klanChat`);
      rtdbRef.current = ref;
      ref.on('value', (snap) => {
        setOnline(true);
        if (!snap.exists()) return;
        const raw = snap.val();
        let arr = Array.isArray(raw) ? raw : Object.values(raw || {}).sort((a,b)=>(a.ts||0)-(b.ts||0));
        arr = arr.filter(Boolean).slice(-200);
        setMsgs(arr);
        localStorage.setItem('rep_klanChat', JSON.stringify(arr));
      }, () => setOnline(false));
      return true;
    };
    if (!tryConnect()) {
      const h = () => tryConnect();
      window.addEventListener('firebase-ready', h);
      return () => window.removeEventListener('firebase-ready', h);
    }
    return () => { rtdbRef.current?.off('value'); };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.detail?.key === 'klanChat') setMsgs(e.detail.value || []); };
    window.addEventListener('fb-sync', h);
    return () => window.removeEventListener('fb-sync', h);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, room]);

  const roomMsgs = msgs.filter(m => m.room === room);

  const send = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || sending) return;
    setSending(true);
    const msg = { id:Date.now(), room, author:cu.username||'Anonim', text, ts:Date.now(), city:cu.city||'', photoUrl: cu.avatarUrl||cu.photoUrl||null };
    if (!textOverride) setInput('');
    setShowGifPicker(false);
    try {
      if (window._fb?.rtdb && window._gameId) {
        const ref = window._fb.rtdb.ref(`games/${window._gameId}/realtime/klanChat`);
        await ref.transaction((cur) => { const arr = Array.isArray(cur)?cur:[]; return [...arr,msg].slice(-200); });
      } else {
        setMsgs(prev => [...prev, msg].slice(-200));
        localStorage.setItem('rep_klanChat', JSON.stringify([...msgs,msg].slice(-200)));
      }
    } catch(e) { setMsgs(prev => [...prev, msg].slice(-200)); }
    setSending(false);
  };

  const sendGif = (gifUrl) => send(gifUrl);
  const displayGifs = giphyResults.length > 0 ? giphyResults : POPULAR_GIFS_KLAN;
  const gifRx = /(https?:\/\/(?:media\.giphy\.com|i\.giphy\.com|media\d*\.giphy\.com|tenor\.com|c\.tenor\.com)\S+)/i;

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:800,color:'#A78BFA',letterSpacing:'0.08em'}}>🔒 KLAN SOHBET</div>
        <div style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.7rem',color:online?'#10B981':'#5A7089',fontWeight:700}}>
          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:online?'#10B981':'#5A7089',boxShadow:online?'0 0 6px #10B981':'none'}}/>
          {online?'Canlı':'Çevrimdışı'}
        </div>
      </div>
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
        {rooms.map(r => (
          <button key={r} onClick={()=>setRoom(r)}
            style={{padding:'0.35rem 0.85rem',borderRadius:'20px',border:`1px solid ${room===r?'rgba(139,92,246,0.5)':border}`,background:room===r?'rgba(139,92,246,0.15)':'transparent',color:room===r?'#A78BFA':dark?'#64748B':'#94A3B8',fontSize:'0.78rem',fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
            {r}
          </button>
        ))}
      </div>
      <div style={{flex:1,background:card,border:`1px solid ${border}`,borderRadius:'16px',padding:'0.75rem',overflowY:'auto',maxHeight:'48vh',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
        {roomMsgs.length===0 && <div style={{color:'#5A7089',fontSize:'0.85rem',textAlign:'center',marginTop:'2rem'}}>{online?'Bu odada henüz mesaj yok. İlk mesajı gönder!':'🔄 Bağlanıyor...'}</div>}
        {roomMsgs.map(m => {
          const isMe = m.author === cu.username;
          const gifMatch = m.text?.match(gifRx);
          const isGif = !!gifMatch;
          return (
            <div key={m.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'0.4rem',alignItems:'flex-end'}}>
              {!isMe && (
                <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#5B21B6,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',flexShrink:0,overflow:'hidden',border:'1px solid rgba(139,92,246,0.3)'}}>
                  {m.photoUrl ? <img src={m.photoUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" onError={e=>e.target.style.display='none'}/> : '👤'}
                </div>
              )}
              <div style={{maxWidth:'78%'}}>
                {!isMe && <div style={{fontSize:'0.62rem',color:'#A78BFA',fontWeight:700,marginBottom:'2px',paddingLeft:'4px'}}>{m.author}{m.city&&` · ${m.city}`}</div>}
                {isGif ? (
                  <div style={{borderRadius:isMe?'12px 12px 3px 12px':'12px 12px 12px 3px',overflow:'hidden',border:`1px solid ${isMe?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.08)'}`}}>
                    <img src={gifMatch[0]} alt="gif" style={{maxWidth:'220px',maxHeight:'200px',display:'block'}} onError={e=>e.target.parentElement.innerHTML='<div style="padding:0.5rem;color:#EF4444;font-size:0.75rem">⚠️ GIF yüklenemedi</div>'}/>
                  </div>
                ) : (
                  <div style={{padding:'0.5rem 0.75rem',borderRadius:isMe?'12px 12px 3px 12px':'12px 12px 12px 3px',background:isMe?'rgba(139,92,246,0.18)':'rgba(255,255,255,0.05)',border:`1px solid ${isMe?'rgba(139,92,246,0.3)':border}`,fontSize:'0.87rem',color:dark?'#E8EDF2':'#1E293B',lineHeight:1.5,wordBreak:'break-word'}}>
                    {m.text}
                  </div>
                )}
                <div style={{fontSize:'0.58rem',color:'#3B4E63',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:isMe?0:'4px'}}>{timeAgo(m.ts)}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>

      {/* GIF Picker */}
      {showGifPicker && (
        <div style={{background:'rgba(6,12,24,0.98)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:'14px',padding:'0.65rem'}}>
          <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.5rem'}}>
            <input value={gifSearch} onChange={e=>setGifSearch(e.target.value)} placeholder="GIF ara... (örn: klan, savaş, zafer)"
              style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'10px',padding:'0.45rem 0.75rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}} />
            <button onClick={()=>setShowGifPicker(false)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.45rem 0.6rem',color:'#5A7089',cursor:'pointer',fontSize:'0.8rem'}}>✕</button>
          </div>
          {giphyLoading && <div style={{textAlign:'center',color:'#A78BFA',fontSize:'0.75rem',padding:'0.3rem'}}>🔄 Yükleniyor...</div>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.3rem',maxHeight:'150px',overflowY:'auto',scrollbarWidth:'none'}}>
            {displayGifs.map((g,i)=>(
              <img key={i} src={g} alt="gif" onClick={()=>sendGif(g)}
                style={{height:'68px',width:'100%',objectFit:'cover',borderRadius:'8px',cursor:'pointer',border:'1px solid rgba(139,92,246,0.15)'}}
                onError={e=>e.target.style.display='none'} />
            ))}
          </div>
          <div style={{fontSize:'0.56rem',color:'#3B4E63',textAlign:'right',marginTop:'0.25rem'}}>Powered by GIPHY</div>
        </div>
      )}

      <div style={{display:'flex',gap:'0.5rem'}}>
        <button onClick={()=>setShowGifPicker(v=>!v)}
          style={{background:showGifPicker?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${showGifPicker?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'12px',padding:'0.65rem 0.7rem',color:showGifPicker?'#A78BFA':'#8BA0B5',cursor:'pointer',fontSize:'0.95rem',flexShrink:0}}>
          🎞️
        </button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder={`#${room} odasına mesaj yaz...`}
          style={{flex:1,background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'0.7rem 1rem',color:dark?'#E8EDF2':'#1E293B',fontSize:'0.88rem',outline:'none',fontFamily:"'DM Sans',sans-serif"}} />
        <button onClick={()=>send()} disabled={sending}
          style={{padding:'0.7rem 1rem',borderRadius:'12px',border:'none',background:sending?'rgba(139,92,246,0.08)':'rgba(139,92,246,0.2)',color:sending?'#5A7089':'#A78BFA',fontWeight:700,cursor:sending?'not-allowed':'pointer',fontSize:'0.9rem',transition:'all 0.15s'}}>
          {sending?'…':'↑'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// NPC OYUNCULAR SAYFASI
// ═══════════════════════════════════════════════════════
const NPC_DEFS = [
  {id:'npc1',name:'Don Kemal',   icon:'🤵',role:'Tefeci',      city:'İstanbul',desc:'Finans dünyasının gölge figürü', trait:'Açgözlü',  color:'#EF4444'},
  {id:'npc2',name:'Av. Avcı',    icon:'⚖️',role:'Avukat',      city:'Ankara',  desc:'Her davayı kazanan soğuk kanlı',trait:'Hesaplı',  color:'#3B82F6'},
  {id:'npc3',name:'Çakal Mete',  icon:'🎯',role:'Sokak Lideri',city:'İzmir',   desc:'Sokakların tartışmasız efendisi',trait:'Saldırgan',color:'#F59E0B'},
  {id:'npc4',name:'Büyükanne',   icon:'👵',role:'Bilge',       city:'Bursa',   desc:'Her şeyi bilen gizemli yaşlı kadın',trait:'Bilge',color:'#10B981'},
  {id:'npc5',name:'Korsan Hakan',icon:'🏴‍☠️',role:'Kaptan',  city:'Trabzon', desc:'Karadenizin efsanevi kaptanı',  trait:'Cesur',    color:'#8B5CF6'},
  {id:'npc6',name:'Dr. Yılmaz',  icon:'🔬',role:'Bilim İnsanı',city:'İzmir',  desc:'Tehlikeli bilginin sahibi',     trait:'Gizemli',  color:'#06B6D4'},
  {id:'npc7',name:'General Fırat',icon:'⚔️',role:'Subay',     city:'Ankara',  desc:'Darbe planlarıyla ünlü general',trait:'Otoriter', color:'#DC2626'},
  {id:'npc8',name:'Hacı Murat',  icon:'🕌',role:'Esnaf',       city:'Konya',   desc:'Çarşının gizli patronu',        trait:'Güvenilmez',color:'#D97706'},
];

function NpcPlayersPage({ profile, showNotif }) {
  const { dark } = useTheme();
  const cu = profile || {};
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [relations, setRelations] = useState(()=>{try{return JSON.parse(localStorage.getItem('npcRelations')||'{}');}catch{return {};}});
  const [activity, setActivity] = useState([
    {npc:'Don Kemal',   text:'Borsa üzerinden manipülasyon yaptı',ts:Date.now()-120000},
    {npc:'Çakal Mete',  text:'Güney mahallede toprak genişletti', ts:Date.now()-300000},
    {npc:'General Fırat',text:'Askeri tatbikat ilan etti',        ts:Date.now()-600000},
  ]);
  const [selected, setSelected] = useState(null);

  const doAction = (npc, action) => {
    const cur = relations[npc.id] || 0;
    const delta = action==='trade'?10:action==='alliance'?20:-25;
    const next = Math.max(-100, Math.min(100, cur+delta));
    const updated = {...relations,[npc.id]:next};
    setRelations(updated);
    localStorage.setItem('npcRelations', JSON.stringify(updated));
    const labels = {trade:'Ticaret',alliance:'İttifak',attack:'Saldırı'};
    setActivity(prev=>[{npc:npc.name,text:`${cu.username||'Sen'} ile ${labels[action]} → İlişki: ${next}`,ts:Date.now()},...prev].slice(0,20));
    showNotif(`${npc.icon} ${npc.name} ile ${labels[action]} yapıldı`,action==='attack'?'error':'success');
    setSelected(null);
  };

  const relColor = v => v>=50?'#10B981':v>=0?'#F59E0B':'#EF4444';
  const relLabel = v => v>=50?'Dost':v>=0?'Nötr':'Düşman';

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:800,color:'#818CF8',letterSpacing:'0.08em'}}>🤖 NPC OYUNCULAR</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>
        {NPC_DEFS.map(npc => {
          const rel = relations[npc.id]||0;
          return (
            <button key={npc.id} onClick={()=>setSelected(npc)}
              style={{background:card,border:`1px solid ${selected?.id===npc.id?npc.color:border}`,borderRadius:'14px',padding:'0.75rem',textAlign:'left',cursor:'pointer',display:'flex',flexDirection:'column',gap:'0.35rem',transition:'all 0.15s',boxShadow:selected?.id===npc.id?`0 0 12px ${npc.color}33`:'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <span style={{fontSize:'1.5rem'}}>{npc.icon}</span>
                <div style={{flex:1,overflow:'hidden'}}>
                  <div style={{fontSize:'0.82rem',fontWeight:700,color:dark?'#E8EDF2':'#1E293B',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{npc.name}</div>
                  <div style={{fontSize:'0.68rem',color:npc.color,fontWeight:600}}>{npc.role}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'0.65rem',color:'#5A7089'}}>{npc.city}</span>
                <span style={{fontSize:'0.65rem',fontWeight:700,color:relColor(rel)}}>{relLabel(rel)} ({rel>0?'+':''}{rel})</span>
              </div>
              <div style={{height:'3px',borderRadius:'2px',background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.abs(rel)}%`,background:relColor(rel),borderRadius:'2px',transition:'width 0.3s'}}/>
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div style={{background:card,border:`1px solid ${selected.color}44`,borderRadius:'16px',padding:'1rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
            <span style={{fontSize:'2rem'}}>{selected.icon}</span>
            <div>
              <div style={{fontSize:'0.95rem',fontWeight:800,color:dark?'#E8EDF2':'#1E293B'}}>{selected.name}</div>
              <div style={{fontSize:'0.75rem',color:'#5A7089'}}>{selected.desc}</div>
            </div>
          </div>
          <div style={{fontSize:'0.78rem',color:'#5A7089'}}>Özellik: <span style={{color:selected.color,fontWeight:700}}>{selected.trait}</span></div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={()=>doAction(selected,'trade')} style={{flex:1,padding:'0.55rem',borderRadius:'10px',border:'1px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.1)',color:'#10B981',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>💼 Ticaret</button>
            <button onClick={()=>doAction(selected,'alliance')} style={{flex:1,padding:'0.55rem',borderRadius:'10px',border:'1px solid rgba(59,130,246,0.3)',background:'rgba(59,130,246,0.1)',color:'#60A5FA',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>🤝 İttifak</button>
            <button onClick={()=>doAction(selected,'attack')} style={{flex:1,padding:'0.55rem',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',color:'#F87171',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>⚔️ Saldır</button>
          </div>
        </div>
      )}
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.78rem',fontWeight:700,color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:'0.25rem'}}>Son Aktivite</div>
      <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
        {activity.map((a,i)=>(
          <div key={i} style={{background:card,border:`1px solid ${border}`,borderRadius:'10px',padding:'0.5rem 0.75rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'0.8rem',color:dark?'#E8EDF2':'#1E293B'}}><b style={{color:'#818CF8'}}>{a.npc}</b>: {a.text}</span>
            <span style={{fontSize:'0.65rem',color:'#5A7089',flexShrink:0,marginLeft:'0.5rem'}}>{timeAgo(a.ts)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DUYURULAR SAYFASI
// ═══════════════════════════════════════════════════════
function DuyurularPage({ profile }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [announcements] = useLs('announcements', []);
  const [selected, setSelected] = useState(null);
  const catColor = {Siyaset:'#EF4444',Ekonomi:'#F59E0B',Hukuk:'#3B82F6',Etkinlik:'#10B981',Sistem:'#8B5CF6'};
  const defaultAnn = [
    {id:'ann1',title:'Seçim Krizi!',body:'Seçim sonuçları tartışmalı, siyasi gerilim tırmanıyor. Tüm partiler acil toplantıya çağrıldı.',category:'Siyaset',icon:'🏛️',ts:Date.now()-3600000},
    {id:'ann2',title:'Ekonomi Uyarısı',body:'Merkez Bankası faiz kararı açıkladı. Piyasalarda dalgalanma bekleniyor.',category:'Ekonomi',icon:'💰',ts:Date.now()-7200000},
    {id:'ann3',title:'Yeni Yasa Tasarısı',body:'Meclis yeni bir yasa tasarısı oylamaya sunuyor. Tüm vatandaşlar görüş bildirebilir.',category:'Hukuk',icon:'⚖️',ts:Date.now()-14400000},
    {id:'ann4',title:'Klan Turnuvası',body:'Bu hafta sonu klan savaşı başlıyor! Katılım için klan liderinizle iletişime geçin.',category:'Etkinlik',icon:'⚔️',ts:Date.now()-86400000},
  ];
  const list = [...announcements,...defaultAnn].slice(0,20);

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:800,color:'#F59E0B',letterSpacing:'0.08em'}}>📣 DUYURULAR</div>
      {selected ? (
        <div style={{background:card,border:`1px solid ${catColor[selected.category]||border}44`,borderRadius:'16px',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <span style={{fontSize:'1.8rem'}}>{selected.icon||'📣'}</span>
            <div>
              <div style={{fontSize:'0.95rem',fontWeight:800,color:dark?'#E8EDF2':'#1E293B'}}>{selected.title}</div>
              <div style={{fontSize:'0.72rem',color:catColor[selected.category]||'#F59E0B',fontWeight:700}}>{selected.category} • {timeAgo(selected.ts)}</div>
            </div>
          </div>
          <div style={{fontSize:'0.9rem',color:dark?'#CBD5E1':'#334155',lineHeight:'1.6'}}>{selected.body}</div>
          <button onClick={()=>setSelected(null)} style={{alignSelf:'flex-start',padding:'0.45rem 1rem',borderRadius:'10px',border:`1px solid ${border}`,background:'transparent',color:'#5A7089',fontSize:'0.8rem',cursor:'pointer',fontWeight:600}}>← Geri</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {list.map(a=>(
            <button key={a.id||a.ts} onClick={()=>setSelected(a)}
              style={{background:card,border:`1px solid ${border}`,borderRadius:'12px',padding:'0.85rem 1rem',display:'flex',alignItems:'center',gap:'0.75rem',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
              <span style={{fontSize:'1.4rem',flexShrink:0}}>{a.icon||'📣'}</span>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontSize:'0.88rem',fontWeight:700,color:dark?'#E8EDF2':'#1E293B',marginBottom:'0.2rem'}}>{a.title}</div>
                <div style={{fontSize:'0.75rem',color:'#5A7089',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.body}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.2rem',flexShrink:0}}>
                <span style={{fontSize:'0.65rem',fontWeight:700,color:catColor[a.category]||'#F59E0B',background:`${catColor[a.category]||'#F59E0B'}15`,padding:'2px 6px',borderRadius:'6px'}}>{a.category}</span>
                <span style={{fontSize:'0.62rem',color:'#5A7089'}}>{timeAgo(a.ts)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SIRALAMA (LEADERBOARD) SAYFASI
// ═══════════════════════════════════════════════════════
function LeaderboardPage({ profile, onNavigate }) {
  const { dark } = useTheme();
  const [allUsers] = useLs('users', []);
  const cu = profile || {};
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const TABS = [
    {id:'money', label:'💰 Servet',  key:'money'},
    {id:'xp',    label:'⭐ XP',      key:'xp'},
    {id:'merit', label:'🏅 Liyakat', key:'meritPoints'},
    {id:'trade', label:'🤝 Ticaret', key:'tradePoints'},
    {id:'level', label:'📈 Seviye',  key:'level'},
    {id:'edu',   label:'🎓 Eğitim',  key:'educationProgress'},
  ];
  const [tab, setTab] = useState('money');
  const activeTab = TABS.find(t=>t.id===tab);
  const users = Array.isArray(allUsers) ? allUsers : [];
  const sorted = [...users].filter(u=>!u.banned).sort((a,b)=>(b[activeTab.key]||0)-(a[activeTab.key]||0)).slice(0,50);
  const myRank = sorted.findIndex(u=>u.id===cu.id)+1;
  const medal = i => i===0?{icon:'🥇',color:'#FFD700',glow:'rgba(255,215,0,0.3)'}:i===1?{icon:'🥈',color:'#C0C0C0',glow:'rgba(192,192,192,0.3)'}:i===2?{icon:'🥉',color:'#CD7F32',glow:'rgba(205,127,50,0.3)'}:null;
  const fmtVal = u => {
    const v=u[activeTab.key]||0;
    if (tab==='edu') return `${Number(v).toLocaleString('tr-TR')} puan`;
    if (tab==='money') return fmtWord(v);
    return Number(v).toLocaleString('tr-TR');
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:800,color:'#FFD700',letterSpacing:'0.08em'}}>🏆 SIRALAMA</div>
      <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'3px',gap:'3px'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:'0.45rem 0.2rem',borderRadius:'9px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.7rem',transition:'all 0.15s',whiteSpace:'nowrap',
              background:tab===t.id?'rgba(255,215,0,0.15)':'transparent',
              color:tab===t.id?'#FFD700':dark?'#64748B':'#94A3B8'}}>
            {t.label}
          </button>
        ))}
      </div>
      {myRank>0&&(
        <div style={{background:'rgba(255,215,0,0.08)',border:'1px solid rgba(255,215,0,0.25)',borderRadius:'12px',padding:'0.65rem 1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'0.8rem',color:'#FFD700',fontWeight:700}}>📍 Senin sıran</span>
          <span style={{fontSize:'0.85rem',fontWeight:800,color:'#FFD700'}}>#{myRank} / {sorted.length}</span>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
        {sorted.length===0&&<div style={{color:'#5A7089',fontSize:'0.85rem',textAlign:'center',marginTop:'2rem'}}>Henüz kayıtlı oyuncu yok.</div>}
        {sorted.map((u,i)=>{
          const m=medal(i); const isMe=u.id===cu.id;
          return (
            <div key={u.id||i} style={{display:'flex',alignItems:'center',gap:'0.65rem',background:isMe?'rgba(255,215,0,0.07)':card,border:`1px solid ${isMe?'rgba(255,215,0,0.3)':border}`,borderRadius:'12px',padding:'0.65rem 0.85rem',boxShadow:m?`0 0 10px ${m.glow}`:'none'}}>
              <div style={{minWidth:'28px',textAlign:'center'}}>
                {m?<span style={{fontSize:'1.3rem'}}>{m.icon}</span>:<span style={{fontSize:'0.78rem',fontWeight:800,color:'#5A7089'}}>#{i+1}</span>}
              </div>
              <div style={{width:'34px',height:'34px',borderRadius:'50%',background:`linear-gradient(135deg,${m?.color||'#3B82F6'},${m?.color||'#6366F1'}33)`,border:`2px solid ${m?.color||'rgba(255,255,255,0.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>
                {u.gender==='kadin'?'👩':'👨'}
              </div>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontSize:'0.85rem',fontWeight:700,color:isMe?'#FFD700':dark?'#E8EDF2':'#1E293B',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.username}{isMe?' (Sen)':''}</div>
                <div style={{fontSize:'0.67rem',color:'#5A7089'}}>{u.city||''} • Lv.{u.level||1}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:'0.82rem',fontWeight:800,color:m?m.color:dark?'#E8EDF2':'#334155'}}>{fmtVal(u)}</div>
                {tab==='money'&&u.xp>0&&<div style={{fontSize:'0.62rem',color:'#5A7089'}}>{u.xp?.toLocaleString()} XP</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SocialPage({ profile, showNotif }) {
  const [posts, setPosts] = useLs('socialPosts', []);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};

  const SOCIAL_GIFS = [
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/l0HlFZ3HqbGrMTBQs/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/xT9IgG50Lg7russbBO/giphy.gif',
    'https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
    'https://media.giphy.com/media/3oEdv22bMDaqXkOIPS/giphy.gif',
  ];

  const publishPost = (contentOverride, imageOverride) => {
    const content = contentOverride || newPost;
    const image = imageOverride !== undefined ? imageOverride : postImage;
    if (!content.trim() && !image.trim()) { showNotif('❌ Gönderi boş olamaz!','error'); return; }
    if (content.length > 500) { showNotif('❌ Maksimum 500 karakter!','error'); return; }
    const post = {
      id:Date.now(), author:cu.username, content:content.trim(),
      imageUrl: image.trim() || undefined,
      likes:[], comments:[], date:new Date().toLocaleDateString('tr-TR'),
      time:new Date().toLocaleTimeString('tr-TR'), city:cu.city||'İstanbul'
    };
    setPosts(prev=>[post,...prev].slice(0,200));
    setNewPost(''); setPostImage(''); setShowGifPicker(false);
    showNotif('✅ Gönderi paylaşıldı!','success');
    try {
      const ds = JSON.parse(localStorage.getItem('rep_dailyTaskProgress')||'{}');
      const today = new Date().toDateString();
      const ts = ds[today]||{};
      const ps = JSON.parse(localStorage.getItem('rep_socialPosts')||'[]');
      localStorage.setItem('rep_socialPosts', JSON.stringify([post,...ps].slice(0,200)));
    } catch(e){}
  };

  const likePost = (id) => {
    setPosts(prev=>prev.map(p=>{
      if(p.id!==id) return p;
      const liked = (p.likes||[]).includes(cu.username);
      return {...p,likes:liked?(p.likes||[]).filter(l=>l!==cu.username):[...(p.likes||[]),cu.username]};
    }));
  };

  const deletePost = (id) => {
    setPosts(prev=>prev.filter(p=>p.id!==id));
    showNotif('🗑️ Gönderi silindi.','info');
  };

  const imgRx = /(https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|gifv)(\?\S*)?|https?:\/\/(?:media\.giphy\.com|i\.giphy\.com|tenor\.com|c\.tenor\.com)\S+)/i;

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#A78BFA',marginBottom:'1rem'}}>📱 Sosyal Medya</div>
      <div style={{background:'rgba(167,139,250,0.05)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
        <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder={`${cu.username||'Oyuncu'} olarak ne düşünüyorsun?`} rows={3}
          style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'#E8EDF2',fontSize:'0.9rem',resize:'none',fontFamily:'inherit',marginBottom:'0.5rem'}} />
        {postImage && (
          <div style={{position:'relative',marginBottom:'0.5rem'}}>
            <img src={postImage} alt="önizleme" style={{maxWidth:'100%',maxHeight:'180px',borderRadius:'10px',objectFit:'cover',border:'1px solid rgba(167,139,250,0.2)'}} onError={e=>e.target.style.display='none'} />
            <button onClick={()=>setPostImage('')} style={{position:'absolute',top:'4px',right:'4px',background:'rgba(0,0,0,0.6)',border:'none',borderRadius:'50%',width:'22px',height:'22px',color:'#fff',cursor:'pointer',fontSize:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
        )}
        {showGifPicker && (
          <div style={{marginBottom:'0.5rem'}}>
            <div style={{overflowX:'auto',display:'flex',gap:'0.4rem',paddingBottom:'0.3rem',scrollbarWidth:'none'}}>
              {SOCIAL_GIFS.map((g,i)=>(
                <img key={i} src={g} alt="gif" onClick={()=>{setPostImage(g);setShowGifPicker(false);}}
                  style={{height:'65px',width:'65px',objectFit:'cover',borderRadius:'8px',cursor:'pointer',border:'1px solid rgba(167,139,250,0.25)',flexShrink:0}}
                  onError={e=>e.target.style.display='none'} />
              ))}
            </div>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.4rem'}}>
          <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
            <button onClick={()=>setShowGifPicker(v=>!v)} title="GIF ekle"
              style={{background:showGifPicker?'rgba(167,139,250,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${showGifPicker?'rgba(167,139,250,0.5)':'rgba(255,255,255,0.1)'}`,borderRadius:'8px',padding:'0.3rem 0.55rem',color:showGifPicker?'#A78BFA':'#666',cursor:'pointer',fontSize:'0.8rem',fontWeight:700}}>
              🎞️ GIF
            </button>
            <input value={postImage} onChange={e=>setPostImage(e.target.value)} placeholder="Resim URL..."
              style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'0.3rem 0.6rem',color:'#E8EDF2',fontFamily:'inherit',fontSize:'0.75rem',outline:'none',width:'130px'}} />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <span style={{fontSize:'0.7rem',color:newPost.length>480?'#EF4444':'#666'}}>{newPost.length}/500</span>
            <button onClick={()=>publishPost()} style={{padding:'0.45rem 1.1rem',background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.35)',borderRadius:'8px',color:'#A78BFA',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>📢 Paylaş</button>
          </div>
        </div>
      </div>
      {posts.map(p=>{
        const textImgMatch = p.content?.match(imgRx);
        const mainImage = p.imageUrl || (textImgMatch ? textImgMatch[0] : null);
        const displayText = textImgMatch ? p.content.replace(textImgMatch[0],'').trim() : p.content;
        return (
          <div key={p.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
              <div>
                <div style={{fontWeight:700,color:'#A78BFA',fontSize:'0.88rem'}}>{p.author}</div>
                <div style={{fontSize:'0.65rem',color:'#666'}}>{p.city} · {p.date} {p.time}</div>
              </div>
              {p.author===cu.username&&<button onClick={()=>deletePost(p.id)} style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontSize:'0.85rem'}}>🗑️</button>}
            </div>
            {displayText && <div style={{fontSize:'0.88rem',color:'#ccc',lineHeight:1.6,marginBottom:'0.5rem'}}>{displayText}</div>}
            {mainImage && (
              <img src={mainImage} alt="" style={{maxWidth:'100%',maxHeight:'220px',borderRadius:'10px',objectFit:'cover',display:'block',marginBottom:'0.5rem',border:'1px solid rgba(255,255,255,0.07)'}} onError={e=>e.target.style.display='none'} />
            )}
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button onClick={()=>likePost(p.id)} style={{padding:'0.25rem 0.7rem',background:(p.likes||[]).includes(cu.username)?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${(p.likes||[]).includes(cu.username)?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'6px',color:(p.likes||[]).includes(cu.username)?'#EF4444':'#999',cursor:'pointer',fontSize:'0.78rem',fontFamily:'inherit'}}>❤️ {(p.likes||[]).length}</button>
            </div>
          </div>
        );
      })}
      {posts.length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#555'}}><div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>📱</div>Henüz gönderi yok. İlk paylaşımı yap!</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BAŞARI SAYFASI
// ═══════════════════════════════════════════════════════
function AchievementsPage({ profile }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const allUsers = (() => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return [];} })();
  const factories = (() => { try { return JSON.parse(localStorage.getItem('rep_factories')||'[]'); } catch{return [];} })();
  const gangs = (() => { try { return JSON.parse(localStorage.getItem('rep_gangs')||'[]'); } catch{return [];} })();
  const parties = (() => { try { return JSON.parse(localStorage.getItem('rep_parties')||'[]'); } catch{return [];} })();

  const ACHIEVEMENTS = [
    {id:'first_million',icon:'💰',title:'İlk Milyoner',desc:'₱1,000,000 birikir',check:p=>(p.money||0)+(p.bankMoney||0)>=1000000,color:'#FFD700'},
    {id:'billionaire',icon:'🏦',title:'Milyarder',desc:'₱1,000,000,000 birikir',check:p=>(p.money||0)+(p.bankMoney||0)>=1000000000,color:'#FFD700'},
    {id:'lv10',icon:'⭐',title:'Tecrübeli',desc:'Seviye 10',check:p=>(p.level||1)>=10,color:'#60A5FA'},
    {id:'lv50',icon:'🌟',title:'Efsanevi',desc:'Seviye 50',check:p=>(p.level||1)>=50,color:'#A78BFA'},
    {id:'politician',icon:'🏛️',title:'Siyasetçi',desc:'Bir partiye katıl',check:p=>{const part=parties.find(pt=>(pt.members||[]).includes(p.username));return !!part;},color:'#F59E0B'},
    {id:'gangster',icon:'🔫',title:'Sokak Köpeği',desc:'Bir çeteye katıl',check:p=>{const g=gangs.find(g=>(g.members||[]).includes(p.username));return !!g;},color:'#EF4444'},
    {id:'merit100',icon:'🏅',title:'Kahraman',desc:'100 liyakat puanı',check:p=>(p.meritPoints||0)>=100,color:'#F59E0B'},
    {id:'merit1000',icon:'🏆',title:'Milli Kahraman',desc:'1000 liyakat puanı',check:p=>(p.meritPoints||0)>=1000,color:'#FFD700'},
    {id:'vip',icon:'👑',title:'VIP Üye',desc:'VIP ol',check:p=>p.vip||p.premium,color:'#A78BFA'},
    {id:'factory_owner',icon:'🏭',title:'Sanayici',desc:'Fabrika kur',check:p=>factories.some(f=>f.owner===p.username),color:'#F59E0B'},
    {id:'uc1000',icon:'💎',title:'UC Koleksiyoncusu',desc:'1000 PoliGold',check:p=>(p.underCoin||0)>=1000,color:'#7DD3FC'},
    {id:'admin',icon:'⚙️',title:'Oyun Yöneticisi',desc:'Admin ol',check:p=>p.role==='admin'||p.isAdmin,color:'#EF4444'},
    {id:'hp_full',icon:'❤️',title:'Sağlıklı Yaşam',desc:'Canı %100 olsun',check:p=>(p.hp||100)>=100,color:'#10B981'},
    {id:'pvp10',icon:'⚔️',title:'Savaşçı',desc:'10 PvP savaşı',check:p=>{const b=(() => { try { return JSON.parse(localStorage.getItem('rep_pvpBattles')||'[]'); } catch{return [];} })(); return b.filter(x=>x.attacker===p.username).length>=10;},color:'#EF4444'},
    {id:'spy5',icon:'🕵️',title:'Ajan',desc:'5 başarılı operasyon',check:p=>{const ops=(() => { try { return JSON.parse(localStorage.getItem('rep_spyOps')||'[]'); } catch{return [];} })(); return ops.filter(o=>o.result==='success').length>=5;},color:'#A78BFA'},
    {id:'social10',icon:'📱',title:'Influencer',desc:'10 gönderi paylaş',check:p=>{const posts=(() => { try { return JSON.parse(localStorage.getItem('rep_socialPosts')||'[]'); } catch{return [];} })(); return posts.filter(x=>x.author===p.username).length>=10;},color:'#EC4899'},
  ];

  const earned = ACHIEVEMENTS.filter(a => { try { return a.check(cu); } catch{return false;} });
  const notEarned = ACHIEVEMENTS.filter(a => { try { return !a.check(cu); } catch{return true;} });

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#FFD700',marginBottom:'0.5rem'}}>🏆 Başarılar</div>
      <div style={{fontSize:'0.82rem',color:'#999',marginBottom:'1rem',background:'rgba(255,215,0,0.07)',borderRadius:'8px',padding:'0.5rem 0.75rem',border:'1px solid rgba(255,215,0,0.2)'}}>
        {earned.length}/{ACHIEVEMENTS.length} başarı kazanıldı · %{Math.round(earned.length/ACHIEVEMENTS.length*100)} tamamlandı
      </div>
      {earned.length>0&&<div style={{marginBottom:'1rem'}}>
        <div style={{fontWeight:700,color:'#FFD700',fontSize:'0.85rem',marginBottom:'0.5rem'}}>✅ Kazanılan Başarılar ({earned.length})</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
          {earned.map(a=>(
            <div key={a.id} style={{background:`rgba(255,215,0,0.06)`,border:`1px solid ${a.color}44`,borderRadius:'10px',padding:'0.75rem',display:'flex',gap:'0.5rem',alignItems:'center'}}>
              <span style={{fontSize:'1.5rem'}}>{a.icon}</span>
              <div><div style={{fontWeight:700,fontSize:'0.8rem',color:a.color}}>{a.title}</div><div style={{fontSize:'0.65rem',color:'#999'}}>{a.desc}</div></div>
            </div>
          ))}
        </div>
      </div>}
      <div>
        <div style={{fontWeight:700,color:'#666',fontSize:'0.85rem',marginBottom:'0.5rem'}}>🔒 Kilitli Başarılar ({notEarned.length})</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
          {notEarned.map(a=>(
            <div key={a.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'0.75rem',display:'flex',gap:'0.5rem',alignItems:'center',opacity:0.55}}>
              <span style={{fontSize:'1.5rem',filter:'grayscale(1)'}}>{a.icon}</span>
              <div><div style={{fontWeight:700,fontSize:'0.8rem',color:'#aaa'}}>{a.title}</div><div style={{fontSize:'0.65rem',color:'#666'}}>{a.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// KRİZ YÖNETİMİ SAYFASI
// ═══════════════════════════════════════════════════════
function CrisisPage({ profile, setProfile, showNotif }) {
  const [crises, setCrises] = useLs('activeCrises', []);
  const [crisisLog, setCrisisLog] = useLs('crisisLog', []);
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const uid = cu.uid || cu.id;
  const now = Date.now();

  const CRISIS_TEMPLATES = [
    {id:'earthquake',name:'Deprem',icon:'🌍',desc:'Büyük bir deprem şehri vurdu! Altyapı ciddi hasar gördü.',severity:'Kritik',color:'#EF4444',poolTarget:500000,duration:12*3600000},
    {id:'economic',name:'Ekonomik Kriz',icon:'📉',desc:'Piyasalar çöküyor, enflasyon tırmanıyor.',severity:'Yüksek',color:'#F59E0B',poolTarget:300000,duration:8*3600000},
    {id:'pandemic',name:'Salgın Hastalık',icon:'🦠',desc:'Tehlikeli bir salgın hızla yayılıyor.',severity:'Kritik',color:'#A78BFA',poolTarget:750000,duration:24*3600000},
    {id:'political',name:'Siyasi Kriz',icon:'🏛️',desc:'Hükümet krizi derinleşiyor, meclis kilitlendi.',severity:'Orta',color:'#60A5FA',poolTarget:200000,duration:6*3600000},
    {id:'war',name:'Savaş Tehdidi',icon:'⚔️',desc:'Sınırda gerilim tırmanıyor, ordu alarma geçti.',severity:'Yüksek',color:'#DC2626',poolTarget:1000000,duration:18*3600000},
    {id:'flood',name:'Sel Felaketi',icon:'🌊',desc:'Şiddetli yağışlar sel baskınına neden oldu.',severity:'Yüksek',color:'#3B82F6',poolTarget:400000,duration:10*3600000},
  ];

  useEffect(() => {
    const lastGen = parseInt(localStorage.getItem('rep_lastCrisisGen')||'0');
    const GEN_INTERVAL = 2*3600000;
    const nowTs = Date.now();
    if (nowTs - lastGen > GEN_INTERVAL) {
      const active = crises.filter(c => c.active && (nowTs-c.startTime)<c.duration);
      if (active.length < 2) {
        const tmpl = CRISIS_TEMPLATES[Math.floor(Math.random()*CRISIS_TEMPLATES.length)];
        const crisis = {
          id:genId(), type:tmpl.id, name:tmpl.name, icon:tmpl.icon, desc:tmpl.desc,
          severity:tmpl.severity, color:tmpl.color, startTime:nowTs, duration:tmpl.duration,
          poolTarget:tmpl.poolTarget, poolCurrent:0, contributions:{}, active:true,
        };
        setCrises(prev => [crisis,...prev.filter(c=>c.active&&(nowTs-c.startTime)<c.duration)].slice(0,5));
        setCrisisLog(prev => [{id:genId(),icon:crisis.icon,text:`🚨 Otomatik uyarı: ${crisis.name} krizi başladı!`,time:new Date().toLocaleTimeString('tr-TR')},...prev].slice(0,50));
        localStorage.setItem('rep_lastCrisisGen', String(nowTs));
      }
    }
  }, []);

  const contribute = (crisisId, amount) => {
    if (!amount||amount<=0) return;
    if ((cu.money||0)<amount) { showNotif('❌ Yetersiz bakiye!','error'); return; }
    let resolved = false;
    setCrises(prev => prev.map(c => {
      if (c.id!==crisisId) return c;
      const newPool = (c.poolCurrent||0)+amount;
      resolved = newPool >= c.poolTarget;
      return {...c, poolCurrent:newPool, contributions:{...(c.contributions||{}),[uid]:((c.contributions||{})[uid]||0)+amount}, active:!resolved, resolvedAt:resolved?Date.now():undefined};
    }));
    const xpGain = Math.floor(amount/1000);
    const meritGain = Math.floor(amount/10000);
    setProfile(pr => { const np={...pr,money:(pr.money||0)-amount,xp:(pr.xp||0)+xpGain,meritPoints:(pr.meritPoints||0)+meritGain}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    const crisis = crises.find(c=>c.id===crisisId);
    if (crisis && (crisis.poolCurrent||0)+amount >= crisis.poolTarget) {
      setCrisisLog(prev => [{id:genId(),icon:'✅',text:`${crisis.name} krizi havuz doldurularak çözüldü!`,time:new Date().toLocaleTimeString('tr-TR')},...prev].slice(0,50));
      showNotif(`✅ ${crisis.name} krizi çözüldü! Katkın için teşekkürler. +${xpGain} XP`,'success');
    } else {
      showNotif(`💪 Havuza ${fmtWord(amount)} katkı! +${xpGain} XP +${meritGain}🏅`,'success');
    }
  };

  const activeCrises = crises.filter(c => c.active && (now-c.startTime)<c.duration);

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#EF4444',marginBottom:'0.3rem'}}>🚨 Kriz Merkezi</div>
      <div style={{fontSize:'0.78rem',color:'#5A7089',marginBottom:'1rem'}}>Krizler sistem tarafından otomatik oluşturulur. Havuza para katkısı yaparak çöz, XP ve Puan kazan!</div>

      {activeCrises.length===0 && (
        <Card style={{textAlign:'center',padding:'2rem',marginBottom:'1rem'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>✅</div>
          <div style={{fontWeight:700,color:'#10B981',marginBottom:'0.3rem'}}>Şu an aktif kriz yok</div>
          <div style={{fontSize:'0.78rem',color:'#5A7089'}}>Sistem her 2 saatte bir kriz üretebilir</div>
        </Card>
      )}

      {activeCrises.map(c=>{
        const pct = Math.min(100,Math.round((c.poolCurrent||0)/c.poolTarget*100));
        const timeLeft = Math.ceil(Math.max(0,c.duration-(now-c.startTime))/3600000);
        const myContrib = (c.contributions||{})[uid]||0;
        const remaining = c.poolTarget-(c.poolCurrent||0);
        return (
          <div key={c.id} style={{background:'rgba(239,68,68,0.05)',border:`1px solid ${c.color||'#EF4444'}44`,borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.6rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                <span style={{fontSize:'2rem'}}>{c.icon}</span>
                <div>
                  <div style={{fontWeight:800,color:c.color||'#EF4444',fontSize:'0.95rem'}}>{c.name}</div>
                  <div style={{fontSize:'0.7rem',color:'#5A7089',maxWidth:'180px'}}>{c.desc}</div>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:'0.72rem',color:'#F59E0B',fontWeight:700}}>⏰ {timeLeft}sa</div>
                <Tag color='red'>{c.severity}</Tag>
              </div>
            </div>
            <div style={{marginBottom:'0.65rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'#5A7089',marginBottom:'4px'}}>
                <span style={{color:'#10B981',fontWeight:700}}>💰 Havuz: {fmtWord(c.poolCurrent||0)}</span>
                <span>Hedef: {fmtWord(c.poolTarget)}</span>
              </div>
              <div style={{height:'8px',background:'rgba(255,255,255,0.06)',borderRadius:'100px',overflow:'hidden',marginBottom:'4px'}}>
                <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,#10B981,${c.color||'#EF4444'})`,borderRadius:'100px',transition:'width 0.5s'}} />
              </div>
              <div style={{fontSize:'0.62rem',color:'#3B4E63'}}>{pct}% tamamlandı • {fmtWord(remaining)} daha gerekli</div>
              {myContrib>0&&<div style={{fontSize:'0.65rem',color:'#10B981',marginTop:'2px'}}>✅ Senin katkın: {fmtWord(myContrib)}</div>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.35rem',marginBottom:'0.35rem'}}>
              {[10000,25000,50000,100000].map(amt=>{
                const can=(cu.money||0)>=amt;
                return (
                  <button key={amt} onClick={()=>can&&contribute(c.id,amt)} disabled={!can}
                    style={{padding:'0.45rem 0.2rem',borderRadius:'8px',border:`1px solid ${can?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.06)'}`,background:can?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.02)',color:can?'#10B981':'#3B4E63',cursor:can?'pointer':'not-allowed',fontWeight:700,fontSize:'0.65rem',fontFamily:"'DM Sans',sans-serif"}}>
                    {fmtWord(amt)}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:'0.62rem',color:'#3B4E63'}}>Katkı yap → XP + Puan kazan • Kriz çözülünce katkıcılar ödüllenir</div>
          </div>
        );
      })}

      {crisisLog.length>0 && (
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem'}}>
          <div style={{fontWeight:700,color:'#5A7089',marginBottom:'0.5rem',fontSize:'0.85rem'}}>📋 Kriz Kayıtları</div>
          {crisisLog.slice(0,10).map((c,i)=>(
            <div key={i} style={{display:'flex',gap:'0.5rem',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{fontSize:'1rem',flexShrink:0}}>{c.icon}</span>
              <div style={{flex:1,fontSize:'0.75rem',color:'#8BA0B5'}}>{c.text}</div>
              <div style={{fontSize:'0.62rem',color:'#3B4E63',flexShrink:0}}>{c.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GELİŞMİŞ KUMARhane SAYFASI (Blackjack + Poker ekli)
// ═══════════════════════════════════════════════════════
function CasinoPage({ profile, setProfile, showNotif }) {
  const [tab, setTab] = useState('wheel');
  const [bjState, setBjState] = useState(null);
  const [pokerState, setPokerState] = useState(null);
  const [betAmt, setBetAmt] = useState(10000);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [dailySpin, setDailySpin] = useLs('dailySpin2', {});
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};
  const now = Date.now();
  const updateUser = (upd) => {
    const next = {...cu,...upd};
    setProfile(next);
    localStorage.setItem('rep_userProfile', JSON.stringify(next));
    try { const u2 = JSON.parse(localStorage.getItem('rep_users')||'[]'); localStorage.setItem('rep_users', JSON.stringify(u2.map(u => u.id===next.id ? next : u))); } catch{}
  };

  // Card deck utilities
  const SUITS = ['♠️','♥️','♦️','♣️'];
  const RANKS_BJ = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const newDeck = () => {
    const deck = [];
    for(const s of SUITS) for(const r of RANKS_BJ) deck.push({suit:s,rank:r});
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    return deck;
  };
  const cardVal = (rank) => {
    if(['J','Q','K'].includes(rank)) return 10;
    if(rank==='A') return 11;
    return parseInt(rank);
  };
  const handVal = (hand) => {
    let v=hand.reduce((s,c)=>s+cardVal(c.rank),0);
    let aces=hand.filter(c=>c.rank==='A').length;
    while(v>21&&aces>0){v-=10;aces--;}
    return v;
  };

  const startBlackjack = () => {
    if(betAmt<1000){showNotif('❌ Minimum bahis: ₱1,000!','error');return;}
    if((cu.money||0)<betAmt){showNotif('❌ Yetersiz bakiye!','error');return;}
    const deck=newDeck();
    const playerH=[deck.pop(),deck.pop()];
    const dealerH=[deck.pop(),deck.pop()];
    updateUser({money:(cu.money||0)-betAmt});
    setBjState({deck,playerHand:playerH,dealerHand:dealerH,bet:betAmt,phase:'playing'});
  };

  const bjHit = () => {
    if(!bjState||bjState.phase!=='playing') return;
    const deck=[...bjState.deck];
    const playerHand=[...bjState.playerHand,deck.pop()];
    const pv=handVal(playerHand);
    if(pv>21) setBjState(prev=>({...prev,deck,playerHand,phase:'bust'}));
    else setBjState(prev=>({...prev,deck,playerHand}));
  };

  const bjStand = () => {
    if(!bjState||bjState.phase!=='playing') return;
    let {deck,dealerHand,bet}=bjState;
    deck=[...deck]; dealerHand=[...dealerHand];
    while(handVal(dealerHand)<17) dealerHand.push(deck.pop());
    const pv=handVal(bjState.playerHand), dv=handVal(dealerHand);
    let result,payout=0;
    if(pv>21){result='bust';}
    else if(dv>21||pv>dv){result='win';payout=bet*2;}
    else if(pv===dv){result='push';payout=bet;}
    else{result='lose';}
    if(payout>0) updateUser({money:(cu.money||0)+payout});
    setBjState(prev=>({...prev,deck,dealerHand,phase:result}));
    const msgs={win:`🃏 Kazandın! +₱${payout.toLocaleString()}`,lose:'💔 Kaybettin!',push:`🤝 Beraberlik! Bahis iade.`,bust:'💥 Battı! 21\'i geçtin!'};
    showNotif(msgs[result]||'',result==='win'?'success':'error');
  };

  const startPoker = () => {
    if(betAmt<5000){showNotif('❌ Minimum poker bahsi: ₱5,000!','error');return;}
    if((cu.money||0)<betAmt){showNotif('❌ Yetersiz bakiye!','error');return;}
    const deck=newDeck();
    const hand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
    updateUser({money:(cu.money||0)-betAmt});
    setPokerState({hand,held:new Array(5).fill(false),deck,bet:betAmt,phase:'hold'});
  };

  const pokerHold = (i) => {
    if(!pokerState||pokerState.phase!=='hold') return;
    setPokerState(prev=>({...prev,held:prev.held.map((h,idx)=>idx===i?!h:h)}));
  };

  const pokerDraw = () => {
    if(!pokerState) return;
    let {hand,held,deck,bet}=pokerState;
    deck=[...deck]; hand=[...hand];
    for(let i=0;i<5;i++) if(!held[i]) hand[i]=deck.pop();
    const rank=evalPokerHand(hand);
    const payouts={royalFlush:800,straightFlush:50,fourOfAKind:25,fullHouse:9,flush:6,straight:4,threeOfAKind:3,twoPair:2,jacksOrBetter:1};
    const mult=payouts[rank]||0;
    const win=mult*bet;
    if(win>0) updateUser({money:(cu.money||0)+win});
    setPokerState(prev=>({...prev,hand,phase:'result',result:rank,win}));
    showNotif(win>0?`✅ ${rank}! +₱${win.toLocaleString()}`:'💔 Kazanmadın!',win>0?'success':'error');
  };

  const evalPokerHand = (hand) => {
    const vals=hand.map(c=>cardVal(c.rank)).sort((a,b)=>a-b);
    const suits=hand.map(c=>c.suit);
    const isFlush=new Set(suits).size===1;
    const isStraight=vals[4]-vals[0]===4&&new Set(vals).size===5;
    const counts={};
    vals.forEach(v=>counts[v]=(counts[v]||0)+1);
    const groups=Object.values(counts).sort((a,b)=>b-a);
    if(isFlush&&isStraight&&vals[0]===10) return 'royalFlush';
    if(isFlush&&isStraight) return 'straightFlush';
    if(groups[0]===4) return 'fourOfAKind';
    if(groups[0]===3&&groups[1]===2) return 'fullHouse';
    if(isFlush) return 'flush';
    if(isStraight) return 'straight';
    if(groups[0]===3) return 'threeOfAKind';
    if(groups[0]===2&&groups[1]===2) return 'twoPair';
    if(groups[0]===2&&vals.some(v=>v>=11)) return 'jacksOrBetter';
    return 'nothing';
  };

  const SPIN_PRIZES=[
    {label:'₱10,000',icon:'💵',type:'money',value:10000,color:'#10B981',weight:25},
    {label:'₱50,000',icon:'💰',type:'money',value:50000,color:'#10B981',weight:12},
    {label:'₱200,000',icon:'💎',type:'money',value:200000,color:'#10B981',weight:4},
    {label:'20 PG',icon:'🪙',type:'uc',value:20,color:'#FFB800',weight:20},
    {label:'100 PG',icon:'💎',type:'uc',value:100,color:'#A78BFA',weight:5},
    {label:'+10 HP',icon:'❤️',type:'hp',value:10,color:'#EF4444',weight:18},
    {label:'+10🏅',icon:'🏅',type:'merit',value:10,color:'#F59E0B',weight:10},
    {label:'JACKPOT!',icon:'👑',type:'money',value:1000000,color:'#FFD700',weight:1},
    {label:'Kaybettin',icon:'💔',type:'none',value:0,color:'#555',weight:15},
  ];
  const totalW=SPIN_PRIZES.reduce((s,p)=>s+p.weight,0);
  const spinData=dailySpin[cu.id]||{lastSpin:0,streak:0};
  const canSpin=(now-spinData.lastSpin)>=24*3600000;
  const nextMs=Math.max(0,24*3600000-(now-spinData.lastSpin));

  const doSpin=()=>{
    if(!canSpin||isSpinning) return;
    setIsSpinning(true);
    setTimeout(()=>{
      let r=Math.random()*totalW, prize=SPIN_PRIZES[SPIN_PRIZES.length-1];
      for(const p of SPIN_PRIZES){r-=p.weight;if(r<=0){prize=p;break;}}
      if(prize.type==='money') updateUser({money:(cu.money||0)+prize.value});
      else if(prize.type==='uc') updateUser({underCoin:(cu.underCoin||0)+prize.value});
      else if(prize.type==='merit') updateUser({meritPoints:(cu.meritPoints||0)+prize.value});
      else if(prize.type==='hp') updateUser({hp:Math.min(100,(cu.hp||100)+prize.value)});
      const newStreak=prize.type==='none'?0:(spinData.streak||0)+1;
      setDailySpin(prev=>({...prev,[cu.id]:{lastSpin:now,streak:newStreak}}));
      setSpinResult(prize);
      setIsSpinning(false);
      showNotif(prize.type!=='none'?`🎡 ${prize.label} kazandın!`:'💔 Bu sefer olmadı!',prize.type!=='none'?'success':'error');
    },1800);
  };

  const playSlots=()=>{
    if((cu.money||0)<1000){showNotif('❌ Min ₱1,000!','error');return;}
    const bet=Math.max(1000,Math.min(betAmt,cu.money||0));
    const SYMS=['🍒','🍋','🍊','⭐','💎','7️⃣'];
    const s=[SYMS[Math.floor(Math.random()*SYMS.length)],SYMS[Math.floor(Math.random()*SYMS.length)],SYMS[Math.floor(Math.random()*SYMS.length)]];
    let mult=0;
    if(s[0]===s[1]&&s[1]===s[2]){mult=s[0]==='7️⃣'?10:s[0]==='💎'?7:3;}
    else if(s[0]===s[1]||s[1]===s[2]||s[0]===s[2]) mult=1.5;
    const win=Math.floor(bet*mult);
    updateUser({money:(cu.money||0)-bet+win});
    if(win>0) showNotif(`${s.join('')} KAZANDI! +₱${(win-bet).toLocaleString()}`,'success');
    else showNotif(`${s.join('')} Kaybettin! -₱${bet.toLocaleString()}`,'error');
  };

  const playCoinFlip=()=>{
    if((cu.money||0)<500){showNotif('❌ Min ₱500!','error');return;}
    const bet=Math.max(500,Math.min(betAmt,cu.money||0));
    const won=Math.random()<0.5;
    updateUser({money:(cu.money||0)+(won?bet:-bet)});
    showNotif(won?`🪙 YAZΙ! +₱${bet.toLocaleString()}`:`🪙 TURA! -₱${bet.toLocaleString()}`,won?'success':'error');
  };

  const renderCard=(c,hidden=false)=>(
    <div style={{width:45,height:65,borderRadius:6,background:hidden?'#1a3a6e':'#fff',border:'1px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:hidden?'1.2rem':'0.8rem',fontWeight:700,color:['♥️','♦️'].includes(c?.suit)?'#EF4444':'#1a1a1a',boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
      {hidden?'🂠':`${c.rank}${c.suit}`}
    </div>
  );

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#FFD700',marginBottom:'1rem'}}>🎰 Kumarhane</div>
      <div style={{display:'flex',gap:'0.35rem',marginBottom:'1rem',overflowX:'auto',paddingBottom:'0.2rem'}}>
        {[{k:'wheel',l:'🎡 Çark'},{k:'blackjack',l:'🃏 Blackjack'},{k:'poker',l:'♠️ Poker'},{k:'slots',l:'🎰 Slot'},{k:'coinflip',l:'🪙 Yazı-Tura'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{flexShrink:0,padding:'0.4rem 0.85rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#FFD700':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(255,215,0,0.12)':'transparent',color:tab===t.k?'#FFD700':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.82rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>
      <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'8px',padding:'0.5rem 0.75rem',fontSize:'0.75rem',color:'#999',marginBottom:'1rem'}}>⚠️ Tüm şans oyunlarında kazanç veya kayıp tamamen rastgeledir. Sorumlu oynayın!</div>

      {tab==='wheel'&&<div style={{maxWidth:400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'1rem'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:700,color:'#FFD700'}}>🎡 Günlük Çark</div>
          <div style={{fontSize:'0.78rem',color:'#999'}}>Günde bir kez ücretsiz çevirme</div>
          {spinData.streak>0&&<div style={{fontSize:'0.72rem',color:'#F59E0B',marginTop:'0.15rem'}}>🔥 {spinData.streak} gün streak!</div>}
        </div>
        {spinResult&&<div style={{textAlign:'center',padding:'0.75rem',background:`rgba(255,255,255,0.05)`,borderRadius:'12px',border:`1px solid ${spinResult.color}44`,marginBottom:'1rem'}}>
          <div style={{fontSize:'2rem'}}>{spinResult.icon}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:700,color:spinResult.color}}>{spinResult.label}</div>
        </div>}
        {canSpin?<button onClick={doSpin} style={{width:'100%',padding:'0.8rem',background:isSpinning?'rgba(255,215,0,0.05)':'linear-gradient(135deg,#B45309,#FFD700)',border:'none',borderRadius:'10px',color:isSpinning?'#FFD700':'#000',fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700,cursor:isSpinning?'not-allowed':'pointer',opacity:isSpinning?0.6:1}}>{isSpinning?'🎡 Dönüyor...':'🎡 ÇARK ÇEVİR!'}</button>
        :<div style={{textAlign:'center',padding:'0.75rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px'}}>
          <div style={{color:'#F59E0B',fontWeight:700}}>⏳ Sonraki çevirme</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:'1.1rem',color:'#FFB800',marginTop:4}}>{Math.floor(nextMs/3600000)}s {Math.floor((nextMs%3600000)/60000)}dk</div>
        </div>}
        <div style={{marginTop:'1rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.3rem'}}>
          {SPIN_PRIZES.filter(p=>p.type!=='none').map((p,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:'0.35rem',padding:'0.3rem 0.5rem',background:'rgba(255,255,255,0.03)',borderRadius:'6px',border:`1px solid ${p.color}22`}}>
              <span style={{fontSize:'0.9rem'}}>{p.icon}</span>
              <span style={{fontSize:'0.72rem',color:p.color,fontWeight:700}}>{p.label}</span>
              <span style={{fontSize:'0.6rem',color:'#444',marginLeft:'auto'}}>%{((p.weight/totalW)*100).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>}

      {tab==='blackjack'&&<div style={{maxWidth:400,margin:'0 auto'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700,color:'#10B981',marginBottom:'0.75rem',textAlign:'center'}}>🃏 Blackjack</div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.75rem',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'0.82rem',color:'#999'}}>Bahis:</span>
          <input type="number" value={betAmt} onChange={e=>setBetAmt(Math.max(1000,parseInt(e.target.value)||1000))} style={{flex:1,padding:'0.4rem 0.5rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'6px',color:'#E8EDF2',fontSize:'0.9rem',outline:'none',fontFamily:'inherit'}} />
          <span style={{fontSize:'0.78rem',color:'#999'}}>Bak: ₱{((cu.money||0)/1000).toFixed(0)}K</span>
        </div>
        {!bjState&&<button onClick={startBlackjack} style={{width:'100%',padding:'0.7rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:'10px',color:'#10B981',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'1rem'}}>🃏 Oyunu Başlat</button>}
        {bjState&&<div>
          <div style={{marginBottom:'0.75rem'}}>
            <div style={{fontSize:'0.72rem',color:'#999',marginBottom:'0.3rem'}}>KUMARHANE ({bjState.phase==='playing'?'?':handVal(bjState.dealerHand)})</div>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {bjState.dealerHand.map((c,i)=>renderCard(c,i===1&&bjState.phase==='playing'))}
            </div>
          </div>
          <div style={{marginBottom:'0.75rem'}}>
            <div style={{fontSize:'0.72rem',color:'#999',marginBottom:'0.3rem'}}>SEN ({handVal(bjState.playerHand)})</div>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {bjState.playerHand.map((c,i)=><div key={i}>{renderCard(c)}</div>)}
            </div>
          </div>
          {bjState.phase==='playing'&&<div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={bjHit} style={{flex:1,padding:'0.6rem',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'8px',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>🃏 Kart Al</button>
            <button onClick={bjStand} style={{flex:1,padding:'0.6rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>✋ Dur</button>
          </div>}
          {bjState.phase!=='playing'&&<div>
            <div style={{textAlign:'center',padding:'0.75rem',background:bjState.phase==='win'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${bjState.phase==='win'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,borderRadius:'10px',marginBottom:'0.5rem'}}>
              <div style={{fontSize:'1.5rem',marginBottom:'0.25rem'}}>{bjState.phase==='win'?'🏆':bjState.phase==='push'?'🤝':'💔'}</div>
              <div style={{fontWeight:700,color:bjState.phase==='win'?'#10B981':bjState.phase==='push'?'#F59E0B':'#EF4444'}}>{bjState.phase==='win'?`Kazandın! +₱${(bjState.bet).toLocaleString()}`:bjState.phase==='push'?'Beraberlik!':bjState.phase==='bust'?'Battı!':'Kaybettin!'}</div>
            </div>
            <button onClick={()=>setBjState(null)} style={{width:'100%',padding:'0.6rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'8px',color:'#aaa',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>🔄 Tekrar Oyna</button>
          </div>}
        </div>}
        <div style={{marginTop:'0.75rem',background:'rgba(255,255,255,0.02)',borderRadius:'8px',padding:'0.5rem',fontSize:'0.72rem',color:'#666'}}>
          🎴 Kural: 21'e en yakın ol. A=11/1, J/Q/K=10. 21=Blackjack (2.5x)!
        </div>
      </div>}

      {tab==='poker'&&<div style={{maxWidth:400,margin:'0 auto'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700,color:'#A78BFA',marginBottom:'0.75rem',textAlign:'center'}}>♠️ Video Poker (Jacks or Better)</div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.75rem',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'0.82rem',color:'#999'}}>Bahis:</span>
          <input type="number" value={betAmt} onChange={e=>setBetAmt(Math.max(5000,parseInt(e.target.value)||5000))} style={{flex:1,padding:'0.4rem 0.5rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'6px',color:'#E8EDF2',fontSize:'0.9rem',outline:'none',fontFamily:'inherit'}} />
        </div>
        {!pokerState&&<div>
          <button onClick={startPoker} style={{width:'100%',padding:'0.7rem',background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'10px',color:'#A78BFA',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'1rem'}}>♠️ Poker Başlat</button>
          <div style={{marginTop:'0.75rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.3rem'}}>
            {[{h:'Royal Flush',p:'800x'},{h:'Straight Flush',p:'50x'},{h:'Four of a Kind',p:'25x'},{h:'Full House',p:'9x'},{h:'Flush',p:'6x'},{h:'Straight',p:'4x'},{h:'Three of a Kind',p:'3x'},{h:'Two Pair',p:'2x'},{h:'Jacks or Better',p:'1x'}].map(r=>(
              <div key={r.h} style={{display:'flex',justifyContent:'space-between',padding:'0.25rem 0.5rem',background:'rgba(255,255,255,0.03)',borderRadius:'5px',fontSize:'0.72rem'}}>
                <span style={{color:'#aaa'}}>{r.h}</span><span style={{color:'#FFD700',fontWeight:700}}>{r.p}</span>
              </div>
            ))}
          </div>
        </div>}
        {pokerState&&<div>
          <div style={{display:'flex',gap:'0.4rem',justifyContent:'center',marginBottom:'0.75rem'}}>
            {pokerState.hand.map((c,i)=>(
              <div key={i} onClick={()=>pokerState.phase==='hold'&&pokerHold(i)} style={{cursor:pokerState.phase==='hold'?'pointer':'default'}}>
                <div style={{width:50,height:70,borderRadius:7,background:pokerState.held[i]?'#1a3a6e':'#fff',border:`2px solid ${pokerState.held[i]?'#60A5FA':'rgba(255,255,255,0.2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:['♥️','♦️'].includes(c.suit)?'#EF4444':'#1a1a1a',boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
                  {c.rank}{c.suit}
                </div>
                {pokerState.phase==='hold'&&<div style={{textAlign:'center',fontSize:'0.65rem',color:pokerState.held[i]?'#60A5FA':'#555',marginTop:'0.15rem',fontWeight:700}}>{pokerState.held[i]?'TUTUL':'TUTS?'}</div>}
              </div>
            ))}
          </div>
          {pokerState.phase==='hold'&&<button onClick={pokerDraw} style={{width:'100%',padding:'0.65rem',background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.35)',borderRadius:'10px',color:'#A78BFA',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.95rem'}}>🃏 Kartları Dağıt</button>}
          {pokerState.phase==='result'&&<div>
            <div style={{textAlign:'center',padding:'0.75rem',background:pokerState.win>0?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${pokerState.win>0?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,borderRadius:'10px',marginBottom:'0.5rem'}}>
              <div style={{fontWeight:700,color:pokerState.win>0?'#10B981':'#EF4444',fontSize:'0.95rem'}}>{pokerState.result} {pokerState.win>0?`+₱${pokerState.win.toLocaleString()}`:'Kazanmadın!'}</div>
            </div>
            <button onClick={()=>setPokerState(null)} style={{width:'100%',padding:'0.6rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'8px',color:'#aaa',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>🔄 Tekrar Oyna</button>
          </div>}
        </div>}
      </div>}

      {tab==='slots'&&<div style={{maxWidth:400,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700,color:'#FFD700',marginBottom:'0.75rem'}}>🎰 Slot Makinesi</div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.75rem',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'0.82rem',color:'#999'}}>Bahis:</span>
          <input type="number" value={betAmt} onChange={e=>setBetAmt(Math.max(1000,parseInt(e.target.value)||1000))} style={{flex:1,padding:'0.4rem 0.5rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'6px',color:'#E8EDF2',fontSize:'0.9rem',outline:'none',fontFamily:'inherit'}} />
        </div>
        <div style={{fontSize:'2.5rem',background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem',letterSpacing:'0.2em'}}>🎰🎰🎰</div>
        <div style={{fontSize:'0.78rem',color:'#999',marginBottom:'0.75rem'}}>3 aynı: 3x · Jackpot (7️⃣): 10x · 2 aynı: 1.5x</div>
        <button onClick={playSlots} style={{width:'100%',padding:'0.75rem',background:'linear-gradient(135deg,#B45309,#FFD700)',border:'none',borderRadius:'10px',color:'#000',cursor:'pointer',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem'}}>🎰 ÇEVİR!</button>
      </div>}

      {tab==='coinflip'&&<div style={{maxWidth:400,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:700,color:'#F59E0B',marginBottom:'0.75rem'}}>🪙 Yazı-Tura</div>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.75rem',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'0.82rem',color:'#999'}}>Bahis:</span>
          <input type="number" value={betAmt} onChange={e=>setBetAmt(Math.max(500,parseInt(e.target.value)||500))} style={{flex:1,padding:'0.4rem 0.5rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'6px',color:'#E8EDF2',fontSize:'0.9rem',outline:'none',fontFamily:'inherit'}} />
        </div>
        <div style={{fontSize:'5rem',marginBottom:'1rem'}}>🪙</div>
        <div style={{fontSize:'0.85rem',color:'#999',marginBottom:'1rem'}}>Doğru tahmin et, 2x kazan!</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
          <button onClick={playCoinFlip} style={{padding:'0.7rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'10px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.9rem'}}>🪙 YAZΙ</button>
          <button onClick={playCoinFlip} style={{padding:'0.7rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'10px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.9rem'}}>🏦 TURA</button>
        </div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ANA UYGULAMA
// ═══════════════════════════════════════════════════════
function App() {
  const [profile, setProfile_raw] = useState(() => {
    try { const s=localStorage.getItem('rep_userProfile'); return s?JSON.parse(s):null; } catch{return null;}
  });
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('rep_userProfile'));
  const [page, setPage] = useState('home');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem('us_theme') === 'dark');
  const toggleDark = () => setDark(d => { const next=!d; localStorage.setItem('us_theme',next?'dark':'light'); return next; });
  useEffect(() => { document.body.classList.toggle('us-dark', dark); }, [dark]);
  useEffect(() => { document.body.classList.toggle('us-dark', dark); }, []);

  // Wrapper to also sync to Firebase
  const setProfile = useCallback((val) => {
    setProfile_raw(prev => {
      const newP = typeof val==='function' ? val(prev) : val;
      if (newP && newP.uid) {
        if (window._fbPendingWrites) {
          window._fbPendingWrites['userProfile'] = newP;
          window._fbScheduleFlush?.('userProfile');
        }
      }
      return newP;
    });
  }, []);

  // Firebase auth state observer
  useEffect(() => {
    if (typeof firebase !== 'undefined') {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          const stored = localStorage.getItem('rep_userProfile');
          if (stored) {
            try {
              const p = JSON.parse(stored);
              if (p.uid === user.uid) {
                setProfile_raw(p);
                setAuthed(true);
                window._startPresenceHeartbeat?.(user.uid, p.username || 'Oyuncu');
                window._setupUserListener?.(user.uid);
                window.dispatchEvent(new CustomEvent('user-logged-in', { detail:{ userId:user.uid } }));
              }
            } catch{}
          }
        } else {
          // Not logged in
          if (authed) {
            setAuthed(false);
            setProfile_raw(null);
            localStorage.removeItem('userId');
          }
        }
      });
      return () => unsubscribe?.();
    }
  }, []);

  // Sync profile from firebase events
  useEffect(() => {
    const h = (e) => {
      if (e.detail?.key === 'userProfile') {
        setProfile_raw(e.detail.value);
      }
    };
    window.addEventListener('fb-sync', h);
    return () => window.removeEventListener('fb-sync', h);
  }, []);

  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [incomingDm, setIncomingDm] = useState(null);
  const [incomingTrade, setIncomingTrade] = useState(null);

  // Socket.IO real-time event listeners
  useEffect(() => {
    if (!authed) return;
    const attach = () => {
      const s = window._socket;
      if (!s) return false;
      s.on('onlinePlayers', (list) => {
        setOnlinePlayers(list || []);
        window.dispatchEvent(new CustomEvent('fb-sync', {detail:{key:'onlineCount',value:(list||[]).length}}));
      });
      s.on('dm', (data) => {
        const myId = profile?.id || profile?.uid;
        if (data.toUserId === myId) {
          try {
            const msgs = JSON.parse(localStorage.getItem('rep_directMessages')||'[]');
            const newMsg = {id: data.ts||Date.now(), from:data.fromUserId, to:data.toUserId, fromName:data.fromUsername, text:data.text, ts:data.ts||Date.now(), read:false};
            localStorage.setItem('rep_directMessages', JSON.stringify([...msgs, newMsg]));
          } catch(e){}
          setIncomingDm(data);
          showNotif(`📬 ${data.fromUsername}: ${data.text?.slice(0,40)}`, 'info', '📬');
        }
      });
      s.on('tradeOffer', (data) => {
        setIncomingTrade(data);
        showNotif(`🤝 ${data.fromUsername} ortaklık teklif etti!`, 'info', '🤝');
      });
      s.on('partnershipOffer', (data) => {
        setIncomingTrade(data);
        showNotif(`🏢 ${data.fromUsername} şirket ortaklığı teklif etti!`, 'info', '🏢');
      });
      s.on('electionUpdate', (data) => {
        if (data.phase === 'finished' && data.winner) {
          showNotif(`🏆 Seçim bitti! ${data.winner.username} Devlet Başkanı seçildi!`, 'success', '🏆');
        } else if (data.phase === 'active') {
          showNotif(`🗳️ Seçim başladı! Oy kullanmayı unutma.`, 'info', '🗳️');
        }
      });
      s.on('marketUpdate', (data) => {
        try {
          const holdings = JSON.parse(localStorage.getItem('rep_holdings')||'[]');
          if (data.companyId && data.ownerName !== profile?.username) {
            const updated = holdings.map(h => h.id===data.companyId ? {...h, sharePrice:data.sharePrice, value:data.value||h.value} : h);
            localStorage.setItem('rep_holdings', JSON.stringify(updated));
          }
        } catch(e){}
      });
      s.on('gameAction', (data) => {
        if (data.type==='newParty') showNotif(`🏛️ ${data.username} yeni parti kurdu: ${data.payload}`, 'info', '🏛️');
        if (data.type==='newGang') showNotif(`⚔️ ${data.username} yeni çete kurdu: ${data.payload}`, 'info', '⚔️');
      });
      return true;
    };
    if (!attach()) {
      const t = setInterval(() => { if(attach()) clearInterval(t); }, 1000);
      return () => clearInterval(t);
    }
  }, [authed, profile?.id, profile?.uid]);

  const showNotif = useCallback((msg, type='info', icon='🔔') => {
    setToast({ msg, type });
    setNotifications(n => [...n.slice(-49), { msg, type, icon, ts:Date.now() }]);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [showWelcome, setShowWelcome] = useState(false);

  // ── Global push notification yardımcı ──
  window._pushNotif = (title, body, tag='understate') => {
    try {
      if(window.Notification && Notification.permission === 'granted') {
        new Notification(title, { body, tag, icon:'favicon.jpg', badge:'favicon.jpg', silent:false });
      }
    } catch(e){}
  };

  const handleLogin = (p) => {
    setProfile_raw(p);
    setAuthed(true);
    // Bildirim izni iste
    setTimeout(()=>{
      try {
        if(window.Notification && Notification.permission === 'default') {
          Notification.requestPermission().then(perm=>{
            if(perm==='granted') window._pushNotif('🎮 Politikon', 'Hoş geldin! Bildirimler açık.','welcome');
          });
        }
      } catch(e){}
    }, 3000);
    // Yeni oyuncu kontrolü
    if (!localStorage.getItem('rep_welcomeShown_' + (p.id||p.uid))) {
      localStorage.setItem('rep_welcomeShown_' + (p.id||p.uid), '1');
      setTimeout(() => setShowWelcome(true), 1200);
    }
    if (p.uid) {
      window._startPresenceHeartbeat?.(p.uid, p.username || 'Oyuncu');
      window._setupUserListener?.(p.uid);
      window.dispatchEvent(new CustomEvent('user-logged-in', { detail:{ userId:p.uid } }));
    }
    try {
      if(typeof io !== 'undefined' && !window._socket) {
        window._socket = io(window.location.origin, {reconnection:true,reconnectionAttempts:10,transports:['websocket','polling']});
        window._socket.on('connect', ()=>console.log('✓ Socket.IO bağlandı'));
        window._socket.on('onlineCount', (cnt)=>window.dispatchEvent(new CustomEvent('fb-sync',{detail:{key:'onlineCount',value:cnt}})));
      }
      if(window._socket && p.id) window._socket.emit('playerJoin', {userId:p.id||p.uid, username:p.username||'Oyuncu', level:p.level||1, city:p.city||'', gender:p.gender||'erkek', money:p.money||0, party:p.party||null, gang:p.gang||null});
    } catch(e) {}
    _hideLoading?.();
  };

  const handleLogout = async () => {
    try { await fbLogout(); } catch{}
    localStorage.removeItem('userId');
    localStorage.removeItem('rep_userProfile');
    setProfile_raw(null);
    setAuthed(false);
    setPage('home');
  };

  // Hide loading screen
  useEffect(() => {
    if (authed) {
      setTimeout(() => window._hideLoading?.(), 500);
    }
  }, [authed]);

  if (!authed) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const notifCount = notifications.filter(n => Date.now()-n.ts < 300000).length;

  const isAdmin = profile?.role === 'admin' || profile?.isAdmin === true || profile?.email === 'admin@understate.tr';
  const pageProps = { profile, setProfile, showNotif, onNavigate: setPage };
  const navItems = isAdmin
    ? [...NAV_ITEMS, { id:'admin', icon:'⚙️', label:'Admin', rgb:'239,68,68' }]
    : NAV_ITEMS;

  const themeVal = { dark, toggle: toggleDark };
  const pageBg = dark ? '#0F172A' : '#F0F2F5';

  return (
    <LangCtx.Provider value={profile?.lang||'tr'}>
    <ThemeCtx.Provider value={themeVal}>
      {/* Responsive outer wrapper — max 480px on desktop, centered */}
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'stretch',justifyContent:'center',background: dark ? '#060C18' : '#E5E7EB'}}>
        <div style={{position:'relative',width:'100%',maxWidth:'480px',display:'flex',flexDirection:'column',overflow:'hidden',background: dark ? '#0F172A' : '#F0F2F5',boxShadow:'0 0 60px rgba(0,0,0,0.3)'}}>
          <Header profile={profile} notifCount={notifCount} onNotif={()=>setNotifOpen(true)} page={page} onNavigate={setPage} />

          {/* Main scrollable content */}
          <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'calc(70px + env(safe-area-inset-bottom, 0px))',background:pageBg}}>
            {page==='home'         && <HomePage        {...pageProps} />}
            {page==='chat'         && <ChatPage        profile={profile} />}
            {page==='economy'      && <EconomyPage     {...pageProps} />}
            {page==='market'       && <StorePage       {...pageProps} />}
            {page==='politics'     && <PoliticsPage    {...pageProps} />}
            {page==='holdings'     && <HoldingsPage    {...pageProps} />}
            {page==='gang'         && <GangPage        {...pageProps} />}
            {page==='alliance'     && <AlliancePage    {...pageProps} />}
            {page==='world'        && <WorldPage       profile={profile} onNavigate={setPage} />}
            {page==='admin'        && <AdminPage       profile={profile} showNotif={showNotif} onNavigate={setPage} />}
            {page==='farm'         && <EconomyPage     {...pageProps} initialSub='farm' />}
            {page==='livestock'    && <EconomyPage     {...pageProps} initialSub='livestock' />}
            {page==='players'      && <PlayersPage     profile={profile} onNavigate={setPage} onlinePlayers={onlinePlayers} />}
            {page==='profile'      && <ProfilePage     {...pageProps} onLogout={handleLogout} />}
            {page==='premium'      && <PremiumPage     {...pageProps} />}
            {page==='football'     && <FootballPage    {...pageProps} />}
            {page==='factory'      && <FactoryPage     {...pageProps} />}
            {page==='mining'       && <MiningPage      {...pageProps} />}
            {page==='army'         && <ArmyPage        {...pageProps} />}
            {page==='spy'          && <SpyPage         {...pageProps} />}
            {page==='newspaper'    && <NewspaperPage   {...pageProps} />}
            {page==='pvp'          && <PvpPage         {...pageProps} />}
            {page==='social'       && <SocialPage      profile={profile} showNotif={showNotif} onNavigate={setPage} />}
            {page==='achievements' && <AchievementsPage profile={profile} />}
            {page==='crisis'       && <CrisisPage      {...pageProps} />}
            {page==='casino'       && <CasinoPage      {...pageProps} />}
            {page==='map'          && <TerritoryMapPage {...pageProps} />}
            {page==='wiki'         && <WikiPage            profile={profile} />}
            {page==='dm'           && <DirectMessagesPage {...pageProps} />}
            {page==='taxgov'       && <TaxMunicipalityPage {...pageProps} />}
            {page==='jobs'         && <JobsPage        {...pageProps} />}
            {page==='citybuild'    && <CityBuildPage   {...pageProps} />}
            {page==='klanchat'     && <KlanChatPage    profile={profile} />}
            {page==='npcplayers'   && <NpcPlayersPage  {...pageProps} />}
            {page==='duyurular'    && <DuyurularPage   profile={profile} />}
            {page==='leaderboard'  && <LeaderboardPage {...pageProps} />}
            {page==='education'    && <EducationPage   {...pageProps} />}
            {page==='citygov'        && <CityGovPage       {...pageProps} />}
            {page==='crime'          && <CrimePage         profile={profile} setProfile={setProfile} showNotif={showNotif} />}
            {page==='daily'          && <DailyTasksPage    {...pageProps} />}
            {page==='tournament'     && <TournamentPage    {...pageProps} />}
            {page==='yetkilerim'     && <YetkilerimPage    {...pageProps} />}
            {page==='election_events'&& <EventsPage        {...pageProps} />}
            {page==='teamwar'        && <TeamWarPage       {...pageProps} />}
          </div>

          <BottomNav page={page} onChange={setPage} items={navItems} notifMap={{ chat: notifications.filter(n=>n.type==='message'&&Date.now()-n.ts<300000).length }} />

          {toast && <Notif msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
          {notifOpen && <NotifPanel notifications={notifications} onClose={()=>setNotifOpen(false)} onClear={()=>setNotifications([])} />}
          {showWelcome && (
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
              <div style={{background:'linear-gradient(135deg,#0B1527,#0F1E38)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'20px',padding:'1.5rem 1.25rem',maxWidth:'380px',width:'100%',maxHeight:'85vh',overflowY:'auto',boxShadow:'0 25px 80px rgba(0,0,0,0.8)'}}>
                <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
                  <div style={{fontSize:'2.5rem',marginBottom:'0.4rem'}}>🏙️</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#E8EDF2'}}>Politikon'e Hoş Geldin!</div>
                  <div style={{fontSize:'0.78rem',color:'#5A7089',marginTop:'0.3rem'}}>{profile?.username||'Oyuncu'}, sana birkaç ipucu verelim 🎮</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.6rem',marginBottom:'1.25rem'}}>
                  {[
                    ['1️⃣','İlk İşini Yap','İşler sekmesinden Çöpçü veya Fırıncı ile para kazanmaya başla. Her 5 dakikada bir toplayabilirsin.'],
                    ['2️⃣','Eğitimini Tamamla','Eğitim sekmesinden okul bitir. Yüksek diploma → daha iyi işler ve siyasi haklar.'],
                    ['3️⃣','Şehrine Oy Ver','Siyaset sekmesinden devlet başkanlığı seçimlerine katıl. Oy katsayın arttıkça etkili olursun.'],
                    ['4️⃣','Parti veya Çete','Lise mezuniyeti sonrası parti kurabilir, yeterli parayla çete/aile oluşturabilirsin.'],
                    ['5️⃣','Günlük Görevleri Bitir','Görevler sekmesindeki günlük hedefleri tamamla — XP ve para kazan.'],
                    ['6️⃣','UC Kazan','Ekonomi → Dönüşüm sayfasından PoliGold edinebilir, oy katsayısını artırabilirsin.'],
                  ].map(([num,title,desc])=>(
                    <div key={num} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'0.65rem 0.8rem',display:'flex',gap:'0.65rem',alignItems:'flex-start'}}>
                      <span style={{fontSize:'1.1rem',flexShrink:0}}>{num}</span>
                      <div>
                        <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.82rem',marginBottom:'0.15rem'}}>{title}</div>
                        <div style={{fontSize:'0.72rem',color:'#5A7089',lineHeight:1.45}}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.6rem 0.8rem',marginBottom:'1rem',fontSize:'0.72rem',color:'#F59E0B',lineHeight:1.4}}>
                  💡 İpucu: Sağ üstteki destek butonuyla bize mesaj atabilirsin. Sorularını yanıtlıyoruz!
                </div>
                <button onClick={()=>setShowWelcome(false)} style={{width:'100%',padding:'0.85rem',borderRadius:'14px',border:'none',background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:'0.92rem',cursor:'pointer'}}>
                  🚀 Oyuna Başla!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeCtx.Provider>
    </LangCtx.Provider>
  );
}

// ═══════════════════════════════════════════════════════
// İŞLER SAYFASI
// ═══════════════════════════════════════════════════════
const JOBS_LIST = [
  { id:'collector',  emoji:'🗑️', svgIcon:'job-trash',     name:'Çöpçü',              earn:525,    cd:5*60*1000,    minLevel:1, desc:'Her 5 dakikada bir' },
  { id:'baker',      emoji:'🥖', svgIcon:'job-chef',      name:'Fırıncı',             earn:840,    cd:5*60*1000,    minLevel:1, desc:'Her 5 dakikada bir' },
  { id:'porter',     emoji:'💪', svgIcon:'job-porter',    name:'Hamal',               earn:1575,   cd:10*60*1000,   minLevel:1, desc:'Her 10 dakikada bir' },
  { id:'warehouse',  emoji:'📦', svgIcon:'job-warehouse', name:'Depo Görevlisi',      earn:4200,   cd:30*60*1000,   minLevel:2, req:'C Sınıfı Ehliyet', desc:'Her 30 dakikada bir' },
  { id:'tailor',     emoji:'🧵',                          name:'Terzi',               earn:8400,   cd:60*60*1000,   minLevel:3, desc:'Her 60 dakikada bir' },
  { id:'lumberjack', emoji:'🪓',                          name:'Oduncu',              earn:12600,  cd:120*60*1000,  minLevel:3, desc:'Her 2 saatte bir' },
  { id:'guard',      emoji:'💂',                          name:'Güvenlik Görevlisi',  earn:21000,  cd:240*60*1000,  minLevel:5, desc:'Her 4 saatte bir' },
  { id:'nurse',      emoji:'👩‍⚕️',                         name:'Hemşire',            earn:35000,  cd:480*60*1000,  minLevel:8, req:'Lise', desc:'Her 8 saatte bir' },
  { id:'officer',    emoji:'👮',                          name:'Polis Memuru',        earn:55000,  cd:720*60*1000,  minLevel:10, req:'Lise', desc:'Her 12 saatte bir' },
  { id:'teacher',    emoji:'👨‍🏫',                         name:'Öğretmen',           earn:80000,  cd:1440*60*1000, minLevel:15, req:'Üniversite', desc:'Her 24 saatte bir' },
  { id:'engineer',   emoji:'⚙️', svgIcon:'job-engineer', name:'Mühendis',           earn:150000, cd:1440*60*1000, minLevel:20, req:'Üniversite', desc:'Her 24 saatte bir' },
  { id:'doctor',     emoji:'🩺', svgIcon:'job-doctor',   name:'Doktor',              earn:350000, cd:1440*60*1000, minLevel:30, req:'Doktora', desc:'Her 24 saatte bir' },
];

function JobsPage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [cooldowns, setCooldowns] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jobCooldowns') || '{}'); } catch { return {}; }
  });
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(p=>p+1), 1000); return () => clearInterval(t); }, []);

  const fmtCd = (ms) => {
    const s = Math.ceil(ms/1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}dk ${s%60}s`;
    return `${Math.floor(s/3600)}sa ${Math.floor((s%3600)/60)}dk`;
  };

  const doWork = (job) => {
    const lastDone = cooldowns[job.id] || 0;
    const remaining = job.cd - (Date.now() - lastDone);
    if (remaining > 0) { showNotif(`⏳ ${fmtCd(remaining)} bekle!`, 'error'); return; }
    const newCd = {...cooldowns, [job.id]: Date.now()};
    setCooldowns(newCd);
    localStorage.setItem('jobCooldowns', JSON.stringify(newCd));
    const xpGain = Math.max(5, Math.floor(job.earn / 200));
    const hasUCBoost = !!(profile?.packages?.ucBoost || profile?.ucBoost || profile?.ucMultiplier);
    const ucMulti = hasUCBoost ? 2 : 1;
    const tpBonus = 1 + (profile?.tradePoints || 0) * 0.0001;
    const ucGain = Math.max(1, Math.round(Math.floor(job.earn / 50000) * ucMulti * tpBonus));
    setProfile(p => {
      const np = {...p, money:(p.money||0)+job.earn, xp:(p.xp||0)+xpGain, underCoin:(p.underCoin||0)+ucGain};
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    // Günlük görev sayacı
    try {
      const today = new Date().toDateString();
      const dk = `day_${today}`;
      const s = JSON.parse(localStorage.getItem('dailyTaskState')||'{}');
      s[dk] = {...(s[dk]||{}), dailyJobCount:((s[dk]?.dailyJobCount)||0)+1};
      localStorage.setItem('dailyTaskState', JSON.stringify(s));
    } catch(e){}
    const ucMsg = ucGain > 0 ? ` +${ucGain} PG` : '';
    showNotif(`${job.emoji} +${fmtWord(job.earn)} kazandın! +${xpGain} XP${ucMsg}`, 'success');
  };

  const playerLevel = profile?.level || 1;

  return (
    <div style={{padding:'1rem', background:bg, minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'#10B981', letterSpacing:'0.08em', marginBottom:'0.25rem'}}>💼 İŞLER</div>
      <div style={{fontSize:'0.75rem', color:'#5A7089', marginBottom:'1rem'}}>Butona bas, para kazan. Her iş için bekleme süresi var.</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem'}}>
        {JOBS_LIST.map(job => {
          const lastDone = cooldowns[job.id] || 0;
          const remaining = Math.max(0, job.cd - (Date.now() - lastDone));
          const onCd = remaining > 0;
          const locked = playerLevel < job.minLevel;
          const pct = onCd ? Math.round(((job.cd - remaining) / job.cd) * 100) : 100;
          return (
            <div key={job.id} style={{background:locked?'rgba(255,255,255,0.02)':card, border:`1px solid ${locked?border:onCd?'rgba(245,158,11,0.25)':'rgba(16,185,129,0.25)'}`, borderRadius:'16px', padding:'0.85rem', opacity:locked?0.5:1, display:'flex', flexDirection:'column', gap:'0.4rem', boxShadow:!locked&&!onCd?'0 2px 8px rgba(16,185,129,0.08)':'none'}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                {job.svgIcon
                  ? <SvgIcon name={job.svgIcon} size={32} style={{filter:'drop-shadow(0 0 4px rgba(16,185,129,0.3))'}} />
                  : <span style={{fontSize:'1.75rem'}}>{job.emoji}</span>}
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.83rem', fontWeight:800, color:dark?'#E8EDF2':'#1E293B'}}>{job.name}</div>
                  <div style={{fontSize:'0.7rem', color:'#10B981', fontWeight:700}}>+{fmtWord(job.earn)}</div>
                </div>
              </div>
              <div style={{fontSize:'0.62rem', color:'#5A7089', display:'flex', gap:'0.3rem', flexWrap:'wrap', alignItems:'center'}}>
                <span>⏱ {job.desc}</span>
                {job.req && <span style={{color:'#F59E0B', fontWeight:600}}>🔑 {job.req}</span>}
                {locked && <span style={{color:'#EF4444', fontWeight:700}}>🔒 Lv.{job.minLevel}</span>}
              </div>
              {onCd && (
                <div>
                  <div style={{height:'3px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden', marginBottom:'2px'}}>
                    <div style={{height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius:'2px', transition:'width 1s linear'}}/>
                  </div>
                  <div style={{fontSize:'0.62rem', color:'#F59E0B', fontWeight:700}}>⏳ {fmtCd(remaining)} kaldı</div>
                </div>
              )}
              <button onClick={() => !locked && doWork(job)} disabled={locked||onCd}
                style={{padding:'0.5rem', borderRadius:'10px', border:'none', background:locked?'rgba(255,255,255,0.04)':onCd?'rgba(245,158,11,0.1)':'linear-gradient(135deg,#10B981,#059669)', color:locked?'#3B4E63':onCd?'#F59E0B':'#fff', fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:'0.8rem', cursor:locked||onCd?'not-allowed':'pointer', transition:'all 0.15s', letterSpacing:'0.05em', opacity:onCd?0.8:1}}>
                {locked ? '🔒 KİLİTLİ' : onCd ? 'BEKLE...' : 'ÇALIŞ'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ORTAKLI İŞLER BÖLÜMü
// ═══════════════════════════════════════════════════════
const PARTNER_JOBS = [
  { cat:'LOJİSTİK', icon:'🚛', color:'#3B82F6', jobs:[
    { id:'city_log',  name:'Şehir İçi Lojistik',     dur:'15 Dakika', cdLabel:'30 dk',  cdMs:30*60*1000,  slots:3, earn:50000,  tp:50,  minLevel:1 },
    { id:'inter_log', name:'Şehirlerarası Taşıma',   dur:'45 Dakika', cdLabel:'2 saat', cdMs:120*60*1000, slots:2, earn:120000, tp:110, minLevel:3 },
  ]},
  { cat:'ÜRETİM', icon:'⚙️', color:'#F59E0B', jobs:[
    { id:'sub_prod',  name:'Taşeron Üretim Siparişi', dur:'30 Dakika', cdLabel:'1 saat', cdMs:60*60*1000,  slots:2, earn:125000, tp:120, minLevel:2 },
    { id:'factory_s', name:'Fabrika Vardiyası',       dur:'1 Saat',    cdLabel:'3 saat', cdMs:180*60*1000, slots:2, earn:280000, tp:250, minLevel:5 },
  ]},
  { cat:'DIŞ TİCARET', icon:'🌐', color:'#10B981', jobs:[
    { id:'customs',   name:'Gümrük Beyannamesi Onayı', dur:'45 Dakika', cdLabel:'1.5 saat', cdMs:90*60*1000,  slots:2, earn:220000, tp:200, minLevel:3 },
    { id:'export',    name:'İhracat Anlaşması',         dur:'2 Saat',    cdLabel:'4 saat',   cdMs:240*60*1000, slots:1, earn:500000, tp:450, minLevel:8 },
  ]},
];

function PartnerJobsSection({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [cooldowns, setCooldowns] = useState(() => { try { return JSON.parse(localStorage.getItem('partnerJobCd')||'{}'); } catch { return {}; } });
  const [tick, setTick] = useState(0);
  const [partnerModal, setPartnerModal] = useState(null);
  const [allUsers] = useLs('users', []);
  useEffect(() => { const t = setInterval(() => setTick(p=>p+1), 1000); return () => clearInterval(t); }, []);

  const startJob = (job, partnerId) => {
    const lastDone = cooldowns[job.id] || 0;
    const remaining = job.cdMs - (Date.now() - lastDone);
    if (remaining > 0) {
      const s = Math.ceil(remaining/1000);
      const label = s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s/60)}dk` : `${Math.floor(s/3600)}sa`;
      showNotif(`⏳ ${label} kaldı!`, 'error');
      setPartnerModal(null);
      return;
    }
    const newCd = {...cooldowns, [job.id]: Date.now()};
    setCooldowns(newCd);
    localStorage.setItem('partnerJobCd', JSON.stringify(newCd));
    const shareEarn = Math.floor(job.earn * 0.5);
    const shareTP = Math.floor(job.tp * 0.5);
    setProfile(p => {
      const np = {...p, money:(p.money||0)+shareEarn, tradePoints:(p.tradePoints||0)+shareTP, xp:(p.xp||0)+30};
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`🤝 +${fmtWord(shareEarn)} + ${shareTP} TP kazandın!`, 'success');
    setPartnerModal(null);
  };

  const fmtRem = (ms) => {
    const s = Math.ceil(ms/1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}dk`;
    return `${Math.floor(s/3600)}sa`;
  };

  const otherUsers = (Array.isArray(allUsers) ? allUsers : []).filter(u => u.id !== profile?.id && !u.banned).slice(0,20);

  return (
    <div style={{paddingBottom:'1rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(16,185,129,0.1))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'14px', padding:'0.85rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.75rem'}}>
        <span style={{fontSize:'1.8rem'}}>🤝</span>
        <div>
          <div style={{fontWeight:800, color:'#F59E0B', fontSize:'0.9rem'}}>Ortaklı İşler</div>
          <div style={{fontSize:'0.72rem', color:'#5A7089'}}>Arkadaşlarınla iş yaparak karşılıklı para ve ticaret puanı kazan.</div>
        </div>
      </div>
      {PARTNER_JOBS.map(cat => (
        <div key={cat.cat} style={{marginBottom:'1.25rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.6rem'}}>
            <span style={{fontSize:'1rem'}}>{cat.icon}</span>
            <span style={{fontSize:'0.68rem', fontWeight:800, color:cat.color, textTransform:'uppercase', letterSpacing:'0.1em'}}>{cat.cat}</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
            {cat.jobs.map(job => {
              const lastDone = cooldowns[job.id] || 0;
              const remaining = Math.max(0, job.cdMs - (Date.now() - lastDone));
              const onCd = remaining > 0;
              const locked = false; // Seviye gereksinimleri kaldırıldı
              return (
                <div key={job.id} style={{background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'0.85rem'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem'}}>
                    <div>
                      <div style={{fontSize:'0.85rem', fontWeight:700, color:dark?'#E8EDF2':'#1E293B'}}>{job.name}</div>
                      <div style={{fontSize:'0.65rem', color:'#5A7089', marginTop:'2px', display:'flex', gap:'0.5rem'}}>
                        <span>⏱ {job.dur}</span>
                        <span>🔄 CD: {job.cdLabel}</span>
                        <span>👥 Kapasite: {job.slots}</span>
                      </div>
                    </div>
                    {onCd && <span style={{fontSize:'0.65rem', color:'#F59E0B', fontWeight:700, flexShrink:0}}>⏳ {fmtRem(remaining)}</span>}
                    {!onCd && !locked && <span style={{fontSize:'0.65rem', color:'#10B981', fontWeight:700, background:'rgba(16,185,129,0.1)', padding:'2px 7px', borderRadius:'6px', flexShrink:0}}>✓ Müsait</span>}
                    {locked && <span style={{fontSize:'0.65rem', color:'#EF4444', fontWeight:700, flexShrink:0}}>🔒 Kilitli</span>}
                  </div>
                  <div style={{display:'flex', gap:'0.75rem', marginBottom:'0.6rem'}}>
                    <span style={{fontSize:'0.75rem', color:'#10B981', fontWeight:700}}>💰 {fmtWord(job.earn)}</span>
                    <span style={{fontSize:'0.75rem', color:'#06B6D4', fontWeight:700}}>🤝 {job.tp} TP</span>
                  </div>
                  <button onClick={() => !locked && !onCd && setPartnerModal({job, cat})} disabled={locked||onCd}
                    style={{width:'100%', padding:'0.5rem', borderRadius:'10px', border:`1px solid ${locked||onCd?border:`${cat.color}44`}`, background:locked||onCd?'rgba(255,255,255,0.03)':`${cat.color}15`, color:locked||onCd?'#3B4E63':cat.color, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'0.8rem', cursor:locked||onCd?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem'}}>
                    {locked ? '🔒 Kilitli' : onCd ? '⏳ Bekleniyor' : '👥 Ortak Seç & Gönder'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {partnerModal && (
        <div onClick={()=>setPartnerModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'480px',margin:'0 auto',background:dark?'#1E293B':'#fff',borderRadius:'20px 20px 0 0',padding:'1.25rem',maxHeight:'70vh',overflowY:'auto'}}>
            <div style={{width:'32px',height:'3px',background:'rgba(255,255,255,0.1)',borderRadius:'2px',margin:'0 auto 1rem'}}/>
            <div style={{fontWeight:800,color:dark?'#E8EDF2':'#1E293B',marginBottom:'0.3rem'}}>👥 Ortak Seç</div>
            <div style={{fontSize:'0.75rem',color:'#5A7089',marginBottom:'0.85rem'}}>{partnerModal.job.name} — Her iki oyuncu da {fmtWord(Math.floor(partnerModal.job.earn/2))} + {Math.floor(partnerModal.job.tp/2)} TP kazanır.</div>
            {otherUsers.length === 0 && <div style={{color:'#5A7089',fontSize:'0.82rem',textAlign:'center',padding:'1rem'}}>Kayıtlı başka oyuncu yok.</div>}
            {otherUsers.map(u => (
              <button key={u.id} onClick={() => startJob(partnerModal.job, u.id)}
                style={{width:'100%',display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.65rem',border:`1px solid ${border}`,borderRadius:'12px',background:'transparent',cursor:'pointer',marginBottom:'0.4rem',textAlign:'left'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(59,130,246,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>
                  {u.gender==='kadin'?'👩':'👨'}
                </div>
                <div>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:dark?'#E8EDF2':'#1E293B'}}>{u.username}</div>
                  <div style={{fontSize:'0.67rem',color:'#5A7089'}}>Lv.{u.level||1} • {u.city||'?'}</div>
                </div>
                <span style={{marginLeft:'auto',fontSize:'0.72rem',color:'#10B981',fontWeight:700}}>→ Gönder</span>
              </button>
            ))}
            {otherUsers.length === 0 && (
              <button onClick={() => startJob(partnerModal.job, 'npc')}
                style={{width:'100%',padding:'0.65rem',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'12px',background:'rgba(99,102,241,0.08)',color:'#818CF8',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
                🤖 NPC ile Çalış
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ŞEHİR İNŞAAT SAYFASI
// ═══════════════════════════════════════════════════════
const CITY_BUILDINGS = [
  { id:'park',       emoji:'🌳', name:'Kent Parkı',          cost:50000,    time:5*60*1000,    effect:'happiness',     bonus:'+5 Mutluluk',   desc:'Şehir mutluluğunu artırır' },
  { id:'hospital',   emoji:'🏥', name:'Hastane',             cost:200000,   time:30*60*1000,   effect:'health',        bonus:'+10 Sağlık',    desc:'Şehir sağlık puanını artırır' },
  { id:'school',     emoji:'🏫', name:'İlköğretim Okulu',    cost:150000,   time:20*60*1000,   effect:'education',     bonus:'+8 Eğitim',     desc:'Eğitim skoru yükselir' },
  { id:'police',     emoji:'🚔', name:'Polis Karakolu',      cost:100000,   time:15*60*1000,   effect:'security',      bonus:'+7 Güvenlik',   desc:'Suç oranını düşürür' },
  { id:'market',     emoji:'🏪', name:'Çarşı',               cost:80000,    time:10*60*1000,   effect:'economy',       bonus:'+3% Gelir',     desc:'Ekonomiyi canlandırır' },
  { id:'library',    emoji:'📚', name:'Kütüphane',           cost:120000,   time:25*60*1000,   effect:'education',     bonus:'+6 Eğitim',     desc:'Eğitim ve XP artışı' },
  { id:'stadium',    emoji:'🏟️', name:'Stadyum',             cost:500000,   time:60*60*1000,   effect:'happiness',     bonus:'+15 Mutluluk',  desc:'Büyük mutluluk bonusu' },
  { id:'factory',    emoji:'🏭', name:'Fabrika',             cost:300000,   time:45*60*1000,   effect:'economy',       bonus:'+5% Gelir',     desc:'Üretim geliri sağlar' },
  { id:'university', emoji:'🎓', name:'Üniversite',          cost:800000,   time:120*60*1000,  effect:'education',     bonus:'+20 Eğitim',    desc:'Maksimum eğitim bonusu' },
  { id:'metro',      emoji:'🚇', name:'Metro Hattı',         cost:1000000,  time:180*60*1000,  effect:'infrastructure', bonus:'+10 Altyapı',  desc:'Şehir altyapısını geliştirir' },
  { id:'tower',      emoji:'🏗️', name:'Gökdelen',            cost:2000000,  time:240*60*1000,  effect:'economy',       bonus:'+25 Ekonomi',   desc:'Finans merkezi', minLevel:10 },
  { id:'airport',    emoji:'✈️', name:'Havalimanı',          cost:5000000,  time:480*60*1000,  effect:'economy',       bonus:'+50 Ekonomi',   desc:'Uluslararası ticaret', minLevel:20 },
];

function CityBuildPage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [buildings, setBuildings] = useLs('cityBuildings', {});
  const [constructions, setConstructions] = useLs('cityConstructions', {});
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(p=>p+1), 2000); return () => clearInterval(t); }, []);

  const effectColors = { happiness:'#EC4899', health:'#10B981', education:'#3B82F6', security:'#F59E0B', economy:'#10B981', infrastructure:'#8B5CF6' };
  const effectLabels = { happiness:'Mutluluk', health:'Sağlık', education:'Eğitim', security:'Güvenlik', economy:'Ekonomi', infrastructure:'Altyapı' };

  const cityStats = useMemo(() => {
    const stats = { happiness:40, health:40, education:40, security:40, economy:40, infrastructure:40 };
    Object.keys(buildings).forEach(bid => {
      const b = CITY_BUILDINGS.find(x=>x.id===bid);
      if (b) {
        const v = parseInt(b.bonus.replace(/[^0-9]/g,'')) || 5;
        stats[b.effect] = Math.min(100, (stats[b.effect]||40) + v);
      }
    });
    return stats;
  }, [buildings]);

  const overallScore = () => {
    const vals = Object.values(cityStats);
    const avg = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
    if (avg>=90) return {grade:'S',color:'#FFD700'};
    if (avg>=80) return {grade:'A',color:'#10B981'};
    if (avg>=70) return {grade:'B',color:'#3B82F6'};
    if (avg>=60) return {grade:'C',color:'#F59E0B'};
    return {grade:'D',color:'#EF4444'};
  };
  const { grade, color } = overallScore();

  const build = (b) => {
    if ((profile?.money||0) < b.cost) { showNotif('Yeterli paran yok!', 'error'); return; }
    if (buildings[b.id]) { showNotif('Bu bina zaten inşa edildi!', 'error'); return; }
    if (constructions[b.id]) { showNotif('Bu bina zaten inşa ediliyor!', 'error'); return; }
    if (b.minLevel && (profile?.level||1) < b.minLevel) { showNotif(`Seviye ${b.minLevel} gerekli!`, 'error'); return; }
    setProfile(p => { const np={...p,money:(p.money||0)-b.cost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setConstructions(prev => ({...prev, [b.id]:{startedAt:Date.now(), finishAt:Date.now()+b.time}}));
    showNotif(`🏗️ ${b.emoji} ${b.name} inşaatı başladı!`, 'success');
  };

  const collect = (b) => {
    const c = constructions[b.id];
    if (!c || Date.now() < c.finishAt) { showNotif('İnşaat henüz bitmedi!', 'error'); return; }
    setConstructions(prev => { const n={...prev}; delete n[b.id]; return n; });
    setBuildings(prev => ({...prev, [b.id]:true}));
    setProfile(p => { const np={...p,xp:(p.xp||0)+500}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${b.emoji} ${b.name} tamamlandı! +500 XP`, 'success');
  };

  const fmtTime = (ms) => {
    const s = Math.ceil(ms/1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}dk`;
    return `${Math.floor(s/3600)}sa ${Math.floor((s%3600)/60)}dk`;
  };

  return (
    <div style={{padding:'1rem', background:bg, minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'#F59E0B', letterSpacing:'0.08em', marginBottom:'1rem'}}>🏗️ ŞEHİR İNŞAAT</div>

      {/* Şehir İstatistik Paneli */}
      <div style={{background:'linear-gradient(135deg,#1A2744,#0F1C38)', borderRadius:'16px', padding:'1rem', marginBottom:'1rem', border:'1px solid rgba(59,130,246,0.15)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.72rem', color:'#60A5FA', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em'}}>📊 Şehir İstatistikleri</div>
          <div style={{background:`${color}20`, border:`1px solid ${color}50`, borderRadius:'10px', padding:'0.25rem 0.75rem', fontSize:'1.1rem', fontWeight:900, color}}>{grade} Sınıfı</div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.45rem'}}>
          {Object.entries(cityStats).map(([k,v]) => (
            <div key={k}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.62rem', marginBottom:'2px'}}>
                <span style={{color:'rgba(255,255,255,0.5)'}}>{effectLabels[k]||k}</span>
                <span style={{color:effectColors[k]||'#fff', fontWeight:700}}>{v}/100</span>
              </div>
              <div style={{height:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${v}%`, background:effectColors[k]||'#3B82F6', borderRadius:'2px', transition:'width 0.5s'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Binalar */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem'}}>
        {CITY_BUILDINGS.map(b => {
          const built = !!buildings[b.id];
          const cons = constructions[b.id];
          const inProgress = cons && Date.now() < cons.finishAt;
          const done = cons && Date.now() >= cons.finishAt;
          const remaining = cons ? Math.max(0, cons.finishAt - Date.now()) : 0;
          const pct = cons ? Math.min(100, Math.round(((Date.now()-cons.startedAt)/(cons.finishAt-cons.startedAt))*100)) : 0;
          const locked = b.minLevel && (profile?.level||1) < b.minLevel;

          return (
            <div key={b.id} style={{background:built?`${effectColors[b.effect]}08`:card, border:`1px solid ${built?effectColors[b.effect]+'44':border}`, borderRadius:'16px', padding:'0.85rem', display:'flex', flexDirection:'column', gap:'0.4rem', opacity:locked&&!built?0.5:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.4rem'}}>
                <span style={{fontSize:'1.6rem'}}>{b.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.8rem', fontWeight:800, color:dark?'#E8EDF2':'#1E293B'}}>{b.name}</div>
                  <div style={{fontSize:'0.65rem', color:effectColors[b.effect]||'#10B981', fontWeight:700}}>{b.bonus}</div>
                </div>
              </div>
              <div style={{fontSize:'0.62rem', color:'#5A7089'}}>{b.desc}</div>

              {built && (
                <div style={{padding:'0.35rem 0.5rem', borderRadius:'8px', background:`${effectColors[b.effect]}15`, border:`1px solid ${effectColors[b.effect]}33`, fontSize:'0.7rem', fontWeight:700, color:effectColors[b.effect], textAlign:'center'}}>✅ İnşa Edildi</div>
              )}
              {inProgress && (
                <div>
                  <div style={{height:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden', marginBottom:'3px'}}>
                    <div style={{height:'100%', width:`${pct}%`, background:'#F59E0B', borderRadius:'2px', transition:'width 2s linear'}}/>
                  </div>
                  <div style={{fontSize:'0.62rem', color:'#F59E0B', fontWeight:700}}>🏗️ {fmtTime(remaining)} kaldı</div>
                </div>
              )}
              {done && (
                <button onClick={() => collect(b)} style={{padding:'0.45rem', borderRadius:'9px', border:'1px solid rgba(16,185,129,0.4)', background:'rgba(16,185,129,0.12)', color:'#10B981', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'0.78rem', cursor:'pointer'}}>
                  ✅ Teslim Al
                </button>
              )}
              {!built && !cons && (
                <button onClick={() => !locked && build(b)} disabled={!!locked}
                  style={{padding:'0.45rem', borderRadius:'9px', border:`1px solid ${locked?border:'rgba(245,158,11,0.4)'}`, background:locked?'rgba(255,255,255,0.03)':'rgba(245,158,11,0.1)', color:locked?'#3B4E63':'#F59E0B', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'0.72rem', cursor:locked?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem'}}>
                  {locked ? `🔒 Lv.${b.minLevel}` : `🏗️ ${fmtWord(b.cost)}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WİKİ SAYFASI
// ═══════════════════════════════════════════════════════
function WikiPage({ profile }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { dark } = useTheme();
  const articles = [
    { id:'basics', icon:'🎮', cat:'Temel', title:'Oyuna Başlangıç', content:`UOLİTİKON'e hoş geldin! Kullanıcı adın ve şifrenle giriş yap. Başlangıçta ₱10.000 nakit ve ₱5.000 banka bakiyen olur.\n\n• Görevleri tamamla → Para ve XP kazan\n• XP ile seviye atla → Yeni özellikler aç\n• Ticaret yap → Ticaret puanı kazan\n• Seçimlere katıl → Siyasi güç kazan\n\n📅 Günlük görevleri tamamla → Ekstra ödül kazan\n🏆 Başarımları tamamla → Özel rozetler kazan` },
    { id:'levels', icon:'⭐', cat:'Temel', title:'Seviye & XP Sistemi', content:`XP kazanarak seviye atlarsın.\n\n• İş yap → +10–50 XP\n• Görev tamamla → +50–250 XP\n• PvP kazanma → +100 XP\n• Fabrika üretimi → +200 XP\n• Günlük login → +50 XP\n\nSeviyeler:\nLv.1–5: Çaylak\nLv.6–15: Vatandaş\nLv.16–30: Girişimci\nLv.31–50: Lider\nLv.51–75: Elit\nLv.76–99: Efsane\nLv.100: Cumhurbaşkanı\n\n⚠️ Parti kurabilmek için Lise diploması gerekir.` },
    { id:'edu', icon:'🎓', cat:'Eğitim', title:'Eğitim Sistemi', content:`Eğitim tıklama tabanlı bir sistemdir.\n\n📚 Eğitim seviyeleri:\n• İlkokul → 50 tıklama (ücretsiz)\n• Ortaokul → 100 tıklama (₱500/tıklama)\n• Lise → 200 tıklama (₱1.000/tıklama)\n• Üniversite → 500 tıklama (₱5.000/tıklama)\n• Yüksek Lisans → 1000 tıklama (₱20.000/tıklama)\n• Doktora → 2000 tıklama (₱50.000/tıklama)\n\n⏱️ Bekleme süresi:\n• Normal: 5 dakika\n• VIP: 2.5 dakika\n• Eğitim Paketi: 1 saniye\n\n🎓 Diploma → Yüksek makamlara aday olma hakkı\n🏛️ Lise diploması → Parti kurabilme\n🎓 Üniversite → Bakanlık pozisyonu` },
    { id:'economy', icon:'💰', cat:'Ekonomi', title:'Ekonomi & Şirketler', content:`Ekonomi sisteminde:\n\n• Şirket kur → Günlük kâr kazan\n• Borsa → Hisse al/sat (5 sektör: Teknoloji, Enerji, Banka, Tarım, Savunma)\n• Banka → Faiz kazan, kredi al\n• Tarım → Ürün yetiştir (Buğday, Mısır, Domates...)\n• Hayvancılık → Hayvan besle ve sat\n• Fabrika → Hammadde işle, ürün sat\n• Maden → Kaynak çıkar\n\n💡 İpucu: Çeşitli sektörlere yatırım yap, riski dağıt!` },
    { id:'politics', icon:'🏛️', cat:'Siyaset', title:'Siyaset & Seçimler', content:`Siyaset bölümünde:\n\n• Parti kur (Lise diploması gerekir, ₱500.000 kuruluş ücreti)\n• Partiye üye ol\n• Yasalar için oy ver\n• Devlet başkanlığına aday ol\n\n🗳️ Oy ağırlığı ticaret sıralamasına göre artar:\n  - 1. sıra: 6x oy gücü\n  - 2. sıra: 4x oy gücü\n  - 3–5. sıra: 3x oy gücü\n  - 6–50. sıra: 2x oy gücü\n  - 51+. sıra: 1x oy gücü\n\n⭐ Liyakat puanı yüksek oyuncular seçimde avantajlı` },
    { id:'penalties', icon:'⚖️', cat:'Hukuk', title:'Ceza Sistemi', content:`UOLİTİKON'de suç ve ceza sistemi:\n\n🚔 Suçlar ve Cezalar:\n• Hırsızlık → ₱50.000 para cezası veya 2 saat hapis\n• Saldırı → ₱100.000 para cezası veya 4 saat hapis\n• Dolandırıcılık → ₱250.000 para cezası veya 8 saat hapis\n• Organize suç → ₱1.000.000 para cezası veya 24 saat hapis\n• Kara para aklama → Hesap dondurma + ₱5.000.000 ceza\n\n⚖️ Mahkeme Süreci:\n• Suçlama yapıldığında avukat tutulabilir\n• Avukat: Cezayı %50 azaltır (₱200.000 ücret)\n• İtiraz hakkı: 24 saat içinde kullanılabilir\n• Temyiz: Mahkeme kararını değiştirme şansı %30\n\n🏛️ Hapis:\n• Hapis süresince oyun aksiyonları kısıtlanır\n• Firar: %40 başarı şansı, başarısızda süre 2x\n• Rüşvet: ₱500.000 karşılığı serbest bırakılma\n\n💡 İpucu: Temiz sicil = Siyasi avantaj!` },
    { id:'court', icon:'🏛️', cat:'Hukuk', title:'Mahkeme & Hukuk', content:`Mahkeme sistemi:\n\n📋 Davalar:\n• Sivil davalar → Para ödeme kararı\n• Ceza davaları → Hapis veya para cezası\n• Ticari davalar → Şirket varlık el koyma riski\n\n⚖️ Avukat Sistemi:\n• Uzman avukat → %70 kazanma şansı (₱500.000)\n• Normal avukat → %50 kazanma şansı (₱150.000)\n• Kendi savunma → %25 kazanma şansı (ücretsiz)\n\n🏛️ Yargıtay:\n• En yüksek mahkeme\n• Başkan tarafından atanır\n• Anayasa değişikliklerini denetler\n\n📌 Önemli: Hukuk puanın yüksek olması yargıda avantaj sağlar!` },
    { id:'police', icon:'🚔', cat:'Hukuk', title:'Polis & Güvenlik', content:`Polis sistemi:\n\n👮 Polis Görevi:\n• Suçluları yakala → Ödül kazan\n• Çete operasyonları → Ekstra liyakat puanı\n• Uyuşturucu baskını → Büyük ödül\n\n🔍 Aranan Listesi:\n• Suç puanı 100+ → Aranan listesine girersin\n• Polisler seni yakalayabilir\n• Aranan iken bazı bölgelere giremezsin\n\n🛡️ Güvenlik Seviyeleri:\n• Yeşil → Normal vatandaş\n• Sarı → Şüpheli (1–50 suç puanı)\n• Turuncu → Aranan (51–100 suç puanı)\n• Kırmızı → En çok aranan (100+ suç puanı)\n\n💡 İpucu: Polisin içine sızabilirsin — ajan ol!` },
    { id:'football', icon:'⚽', cat:'Futbol', title:'Futbol Yönetimi', content:`Futbol bölümünde:\n\n• Kulüp kur (₱2.000.000)\n• Oyuncu satın al (transfer pazarı)\n• Antrenman yap → İstatistik artır\n• Taktik seç: 4-4-2, 4-3-3, 3-5-2...\n• Altyapı geliştir: Stadyum, akademi, sağlık merkezi\n• Lig maçları oyna → Para ve taraftar kazan\n• Şampiyon ol → Kupa & prestij kazan\n\n🏆 Lig Seviyeleri: 3. Lig → 2. Lig → 1. Lig → Süper Lig\n💡 Güçlü taktik + iyi oyuncular = Şampiyonluk!` },
    { id:'army', icon:'⚔️', cat:'Ordu', title:'Ordu & Savaş', content:`Ordu bölümünde:\n\n• Asker al (₱10.000/asker)\n• Silah satın al: Tüfek, Tank, Topçu, Uçak\n• Diğer şehirlere saldır → Kaynak ele geçir\n• Savunma hattı kur → Şehri koru\n• Konum puanı artır → Daha güçlü saldırılar\n\n⚔️ Savaş Mekanizması:\n• Saldırı = (Asker × Silah Gücü) × Rastgele[0.8–1.2]\n• Savunma güçlüyse → Saldırı başarısız\n• Başarılı saldırı → Para + Arazi kazan\n• Başarısız saldırı → Asker kaybı\n\n🛡️ NATO ve Birlikler için İttifak bölümüne bak!` },
    { id:'crime', icon:'🔫', cat:'Suç', title:'Çete & Suç Dünyası', content:`Çete bölümünde:\n\n• Çete kur veya üye ol (minimum 3 kişi)\n• Suç işle → Para kazan (riskli!)\n• Çete savaşları → Bölge kontrolü\n• Organize suç örgütü kur\n• Kara para akla → Meşru para haline getir (riskli)\n\n⚠️ Risk Tablosu:\n• Ufak hırsızlık: %30 yakalanma riski\n• Soygun: %50 yakalanma riski\n• Silahlı saldırı: %70 yakalanma riski\n• Cinayet: %90 yakalanma riski\n\n💡 Yüksek suç puanı → Polis tarafından aranırsın!` },
    { id:'premium', icon:'👑', cat:'Premium', title:'VIP & Paketler', content:`Premium özellikler:\n\n👑 VIP Üyelik:\n• Tüm bekleme sürelerinde %50 azalma\n• Profil çerçevesi\n• Ekstra ₱50.000 başlangıç\n• Özel VIP rozeti\n• Günlük 500 PG bonus\n\n📚 Eğitim Paketi:\n• Her tıklamada 1sn bekleme (normal: 5dk)\n• Sadece eğitim için geçerli\n• VIP ile birleştirilebilir\n\n🪙 PoliGold (UC):\n• Özel para birimi\n• VIP alımı, özel eşyalar için kullanılır\n• Günlük görevlerden kazanılabilir` },
    { id:'alliance', icon:'🤝', cat:'Siyaset', title:'İttifaklar & Diplomasi', content:`İttifak sisteminde:\n\n• İttifak kur (minimum 5 üye)\n• Diğer şehirlerle ticaret anlaşması yap\n• Savunma paktı → Saldırıya uğrayan üyeyi koru\n• Ekonomik birlik → Ortak vergi indirimi\n\n🌍 Küresel İttifaklar:\n• G5 (5 büyük güç) → Dünya ekonomisini yönetir\n• Askeri İttifak → Ortak savaş gücü\n• Ticaret Birliği → Düşük tarifeler\n\n⚠️ İttifak bozulursa 7 gün soğuma süresi uygulanır!` },
  ];
  const filtered = articles.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()) || a.cat.toLowerCase().includes(search.toLowerCase())
  );
  const cats = [...new Set(articles.map(a=>a.cat))];
  return (
    <div style={{padding:'0.7rem',paddingBottom:'5rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'0.3rem'}}>📚</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.15rem',fontWeight:900,color:'#E8EDF2'}}>WİKİ</div>
        <div style={{fontSize:'0.72rem',color:'#5A7089',marginTop:'0.2rem'}}>Oyun hakkında her şeyi öğren</div>
      </div>
      <div style={{marginBottom:'0.75rem'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Ara..."
          style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0.65rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
      </div>
      {selected ? (
        <div>
          <button onClick={()=>setSelected(null)} style={{background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'8px',padding:'0.4rem 0.8rem',color:'#60A5FA',cursor:'pointer',marginBottom:'0.75rem',fontSize:'0.82rem',fontWeight:700,fontFamily:'inherit'}}>← Geri</button>
          <div style={{background:'rgba(11,21,39,0.95)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.1rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.35rem'}}>{selected.icon}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:'#E8EDF2',fontSize:'1.05rem',marginBottom:'0.25rem'}}>{selected.title}</div>
            <div style={{display:'inline-block',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'6px',padding:'2px 8px',fontSize:'0.65rem',color:'#60A5FA',fontWeight:700,marginBottom:'0.75rem'}}>{selected.cat}</div>
            <div style={{fontSize:'0.85rem',color:'#CBD5E1',lineHeight:1.7,whiteSpace:'pre-line'}}>{selected.content}</div>
          </div>
        </div>
      ) : (
        <div>
          {cats.map(cat => {
            const catArticles = filtered.filter(a=>a.cat===cat);
            if (!catArticles.length) return null;
            return (
              <div key={cat} style={{marginBottom:'1rem'}}>
                <div style={{fontSize:'0.65rem',fontWeight:800,color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.4rem'}}>{cat}</div>
                {catArticles.map(a=>(
                  <button key={a.id} onClick={()=>setSelected(a)} style={{width:'100%',display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',cursor:'pointer',marginBottom:'0.35rem',textAlign:'left',fontFamily:"'DM Sans',sans-serif"}}>
                    <span style={{fontSize:'1.4rem',flexShrink:0}}>{a.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.88rem'}}>{a.title}</div>
                      <div style={{fontSize:'0.67rem',color:'#5A7089',marginTop:'1px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.content.split('\n')[0]}</div>
                    </div>
                    <span style={{color:'#3B4E63',flexShrink:0}}>›</span>
                  </button>
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem'}}>Arama sonucu bulunamadı.</div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HAYVANCILİK BİLEŞENİ
// ═══════════════════════════════════════════════════════
const LIVESTOCK_TYPES = [
  { id:'inek',   icon:'🐄', label:'İnek',     cost:5000,   feedCost:500,  sellPrice:15000,  growTime:10*60*1000, product:'🥛 Süt', productValue:2000  },
  { id:'tavuk',  icon:'🐔', label:'Tavuk',    cost:500,    feedCost:50,   sellPrice:2000,   growTime:3*60*1000,  product:'🥚 Yumurta', productValue:200 },
  { id:'koyun',  icon:'🐑', label:'Koyun',    cost:3000,   feedCost:300,  sellPrice:10000,  growTime:7*60*1000,  product:'🧶 Yün', productValue:1500  },
  { id:'domuz',  icon:'🐖', label:'Domuz',    cost:2000,   feedCost:200,  sellPrice:8000,   growTime:5*60*1000,  product:'🥩 Et', productValue:3000   },
  { id:'at',     icon:'🐴', label:'At',       cost:50000,  feedCost:5000, sellPrice:200000, growTime:30*60*1000, product:'🏇 Yarış', productValue:20000 },
];

const BARN_LEVELS = [
  { lvl:1, capacity:4,  upgradeCost:20000,  label:'Küçük Ahır' },
  { lvl:2, capacity:8,  upgradeCost:60000,  label:'Orta Ahır'  },
  { lvl:3, capacity:15, upgradeCost:150000, label:'Büyük Ahır' },
  { lvl:4, capacity:25, upgradeCost:400000, label:'Çiftlik'    },
  { lvl:5, capacity:40, upgradeCost:null,   label:'Mega Çiftlik (MAX)' },
];

function LivestockSection({ profile, setProfile, showNotif }) {
  const [animals, setAnimals] = useLs('rep_livestock', []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(()=>setNow(Date.now()), 5000); return ()=>clearInterval(t); }, []);

  const barnLvl = Math.min(5, Math.max(1, profile?.barnLevel || 1));
  const barnInfo = BARN_LEVELS.find(b=>b.lvl===barnLvl) || BARN_LEVELS[0];
  const capacity = barnInfo.capacity;
  const nextBarn = BARN_LEVELS.find(b=>b.lvl===barnLvl+1);

  const upgradeBarn = () => {
    if (!nextBarn) { showNotif('Ahır zaten maksimum seviyede!', 'info'); return; }
    if ((profile?.money||0) < nextBarn.upgradeCost) { showNotif(`Geliştirmek için ${fmtWord(nextBarn.upgradeCost)} gerekli`, 'error'); return; }
    setProfile(p => { const np={...p, money:(p.money||0)-nextBarn.upgradeCost, barnLevel:(barnLvl+1)}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`🏚️ Ahır Lv.${barnLvl+1} oldu! Kapasite: ${nextBarn.capacity} hayvan`, 'success');
  };

  const buyAnimal = (type) => {
    if (animals.length >= capacity) { showNotif(`Ahır dolu! (${capacity}/${capacity}) Geliştir →`, 'error'); return; }
    if ((profile?.money||0) < type.cost) { showNotif(`${fmtWord(type.cost)} gerekli`, 'error'); return; }
    const animal = { id: Date.now(), typeId: type.id, boughtAt: Date.now(), fed: Date.now(), mature: Date.now() + type.growTime };
    setAnimals(prev => [...prev, animal]);
    setProfile(p => { const np={...p,money:(p.money||0)-type.cost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${type.icon} ${type.label} satın alındı!`, 'success');
  };

  const feedAnimal = (animal) => {
    const type = LIVESTOCK_TYPES.find(t=>t.id===animal.typeId);
    if (!type) return;
    if ((profile?.money||0) < type.feedCost) { showNotif(`Yem için ${fmtWord(type.feedCost)} gerekli`, 'error'); return; }
    setAnimals(prev => prev.map(a => a.id===animal.id ? {...a, fed: Date.now()} : a));
    setProfile(p => { const np={...p,money:(p.money||0)-type.feedCost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`🌾 Beslendi!`, 'success');
  };

  const collectProduct = (animal) => {
    const type = LIVESTOCK_TYPES.find(t=>t.id===animal.typeId);
    if (!type) return;
    if (now < animal.mature) { showNotif('Hayvan henüz olgunlaşmadı!', 'error'); return; }
    setAnimals(prev => prev.map(a => a.id===animal.id ? {...a, mature: Date.now() + type.growTime} : a));
    setProfile(p => { const np={...p,money:(p.money||0)+type.productValue,tradePoints:(p.tradePoints||0)+10}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`${type.product} toplandı! +${fmtWord(type.productValue)}`, 'success');
  };

  const sellAnimal = (animal) => {
    const type = LIVESTOCK_TYPES.find(t=>t.id===animal.typeId);
    if (!type) return;
    setAnimals(prev => prev.filter(a => a.id !== animal.id));
    setProfile(p => { const np={...p,money:(p.money||0)+type.sellPrice}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`💰 ${type.icon} ${type.label} satıldı: +${fmtWord(type.sellPrice)}`, 'success');
  };

  return (
    <div>
      {/* Ahır Bilgi & Geliştirme */}
      <div style={{background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'14px',padding:'0.9rem',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
          <div>
            <div style={{fontWeight:800,color:'#10B981',fontSize:'0.9rem'}}>🏚️ {barnInfo.label}</div>
            <div style={{fontSize:'0.7rem',color:'#5A7089',marginTop:'0.1rem'}}>Kapasite: {animals.length} / {capacity} hayvan</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'0.6rem',color:'#5A7089',marginBottom:'0.2rem'}}>Ahır Lv.{barnLvl}</div>
            {nextBarn ? (
              <button onClick={upgradeBarn} style={{padding:'0.35rem 0.75rem',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.35)',borderRadius:'8px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontSize:'0.72rem',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                ⬆️ Lv.{barnLvl+1} • {fmtWord(nextBarn.upgradeCost)}
              </button>
            ) : (
              <span style={{fontSize:'0.65rem',color:'#10B981',fontWeight:700}}>✅ MAX</span>
            )}
          </div>
        </div>
        {/* Kapasite bar */}
        <div style={{height:'5px',background:'rgba(255,255,255,0.06)',borderRadius:'3px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.min(100,Math.round(animals.length/capacity*100))}%`,background:animals.length>=capacity?'#EF4444':'#10B981',borderRadius:'3px',transition:'width 0.5s'}} />
        </div>
      </div>
      {/* Satın al */}
      <div style={{fontSize:'0.68rem',fontWeight:700,color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>Hayvan Satın Al {animals.length>=capacity && <span style={{color:'#EF4444'}}>— Ahır Dolu!</span>}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem',marginBottom:'0.75rem'}}>
        {LIVESTOCK_TYPES.map(type=>(
          <button key={type.id} onClick={()=>buyAnimal(type)}
            style={{padding:'0.7rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',cursor:'pointer',textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.2rem'}}>{type.icon}</div>
            <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.8rem'}}>{type.label}</div>
            <div style={{fontSize:'0.65rem',color:'#EF4444'}}>{fmtWord(type.cost)}</div>
            <div style={{fontSize:'0.62rem',color:'#10B981'}}>{type.product}: {fmtWord(type.productValue)}</div>
          </button>
        ))}
      </div>
      {/* Ahır */}
      <div style={{fontSize:'0.68rem',fontWeight:700,color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>Ahırım ({animals.length} hayvan)</div>
      {animals.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'1.5rem',fontSize:'0.85rem'}}>Henüz hayvanın yok. Yukarıdan satın al!</div>}
      {animals.map(animal => {
        const type = LIVESTOCK_TYPES.find(t=>t.id===animal.typeId);
        if (!type) return null;
        const isMature = now >= animal.mature;
        const pct = isMature ? 100 : Math.round((now - (animal.mature - type.growTime)) / type.growTime * 100);
        const rem = Math.max(0, animal.mature - now);
        const remStr = rem < 60000 ? `${Math.ceil(rem/1000)}sn` : `${Math.floor(rem/60000)}dk`;
        return (
          <div key={animal.id} style={{background:'rgba(11,21,39,0.9)',border:`1px solid ${isMature?'rgba(16,185,129,0.35)':'rgba(255,255,255,0.06)'}`,borderRadius:'12px',padding:'0.75rem',marginBottom:'0.4rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
              <div style={{fontSize:'1.75rem',flexShrink:0}}>{type.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.85rem'}}>{type.label}</div>
                <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',margin:'0.3rem 0'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:isMature?'#10B981':'#F59E0B',borderRadius:'2px',transition:'width 0.5s'}} />
                </div>
                <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{isMature ? `✅ ${type.product} hazır!` : `⏳ ${remStr} kaldı`}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                {isMature && <button onClick={()=>collectProduct(animal)} style={{padding:'0.3rem 0.55rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:'7px',color:'#10B981',cursor:'pointer',fontWeight:700,fontSize:'0.7rem',fontFamily:'inherit',whiteSpace:'nowrap'}}>Topla</button>}
                <button onClick={()=>feedAnimal(animal)} style={{padding:'0.3rem 0.55rem',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'7px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontSize:'0.7rem',fontFamily:'inherit'}}>🌾 Besle</button>
                <button onClick={()=>sellAnimal(animal)} style={{padding:'0.3rem 0.55rem',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'7px',color:'#F87171',cursor:'pointer',fontWeight:700,fontSize:'0.7rem',fontFamily:'inherit'}}>Sat</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ÖZEL MESAJLAŞMA SAYFASI
// ═══════════════════════════════════════════════════════
function DirectMessagesPage({ profile, setProfile, showNotif }) {
  const [messages, setMessages] = useLs('rep_directMessages', []);
  const [convWith, setConvWith] = useState(null);
  const [input, setInput] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [giphyLoading, setGiphyLoading] = useState(false);
  const cu = profile || {};
  const msgsEndRef = useRef(null);
  const allUsers = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
  const contacts = allUsers.filter(u => u.id !== cu.id && !u.banned);

  const DM_POPULAR_GIFS = [
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/l0HlFZ3HqbGrMTBQs/giphy.gif',
    'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
    'https://media.giphy.com/media/xT9IgG50Lg7russbBO/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/TdfyKrN7HGTIY/giphy.gif',
    'https://media.giphy.com/media/3oEdv22bMDaqXkOIPS/giphy.gif',
    'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
  ];
  const dmDisplayGifs = giphyResults.length > 0 ? giphyResults : DM_POPULAR_GIFS;
  const gifRx = /(https?:\/\/(?:media\.giphy\.com|i\.giphy\.com|media\d*\.giphy\.com|tenor\.com|c\.tenor\.com)\S+)/i;

  useEffect(() => {
    if (!showGifPicker) return;
    const q = gifSearch.trim();
    const timer = setTimeout(async () => {
      setGiphyLoading(true);
      try {
        const endpoint = q ? `/api/giphy-search?q=${encodeURIComponent(q)}&limit=20` : '/api/giphy-trending?limit=20';
        const r = await fetch(endpoint);
        const data = await r.json();
        if (data && Array.isArray(data.data)) {
          setGiphyResults(data.data.map(g => g.images?.fixed_height?.url || g.images?.downsized?.url || '').filter(Boolean));
        }
      } catch(e) { setGiphyResults([]); }
      setGiphyLoading(false);
    }, q ? 500 : 0);
    return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker]);

  const getConvMsgs = (uid) => messages.filter(m=>(m.from===cu.id&&m.to===uid)||(m.from===uid&&m.to===cu.id)).sort((a,b)=>a.ts-b.ts);
  const unread = (uid) => messages.filter(m=>m.from===uid&&m.to===cu.id&&!m.read).length;
  const totalUnread = messages.filter(m=>m.to===cu.id&&!m.read).length;

  const openConv = (user) => {
    setConvWith(user);
    setMessages(prev=>prev.map(m=>m.from===user.id&&m.to===cu.id?{...m,read:true}:m));
  };

  const sendMessage = (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || !convWith) return;
    const ts = Date.now();
    const msg = {id:ts, from:cu.id, to:convWith.id, fromName:cu.username, text, ts, read:false};
    setMessages(prev=>[...prev, msg]);
    try {
      if (window._socket) {
        window._socket.emit('dm', {
          fromUserId: cu.id||cu.uid,
          fromUsername: cu.username,
          toUserId: convWith.id||convWith.uid,
          text,
          ts
        });
      }
    } catch(e){}
    if (!textOverride) setInput('');
    setShowGifPicker(false);
    setTimeout(()=>msgsEndRef.current?.scrollIntoView({behavior:'smooth'}), 50);
    try { const today=new Date().toDateString(); const dk=`day_${today}`; const s=JSON.parse(localStorage.getItem('dailyTaskState')||'{}'); s[dk]={...(s[dk]||{}),dailyChatCount:((s[dk]?.dailyChatCount)||0)+1}; localStorage.setItem('dailyTaskState',JSON.stringify(s)); } catch(e){}
  };

  // Listen for incoming real-time DMs from socket and update local state
  useEffect(() => {
    const handler = (data) => {
      const myId = cu.id||cu.uid;
      if (data.toUserId !== myId) return;
      if (convWith && (data.fromUserId===convWith.id||data.fromUserId===convWith.uid)) {
        const newMsg = {id:data.ts||Date.now(), from:data.fromUserId, to:myId, fromName:data.fromUsername, text:data.text, ts:data.ts||Date.now(), read:true};
        setMessages(prev => prev.some(m=>m.id===newMsg.id) ? prev : [...prev, newMsg]);
        setTimeout(()=>msgsEndRef.current?.scrollIntoView({behavior:'smooth'}), 50);
      } else {
        try {
          const urd = JSON.parse(localStorage.getItem('rep_dmUnread')||'{}');
          urd[data.fromUsername] = (urd[data.fromUsername]||0) + 1;
          localStorage.setItem('rep_dmUnread', JSON.stringify(urd));
        } catch(e){}
        try {
          if(window.Notification && Notification.permission === 'granted'){
            new Notification(`💬 ${data.fromUsername} sana mesaj gönderdi`, {body: data.text?.slice(0,60), tag:'dm'});
          }
        } catch(e){}
      }
    };
    window._socket?.on('dm', handler);
    return () => { try { window._socket?.off('dm', handler); } catch(e){} };
  }, [convWith, cu.id, cu.uid]);

  const convMsgs = convWith ? getConvMsgs(convWith.id) : [];

  return (
    <div style={{padding:'0.7rem',paddingBottom:'5rem'}}>
      {convWith ? (
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem',padding:'0.65rem 0.85rem',background:'rgba(11,21,39,0.95)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px'}}>
            <button onClick={()=>setConvWith(null)} style={{background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'8px',padding:'0.3rem 0.65rem',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontSize:'0.78rem',fontFamily:'inherit',flexShrink:0}}>←</button>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#3B82F6,#6366F1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>{convWith.gender==='kadin'?'👩':'👨'}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.88rem'}}>{convWith.username}</div>
              <div style={{fontSize:'0.62rem',color:'#5A7089'}}>Lv.{convWith.level||1} · {convWith.city||'—'}</div>
            </div>
          </div>
          <div style={{minHeight:'240px',maxHeight:'42vh',overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.4rem',marginBottom:'0.5rem',padding:'0.1rem 0'}}>
            {convMsgs.length===0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.82rem'}}>İlk mesajı sen gönder! 💬</div>}
            {convMsgs.map(m=>{
              const mine = m.from===cu.id;
              const gifMatch = m.text?.match(gifRx);
              return (
                <div key={m.id} style={{display:'flex',justifyContent:mine?'flex-end':'flex-start'}}>
                  {gifMatch ? (
                    <div style={{maxWidth:'78%',borderRadius:mine?'14px 14px 4px 14px':'14px 14px 14px 4px',overflow:'hidden',border:`1px solid ${mine?'rgba(59,130,246,0.3)':'rgba(255,255,255,0.08)'}`}}>
                      <img src={gifMatch[0]} alt="gif" style={{maxWidth:'220px',maxHeight:'200px',display:'block'}} onError={e=>e.target.parentElement.innerHTML='<div style="padding:0.5rem;color:#EF4444;font-size:0.75rem">⚠️ GIF yüklenemedi</div>'}/>
                      <div style={{fontSize:'0.55rem',color:'#3B4E63',padding:'2px 6px',textAlign:mine?'right':'left'}}>{new Date(m.ts).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  ) : (
                    <div style={{maxWidth:'78%',padding:'0.55rem 0.85rem',borderRadius:mine?'14px 14px 4px 14px':'14px 14px 14px 4px',background:mine?'rgba(59,130,246,0.22)':'rgba(255,255,255,0.06)',border:`1px solid ${mine?'rgba(59,130,246,0.35)':'rgba(255,255,255,0.08)'}`,color:'#E8EDF2',fontSize:'0.85rem',lineHeight:1.45}}>
                      {m.text}
                      <div style={{fontSize:'0.58rem',color:'#3B4E63',marginTop:'0.2rem',textAlign:mine?'right':'left'}}>{new Date(m.ts).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={msgsEndRef}/>
          </div>

          {/* GIF Picker - DM */}
          {showGifPicker && (
            <div style={{background:'rgba(6,12,24,0.98)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'14px',padding:'0.6rem',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem'}}>
                <input value={gifSearch} onChange={e=>setGifSearch(e.target.value)} placeholder="GIF ara..."
                  style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:'10px',padding:'0.4rem 0.7rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none'}} />
                <button onClick={()=>setShowGifPicker(false)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',padding:'0.4rem 0.55rem',color:'#5A7089',cursor:'pointer',fontSize:'0.8rem'}}>✕</button>
              </div>
              {giphyLoading && <div style={{textAlign:'center',color:'#60A5FA',fontSize:'0.72rem'}}>🔄 Yükleniyor...</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.3rem',maxHeight:'140px',overflowY:'auto',scrollbarWidth:'none'}}>
                {dmDisplayGifs.map((g,i)=>(
                  <img key={i} src={g} alt="gif" onClick={()=>sendMessage(g)}
                    style={{height:'64px',width:'100%',objectFit:'cover',borderRadius:'7px',cursor:'pointer',border:'1px solid rgba(59,130,246,0.15)'}}
                    onError={e=>e.target.style.display='none'} />
                ))}
              </div>
              <div style={{fontSize:'0.54rem',color:'#3B4E63',textAlign:'right',marginTop:'0.2rem'}}>Powered by GIPHY</div>
            </div>
          )}

          <div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={()=>setShowGifPicker(v=>!v)}
              style={{background:showGifPicker?'rgba(59,130,246,0.18)':'rgba(255,255,255,0.04)',border:`1px solid ${showGifPicker?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'12px',padding:'0.6rem 0.65rem',color:showGifPicker?'#60A5FA':'#8BA0B5',cursor:'pointer',fontSize:'0.95rem',flexShrink:0}}>
              🎞️
            </button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Mesaj yaz..."
              style={{flex:1,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0.65rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none'}} />
            <button onClick={()=>sendMessage()} style={{padding:'0.65rem 1rem',background:'rgba(59,130,246,0.2)',border:'1px solid rgba(59,130,246,0.35)',borderRadius:'12px',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontSize:'1rem',fontFamily:'inherit',flexShrink:0}}>➤</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{background:'linear-gradient(135deg,rgba(96,165,250,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(96,165,250,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.3rem'}}>📬</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#E8EDF2'}}>ÖZEL MESAJLAR</div>
            {totalUnread>0 && <div style={{background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'20px',padding:'0.2rem 0.75rem',display:'inline-block',fontSize:'0.72rem',color:'#60A5FA',marginTop:'0.3rem',fontWeight:700}}>{totalUnread} okunmamış</div>}
          </div>
          {contacts.length===0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz başka oyuncu yok.</div>}
          {contacts.map(user=>{
            const lastMsg = getConvMsgs(user.id).slice(-1)[0];
            const u = unread(user.id);
            return (
              <button key={user.id} onClick={()=>openConv(user)}
                style={{width:'100%',display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.8rem',background:u?'rgba(59,130,246,0.07)':'rgba(255,255,255,0.03)',border:`1px solid ${u?'rgba(59,130,246,0.25)':'rgba(255,255,255,0.06)'}`,borderRadius:'13px',cursor:'pointer',marginBottom:'0.35rem',textAlign:'left',fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'linear-gradient(135deg,#3B82F6,#6366F1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.15rem',flexShrink:0}}>{user.gender==='kadin'?'👩':'👨'}</div>
                <div style={{flex:1,overflow:'hidden'}}>
                  <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.88rem'}}>{user.username}</div>
                  <div style={{fontSize:'0.68rem',color:'#5A7089',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lastMsg?lastMsg.text:'Mesajlaşmaya başla...'}</div>
                </div>
                {u>0 && <div style={{background:'#3B82F6',borderRadius:'50%',minWidth:'22px',height:'22px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:800,color:'#fff',flexShrink:0,padding:'0 4px'}}>{u}</div>}
                <span style={{color:'#3B4E63',flexShrink:0}}>›</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// VERGİ & BELEDİYE SAYFASI
// ═══════════════════════════════════════════════════════
function TaxMunicipalityPage({ profile, setProfile, showNotif }) {
  const cu = profile || {};
  const userCity = cu.city || 'İstanbul';
  const citySlug = userCity.toLowerCase().replace(/\s/g,'_').replace(/[^a-z0-9_]/g,'');
  const [treasury, setTreasury] = useLs(`cityTreasury_${citySlug}`, {balance:2500000, lastCollected:0});
  const [services, setServices] = useLs(`cityServices_${citySlug}`, {
    park:     {level:1, name:'Parklar',   icon:'🌳', cost:500000,  effect:'Mutluluk +5%'},
    hospital: {level:0, name:'Hastane',   icon:'🏥', cost:2000000, effect:'Sağlık +15%'},
    school:   {level:1, name:'Okullar',   icon:'🏫', cost:800000,  effect:'Eğitim +10%'},
    road:     {level:2, name:'Yollar',    icon:'🛣️', cost:300000,  effect:'Ulaşım +8%'},
    market:   {level:1, name:'Çarşı',     icon:'🏪', cost:400000,  effect:'Ticaret +5%'},
    police:   {level:1, name:'Emniyet',   icon:'🚔', cost:600000,  effect:'Güvenlik +10%'},
  });
  const [taxRate, setTaxRate] = useLs(`cityTaxRate_${citySlug}`, 22);
  const [taxLog, setTaxLog] = useLs(`cityTaxLog_${citySlug}`, []);
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),5000);return()=>clearInterval(t);},[]);
  // Belediye başkanı tespiti: aynı şehirdeki belediye başkanı pozisyonlu kullanıcı
  const allUsersRaw = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
  const cityMayor = allUsersRaw.find(u=>u.city===userCity&&(u.position==='Belediye Başkanı'||u.positions?.includes('belediye')));
  const isMayor = cu.role==='admin' || (cityMayor && cityMayor.id===cu.id) || cu.position==='Belediye Başkanı';
  const isCouncil = isMayor;
  const taxCD = 4*3600000;
  const canCollect = isMayor && (now - (treasury.lastCollected||0)) >= taxCD;
  const rem = Math.max(0, (treasury.lastCollected||0) + taxCD - now);
  const remH = Math.floor(rem/3600000); const remM = Math.floor((rem%3600000)/60000);

  const collectTaxes = () => {
    if (!canCollect) { showNotif('Henüz vergi toplanamaz', 'error'); return; }
    const allUsers = (()=>{try{return JSON.parse(localStorage.getItem('rep_users')||'[]');}catch{return[];}})();
    const cityResidents = allUsers.filter(u=>!u.banned && (u.city===userCity || cu.role==='admin'));
    const collected = cityResidents.reduce((s,u)=>s+Math.floor((u.money||0)*taxRate/100), 0);
    const cityShare = Math.floor(collected * 0.6);
    setTreasury(prev=>({...prev, balance:(prev.balance||0)+cityShare, lastCollected:Date.now()}));
    setTaxLog(prev=>[{id:Date.now(), amount:cityShare, date:new Date().toLocaleDateString('tr-TR'), collector:cu.username, rate:taxRate}, ...prev].slice(0,20));
    showNotif(`🏛️ Vergi toplandı! Hazineye: ${fmtM(cityShare)}`, 'success');
  };

  const upgradeService = (key) => {
    const svc = services[key];
    const cost = svc.cost * (svc.level+1);
    if (!isCouncil) { showNotif('Meclis üyesi veya başkan yetkisi gerekli', 'error'); return; }
    if ((treasury.balance||0) < cost) { showNotif(`Hazine yetersiz (${fmtM(cost)} gerekli)`, 'error'); return; }
    setServices(prev=>({...prev, [key]:{...svc, level:svc.level+1}}));
    setTreasury(prev=>({...prev, balance:prev.balance-cost}));
    showNotif(`✅ ${svc.name} Seviye ${svc.level+1}'e yükseltildi!`, 'success');
  };

  return (
    <div style={{padding:'0.7rem',paddingBottom:'5rem'}}>
      <div style={{background:'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(11,21,39,0.97))',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#F59E0B',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>🏙️ {userCity.toUpperCase()} — ŞEHİR YÖNETİMİ</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#E8EDF2',marginBottom:'0.1rem'}}>Vergi & Belediye</div>
        <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{isMayor ? '👑 Belediye Başkanı olarak yönetiyorsunuz' : 'Hizmetleri görüntüleyin — yönetim için Belediye Başkanı gerekli'}</div>
        {cityMayor && <div style={{marginTop:'0.4rem',fontSize:'0.65rem',color:'#F59E0B'}}>Belediye Başkanı: <span style={{fontWeight:700}}>@{cityMayor.username}</span></div>}
      </div>

      {/* Hazine */}
      <div style={{background:'rgba(245,158,11,0.07)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'14px',padding:'0.9rem',marginBottom:'0.6rem'}}>
        <div style={{fontSize:'0.62rem',color:'#F59E0B',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>🏦 ŞEHİR HAZİNESİ</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1.6rem',fontWeight:800,color:'#F59E0B',marginBottom:'0.35rem'}}>{fmtM(treasury.balance||0)}</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem'}}>
          <div style={{fontSize:'0.72rem',color:'#5A7089'}}>Vergi Oranı: <span style={{color:'#F59E0B',fontWeight:700}}>%{taxRate}</span></div>
          {isMayor ? (
            <button onClick={collectTaxes} disabled={!canCollect}
              style={{padding:'0.35rem 0.85rem',borderRadius:'9px',border:`1px solid ${canCollect?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.06)'}`,background:canCollect?'rgba(245,158,11,0.15)':'rgba(255,255,255,0.03)',color:canCollect?'#F59E0B':'#3B4E63',cursor:canCollect?'pointer':'default',fontWeight:700,fontSize:'0.75rem',fontFamily:'inherit'}}>
              {canCollect ? '💰 Vergi Topla' : `⏳ ${remH}s ${remM}dk`}
            </button>
          ) : (
            <div style={{fontSize:'0.65rem',color:'#3B4E63'}}>🔒 Belediye Başkanı yetkisi gerekli</div>
          )}
        </div>
      </div>

      {/* Vergi oranı slider */}
      {isMayor && (
        <div style={{background:'rgba(11,21,39,0.9)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'0.75rem',marginBottom:'0.6rem'}}>
          <div style={{fontSize:'0.62rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',marginBottom:'0.5rem'}}>📊 VERGİ ORANI: %{taxRate}</div>
          <input type="range" min={5} max={50} value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))}
            style={{width:'100%',marginBottom:'0.25rem',accentColor:'#F59E0B'}} />
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.62rem',color:'#3B4E63'}}>
            <span>%5 Düşük</span><span>%50 Yüksek</span>
          </div>
        </div>
      )}

      {/* Şehir hizmetleri */}
      <div style={{fontSize:'0.62rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>🏙️ ŞEHİR HİZMETLERİ</div>
      {Object.entries(services).map(([key, svc]) => {
        const upgCost = svc.cost * (svc.level+1);
        const canUpg = isCouncil && (treasury.balance||0) >= upgCost;
        const stars = Math.min(svc.level, 5);
        return (
          <div key={key} style={{background:'rgba(11,21,39,0.9)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'0.75rem',marginBottom:'0.35rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{fontSize:'1.6rem',flexShrink:0}}>{svc.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.85rem'}}>{svc.name}</div>
              <div style={{fontSize:'0.63rem',color:'#5A7089'}}>{svc.effect}</div>
              <div style={{display:'flex',gap:'1px',marginTop:'0.2rem'}}>
                {[...Array(5)].map((_,i)=><span key={i} style={{fontSize:'0.65rem',color:i<stars?'#F59E0B':'#3B4E63'}}>★</span>)}
                <span style={{fontSize:'0.6rem',color:'#5A7089',marginLeft:'4px'}}>Lv.{svc.level}</span>
              </div>
            </div>
            <button onClick={()=>upgradeService(key)}
              style={{padding:'0.3rem 0.6rem',borderRadius:'8px',border:`1px solid ${canUpg?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.06)'}`,background:canUpg?'rgba(245,158,11,0.12)':'rgba(255,255,255,0.03)',color:canUpg?'#F59E0B':'#3B4E63',cursor:canUpg?'pointer':'default',fontSize:'0.65rem',fontWeight:700,fontFamily:'inherit',flexShrink:0,whiteSpace:'nowrap'}}>
              {canUpg ? `↑ ${fmtM(upgCost)}` : '🔒'}
            </button>
          </div>
        );
      })}

      {/* Vergi geçmişi */}
      {taxLog.length > 0 && (
        <div style={{marginTop:'0.6rem'}}>
          <div style={{fontSize:'0.62rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.4rem'}}>📋 VERGİ GEÇMİŞİ</div>
          {taxLog.slice(0,5).map(log=>(
            <div key={log.id} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.73rem'}}>
              <span style={{color:'#5A7089'}}>{log.date} · %{log.rate} · {log.collector}</span>
              <span style={{color:'#F59E0B',fontWeight:700}}>+{fmtM(log.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Maliye Bakanlığı Destek Talebi */}
      {isMayor && (
        <div style={{marginTop:'0.75rem',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'14px',padding:'0.9rem'}}>
          <div style={{fontSize:'0.62rem',color:'#10B981',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.5rem'}}>🏦 MALİYE BAKANLIĞI — HAZİNE TALEBİ</div>
          <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.6rem'}}>
            Şehir geliştirme projeleri için Maliye Bakanlığı'ndan ek kaynak talep edebilirsiniz. Maliye Bakanı talebi inceleyip onaylayabilir.
          </div>
          {(()=>{
            const reqs = JSON.parse(localStorage.getItem('rep_treasuryRequests')||'[]');
            const pending = reqs.filter(r=>r.city===userCity&&r.status==='bekliyor');
            if(pending.length>0){
              return <div style={{fontSize:'0.72rem',color:'#F59E0B',padding:'0.5rem',background:'rgba(245,158,11,0.08)',borderRadius:'8px'}}>⏳ {pending.length} adet onay bekleyen talebiniz var.</div>;
            }
            return (
              <button onClick={()=>{
                const amt = prompt('Talep edilecek tutar (₱):');
                const reason = prompt('Talep sebebi (şehir geliştirme projesi):');
                if(!amt || !reason) return;
                const v = parseInt(amt);
                if(isNaN(v)||v<=0){showNotif('Geçersiz tutar','error');return;}
                const reqs2 = JSON.parse(localStorage.getItem('rep_treasuryRequests')||'[]');
                reqs2.unshift({id:Date.now(),city:userCity,mayor:cu.username,amount:v,reason,status:'bekliyor',date:new Date().toLocaleString('tr-TR')});
                localStorage.setItem('rep_treasuryRequests',JSON.stringify(reqs2.slice(0,50)));
                showNotif('✅ Maliye Bakanlığı\'na talep iletildi!','success');
              }} style={{width:'100%',padding:'0.55rem',borderRadius:'10px',border:'1px solid rgba(16,185,129,0.35)',background:'rgba(16,185,129,0.1)',color:'#10B981',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
                💰 Maliye'den Para Talep Et
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HARİTA / BÖLGE SAYFASI
// ═══════════════════════════════════════════════════════
function TerritoryMapPage({ profile, showNotif }) {
  const [districts] = useLs('rep_districts', DEFAULT_DISTRICTS);
  const [mapMode, setMapMode] = useState('political');
  const [selected, setSelected] = useState(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);
  const dragRef = useRef(null);
  const touchRef = useRef(null);
  const pinchRef = useRef(null);
  const velRef = useRef({x:0, y:0});
  const rafRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const lastPosRef = useRef(null);

  const MAP_MODES = [
    {id:'political',label:'⚖️ Siyasi'}, {id:'crime',label:'🔪 Suç'},
    {id:'police',label:'👮 Polis'}, {id:'economic',label:'💰 Ekonomi'}, {id:'revolt',label:'🔥 İsyan'},
  ];

  const getColor = (d, mode) => {
    const a = 0.70;
    if (mode==='political') {
      if (d.controlBy==='Ordu') return `rgba(239,68,68,${a})`;
      if (d.controlBy==='Şirketler') return `rgba(16,185,129,${a})`;
      if (d.controlBy==='Aydınlar') return `rgba(59,130,246,${a})`;
      if (d.controlBy==='Tüccarlar') return `rgba(234,179,8,${a})`;
      if (d.controlBy==='Asi Grup') return `rgba(245,158,11,${a})`;
      return `rgba(55,65,81,${a})`;
    }
    if (mode==='crime') {
      if (d.crime>70) return `rgba(239,68,68,${a})`;
      if (d.crime>50) return `rgba(245,158,11,${a})`;
      if (d.crime>30) return `rgba(234,179,8,${a*0.75})`;
      return `rgba(16,185,129,${a})`;
    }
    if (mode==='police') {
      if (d.alarm>65) return `rgba(59,130,246,${a})`;
      if (d.alarm>40) return `rgba(96,165,250,${a*0.7})`;
      return `rgba(30,58,138,${a*0.45})`;
    }
    if (mode==='economic') {
      if (d.income>150000) return `rgba(16,185,129,${a})`;
      if (d.income>80000)  return `rgba(234,179,8,${a})`;
      if (d.income>50000)  return `rgba(245,158,11,${a*0.8})`;
      return `rgba(239,68,68,${a*0.65})`;
    }
    if (mode==='revolt') {
      const risk = (100-d.support)*0.6 + d.crime*0.4;
      if (risk>60) return `rgba(239,68,68,${a})`;
      if (risk>40) return `rgba(245,158,11,${a})`;
      return `rgba(16,185,129,${a})`;
    }
    return `rgba(55,65,81,${a})`;
  };

  const onTouchStart = React.useCallback((e) => {
    e.preventDefault();
    cancelAnimationFrame(rafRef.current);
    velRef.current = {x:0, y:0};
    if (e.touches.length===1) {
      touchRef.current = {x:e.touches[0].clientX, y:e.touches[0].clientY, t:Date.now()};
      lastPosRef.current = {x:e.touches[0].clientX, y:e.touches[0].clientY};
      setDragging(false);
    } else if (e.touches.length===2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchRef.current = Math.sqrt(dx*dx+dy*dy);
    }
  }, []);

  const onTouchMove = React.useCallback((e) => {
    e.preventDefault();
    if (e.touches.length===1 && touchRef.current) {
      const dx=e.touches[0].clientX-touchRef.current.x, dy=e.touches[0].clientY-touchRef.current.y;
      if (Math.abs(dx)>5||Math.abs(dy)>5) setDragging(true);
      const dt=Math.max(1,Date.now()-touchRef.current.t);
      velRef.current = {x:(dx/dt)*14, y:(dy/dt)*14};
      setTx(p=>p+dx); setTy(p=>p+dy);
      touchRef.current = {x:e.touches[0].clientX, y:e.touches[0].clientY, t:Date.now()};
    } else if (e.touches.length===2 && pinchRef.current) {
      const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
      const d=Math.sqrt(dx*dx+dy*dy);
      setScale(p=>Math.min(3, Math.max(0.4, p*(d/pinchRef.current))));
      pinchRef.current=d;
    }
  }, []);

  const onTouchEnd = React.useCallback(() => {
    const inertia = () => {
      velRef.current = {x:velRef.current.x*0.88, y:velRef.current.y*0.88};
      if (Math.abs(velRef.current.x)>0.5||Math.abs(velRef.current.y)>0.5) {
        setTx(p=>p+velRef.current.x); setTy(p=>p+velRef.current.y);
        rafRef.current = requestAnimationFrame(inertia);
      } else { setDragging(false); }
    };
    rafRef.current = requestAnimationFrame(inertia);
    touchRef.current=null;
  }, []);

  const onMouseDown = React.useCallback((e) => {
    dragRef.current = {x:e.clientX, y:e.clientY, moved:false};
  }, []);
  const onMouseMove = React.useCallback((e) => {
    if (!dragRef.current) return;
    const dx=e.clientX-dragRef.current.x, dy=e.clientY-dragRef.current.y;
    if (Math.abs(dx)>4||Math.abs(dy)>4) { dragRef.current.moved=true; setDragging(true); }
    setTx(p=>p+dx); setTy(p=>p+dy);
    dragRef.current = {...dragRef.current, x:e.clientX, y:e.clientY};
  }, []);
  const onMouseUp = React.useCallback(() => { dragRef.current=null; }, []);
  const onWheel = React.useCallback((e) => {
    e.preventDefault();
    setScale(p=>Math.min(3, Math.max(0.4, p*(e.deltaY>0?0.88:1.13))));
  }, []);

  const clickDistrict = React.useCallback((d, e) => {
    e.stopPropagation();
    if (!dragRef.current?.moved) setSelected(d);
  }, []);

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const LEGEND = {
    political:[['#6B7280','Halk'],['#EF4444','Ordu/Güç'],['#10B981','Şirket'],['#3B82F6','Aydınlar'],['#EAB308','Tüccarlar'],['#F59E0B','İsyancı']],
    crime:[['#10B981','Düşük <30'],['#EAB308','Orta 30-50'],['#F59E0B','Yüksek 50-70'],['#EF4444','Kritik >70']],
    police:[['#1E3A8A','Güvenli'],['#60A5FA','Devriye'],['#3B82F6','Yüksek Alarm']],
    economic:[['#EF4444','Düşük <50K'],['#F59E0B','Orta 50-80K'],['#EAB308','İyi 80-150K'],['#10B981','Zengin >150K']],
    revolt:[['#10B981','Stabil'],['#F59E0B','Gergin'],['#EF4444','İsyan Riski']],
  };

  return (
    <div style={{position:'relative',width:'100%',height:'calc(100dvh - 120px)',background:'#020912',overflow:'hidden',userSelect:'none'}}>
      {/* Mode Bar */}
      <div style={{position:'absolute',top:0,left:0,right:0,zIndex:20,display:'flex',gap:'4px',padding:'0.4rem 0.5rem',background:'rgba(2,9,18,0.96)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(0,255,80,0.08)',overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
        {MAP_MODES.map(m=>(
          <button key={m.id} onClick={()=>setMapMode(m.id)} style={{padding:'0.28rem 0.55rem',borderRadius:'8px',border:`1px solid ${mapMode===m.id?'rgba(0,255,80,0.5)':'rgba(255,255,255,0.06)'}`,background:mapMode===m.id?'rgba(0,255,80,0.1)':'rgba(255,255,255,0.02)',color:mapMode===m.id?'#00FF64':'#1A3028',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.64rem',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            {m.label}
          </button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={()=>{setTx(0);setTy(0);setScale(1);}} title="Sıfırla" style={{padding:'0.28rem 0.55rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)',color:'#1A3028',fontSize:'0.78rem',cursor:'pointer',flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>⊡</button>
      </div>

      {/* SVG Map */}
      <svg
        style={{position:'absolute',left:0,right:0,bottom:0,top:'37px',width:'100%',height:'calc(100% - 37px)',touchAction:'none',cursor:dragging?'grabbing':'grab'}}
        viewBox="0 0 360 480" preserveAspectRatio="xMidYMid meet"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <defs>
          <filter id="dGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="dGlowSm"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <pattern id="mGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="rgba(0,255,80,0.035)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <g transform={`translate(${tx},${ty}) scale(${scale})`}>
          <rect width="360" height="480" fill="#030F1B"/>
          <rect width="360" height="480" fill="url(#mGrid)"/>
          {/* district border lines for atmosphere */}
          {[60,120,180,240,300].map(y=><line key={y} x1="0" y1={y} x2="360" y2={y} stroke="rgba(0,100,50,0.06)" strokeWidth="0.5"/>)}
          {[90,180,270].map(x=><line key={x} x1={x} y1="0" x2={x} y2="480" stroke="rgba(0,100,50,0.06)" strokeWidth="0.5"/>)}

          {districts.map(d => {
            const pts = DISTRICT_POLYGONS[d.id];
            if (!pts) return null;
            const fill = getColor(d, mapMode);
            const isSel = selected?.id===d.id;
            const hasRiot = d.conflicts?.includes('riot');
            const hasCartel = d.conflicts?.includes('cartel');
            const hasPoliceDeploy = d.conflicts?.includes('police');
            const ctr = getCentroid(pts);
            return (
              <g key={d.id} onClick={(e)=>clickDistrict(d,e)} style={{cursor:'pointer'}}>
                <polygon points={pts} fill={fill}
                  stroke={isSel?'#00FF64':hasRiot?'rgba(239,68,68,0.7)':hasCartel?'rgba(245,158,11,0.5)':'rgba(0,180,60,0.22)'}
                  strokeWidth={isSel?2.5:1}
                  filter={isSel?'url(#dGlow)':undefined}
                />
                {isSel && <polygon points={pts} fill="rgba(0,255,80,0.07)" stroke="none"/>}
                {(hasRiot||hasCartel) && (
                  <polygon points={pts} fill="none" stroke={hasRiot?'rgba(239,68,68,0.7)':'rgba(245,158,11,0.6)'} strokeWidth="1.5">
                    <animate attributeName="stroke-opacity" values="0.15;0.9;0.15" dur="1.3s" repeatCount="indefinite"/>
                  </polygon>
                )}
                {hasPoliceDeploy && !hasRiot && (
                  <polygon points={pts} fill="rgba(59,130,246,0.08)" stroke="none">
                    <animate attributeName="fill-opacity" values="0.04;0.18;0.04" dur="2s" repeatCount="indefinite"/>
                  </polygon>
                )}
                <text x={ctr.x} y={ctr.y-1} textAnchor="middle" dominantBaseline="middle"
                  fill={isSel?'#00FF64':'rgba(190,225,230,0.88)'} fontSize="8.5" fontWeight="700"
                  fontFamily="DM Sans,sans-serif" style={{pointerEvents:'none',textShadow:'0 1px 3px #000'}}>
                  {d.name}
                </text>
                {isSel && <circle cx={ctr.x} cy={ctr.y+11} r="2.2" fill="#00FF64" filter="url(#dGlowSm)"><animate attributeName="r" values="1.5;3.5;1.5" dur="1s" repeatCount="indefinite"/></circle>}
                {(hasRiot||hasCartel) && !isSel && <text x={ctr.x+12} y={ctr.y-8} fontSize="8" style={{pointerEvents:'none'}}>{hasRiot?'🔥':hasCartel?'💀':''}</text>}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend overlay */}
      <div style={{position:'absolute',top:'45px',right:'6px',zIndex:15,background:'rgba(2,9,18,0.9)',backdropFilter:'blur(8px)',border:'1px solid rgba(0,255,80,0.1)',borderRadius:'8px',padding:'0.4rem 0.5rem',maxWidth:'88px',pointerEvents:'none'}}>
        <div style={{fontSize:'0.48rem',color:'#0A3020',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'3px'}}>Lejant</div>
        {(LEGEND[mapMode]||[]).map(([c,l])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'2px'}}>
            <div style={{width:'7px',height:'7px',borderRadius:'2px',background:c,flexShrink:0,boxShadow:`0 0 4px ${c}80`}}/>
            <span style={{fontSize:'0.48rem',color:'#1A4030',lineHeight:1.3}}>{l}</span>
          </div>
        ))}
      </div>

      {/* Selected district detail panel */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:'absolute',inset:0,zIndex:30,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(3px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(3,12,24,0.99)',backdropFilter:'blur(24px)',border:'1px solid rgba(0,255,80,0.18)',borderBottom:'none',borderRadius:'22px 22px 0 0',padding:'1rem',boxShadow:'0 -30px 80px rgba(0,0,0,0.65)',maxHeight:'70vh',overflowY:'auto',animation:'slideUp 0.22s ease'}}>
            <div style={{width:'32px',height:'3px',borderRadius:'2px',background:'rgba(255,255,255,0.08)',margin:'0 auto 0.7rem'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.7rem'}}>
              <div>
                <div style={{fontWeight:900,color:'#00FF64',fontSize:'1.05rem',fontFamily:"'Syne',sans-serif",textShadow:'0 0 12px rgba(0,255,80,0.5)',marginBottom:'0.12rem'}}>{selected.name}</div>
                <div style={{display:'flex',gap:'0.35rem',alignItems:'center'}}>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',background:selected.controlColor||'#6B7280',boxShadow:`0 0 5px ${selected.controlColor}`}}/>
                  <span style={{fontSize:'0.66rem',color:'#2A4A3A'}}>{selected.controlBy} • {(selected.population||0).toLocaleString('tr-TR')} nüfus</span>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'50%',width:'26px',height:'26px',color:'#2A4A3A',cursor:'pointer',fontSize:'0.8rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.35rem',marginBottom:'0.6rem'}}>
              {[
                ['💰','Yasal Gelir',fmtWord(selected.legalIncome||0),'#10B981'],
                ['🌑','Yeraltı',fmtWord(selected.illegalIncome||0),'#EF4444'],
                ['🔪','Suç Oranı',`%${selected.crime}`,'#F59E0B'],
                ['👮','Alarm Seviyesi',`%${selected.alarm}`,'#3B82F6'],
                ['❤️','Halk Desteği',`%${selected.support}`,'#EC4899'],
                ['⚡','Nüfuz Puanı',`%${selected.influence}`,'#8B5CF6'],
              ].map(([ic,lb,v,c])=>(
                <div key={lb} style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'10px',padding:'0.45rem 0.5rem'}}>
                  <div style={{fontSize:'0.53rem',color:'#0A2A1A',textTransform:'uppercase',marginBottom:'1px'}}>{ic} {lb}</div>
                  <div style={{fontWeight:800,color:c,fontSize:'0.82rem',fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                </div>
              ))}
            </div>
            {selected.conflicts?.length>0 && (
              <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:'8px',padding:'0.5rem',marginBottom:'0.5rem'}}>
                <div style={{fontSize:'0.65rem',fontWeight:800,color:'#FCA5A5',marginBottom:'0.2rem'}}>⚡ Aktif Olaylar</div>
                <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
                  {selected.conflicts.map(c=>(
                    <span key={c} style={{padding:'2px 6px',borderRadius:'6px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.2)',color:'#FCA5A5',fontSize:'0.65rem',fontWeight:700}}>
                      {c==='riot'?'🔥 İsyan':c==='cartel'?'💀 Kartel':c==='police'?'👮 Operasyon':'⚡ '+c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {[['Halk Desteği',selected.support,'#EC4899'],['Güvenlik Skoru',100-selected.alarm,'#3B82F6'],['Ekonomik Güç',Math.min(100,Math.round((selected.income||0)/3000)),'#10B981']].map(([lb,v,c])=>(
              <div key={lb} style={{marginBottom:'0.28rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.55rem',color:'#0A2A1A',marginBottom:'2px'}}><span>{lb}</span><span>{v}%</span></div>
                <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px'}}>
                  <div style={{height:'100%',width:`${v}%`,background:`linear-gradient(90deg,${c}80,${c})`,borderRadius:'2px',transition:'width 0.5s'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selected && (
        <div style={{position:'absolute',bottom:'10px',left:'50%',transform:'translateX(-50%)',background:'rgba(2,9,18,0.85)',backdropFilter:'blur(8px)',border:'1px solid rgba(0,255,80,0.1)',borderRadius:'20px',padding:'0.28rem 0.85rem',fontSize:'0.6rem',color:'#0A3020',fontWeight:700,zIndex:10,pointerEvents:'none',whiteSpace:'nowrap'}}>
          👆 Bölgeye dokun → Detay &nbsp;•&nbsp; 🤏 Sıkıştır → Zoom
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GÜNLÜK GÖREVLER SAYFASI
// ═══════════════════════════════════════════════════════
const DAILY_TASK_DEFS = [
  { id:'login',       icon:'🔑', title:'Günlük Giriş',          desc:'Oyuna giriş yap',                    reward:{money:5000,  xp:50,  uc:1},  auto:true },
  { id:'job5',        icon:'💼', title:'5 İş Tamamla',           desc:'Herhangi bir iş 5 kez yap',          reward:{money:15000, xp:100, uc:2},  target:5,  key:'dailyJobCount' },
  { id:'chat1',       icon:'💬', title:'Sohbet Et',              desc:'Sohbet sayfasında mesaj gönder',     reward:{money:3000,  xp:30,  uc:1},  target:1,  key:'dailyChatCount' },
  { id:'farm1',       icon:'🌾', title:'Tarım Hasatı',           desc:'Tarımda hasat yap',                  reward:{money:8000,  xp:60,  uc:1},  target:1,  key:'dailyFarmCount' },
  { id:'trade1',      icon:'🌍', title:'Ticaret Rotası',         desc:'Dış ticaret rotası başlat',          reward:{money:20000, xp:120, uc:3},  target:1,  key:'dailyTradeCount' },
  { id:'mine1',       icon:'⛏️', title:'Maden Çıkar',           desc:'Madende bir kez kazan',              reward:{money:10000, xp:80,  uc:2},  target:1,  key:'dailyMineCount' },
  { id:'vote1',       icon:'🗳️', title:'Siyasi Katılım',        desc:'Siyasette oy kullan veya başvur',    reward:{money:6000,  xp:50,  uc:1},  target:1,  key:'dailyVoteCount' },
  { id:'pvp1',        icon:'⚔️', title:'Dövüş Yap',             desc:'PvP sayfasında bir dövüş yap',       reward:{money:25000, xp:200, uc:4},  target:1,  key:'dailyPvpCount' },
  { id:'news1',       icon:'📰', title:'Haber Oku',              desc:'Gazete sayfasını ziyaret et',        reward:{money:2000,  xp:20,  uc:0},  auto:true },
  { id:'edu1',        icon:'🎓', title:'Eğitime Devam Et',       desc:'Eğitim sayfasında tıklama yap',     reward:{money:5000,  xp:75,  uc:1},  target:1,  key:'dailyEduCount' },
];

function DailyTasksPage({ profile, setProfile, showNotif, onNavigate }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const today = new Date().toDateString();
  const [dailyState, setDailyState] = useLs('dailyTaskState', {});
  const [claimed, setClaimed] = useLs('dailyTasksClaimed', {});

  const dayKey = `day_${today}`;
  const todayClaimed = claimed[dayKey] || {};
  const todayProgress = dailyState[dayKey] || {};

  const getProgress = (task) => {
    if (task.auto) return 1;
    return Math.min(task.target, todayProgress[task.key] || 0);
  };

  const isComplete = (task) => getProgress(task) >= (task.target || 1);
  const isClaimed = (task) => !!todayClaimed[task.id];

  const claimTask = (task) => {
    if (!isComplete(task)) { showNotif('Görev henüz tamamlanmadı!', 'error'); return; }
    if (isClaimed(task)) { showNotif('Bu görev zaten alındı!', 'error'); return; }
    setClaimed(prev => ({...prev, [dayKey]:{...(prev[dayKey]||{}), [task.id]:true}}));
    setProfile(p => {
      const np = {...p,
        money:(p.money||0)+(task.reward.money||0),
        xp:(p.xp||0)+(task.reward.xp||0),
        underCoin:(p.underCoin||0)+(task.reward.uc||0)
      };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    showNotif(`✅ ${task.title} ödülü: +${fmtWord(task.reward.money)} +${task.reward.xp}XP${task.reward.uc?` +${task.reward.uc}UC`:''}`, 'success');
  };

  // Otomatik login görevi tamamla + 3 saniyede bir localStorage yenile
  React.useEffect(() => {
    if (!todayProgress['login_done']) {
      setDailyState(prev => ({...prev, [dayKey]:{...(prev[dayKey]||{}), login_done:true}}));
    }
    const refresh = () => {
      try {
        const s = JSON.parse(localStorage.getItem('rep_dailyTaskState') || localStorage.getItem('dailyTaskState') || '{}');
        setDailyState(s);
      } catch(e) {}
    };
    const iv = setInterval(refresh, 3000);
    return () => clearInterval(iv);
  }, []);

  const completedCount = DAILY_TASK_DEFS.filter(t=>isComplete(t)&&isClaimed(t)).length;
  const totalReward = DAILY_TASK_DEFS.reduce((s,t)=>s+(t.reward.money||0),0);

  return (
    <div style={{padding:'1rem', background:bg, minHeight:'100%'}}>
      <div style={{background:'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(11,21,39,0.97))',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#F59E0B',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>📅 GÜNLÜK GÖREVLER</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#E8EDF2',marginBottom:'0.2rem'}}>Her gün yenilenir</div>
        <div style={{fontSize:'0.7rem',color:'#5A7089'}}>
          <span style={{color:'#F59E0B',fontWeight:700}}>{completedCount}/{DAILY_TASK_DEFS.length}</span> görev tamamlandı •
          Toplam ödül: <span style={{color:'#10B981',fontWeight:700}}>{fmtWord(totalReward)}</span>
        </div>
        <div style={{marginTop:'0.6rem',height:'6px',background:'rgba(255,255,255,0.07)',borderRadius:'3px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${(completedCount/DAILY_TASK_DEFS.length)*100}%`,background:'linear-gradient(90deg,#F59E0B,#FBBF24)',borderRadius:'3px',transition:'width 0.4s'}} />
        </div>
      </div>

      {DAILY_TASK_DEFS.map(task => {
        const prog = getProgress(task);
        const target = task.target || 1;
        const done = isComplete(task);
        const got = isClaimed(task);
        const pct = Math.round((prog/target)*100);
        return (
          <div key={task.id} style={{background:got?`rgba(16,185,129,0.05)`:card,border:`1px solid ${got?'rgba(16,185,129,0.25)':done?'rgba(245,158,11,0.3)':border}`,borderRadius:'14px',padding:'0.85rem',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{fontSize:'1.6rem',flexShrink:0}}>{task.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,color:dark?'#E8EDF2':'#1E293B',fontSize:'0.85rem'}}>{task.title}</div>
              <div style={{fontSize:'0.65rem',color:'#5A7089',marginBottom:'0.3rem'}}>{task.desc}</div>
              {!task.auto && (
                <div>
                  <div style={{height:'3px',background:'rgba(255,255,255,0.07)',borderRadius:'2px',overflow:'hidden',marginBottom:'2px'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:done?'#10B981':'#F59E0B',borderRadius:'2px',transition:'width 0.3s'}} />
                  </div>
                  <div style={{fontSize:'0.6rem',color:'#5A7089'}}>{prog}/{target}</div>
                </div>
              )}
              <div style={{fontSize:'0.62rem',color:'#10B981',fontWeight:700,marginTop:'0.2rem'}}>
                +{fmtWord(task.reward.money)} • +{task.reward.xp}XP{task.reward.uc?` • +${task.reward.uc}UC`:''}
              </div>
            </div>
            <button onClick={()=>claimTask(task)} disabled={got||!done}
              style={{padding:'0.4rem 0.7rem',borderRadius:'10px',border:'none',background:got?'rgba(16,185,129,0.15)':done?'linear-gradient(135deg,#F59E0B,#D97706)':'rgba(255,255,255,0.04)',color:got?'#10B981':done?'#000':'#3B4E63',fontWeight:800,fontSize:'0.72rem',cursor:got||!done?'default':'pointer',flexShrink:0}}>
              {got?'✅':'Al'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ULUSLARARASI TİCARET SAYFASI (Ekonomi sekmesi)
// ═══════════════════════════════════════════════════════
const TRADE_ROUTES = [
  { id:'tr_eu',    from:'🇹🇷 Türkiye', to:'🇪🇺 Avrupa',     duration:2*3600000,  cost:50000,   earn:120000, tp:80,  minLevel:3,  goods:'Tekstil, Gıda' },
  { id:'tr_mid',   from:'🇹🇷 Türkiye', to:'🌍 Orta Doğu',   duration:3*3600000,  cost:80000,   earn:200000, tp:130, minLevel:5,  goods:'İnşaat, Enerji' },
  { id:'tr_asia',  from:'🇹🇷 Türkiye', to:'🌏 Asya',         duration:6*3600000,  cost:150000,  earn:420000, tp:250, minLevel:8,  goods:'Makine, Kimya' },
  { id:'tr_us',    from:'🇹🇷 Türkiye', to:'🇺🇸 ABD',         duration:8*3600000,  cost:250000,  earn:700000, tp:400, minLevel:12, goods:'Savunma, Teknoloji' },
  { id:'tr_af',    from:'🇹🇷 Türkiye', to:'🌍 Afrika',        duration:4*3600000,  cost:100000,  earn:280000, tp:180, minLevel:6,  goods:'Gıda, İlaç' },
  { id:'tr_ru',    from:'🇹🇷 Türkiye', to:'🇷🇺 Rusya',        duration:1.5*3600000,cost:40000,   earn:95000,  tp:60,  minLevel:2,  goods:'Turizm, Gıda' },
  { id:'tr_cn',    from:'🇹🇷 Türkiye', to:'🇨🇳 Çin',          duration:10*3600000, cost:400000,  earn:1200000,tp:700, minLevel:18, goods:'Ham Madde, Lojistik' },
];

function IntlTradePage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [activeRoutes, setActiveRoutes] = useLs('intlTradeRoutes', {});
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(()=>setTick(p=>p+1),5000); return ()=>clearInterval(t); }, []);

  const playerLevel = profile?.level || 1;

  const startRoute = (route) => {
    if ((profile?.money||0) < route.cost) { showNotif('Yeterli paran yok!','error'); return; }
    if (playerLevel < route.minLevel) { showNotif(`Seviye ${route.minLevel} gerekli!`,'error'); return; }
    if (activeRoutes[route.id]) { showNotif('Bu rota zaten aktif!','error'); return; }
    setProfile(p => { const np={...p,money:(p.money||0)-route.cost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setActiveRoutes(prev => ({...prev,[route.id]:{startedAt:Date.now(),finishAt:Date.now()+route.duration}}));
    showNotif(`🚢 ${route.to} rotası başlatıldı!`,'success');
    // Günlük görev sayacı
    const today = new Date().toDateString();
    const dk = `day_${today}`;
    try { const s=JSON.parse(localStorage.getItem('dailyTaskState')||'{}'); s[dk]={...(s[dk]||{}),dailyTradeCount:(s[dk]?.dailyTradeCount||0)+1}; localStorage.setItem('dailyTaskState',JSON.stringify(s)); } catch(e){}
  };

  const collectRoute = (route) => {
    const r = activeRoutes[route.id];
    if (!r || Date.now() < r.finishAt) { showNotif('Rota henüz tamamlanmadı!','error'); return; }
    setActiveRoutes(prev => { const n={...prev}; delete n[route.id]; return n; });
    setProfile(p => {
      const np={...p, money:(p.money||0)+route.earn, tradePoints:(p.tradePoints||0)+route.tp, xp:(p.xp||0)+Math.floor(route.tp/2)};
      localStorage.setItem('rep_userProfile',JSON.stringify(np));
      return np;
    });
    showNotif(`✅ ${route.to} rotası tamamlandı! +${fmtWord(route.earn)} +${route.tp}TP`,'success');
  };

  const fmtTime = (ms) => {
    if (ms<=0) return 'Tamamlandı!';
    const h=Math.floor(ms/3600000); const m=Math.floor((ms%3600000)/60000);
    return h>0?`${h}sa ${m}dk`:`${m}dk`;
  };

  return (
    <div>
      <div style={{background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(11,21,39,0.95))',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'14px',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.72rem',color:'#10B981',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>🌍 ULUSLARARASI TİCARET</div>
        <div style={{fontSize:'0.72rem',color:'#5A7089'}}>Ticaret Puanı: <span style={{color:'#06B6D4',fontWeight:700}}>{profile?.tradePoints||0} TP</span> • Her 100 TP → %1 oy katsayısı</div>
      </div>
      {TRADE_ROUTES.map(route => {
        const active = activeRoutes[route.id];
        const locked = playerLevel < route.minLevel;
        const remaining = active ? Math.max(0, active.finishAt - Date.now()) : 0;
        const done = active && remaining === 0;
        const pct = active ? Math.round(((active.duration-(active.finishAt-Date.now()))/active.duration)*100) : 0;
        return (
          <div key={route.id} style={{background:locked?'rgba(255,255,255,0.02)':done?'rgba(16,185,129,0.06)':card,border:`1px solid ${locked?border:done?'rgba(16,185,129,0.3)':active?'rgba(59,130,246,0.25)':border}`,borderRadius:'14px',padding:'0.85rem',marginBottom:'0.5rem',opacity:locked?0.5:1}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.5rem',marginBottom:'0.4rem'}}>
              <div>
                <div style={{fontWeight:800,color:dark?'#E8EDF2':'#1E293B',fontSize:'0.85rem'}}>{route.from} → {route.to}</div>
                <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{route.goods} • Süre: {fmtTime(route.duration)}</div>
                <div style={{fontSize:'0.62rem',color:'#10B981',fontWeight:700,marginTop:'0.2rem'}}>
                  -{fmtWord(route.cost)} • +{fmtWord(route.earn)} • +{route.tp}TP
                </div>
              </div>
              {locked
                ? <span style={{color:'#EF4444',fontSize:'0.7rem',fontWeight:700,flexShrink:0}}>🔒 Lv.{route.minLevel}</span>
                : done
                  ? <button onClick={()=>collectRoute(route)} style={{padding:'0.4rem 0.75rem',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#10B981,#059669)',color:'#fff',fontWeight:800,fontSize:'0.75rem',cursor:'pointer',flexShrink:0}}>Topla!</button>
                  : active
                    ? <span style={{fontSize:'0.68rem',color:'#60A5FA',fontWeight:700,flexShrink:0}}>⏳ {fmtTime(remaining)}</span>
                    : <button onClick={()=>startRoute(route)} style={{padding:'0.4rem 0.75rem',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#fff',fontWeight:800,fontSize:'0.75rem',cursor:'pointer',flexShrink:0}}>Başlat</button>
              }
            </div>
            {active && !done && (
              <div style={{height:'3px',background:'rgba(255,255,255,0.07)',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(100,pct)}%`,background:'linear-gradient(90deg,#3B82F6,#60A5FA)',borderRadius:'2px',transition:'width 5s linear'}} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TURNUVA / ETKİNLİK SAYFASI
// ═══════════════════════════════════════════════════════
const TOURNAMENTS = [
  { id:'wealth',   icon:'💰', title:'Servet Yarışması',      desc:'En fazla para biriktir',       reward:{money:500000, uc:100, xp:2000}, duration:7,  category:'Ekonomi',  key:'money',        type:'highest' },
  { id:'jobs_t',   icon:'💼', title:'Çalışkan Ödülü',        desc:'Bu hafta en fazla iş yap',     reward:{money:200000, uc:50,  xp:1000}, duration:7,  category:'İş',       key:'weeklyJobs',   type:'highest' },
  { id:'trade_t',  icon:'🌍', title:'Ticaret Şampiyonu',     desc:'En yüksek TP toplayan',        reward:{money:300000, uc:75,  xp:1500}, duration:7,  category:'Ticaret',  key:'tradePoints',  type:'highest' },
  { id:'xp_t',     icon:'⭐', title:'XP Ligi',               desc:'En fazla XP toplayan',        reward:{money:150000, uc:40,  xp:3000}, duration:7,  category:'Genel',    key:'xp',           type:'highest' },
  { id:'casino_t', icon:'🎰', title:'Şans Turnuvası',        desc:'En büyük tek oyun kazancı',   reward:{money:1000000,uc:200, xp:5000}, duration:3,  category:'Eğlence',  key:'bigWin',       type:'highest' },
  { id:'pvp_t',    icon:'⚔️', title:'Savaş Ligi',           desc:'En fazla PvP kazancı',        reward:{money:400000, uc:80,  xp:2000}, duration:7,  category:'Dövüş',    key:'pvpWins',      type:'highest' },
];

function TournamentPage({ profile, setProfile, showNotif }) {
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const [allUsers] = useLs('rep_users', []);
  const [tab, setTab] = useState('active');
  const [joined, setJoined] = useLs('tournamentJoined', {});
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(()=>setTick(p=>p+1),10000); return ()=>clearInterval(t); }, []);

  const join = (t) => {
    if (joined[t.id]) { showNotif('Bu turnuvaya zaten katıldın!','error'); return; }
    setJoined(prev=>({...prev,[t.id]:{joinedAt:Date.now(),score:profile?.[t.key]||0}}));
    showNotif(`🎯 ${t.title} turnuvasına katıldın!`,'success');
  };

  const getLeaders = (t) => {
    const players = allUsers.length > 0 ? allUsers : [profile];
    return [...players].sort((a,b)=>(b[t.key]||0)-(a[t.key]||0)).slice(0,5);
  };

  const myRank = (t) => {
    const all = [...allUsers, profile].filter((u,i,arr)=>arr.findIndex(x=>x?.id===u?.id)===i);
    const sorted = all.sort((a,b)=>(b[t.key]||0)-(a[t.key]||0));
    return sorted.findIndex(u=>u?.id===profile?.id)+1;
  };

  const catColor = {Ekonomi:'#10B981',İş:'#3B82F6',Ticaret:'#06B6D4',Genel:'#F59E0B',Eğlence:'#8B5CF6',Dövüş:'#EF4444'};

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(11,21,39,0.97))',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'0.6rem',color:'#EF4444',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.2rem'}}>🎯 TURNUVALAR & ETKİNLİKLER</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#E8EDF2',marginBottom:'0.1rem'}}>Rekabet Et, Kazan</div>
        <div style={{fontSize:'0.7rem',color:'#5A7089'}}>Her hafta yenilenen turnuvalar • Birinci büyük ödül kazanır</div>
      </div>

      <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
        {[['active','⚡ Aktif'],['my','🏆 Katıldıklarım']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{flex:1,padding:'0.5rem',borderRadius:'10px',border:`1px solid ${tab===v?'rgba(239,68,68,0.4)':border}`,background:tab===v?'rgba(239,68,68,0.12)':'transparent',color:tab===v?'#F87171':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>
            {l}
          </button>
        ))}
      </div>

      {TOURNAMENTS.filter(t => tab==='my'?!!joined[t.id]:true).map(t => {
        const isJoined = !!joined[t.id];
        const rank = myRank(t);
        const leaders = getLeaders(t);
        const cc = catColor[t.category]||'#5A7089';
        return (
          <div key={t.id} style={{background:card,border:`1px solid ${isJoined?'rgba(239,68,68,0.25)':border}`,borderRadius:'14px',padding:'0.9rem',marginBottom:'0.6rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'0.5rem'}}>
              <div style={{display:'flex',gap:'0.6rem',alignItems:'center'}}>
                <span style={{fontSize:'1.75rem'}}>{t.icon}</span>
                <div>
                  <div style={{fontWeight:800,color:dark?'#E8EDF2':'#1E293B',fontSize:'0.88rem'}}>{t.title}</div>
                  <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{t.desc}</div>
                  <span style={{fontSize:'0.6rem',fontWeight:700,color:cc,background:`${cc}18`,border:`1px solid ${cc}30`,borderRadius:'6px',padding:'0.1rem 0.4rem'}}>{t.category}</span>
                </div>
              </div>
              <button onClick={()=>join(t)} disabled={isJoined}
                style={{padding:'0.35rem 0.7rem',borderRadius:'9px',border:'none',background:isJoined?'rgba(16,185,129,0.15)':'linear-gradient(135deg,#EF4444,#DC2626)',color:isJoined?'#10B981':'#fff',fontWeight:700,fontSize:'0.72rem',cursor:isJoined?'default':'pointer',flexShrink:0}}>
                {isJoined?'✅ Katıldın':'Katıl'}
              </button>
            </div>

            <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
              {[['💰',fmtWord(t.reward.money)],['💎',`${t.reward.uc}UC`],['⭐',`${t.reward.xp}XP`]].map(([ic,v])=>(
                <div key={ic} style={{flex:1,textAlign:'center',background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'8px',padding:'0.3rem 0'}}>
                  <div style={{fontSize:'0.6rem',color:'#F87171',fontWeight:700}}>{ic} {v}</div>
                </div>
              ))}
            </div>

            {isJoined && (
              <div>
                <div style={{fontSize:'0.65rem',color:'#5A7089',fontWeight:700,marginBottom:'0.3rem'}}>🏆 Liderler ({t.duration} gün)</div>
                {leaders.map((u,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.25rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontSize:'0.7rem',color:i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#5A7089',fontWeight:800,width:'18px'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
                    <span style={{flex:1,fontSize:'0.72rem',color:u?.id===profile?.id?'#60A5FA':'#E8EDF2',fontWeight:u?.id===profile?.id?800:400}}>{u?.username||'?'}</span>
                    <span style={{fontSize:'0.7rem',color:'#10B981',fontWeight:700}}>{fmt(u?.[t.key]||0)}</span>
                  </div>
                ))}
                <div style={{marginTop:'0.35rem',fontSize:'0.65rem',color:'#60A5FA',fontWeight:700}}>Sıran: #{rank}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════
const styleEl = document.createElement('style');
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #E5E7EB; color: #1A2233; font-family: 'DM Sans', sans-serif; overflow: hidden; -webkit-tap-highlight-color: transparent; }
  body.us-dark { color: #E8EDF2 !important; background: #060C18 !important; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 10px; }
  input, select, textarea { -webkit-appearance: none; font-size: 16px !important; }
  button { -webkit-tap-highlight-color: transparent; }
  .bnav { scroll-behavior: smooth; }
  .bnav::-webkit-scrollbar { display: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes notifIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes vipRainbow { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
  @keyframes vipFire { 0%,100%{box-shadow:0 0 8px #FF4500,0 0 16px rgba(255,69,0,0.4)} 50%{box-shadow:0 0 14px #FFD700,0 0 28px rgba(255,215,0,0.5)} }
  @keyframes vipIce { 0%,100%{box-shadow:0 0 8px #00BFFF,0 0 16px rgba(0,191,255,0.4)} 50%{box-shadow:0 0 14px #E0FFFF,0 0 28px rgba(224,255,255,0.6)} }
  @keyframes vipGold { 0%,100%{box-shadow:0 0 8px #FFD700,0 0 16px rgba(255,215,0,0.4)} 50%{box-shadow:0 0 16px #FFA500,0 0 32px rgba(255,165,0,0.5)} }
  @keyframes vipNeon { 0%,100%{box-shadow:0 0 8px #00FF64,0 0 16px rgba(0,255,100,0.4)} 50%{box-shadow:0 0 14px #00FF64,0 0 28px rgba(0,255,100,0.7)} }
  @keyframes vipViolet { 0%,100%{box-shadow:0 0 8px #8B5CF6,0 0 16px rgba(139,92,246,0.4)} 50%{box-shadow:0 0 14px #A78BFA,0 0 28px rgba(167,139,250,0.6)} }
  @keyframes vipHeart { 0%,100%{box-shadow:0 0 8px #EC4899,0 0 16px rgba(236,72,153,0.4)} 50%{box-shadow:0 0 14px #F43F5E,0 0 28px rgba(244,63,94,0.6)} }
`;
document.head.appendChild(styleEl);

// ═══════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

// Loading screen kapat (auth yoksa da bir süre sonra kapat)
setTimeout(() => window._hideLoading?.(), 4000);
