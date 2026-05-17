"use strict";
const {
  useState, useEffect, useRef, useCallback, useMemo, useReducer,
  createContext, useContext, Fragment
} = React;

// ═══════════════════════════════════════════════════════
// SABITLER
// ═══════════════════════════════════════════════════════
const GAME_ID = "understate_main_server";
const APP_V   = "8.0";

const CITIES = ['İstanbul','Ankara','İzmir','Bursa','Antalya','Trabzon','Gaziantep','Konya','Kayseri','Mersin'];

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
  if (n >= 1e12) return `₺${(n/1e12).toFixed(1)} Trilyon`;
  if (n >= 1e9)  return `₺${(n/1e9).toFixed(1)} Milyar`;
  if (n >= 1e6)  return `₺${(n/1e6).toFixed(1)} Milyon`;
  if (n >= 1e4)  return `₺${(n/1e3).toFixed(0)} Bin`;
  return `₺${fmt(n)}`;
};
const fmtM   = fmtWord;
const fmtUC  = (n) => `${fmt(n||0)} UC`;
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
    const h = (e) => { if (e.detail?.key===key) set(e.detail.value); };
    window.addEventListener('fb-sync', h);
    return () => window.removeEventListener('fb-sync', h);
  }, [key]);
  const write = useCallback((val) => {
    const v = typeof val==='function' ? val(s) : val;
    set(v);
    localStorage.setItem('rep_'+key, JSON.stringify(v));
    if (window._fbPendingWrites) {
      window._fbPendingWrites[key] = v;
      window._fbScheduleFlush?.(key);
    }
  }, [key, s]);
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
  const [f, setF] = useState({ username:'', password:'', city:'İstanbul', gender:'male' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showPw, setShowPw] = useState(false);
  const u = (k,v) => setF(p => ({...p,[k]:v}));

  const getUsers = () => { try { return JSON.parse(localStorage.getItem('rep_users')||'[]'); } catch{return [];} };
  const saveUsers = (arr) => localStorage.setItem('rep_users', JSON.stringify(arr));

  const doLogin = () => {
    if (!f.username.trim() || !f.password) { setErr('Kullanıcı adı ve şifre gerekli'); return; }
    setLoading(true); setErr('');
    const uname = f.username.trim();
    const users = getUsers();
    // Admin shortcut
    if (uname === 'admin' && f.password === 'admin123') {
      let adminUser = users.find(u => u.username === 'admin' || u.role === 'admin');
      if (!adminUser) {
        adminUser = {
          id:'admin_001', uid:'admin_001', username:'admin', password:'admin123',
          email:'admin@understate.tr', city:'Ankara', gender:'erkek',
          money:999999999, bankMoney:999999999, bank:999999999, underCoin:99999,
          xp:999999, level:99, meritPoints:9999, loyaltyPoints:9999, hp:100,
          role:'admin', isAdmin:true, banned:false, premium:true, vip:true,
          registeredAt:Date.now(), lastOnline:Date.now(),
          loginStreak:1, lastLoginDate:new Date().toDateString(),
          createdAt:new Date().toLocaleDateString('tr-TR'),
          achievements:[], inventory:{}, badges:[],
          stats:{trades:0,messages:0,crimes:0,votes:0,battles:0,farm:0},
          skills:{trade:0,politics:0,crime:0,military:0,farming:0}
        };
        saveUsers([...users, adminUser]);
      }
      localStorage.setItem('userId', adminUser.id);
      localStorage.setItem('rep_userProfile', JSON.stringify(adminUser));
      setLoading(false);
      onLogin(adminUser);
      return;
    }
    // Regular user login
    const found = users.find(u => u.username === uname && u.password === f.password);
    if (!found) { setErr('Kullanıcı adı veya şifre hatalı'); setLoading(false); return; }
    if (found.banned) { setErr('Bu hesap banlanmıştır: ' + (found.banReason||'Kural ihlali')); setLoading(false); return; }
    const updated = { ...found, lastOnline: Date.now(), online: true };
    saveUsers(users.map(u => u.id === found.id ? updated : u));
    localStorage.setItem('userId', found.id);
    localStorage.setItem('rep_userProfile', JSON.stringify(updated));
    setLoading(false);
    onLogin(updated);
  };

  const doRegister = () => {
    if (!f.username.trim() || !f.password) { setErr('Kullanıcı adı ve şifre gerekli'); return; }
    if (f.username.length < 3) { setErr('Kullanıcı adı en az 3 karakter'); return; }
    if (f.password.length < 6) { setErr('Şifre en az 6 karakter'); return; }
    setLoading(true); setErr('');
    const uname = f.username.trim();
    const users = getUsers();
    if (users.find(u => u.username === uname)) { setErr('Bu kullanıcı adı zaten alınmış'); setLoading(false); return; }
    const id = 'user_' + Date.now();
    const profile = {
      id, uid:id, username:uname, password:f.password,
      email:'', city:f.city, gender:f.gender==='female'?'kadin':'erkek',
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
    saveUsers([...users, profile]);
    localStorage.setItem('userId', id);
    localStorage.setItem('rep_userProfile', JSON.stringify(profile));
    setLoading(false);
    onLogin(profile);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'#050D1A',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',overflowY:'auto',padding:'env(safe-area-inset-top, 1.5rem) 1rem calc(env(safe-area-inset-bottom, 0px) + 3rem)',minHeight:'100dvh'}}>
      {/* Arka plan efekti */}
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)',pointerEvents:'none'}} />
      <div style={{position:'fixed',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)',pointerEvents:'none'}} />

      {/* Logo */}
      <div style={{textAlign:'center',marginBottom:'2rem',marginTop:'1rem',position:'relative',zIndex:1}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(2rem,8vw,3.5rem)',fontWeight:900,letterSpacing:'0.3em',display:'flex',alignItems:'baseline',justifyContent:'center',marginBottom:'0.25rem'}}>
          <span style={{color:'#D00000',textShadow:'0 0 30px rgba(208,0,0,0.5)'}}>[ U</span>
          <span style={{color:'#fff'}}>NDER</span>
          <span style={{color:'#D00000',textShadow:'0 0 30px rgba(208,0,0,0.5)'}}> ]</span>
        </div>
        <div style={{color:'rgba(255,255,255,0.3)',fontSize:'0.72rem',letterSpacing:'0.25em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>Şehir & Devlet Simülasyonu • v{APP_V}</div>
        <div style={{width:'40px',height:'2px',background:'linear-gradient(90deg,transparent,#3B82F6,transparent)',margin:'0.75rem auto 0',borderRadius:'2px'}} />
      </div>

      {/* Panel */}
      <div style={{width:'100%',maxWidth:'400px',position:'relative',zIndex:1}}>
        <div style={{background:'rgba(11,21,39,0.95)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'1.75rem 1.5rem',backdropFilter:'blur(20px)',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>

          {/* Tabs */}
          <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'4px',marginBottom:'1.5rem',gap:'4px'}}>
            {[['login','🔑 Giriş Yap'],['register','📝 Kayıt Ol']].map(([v,l]) => (
              <button key={v} onClick={() => {setTab(v);setErr('');}}
                style={{flex:1,padding:'0.55rem',borderRadius:'10px',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.83rem',transition:'all 0.15s',
                  background: tab===v ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: tab===v ? '#60A5FA' : '#5A7089'}}>
                {l}
              </button>
            ))}
          </div>

          {/* Hata */}
          {err && <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'10px',padding:'0.6rem 0.9rem',color:'#FCA5A5',fontSize:'0.82rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>⚠️ {err}</div>}

          {/* Form */}
          <AuthField label="Kullanıcı Adı" placeholder="Kullanıcı adın (admin, demo...)" value={f.username} onChange={v=>u('username',v)} />
          <AuthField label="Şifre" type={showPw?'text':'password'} placeholder={tab==='register'?'En az 6 karakter':'••••••••'} value={f.password} onChange={v=>u('password',v)}
            suffix={<button onClick={()=>setShowPw(p=>!p)} style={{background:'none',border:'none',color:'#5A7089',cursor:'pointer',fontSize:'1rem',padding:'0 4px'}}>{showPw?'🙈':'👁️'}</button>} />

          {tab==='register' && <>
            <div style={{marginBottom:'1rem'}}>
              <div style={{fontSize:'0.72rem',color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.4rem',fontWeight:700}}>Şehir</div>
              <select value={f.city} onChange={e=>u('city',e.target.value)}
                style={{width:'100%',padding:'0.7rem 0.9rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'0.9rem',outline:'none'}}>
                {CITIES.map(c=><option key={c} value={c} style={{background:'#0B1527'}}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <div style={{fontSize:'0.72rem',color:'#5A7089',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.4rem',fontWeight:700}}>Cinsiyet</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                {[['male','👨 Erkek'],['female','👩 Kadın']].map(([v,l])=>(
                  <button key={v} onClick={()=>u('gender',v)} style={{padding:'0.65rem',borderRadius:'10px',border:`1px solid ${f.gender===v?'rgba(59,130,246,0.5)':'rgba(255,255,255,0.08)'}`,background:f.gender===v?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:f.gender===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer',fontSize:'0.85rem',transition:'all 0.15s'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </>}

          <button onClick={tab==='login'?doLogin:doRegister} disabled={loading}
            style={{width:'100%',padding:'0.95rem',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#000',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'0.95rem',letterSpacing:'0.12em',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,transition:'all 0.2s',textTransform:'uppercase',boxShadow:'0 4px 20px rgba(59,130,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
            {loading ? <>
              <div style={{width:'18px',height:'18px',border:'2.5px solid rgba(0,0,0,0.3)',borderTopColor:'#000',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
              <span>Lütfen bekleyin...</span>
            </> : (tab==='login' ? '→ Giriş Yap' : '→ Hesap Oluştur')}
          </button>

          {tab==='login' && (
            <div style={{textAlign:'center',marginTop:'1rem',display:'flex',gap:'0.5rem',justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>{u('username','demo');u('password','demo1234');}}
                style={{background:'none',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'8px',color:'#5A7089',cursor:'pointer',fontSize:'0.75rem',padding:'0.35rem 0.9rem',fontFamily:"'DM Sans',sans-serif"}}>
                🧪 Demo hesabı doldur
              </button>
              <button onClick={()=>{u('username','admin');u('password','admin123');}}
                style={{background:'none',border:'1px dashed rgba(239,68,68,0.3)',borderRadius:'8px',color:'#EF4444',cursor:'pointer',fontSize:'0.75rem',padding:'0.35rem 0.9rem',fontFamily:"'DM Sans',sans-serif"}}>
                ⚙️ Admin girişi
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{marginTop:'1.5rem',color:'rgba(255,255,255,0.2)',fontSize:'0.7rem',textAlign:'center',position:'relative',zIndex:1}}>
        🔒 UnderState • Kullanıcı adı ile güvenli giriş
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
  const base = {border:'none',borderRadius:'12px',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1,transition:'all 0.15s',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'0.35rem'};
  const vars = {
    primary:  {background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#fff',boxShadow:'0 3px 12px rgba(59,130,246,0.25)'},
    gold:     {background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#000'},
    green:    {background:'linear-gradient(135deg,#10B981,#059669)',color:'#fff'},
    red:      {background:'linear-gradient(135deg,#EF4444,#DC2626)',color:'#fff'},
    ghost:    {background:'rgba(255,255,255,0.05)',color:'#8BA0B5',border:'1px solid rgba(255,255,255,0.08)'},
    danger:   {background:'rgba(239,68,68,0.12)',color:'#FCA5A5',border:'1px solid rgba(239,68,68,0.25)'},
  };
  const sizes = { sm:{padding:'0.35rem 0.8rem',fontSize:'0.78rem'}, md:{padding:'0.65rem 1.25rem',fontSize:'0.87rem'}, lg:{padding:'0.9rem 1.5rem',fontSize:'1rem'}, full:{padding:'0.7rem 1rem',fontSize:'0.87rem',width:'100%'} };
  return (
    <button style={{...base,...(vars[variant]||vars.primary),...(sizes[size]||sizes.md),...style}} onClick={disabled?undefined:onClick}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════
function Header({ profile, notifCount, onNotif, page }) {
  const onlineCnt = useOnlineCount();
  const lvl = getLevelInfo(profile?.xp || 0);
  const { dark, toggle } = useTheme();
  return (
    <div style={{position:'sticky',top:0,zIndex:100,background: dark ? '#0F172A' : '#FFFFFF',borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.4)' : '0 1px 8px rgba(0,0,0,0.06)'}} >
      {/* Ticker */}
      <div style={{height:'22px',background:'rgba(0,0,0,0.4)',borderBottom:'1px solid rgba(255,255,255,0.04)',overflow:'hidden',display:'flex',alignItems:'center'}}>
        <div style={{whiteSpace:'nowrap',fontSize:'0.58rem',fontFamily:"'JetBrains Mono',monospace",color:'#94A3B8',animation:'ticker 35s linear infinite',paddingLeft:'100%'}}>
          🟢 {onlineCnt} çevrimiçi oyuncu &nbsp;•&nbsp; 💰 Borsa: TECH +2.4% &nbsp;•&nbsp; 🏛️ Parlamento: Vergi yasası oylaması &nbsp;•&nbsp; ⚔️ Aktif savaş: 3 &nbsp;•&nbsp; 📊 GSYİH: ₺4.8T &nbsp;•&nbsp; 🌾 Tarım sezonu aktif &nbsp;•&nbsp; 🟢 {onlineCnt} çevrimiçi oyuncu &nbsp;•&nbsp; 💰 Borsa: TECH +2.4%
        </div>
      </div>
      {/* Main header */}
      <div style={{display:'flex',alignItems:'center',padding:'0.45rem 0.85rem',gap:'0.5rem'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:900,letterSpacing:'0.15em',color:'#3B82F6',textShadow:'0 0 15px rgba(59,130,246,0.3)',flexShrink:0}}>
          [UNDER]
        </div>
        <div style={{flex:1}} />
        {/* Stats */}
        <div style={{display:'flex',gap:'0',alignItems:'center'}}>
          {[
            [fmtWord(profile?.money), 'PARA', '#10B981'],
            [fmtUC(profile?.underCoin), 'UC', '#60A5FA'],
            [`Lv.${lvl.lvl}`, profile?.username?.slice(0,8)||'...', '#F59E0B'],
          ].map(([val, lbl, color], i) => (
            <div key={i} style={{textAlign:'center',padding:'0.2rem 0.5rem',background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',borderRight:i<2?'none':'1px solid rgba(255,255,255,0.07)',borderRadius:i===0?'8px 0 0 8px':i===2?'0 8px 8px 0':'0'}}>
              <div style={{fontSize:'0.48rem',color: dark ? '#64748B' : '#7A8FA6',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:700}}>{lbl}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',fontWeight:700,color,lineHeight:1.3}}>{val}</div>
            </div>
          ))}
        </div>
        {/* Notif */}
        <button onClick={toggle} title={dark?'Aydınlık mod':'Karanlık mod'} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.35rem 0.55rem',cursor:'pointer',fontSize:'1rem',color:'#8BA0B5',marginRight:'2px'}}>
          {dark ? '☀️' : '🌙'}
        </button>
        <button onClick={onNotif} style={{position:'relative',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.35rem 0.55rem',cursor:'pointer',fontSize:'1rem',color:'#8BA0B5'}}>
          🔔
          {notifCount > 0 && <span style={{position:'absolute',top:'-4px',right:'-4px',background:'#EF4444',color:'#fff',fontSize:'0.52rem',fontWeight:900,minWidth:'14px',height:'14px',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 2px',border:'2px solid #06080F'}}>{notifCount}</span>}
        </button>
      </div>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ALT NAVİGASYON (Kaydırılabilir)
// ═══════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:'home',      icon:'🏠', label:'Ana Sayfa', rgb:'59,130,246' },
  { id:'politics',  icon:'🏛️', label:'Siyaset',  rgb:'245,200,66' },
  { id:'economy',   icon:'💰', label:'Ekonomi',  rgb:'16,185,129' },
  { id:'holdings',  icon:'🏢', label:'Şirketler',rgb:'245,158,11' },
  { id:'football',  icon:'⚽', label:'Futbol',   rgb:'16,185,129' },
  { id:'army',      icon:'⚔️', label:'Ordu',    rgb:'239,68,68'  },
  { id:'casino',    icon:'🎰', label:'Kumarhane',rgb:'255,215,0'  },
  { id:'factory',   icon:'🏭', label:'Fabrika',  rgb:'245,158,11' },
  { id:'mining',    icon:'⛏️', label:'Maden',   rgb:'161,97,40'  },
  { id:'spy',       icon:'🕵️', label:'İstihbarat',rgb:'139,92,246'},
  { id:'newspaper', icon:'📰', label:'Gazete',   rgb:'96,165,250' },
  { id:'pvp',       icon:'⚔️', label:'Dövüş',   rgb:'239,68,68'  },
  { id:'social',    icon:'📱', label:'Sosyal',   rgb:'167,139,250'},
  { id:'gang',      icon:'🔫', label:'Çete',     rgb:'239,68,68'  },
  { id:'alliance',  icon:'🤝', label:'İttifak',  rgb:'96,165,250' },
  { id:'chat',      icon:'💬', label:'Sohbet',   rgb:'139,92,246' },
  { id:'world',     icon:'🌍', label:'Dünya',    rgb:'59,130,246' },
  { id:'players',   icon:'👥', label:'Oyuncular',rgb:'59,130,246' },
  { id:'achievements',icon:'🏆',label:'Başarılar',rgb:'255,215,0' },
  { id:'crisis',    icon:'🚨', label:'Kriz',     rgb:'239,68,68'  },
  { id:'map',       icon:'🗺️', label:'Harita',   rgb:'0,200,100'  },
];

function BottomNav({ page, onChange, items, notifMap={} }) {
  const navList = items || NAV_ITEMS;
  const { dark } = useTheme();
  const ref = useRef(null);
  useEffect(() => {
    const idx = navList.findIndex(i=>i.id===page);
    if (ref.current && idx > -1) {
      const item = ref.current.children[idx];
      if (item) item.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' });
    }
  }, [page]);
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:900,background: dark ? '#0F172A' : '#FFFFFF',borderTop: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',paddingBottom:'env(safe-area-inset-bottom, 0px)',boxShadow: dark ? '0 -4px 16px rgba(0,0,0,0.4)' : '0 -4px 16px rgba(0,0,0,0.08)'}}>
      <div ref={ref} className="bnav" style={{display:'flex',overflowX:'auto',WebkitOverflowScrolling:'touch',gap:'2px',padding:'5px 4px',scrollbarWidth:'none'}}>
        {navList.map(it => {
          const active = page===it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
              style={{flex:'0 0 auto',minWidth:'58px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'3px',padding:'0.4rem 0.3rem',borderRadius:'12px',border:`1px solid ${active?`rgba(${it.rgb},0.2)`:'transparent'}`,background:active?`rgba(${it.rgb},0.09)`:'transparent',cursor:'pointer',WebkitTapHighlightColor:'transparent',position:'relative',transition:'all 0.15s',margin:'1px'}}>
              <span style={{fontSize:'1.25rem',lineHeight:1,filter:active?`drop-shadow(0 0 5px rgba(${it.rgb},0.5))`:'none',transition:'all 0.15s',transform:active?'scale(1.1)':'scale(1)'}}>{it.icon}</span>
              <span style={{fontSize:'0.5rem',fontWeight:900,letterSpacing:'0.04em',color:active?`rgb(${it.rgb})`: dark ? '#64748B' : '#94A3B8',textTransform:'uppercase',whiteSpace:'nowrap',transition:'color 0.15s'}}>{it.label}</span>
              {notifMap[it.id] > 0 && <span style={{position:'absolute',top:2,right:4,background:'#EF4444',color:'#fff',fontSize:'0.5rem',fontWeight:900,minWidth:'13px',height:'13px',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 2px'}}>{notifMap[it.id]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ANA SAYFA — PLATFORM DESIGN
// ═══════════════════════════════════════════════════════
function HomePage({ profile, onNavigate }) {
  const lvl = getLevelInfo(profile?.xp || 0);
  const onlineCnt = useOnlineCount();
  const [news] = useLs('liveNews', []);
  const [tasks] = useLs('dailyTasks', []);
  const [activity] = useLs('activityFeed', []);
  const [announcements] = useLs('announcements', []);
  const money = profile?.money || 0;
  const fmtShort = (n) => {
    const abs = Math.abs(n||0);
    if (abs>=1e9)  return (n/1e9).toFixed(1)+'B';
    if (abs>=1e6)  return (n/1e6).toFixed(1)+'M';
    if (abs>=1e3)  return (n/1e3).toFixed(1)+'K';
    return String(Math.floor(n||0));
  };

  const defaultTasks = [
    { name:'Çeteye Katıl', pct: 100 },
    { name:'Şehir Savaşına Katıl', pct: 60 },
    { name:'Ekonomik Yatırım Yap', pct: 30 },
  ];
  const taskList = defaultTasks;

  const recentActivity = (Array.isArray(activity) ? activity : []).slice(0, 5);

  return (
    <div style={{padding:'0 0.75rem 1rem',background:'#F0F2F5',minHeight:'100%'}}>
      {/* ── Welcome card (stays dark) ── */}
      <div style={{background:'linear-gradient(135deg,#1A2744 0%,#0F1C38 100%)',borderRadius:'18px',padding:'1.2rem',marginBottom:'0.75rem',boxShadow:'0 6px 24px rgba(0,0,0,0.18)',marginTop:'0.75rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
          <div>
            <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:'0.2rem',fontWeight:600}}>Oyuncu Profili</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.35rem',fontWeight:900,color:'#FFFFFF'}}>Hoş Geldiniz</div>
          </div>
          <Avatar profile={profile} size={48} />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
          {[
            {label:'Seviye',value:lvl.lvl},
            {label:'Prestij',value:fmtShort(profile?.meritPoints||0)},
            {label:'Para',value:'₺'+fmtShort(money)},
          ].map(({label,value})=>(
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontSize:'0.52rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.07em',fontWeight:700,marginBottom:'0.15rem'}}>{label}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1.2rem',fontWeight:900,color:'#FFFFFF'}}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-column stat cards ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.55rem',marginBottom:'0.75rem'}}>
        {[
          {icon:'🔔',label:'Bildirimler',value:news.length||0,sub:'Yeni bildirim',color:'#F59E0B',page:'chat'},
          {icon:'🏆',label:'Başarımlar',value:'38/100',sub:'Tamamlandı',color:'#F59E0B',page:'profile'},
          {icon:'📈',label:'Ekonomi',value:'+15%',sub:'Günlük kazanç',color:'#10B981',positive:true,page:'economy'},
          {icon:'⚡',label:'Aktivite',value:onlineCnt||247,sub:'Bugün',color:'#3B82F6',page:'players'},
        ].map((item)=>(
          <div key={item.label} onClick={()=>onNavigate(item.page)}
            style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'0.9rem 0.85rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',cursor:'pointer',transition:'all 0.15s',WebkitTapHighlightColor:'transparent'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.35rem',marginBottom:'0.35rem'}}>
              <span style={{fontSize:'1rem'}}>{item.icon}</span>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#7A8FA6',textTransform:'uppercase',letterSpacing:'0.05em'}}>{item.label}</span>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1.45rem',fontWeight:900,color:item.positive?'#10B981':item.color==='#3B82F6'?'#1A2233':'#1A2233',lineHeight:1,marginBottom:'0.2rem'}}>{item.value}</div>
            <div style={{fontSize:'0.63rem',color:'#9AABBA'}}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Daily Tasks ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',marginBottom:'0.75rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233',marginBottom:'0.8rem'}}>Günlük Görevler</div>
        {taskList.map((task,i)=>(
          <div key={i} style={{marginBottom:i<taskList.length-1?'0.75rem':'0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.3rem'}}>
              <span style={{fontSize:'0.85rem',fontWeight:600,color:'#1A2233'}}>{task.name}</span>
              <span style={{fontSize:'0.75rem',fontWeight:700,color:'#7A8FA6'}}>{task.pct}%</span>
            </div>
            <div style={{height:'7px',background:'#E8ECF0',borderRadius:'100px',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${task.pct}%`,background:`linear-gradient(90deg,${task.pct===100?'#10B981':'#3B82F6'},${task.pct===100?'#34D399':'#60A5FA'})`,borderRadius:'100px',transition:'width 0.5s ease'}} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',marginBottom:'0.75rem'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233',marginBottom:'0.7rem'}}>Son Aktiviteler</div>
        {(recentActivity.length > 0 ? recentActivity : [
          {text:'Çeteye katıldın',color:'#10B981',time:'2dk'},
          {text:'Borsa işlemi gerçekleştirildi',color:'#3B82F6',time:'15dk'},
          {text:'Seçim oy kullanıldı',color:'#F59E0B',time:'1sa'},
          {text:'Yeni mesaj aldın',color:'#8B5CF6',time:'2sa'},
        ]).slice(0,5).map((item,i,arr)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.55rem 0',borderBottom:i<arr.length-1?'1px solid rgba(0,0,0,0.05)':'none'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:item.color||'#3B82F6',flexShrink:0}} />
            <span style={{flex:1,fontSize:'0.82rem',color:'#3B5470',fontWeight:500}}>{item.text||item.desc||item.content||'Aktivite'}</span>
            <span style={{fontSize:'0.67rem',color:'#9AABBA'}}>{item.time||timeAgo(item.ts||item.time)}</span>
          </div>
        ))}
      </div>

      {/* ── System Announcements ── */}
      {announcements.length > 0 && (
        <div style={{background:'linear-gradient(135deg,#1A2744,#0F1C38)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:'16px',padding:'1rem',marginBottom:'0.75rem',boxShadow:'0 2px 8px rgba(0,0,0,0.12)'}}>
          <div style={{fontSize:'0.72rem',color:'#60A5FA',fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.6rem'}}>📢 Sistem Duyuruları</div>
          {announcements.slice(0,3).map((a,i)=>(
            <div key={a.id||i} style={{padding:'0.5rem 0',borderBottom:i<Math.min(2,announcements.length-1)?'1px solid rgba(255,255,255,0.06)':'none'}}>
              <div style={{fontSize:'0.82rem',color:'#E8EDF2',marginBottom:'0.1rem'}}>{a.text}</div>
              <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)'}}>{a.by||'Admin'} • {timeAgo(a.ts)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick categories ── */}
      <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:800,color:'#1A2233',marginBottom:'0.75rem'}}>Hızlı Erişim</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.45rem'}}>
          {[
            {icon:'🌾',label:'Tarım',page:'economy'},
            {icon:'📈',label:'Borsa',page:'economy'},
            {icon:'🏪',label:'Pazar',page:'economy'},
            {icon:'⚔️',label:'Savaş',page:'world'},
            {icon:'🗳️',label:'Seçim',page:'politics'},
            {icon:'🤝',label:'İttifak',page:'world'},
            {icon:'🎰',label:'Kumarhane',page:'economy'},
            {icon:'💼',label:'İş',page:'economy'},
          ].map((a,i) => (
            <button key={i} onClick={() => onNavigate(a.page)}
              style={{background:'#F5F7FA',border:'1px solid rgba(0,0,0,0.07)',borderRadius:'14px',padding:'0.7rem 0.3rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s'}}>
              <span style={{fontSize:'1.45rem',lineHeight:1}}>{a.icon}</span>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#3B5470',textAlign:'center',lineHeight:1.2}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════
const ACHIEVEMENTS_LIST = [
  { id:'first_money',   icon:'💰', title:'İlk Kazanç',      desc:'₺1.000 kazan',                   check: u => (u.money||0) >= 1000 },
  { id:'first_10k',     icon:'💵', title:'Para Babası',      desc:'₺10.000 kazan',                  check: u => (u.money||0) >= 10000 },
  { id:'first_100k',    icon:'💸', title:'Varlıklı',         desc:'₺100.000 kazan',                 check: u => (u.money||0) >= 100000 },
  { id:'millionaire',   icon:'💎', title:'Milyoner',         desc:'₺1.000.000 kazan',               check: u => (u.money||0) >= 1000000 },
  { id:'billionaire',   icon:'🏆', title:'Milyarder',        desc:'₺1 Milyar kazan',                check: u => (u.money||0) >= 1e9 },
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
    setMsg(`✅ ${u.username} kullanıcısına ${amt} UC verildi`);
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

  const sendAnnouncement = () => {
    if (!announcement.trim()) { setMsg('Duyuru metni girin'); return; }
    const ann = { id:genId(), text:announcement.trim(), by:profile?.username||'Admin', ts:Date.now(), type:'system' };
    const newAnns = [ann, ...announcements].slice(0, 50);
    setAnnouncements(newAnns);
    setAnnouncement('');
    setMsg('✅ Duyuru yayınlandı');
    showNotif?.('📢 Sistem duyurusu yayınlandı', 'info');
  };

  const totalMoney = allUsers.reduce((s,u)=>s+(u.money||0), 0);
  const bannedCount = allUsers.filter(u=>u.banned).length;
  const adminCount = allUsers.filter(u=>u.role==='admin').length;

  const cs = {background:'rgba(255,255,255,0.04)',borderRadius:'14px',padding:'1rem',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'0.65rem'};
  const inp = {width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.55rem 0.8rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'15px',outline:'none',boxSizing:'border-box'};
  const tabs = [['dashboard','📊 Panel'],['users','👥 Kullanıcılar'],['manage','🛡️ Yönet'],['announce','📢 Duyuru'],['logs','📋 Log'],['tools','🛠️ Araçlar'],['election','🗳️ Seçim']];

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
                  <div style={{fontSize:'0.6rem',color:'#5A7089'}}>{u.underCoin||0} UC</div>
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
                  {[['💰',fmtM(selectedUser.money||0),'Para'],['💎',selectedUser.underCoin||0,'UC'],['⭐',selectedUser.level||1,'Seviye'],['📊',selectedUser.xp||0,'XP'],['❤️',selectedUser.hp||100,'HP'],['🏙️',selectedUser.city||'?','Şehir']].map(([ic,v,l])=>(
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
                <div style={{fontWeight:700,color:'#60A5FA',marginBottom:'0.5rem',fontSize:'0.8rem'}}>💎 UnderCoin İşlemleri</div>
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
            <textarea value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="Duyuru metni... (tüm oyunculara görünür)" rows={4}
              style={{...inp,resize:'vertical',marginBottom:'0.65rem'}} />
            <button onClick={sendAnnouncement} style={{width:'100%',padding:'0.7rem',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#3B82F6,#2563EB)',color:'#fff',fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
              📢 Duyuruyu Yayınla
            </button>
          </div>

          <div style={cs}>
            <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>📋 Son Duyurular ({announcements.length})</div>
            {announcements.length===0 && <div style={{color:'#3B4E63',fontSize:'0.8rem',textAlign:'center',padding:'1rem'}}>Henüz duyuru yok</div>}
            {announcements.map(a => (
              <div key={a.id} style={{padding:'0.55rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{fontSize:'0.82rem',color:'#E8EDF2',marginBottom:'0.15rem'}}>{a.text}</div>
                <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{a.by} • {timeAgo(a.ts)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <div style={{fontSize:'0.6rem',color:'#5A7089'}}>{u.underCoin||0} UC</div>
                </div>
              </div>
            </div>
          ))}
          {allUsers.length===0 && <div style={{...cs,textAlign:'center',color:'#3B4E63',padding:'2rem'}}>Henüz kullanıcı yok</div>}
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
              ['Oyun', 'UNDERSTATE v8.0'],
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

      {/* ── SEÇİM YÖNETİMİ ── */}
      {tab==='election' && (() => {
        const sortedCands = [...(elections_adm.candidates||[])].sort((a,b)=>(b.votes||0)-(a.votes||0));
        const totalVotes = sortedCands.reduce((s,c)=>s+(c.votes||0),0);
        const startElection = () => { setElections_adm({...elections_adm, phase:'active', startedAt:Date.now()}); showNotif('✅ Seçim başlatıldı!','success'); };
        const closeElection = () => { const w=sortedCands[0]||null; setElections_adm({...elections_adm, phase:'finished', finishedAt:Date.now(), winner:w}); showNotif(`🏆 Kazanan: ${w?.username||'-'}`,'gold'); };
        const resetElection = () => { if(!window.confirm('Seçimi sıfırla?')) return; setElections_adm({phase:'idle',candidates:[],votes:{},nextElection:Date.now()+7*24*60*60*1000}); showNotif('↺ Seçim sıfırlandı','success'); };
        return (
          <div>
            <div style={cs}>
              <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.65rem',fontSize:'0.85rem'}}>🗳️ Seçim Yönetimi</div>
              <div style={{display:'flex',gap:'0.4rem',alignItems:'center',marginBottom:'0.65rem',flexWrap:'wrap'}}>
                <span style={{padding:'0.3rem 0.75rem',borderRadius:'8px',border:`1px solid ${elections_adm.phase==='active'?'rgba(16,185,129,0.4)':elections_adm.phase==='finished'?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.1)'}`,background:elections_adm.phase==='active'?'rgba(16,185,129,0.1)':elections_adm.phase==='finished'?'rgba(59,130,246,0.1)':'rgba(255,255,255,0.03)',color:elections_adm.phase==='active'?'#10B981':elections_adm.phase==='finished'?'#60A5FA':'#5A7089',fontSize:'0.78rem',fontWeight:700}}>
                  {elections_adm.phase==='active'?'🟢 Aktif':elections_adm.phase==='finished'?'🏁 Bitti':'⏸️ Bekliyor'}
                </span>
                <span style={{fontSize:'0.7rem',color:'#3B4E63'}}>{sortedCands.length} aday • {totalVotes} oy</span>
              </div>
              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                {elections_adm.phase==='idle'&&<button onClick={startElection} style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'none',background:'#10B981',color:'#fff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>🗳️ Seçimi Başlat</button>}
                {elections_adm.phase==='active'&&<button onClick={closeElection} style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'none',background:'#3B82F6',color:'#fff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>🏁 Seçimi Kapat ve Kazananı Duyur</button>}
                <button onClick={resetElection} style={{padding:'0.45rem 0.85rem',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',color:'#EF4444',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>↺ Sıfırla</button>
              </div>
              {elections_adm.winner&&elections_adm.phase==='finished'&&(
                <div style={{marginTop:'0.65rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.65rem'}}>
                  <div style={{fontSize:'0.78rem',fontWeight:700,color:'#F59E0B'}}>🏆 Kazanan: {elections_adm.winner.username} ({elections_adm.winner.votes||0} oy)</div>
                  {elections_adm.winner.party&&<div style={{fontSize:'0.65rem',color:'#5A7089',marginTop:'0.15rem'}}>{elections_adm.winner.party}</div>}
                </div>
              )}
            </div>
            <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.4rem',fontSize:'0.78rem'}}>👥 Adaylar ({sortedCands.length})</div>
            {sortedCands.length===0 ? <div style={{...cs,textAlign:'center',color:'#3B4E63',padding:'1.5rem',fontSize:'0.82rem'}}>Henüz aday yok</div>
            : sortedCands.map((c,i)=>{
              const pct = totalVotes>0 ? Math.round((c.votes||0)/totalVotes*100) : 0;
              return (
                <div key={c.uid} style={{...cs,padding:'0.75rem',marginBottom:'0.4rem',border:`1px solid ${i===0?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.06)'}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.3rem'}}>
                    <div>
                      <div style={{fontWeight:700,color:i===0?'#F59E0B':'#E8EDF2',fontSize:'0.85rem'}}>{['🥇','🥈','🥉'][i]||'•'} {c.username}</div>
                      <div style={{fontSize:'0.62rem',color:'#5A7089'}}>{c.party||'Bağımsız'}</div>
                    </div>
                    <div style={{textAlign:'right'}}><div style={{fontWeight:800,color:'#F59E0B'}}>{c.votes||0}</div><div style={{fontSize:'0.6rem',color:'#5A7089'}}>oy ({pct}%)</div></div>
                  </div>
                  <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px'}}><div style={{height:'100%',width:`${pct}%`,background:i===0?'#F59E0B':'#8B5CF6',borderRadius:'2px',transition:'width 0.5s'}}/></div>
                </div>
              );
            })}
          </div>
        );
      })()}
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

  const sendMsg = () => {
    if (!msg.trim()) return;
    const newMsg = {
      id: genId(), userId: profile?.uid, username: profile?.username || 'Oyuncu',
      gender: profile?.gender, text: msg.trim(), ts: Date.now(),
      level: profile?.level || 1, premium: profile?.premium,
    };
    if (tab === 'global') {
      const updated = [...(globalChat||[]).slice(-199), newMsg];
      setGlobalChat(updated);
    } else if (tab === 'city') {
      const upd = { ...(cityChats||{}), [cityKey]: [...(cityMessages||[]).slice(-99), newMsg] };
      setCityChats(upd);
    }
    setMsg('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
  };

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
              const imgRx = /(https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(\?\S*)?)/i;
              const imgMatch = m.text?.match(imgRx);
              const isImageOnly = imgMatch && m.text.trim()===imgMatch[0];
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
          {/* Input */}
          <div style={{padding:'0.5rem 0.7rem',background:'rgba(6,12,24,0.97)',borderTop:'1px solid rgba(255,255,255,0.04)',paddingBottom:'calc(0.5rem + env(safe-area-inset-bottom, 0px))',flexShrink:0}}>
            <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-end'}}>
              <input ref={inputRef} value={msg} onChange={e=>setMsg(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
                placeholder="Mesaj yaz..." maxLength={500}
                style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0.6rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',resize:'none'}} />
              <button onClick={sendMsg} style={{background:'linear-gradient(135deg,#3B82F6,#2563EB)',border:'none',borderRadius:'12px',padding:'0.6rem 1rem',color:'#fff',fontWeight:700,fontSize:'1rem',cursor:'pointer',flexShrink:0}}>→</button>
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
function EconomyPage({ profile, setProfile, showNotif }) {
  const [sub, setSub] = useState('overview');
  const [stocks, setStocks] = useLs('stockMarket', { TECH:145, ENERGY:88, FOOD:62, BANK:210, DEFENSE:175 });
  const [portfolio, setPortfolio] = useLs('stockPortfolio', {});
  const [farmModal, setFarmModal] = useState(null);
  const [farms, setFarms] = useLs('userFarms', []);
  const [casinoResult, setCasinoResult] = useState(null);

  const subs = [
    { id:'overview', label:'📊 Genel' },
    { id:'stocks',   label:'📈 Borsa' },
    { id:'farm',     label:'🌾 Tarım' },
    { id:'casino',   label:'🎰 Kumarhane' },
    { id:'bank',     label:'🏦 Banka' },
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
                ['💎','Liyakat (UC)',`${fmt(profile?.underCoin||0)} UC`,'#A78BFA'],
              ].map(([ic,lb,v,c])=>(
                <div key={lb} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${c}28`,borderRadius:'10px',padding:'0.55rem 0.35rem',textAlign:'center'}}>
                  <div style={{fontSize:'0.52rem',color:'#2A3A4A',textTransform:'uppercase',marginBottom:'0.15rem',letterSpacing:'0.04em',lineHeight:1.2}}>{ic} {lb}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.72rem',fontWeight:700,color:c,lineHeight:1.2}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Devlet Ekonomisi */}
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'0.6rem',fontWeight:700,color:'#F59E0B',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'0.4rem'}}>🏛️ DEVLET EKONOMİSİ</div>
            <div style={{background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:'12px',padding:'0.7rem',marginBottom:'0.75rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
                {[['🏛️','Hazine','₺4.8 Trilyon','#10B981'],['📉','Enflasyon','%68.4','#EF4444'],['💹','Faiz Oranı','%45','#F59E0B'],['💰','Vergi Oranı','%22','#8B5CF6']].map(([ic,lb,v,c])=>(
                  <div key={lb} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontSize:'0.7rem',color:'#4A5A6A'}}>{ic} {lb}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.72rem',fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

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
            <div style={{color:'#5A7089',fontSize:'0.75rem',marginBottom:'0.75rem'}}>📊 Her alımda 10 adet hisse satın alınır.</div>
            {Object.entries(stocks).map(([sym, price]) => {
              const held = portfolio[sym]?.qty || 0;
              const change = (Math.random()-0.5)*5;
              return (
                <Card key={sym} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:'0.95rem',color:'#E8EDF2'}}>{sym}</div>
                      {held > 0 && <div style={{fontSize:'0.65rem',color:'#5A7089'}}>{held} adet elimde</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1.05rem',fontWeight:700,color:'#E8EDF2'}}>₺{price}</div>
                      <div style={{fontSize:'0.7rem',color: change>=0?'#10B981':'#EF4444',fontWeight:700}}>{change>=0?'▲':'▼'} {Math.abs(change).toFixed(2)}%</div>
                    </div>
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <Btn variant='green' size='sm' onClick={()=>buyStock(sym)}>Al</Btn>
                      {held > 0 && <Btn variant='danger' size='sm' onClick={()=>sellStock(sym)}>Sat</Btn>}
                    </div>
                  </div>
                </Card>
              );
            })}
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
                  {[['wheat','🌾','Buğday','₺100','2dk','₺500'],['corn','🌽','Mısır','₺150','3dk','₺900'],['tomato','🍅','Domates','₺80','1.5dk','₺350'],['grape','🍇','Üzüm','₺250','5dk','₺1800']].map(([t,ic,lb,cost,time,earn])=>(
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
      </div>
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
      setProfile(p => { const np={...p, money:p.money-n, bank:(p.bank||0)+n}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`🏦 ${fmtM(n)} yatırıldı`, 'success');
    } else {
      if (n > (profile?.bank||0)) { showNotif('Yetersiz banka bakiyesi', 'error'); return; }
      setProfile(p => { const np={...p, money:(p.money||0)+n, bank:p.bank-n}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
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
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Fiyat (₺)</div>
              <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="₺"
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
  const [transferModal, setTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [disbandConfirm, setDisbandConfirm] = useState(false);

  const myParty = parties.find(p => p.leaderId===profile?.uid || (p.members||[]).includes(profile?.uid));
  const isLeader = myParty?.leaderId === profile?.uid;
  const isPresident = cabinet['Devlet Başkanı'] === profile?.username;

  const CABINET_ROLES = [
    'Devlet Başkanı','Başbakan','İçişleri Bakanı','Dışişleri Bakanı',
    'Maliye Bakanı','Savunma Bakanı','Adalet Bakanı','Ticaret Bakanı',
    'Sağlık Bakanı','Eğitim Bakanı'
  ];

  const createParty = () => {
    if (!pForm.name.trim()) { showNotif('Parti adı gerekli', 'error'); return; }
    if (myParty) { showNotif('Zaten bir partiye üyesin', 'error'); return; }
    if ((profile?.money||0) < 10000) { showNotif('Parti kurmak için ₺10.000 gerekli', 'error'); return; }
    const party = {
      id:genId(), name:pForm.name.trim(), ideology:pForm.ideology, desc:pForm.desc,
      color:pForm.color, leaderId:profile?.uid, leaderName:profile?.username,
      members:[profile?.uid], memberCount:1, treasury:0,
      support:5+Math.floor(Math.random()*10), createdAt:Date.now()
    };
    setParties([...parties, party]);
    setProfile(p => { const np={...p,party:party.id,money:(p.money||0)-10000}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    showNotif(`🏛️ ${pForm.name} partisi kuruldu!`, 'success');
  };

  const joinParty = (party) => {
    if (myParty) { showNotif('Zaten bir partidesin', 'error'); return; }
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
    'Devlet Başkanı':  {icon:'👑', cd:4*3600000, label:'Ulusal Duyuru',    xp:500,  money:0,    desc:'Ulusal karar al, XP kazan'},
    'Başbakan':        {icon:'🏛️',cd:3*3600000, label:'Hükümet Toplantısı',xp:300, money:0,    desc:'Bakanları koordine et'},
    'İçişleri Bakanı': {icon:'🚔', cd:2*3600000, label:'Polis Operasyonu', xp:200,  money:0,    desc:'Güvenlik operasyonu başlat'},
    'Dışişleri Bakanı':{icon:'🌐', cd:4*3600000, label:'Diplomatik Ziyaret',xp:200, money:5000, desc:'Uluslararası anlaşma imzala'},
    'Maliye Bakanı':   {icon:'💸', cd:6*3600000, label:'Bütçe Kararı',     xp:150,  money:20000,desc:'Devlet kaynaklarından yararlan'},
    'Savunma Bakanı':  {icon:'⚔️', cd:3*3600000, label:'Askeri Tatbikat',  xp:250,  money:0,    desc:'Ordu tatbikatı planla'},
    'Adalet Bakanı':   {icon:'⚖️', cd:4*3600000, label:'Yargı Kararı',     xp:300,  money:0,    desc:'Adalet sistemini yönet'},
    'Ticaret Bakanı':  {icon:'📦', cd:5*3600000, label:'Ticaret Anlaşması', xp:200, money:15000,desc:'Ekonomiyi büyüt'},
    'Sağlık Bakanı':   {icon:'🏥', cd:3*3600000, label:'Sağlık Kampanyası', xp:250, money:0,    desc:'Halk sağlığı hizmeti ver'},
    'Eğitim Bakanı':   {icon:'📚', cd:4*3600000, label:'Eğitim Reformu',    xp:350, money:0,    desc:'Eğitim sistemi geliştir'},
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
    setElections(e => ({...e, votes:{...(e.votes||{}),[profile.uid]:candidateUid}, candidates:(e.candidates||[]).map(c=>c.uid===candidateUid?{...c,votes:(c.votes||0)+1}:c)}));
    setProfile(p => { const np={...p,xp:(p.xp||0)+100}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('🗳️ Oyunuz kullanıldı!', 'success');
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
  const subs = [{id:'parties',label:'🏛️ Partiler'},{id:'management',label:'⚙️ Parti Yön.'},{id:'govpanel',label:'🏛️ Makam'},{id:'laws',label:'⚖️ Yasalar'},{id:'election',label:'🗳️ Seçim'},{id:'cabinet',label:'👔 Kabine'}];

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
              <Btn variant='ghost' size='sm' onClick={()=>setCreateModal(true)} style={{marginBottom:'0.75rem',width:'100%'}}>🏛️ Yeni Parti Kur (₺10.000)</Btn>
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
                        {label:'💼 Bağış Kampanyası', cd:12*3600000, id:'fundraise', onClick:()=>partyAction('fundraise',12*3600000,()=>{setParties(prev=>prev.map(p=>p.id===myParty.id?{...p,treasury:(p.treasury||0)+10000}:p));showNotif('💼 Kampanya başarılı! +₺10.000 kasa','success');})},
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

        {sub==='election' && (
          <div>
            <Card style={{marginBottom:'0.75rem',background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(11,21,39,0.9))',border:'1px solid rgba(245,158,11,0.2)'}}>
              <div style={{fontWeight:800,color:'#F59E0B',marginBottom:'0.3rem',fontSize:'0.85rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>🗳️ Devlet Başkanlığı Seçimi</div>
              <div style={{fontSize:'0.78rem',color:'#8BA0B5',marginBottom:'0.65rem'}}>{sortedCandidates.length} aday • {Object.keys(elections.votes||{}).length} oy kullanıldı</div>
              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                {!elections.candidates?.some(c=>c.uid===profile?.uid)&&myParty&&(
                  <Btn variant='gold' size='sm' onClick={registerCandidate}>🏁 Aday Ol</Btn>
                )}
                {elections.candidates?.some(c=>c.uid===profile?.uid)&&<Tag color='gold'>✅ Adaysın</Tag>}
              </div>
            </Card>
            {sortedCandidates.length===0 && (
              <Card style={{textAlign:'center',padding:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🗳️</div>
                <div style={{color:'#5A7089',fontSize:'0.85rem'}}>Henüz aday yok. Parti üyesi olarak aday olabilirsin!</div>
              </Card>
            )}
            {sortedCandidates.map((c,i) => {
              const totalV = sortedCandidates.reduce((s,x)=>s+(x.votes||0),0);
              const pct = totalV>0 ? Math.round((c.votes||0)/totalV*100) : 0;
              const isMe = c.uid===profile?.uid;
              return (
                <Card key={c.uid} style={{marginBottom:'0.5rem',padding:'1rem',border:`1px solid ${i===0?'rgba(245,158,11,0.3)':isMe?'rgba(139,92,246,0.25)':'rgba(255,255,255,0.05)'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.5rem'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(245,158,11,0.15)',border:'2px solid rgba(245,158,11,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'👤'}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                        <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{c.username}</div>
                        {isMe&&<Tag color='violet'>Sen</Tag>}
                        {myVote===c.uid&&<Tag color='green'>Oyum</Tag>}
                      </div>
                      <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{c.party} • {c.slogan}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontWeight:800,color:'#F59E0B',fontSize:'1rem'}}>{c.votes||0}</div>
                      <div style={{fontSize:'0.6rem',color:'#5A7089'}}>oy ({pct}%)</div>
                    </div>
                  </div>
                  <ProgressBar pct={pct} color={i===0?'#F59E0B':'#8B5CF6'} h={4} />
                  {!userVoted&&c.uid!==profile?.uid&&(
                    <Btn variant='primary' size='sm' onClick={()=>voteInElection(c.uid)} style={{marginTop:'0.5rem',width:'100%'}}>🗳️ Bu Adaya Oy Ver</Btn>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {sub==='cabinet' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div style={{color:'#5A7089',fontSize:'0.78rem'}}>👔 Devlet Kabinesi</div>
              {(isPresident||isLeader)&&<Btn variant='ghost' size='sm' onClick={()=>setCabinetModal(true)}>+ Ata</Btn>}
            </div>
            {CABINET_ROLES.map(role => {
              const assigned = cabinet[role];
              const isMyRole = assigned===profile?.username;
              return (
                <Card key={role} style={{marginBottom:'0.4rem',padding:'0.75rem',border:`1px solid ${isMyRole?'rgba(245,158,11,0.3)':assigned?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)'}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontWeight:700,color:isMyRole?'#F59E0B':'#E8EDF2',fontSize:'0.85rem'}}>{role}</div>
                      {assigned ? <div style={{fontSize:'0.7rem',color:'#10B981',marginTop:'0.1rem'}}>👤 {assigned}{isMyRole?' (Sen)':''}</div>
                        : <div style={{fontSize:'0.7rem',color:'#3B4E63',marginTop:'0.1rem',fontStyle:'italic'}}>Boş — Atanmamış</div>}
                    </div>
                    <div style={{display:'flex',gap:'0.3rem',alignItems:'center'}}>
                      {isMyRole&&<Tag color='gold'>⭐ Senin</Tag>}
                      {!assigned&&(isPresident||isLeader)&&<Btn variant='ghost' size='sm' onClick={()=>{setCabinetRole(role);setCabinetModal(true);}}>Ata</Btn>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
            💡 Parti kurmak ₺10.000 gerektirir. Bakiye: {fmtWord(profile?.money)}
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
            <input type="number" value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} placeholder="₺ Tutar" style={inputSt} />
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
    if (myGang) { showNotif('Zaten bir çeteye üyesin','error'); return; }
    const cost = gForm.type==='gang' ? 50000 : 100000;
    if ((profile?.money||0) < cost) { showNotif(`${fmtWord(cost)} gerekli`,'error'); return; }
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
    if (myGang) { showNotif('Zaten üyesin','error'); return; }
    setGangs(prev => prev.map(g => g.id===gang.id ? {...g, members:[...(g.members||[]),uid], memberCount:(g.memberCount||0)+1} : g));
    setProfile(p => { const np={...p,gang:gang.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${gang.name}'e katıldın`,'success');
  };

  const leaveGang = () => {
    if (!myGang||isGangLeader) { if(isGangLeader) showNotif('Lider ayrılamaz. Önce liderliği devret.','error'); return; }
    setGangs(prev => prev.map(g => g.id===myGang.id ? {...g,members:(g.members||[]).filter(m=>m!==uid),memberCount:Math.max(0,(g.memberCount||1)-1)} : g));
    setProfile(p => { const np={...p,gang:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('Çeteden ayrıldın','info');
  };

  const kickMember = (muid) => {
    if (!isGangLeader) return;
    setGangs(prev => prev.map(g => g.id===myGang.id ? {...g,members:(g.members||[]).filter(m=>m!==muid),memberCount:Math.max(0,(g.memberCount||1)-1)} : g));
    showNotif('Üye çeteden çıkarıldı','info');
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
    ? [{id:'gangs',label:'⚔️ Liste'},{id:'management',label:'⚙️ Yönetim'},{id:'attack',label:'🥊 Suç'},{id:'territory',label:'🗺️ Bölge'}]
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
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{myGang.memberCount} üye • Güç: {myGang.power} • {isGangLeader?'👑 Lidersin':'Üye'}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.35rem',marginBottom:'0.5rem'}}>
                  {[['💰','Kasa',fmtWord(myGang.treasury||0)],['⚡','Güç',myGang.power||10],['🗺️','Bölge',myGang.territory||0]].map(([ic,lb,v])=>(
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
                <Btn variant='danger' size='sm' onClick={()=>{setGForm(p=>({...p,type:'gang'}));setCreateModal(true);}}>⚔️ Çete Kur (₺50K)</Btn>
                <Btn variant='ghost' size='sm' onClick={()=>{setGForm(p=>({...p,type:'family'}));setCreateModal(true);}}>👨‍👩‍👧‍👦 Aile Kur (₺100K)</Btn>
              </div>
            )}
            {gangs.map(gang => (
              <Card key={gang.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:`1px solid ${gang.id===myGang?.id?'rgba(239,68,68,0.3)':gang.type==='family'?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.1)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{gang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'} {gang.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{gang.memberCount} üye • Güç: {gang.power} • {fmtWord(gang.treasury||0)} kasa</div>
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
                    {[['👑','Lider',myGang.leaderName||'?'],['👥','Üye',myGang.memberCount||1],['⚡','Güç',myGang.power||10],['💰','Kasa',fmtWord(myGang.treasury||0)]].map(([ic,lb,v])=>(
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
            {[['🥊','Sokak Kavgası',80,'₺500-2.000',500],['🔫','Gasp Girişimi',60,'₺2.000-8.000',3000],['💣','Banka Soygunu',30,'₺20K-100K',10000],['🚗','Araba Hırsızlığı',70,'₺5.000-15.000',2000]].map(([ic,name,rate,earn,fine])=>(
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
          <Card style={{textAlign:'center',padding:'2rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🗺️</div>
            <div style={{color:'#5A7089'}}>Bölge sistemi yakında aktif</div>
          </Card>
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
            <input type="number" value={donateAmt} onChange={e=>setDonateAmt(e.target.value)} placeholder="₺ Tutar" style={inpSt} />
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
            <input type="number" value={donateAmt} onChange={e=>setDonateAmt(e.target.value)} placeholder="₺ Tutar" style={inpSt} />
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
function PlayersPage({ profile }) {
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tab, setTab] = useState('all');
  const [lbSub, setLbSub] = useState('money');
  const onlineCnt = useOnlineCount();
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
        {[['all',`👥 Tümü (${combined.length})`],['top','🏆 Liderlik']].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:'0.38rem 0.75rem',borderRadius:'8px',border:`1px solid ${tab===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,background:tab===v?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:tab===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.76rem',cursor:'pointer',whiteSpace:'nowrap'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Online badge */}
      <div style={{display:'inline-flex',alignItems:'center',gap:'5px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'20px',padding:'4px 12px',marginBottom:'0.75rem',fontSize:'0.72rem',fontWeight:700,color:'#10B981'}}>
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10B981',animation:'pulse 2s infinite'}} />
        {onlineCnt} çevrimiçi oyuncu
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

      {/* Oyuncu listesi */}
      {(tab==='top'?leaderboardData:filtered).map((p,i) => (
        <button key={p.id||p.username} onClick={()=>setSelectedPlayer(p)}
          style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background: p.username===profile?.username?'rgba(59,130,246,0.08)':'rgba(15,28,48,0.85)',border:`1px solid ${p.username===profile?.username?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.05)'}`,borderRadius:'12px',width:'100%',marginBottom:'0.4rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s',textAlign:'left'}}>
          {tab==='top' && (
            <div style={{width:'28px',textAlign:'center',fontSize:'1rem',flexShrink:0}}>{rankIcon(i)}</div>
          )}
          <div style={{position:'relative',flexShrink:0}}>
            <Avatar profile={p} size={42} />
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
              <span style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{p.username}</span>
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
      ))}
      {(tab==='top'?leaderboardData:filtered).length===0 && (
        <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>
          {search ? 'Oyuncu bulunamadı' : 'Henüz kayıtlı oyuncu yok'}
        </div>
      )}

      {selectedPlayer && (
        <Modal title={`👤 ${selectedPlayer.username}`} onClose={()=>setSelectedPlayer(null)}>
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <Avatar profile={selectedPlayer} size={64} />
            <div style={{fontWeight:800,fontSize:'1.1rem',color:'#E8EDF2',marginTop:'0.6rem'}}>{selectedPlayer.username}</div>
            <div style={{fontSize:'0.75rem',color:'#5A7089'}}>{selectedPlayer.city||'?'} • {getLevelInfo(selectedPlayer.xp||0).title}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'1rem'}}>
            {[['💰','Para',fmtM(selectedPlayer.money||0)],['⭐','Seviye','Lv.'+(selectedPlayer.level||1)],['📊','XP',fmt(selectedPlayer.xp||0)],['🏙️','Şehir',selectedPlayer.city||'?']].map(([ic,lb,v])=>(
              <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'0.65rem',textAlign:'center'}}>
                <div style={{fontSize:'0.6rem',color:'#3B4E63',textTransform:'uppercase',marginBottom:'0.2rem'}}>{ic} {lb}</div>
                <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.9rem'}}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
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
              ['🪙','UnderCoin',fmtUC(profile?.underCoin),'#F59E0B'],
              ['⭐','Merit',fmt(profile?.meritPoints),'#8B5CF6'],
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
            <div style={{fontSize:'0.68rem',color:'#5A7089',marginBottom:'0.5rem'}}>URL gir (.jpg, .png, .gif, .webp)</div>
            <input value={photoUrlInput} onChange={e=>setPhotoUrlInput(e.target.value)} placeholder="https://resim-url.com/foto.jpg" style={inputSt}/>
            {photoUrlInput && <img src={photoUrlInput} alt="preview" style={{width:'52px',height:'52px',borderRadius:'50%',objectFit:'cover',marginTop:'0.5rem',border:'2px solid rgba(59,130,246,0.3)',display:'block'}} onError={e=>e.target.style.display='none'}/>}
            <Btn variant='primary' size='full' onClick={savePhotoUrl} style={{marginTop:'0.5rem'}}>✅ Kaydet</Btn>
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
    { id:'week', label:'Haftalık', price:49, uc:0, days:7, badge:'🟢' },
    { id:'month', label:'Aylık', price:149, uc:0, days:30, badge:'⭐', popular:true },
    { id:'year', label:'Yıllık', price:999, uc:0, days:365, badge:'💎', save:'%44 Tasarruf' },
    { id:'uc', label:'UC ile', price:0, uc:500, days:30, badge:'🪙' },
  ];

  return (
    <div style={{padding:'0.7rem'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,#1a0a2e,#2d1060)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'20px',padding:'1.5rem',textAlign:'center',marginBottom:'0.75rem'}}>
        <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>💎</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#fff',marginBottom:'0.25rem'}}>UNDERSTATE VIP</div>
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
            <div style={{fontWeight:900,color:'#A78BFA',fontSize:'1rem'}}>{p.price>0 ? `₺${p.price}` : `${p.uc} UC`}</div>
            <Btn variant='ghost' size='sm' onClick={()=>showNotif('Ödeme sistemi yakında aktif! 💎','gold')} style={{marginTop:'0.25rem'}}>Satın Al</Btn>
          </div>
        </div>
      ))}
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
  const [sub, setSub] = useState('list');
  const [createModal, setCreateModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [holdingName, setHoldingName] = useState('');
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [manageModal, setManageModal] = useState(false);

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
    const h = {
      id: genId(), name: holdingName.trim(), sector: sec.id, sectorLabel: sec.label,
      sectorIcon: sec.icon, owner: profile?.uid, ownerName: profile?.username,
      value: sec.baseCost, dailyProfit: sec.profit, maintenance: sec.maint,
      level: 1, experience: 0, lastProfit: 0, employees: Math.floor(sec.baseCost / 50000),
      listedOnStock: false, shares: [], createdAt: Date.now(),
    };
    setHoldings(prev => [...prev, h]);
    setProfile(p => {
      const np = { ...p, money: (p.money||0) - sec.baseCost };
      localStorage.setItem('rep_userProfile', JSON.stringify(np));
      return np;
    });
    setCreateModal(false);
    setHoldingName('');
    setSelectedSector(null);
    showNotif(`🏢 ${h.name} kuruldu!`, 'success');
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

  return (
    <div>
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {[{id:'list',label:'🏢 Şirketlerim'},{id:'market',label:'🌐 Piyasa'},{id:'sectors',label:'📊 Sektörler'}].map(s=>(
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

            {!myHoldings.length && (
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

        {sub === 'market' && (
          <div>
            <div style={{color:'#5A7089',fontSize:'0.78rem',marginBottom:'0.75rem'}}>🌐 Tüm oyunculara ait şirketler</div>
            {holdings.length === 0 && (
              <Card style={{textAlign:'center',padding:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🏢</div>
                <div style={{color:'#5A7089',fontSize:'0.85rem'}}>Henüz hiç şirket kurulmamış</div>
              </Card>
            )}
            {holdings.map(h => (
              <Card key={h.id} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                  <span style={{fontSize:'1.75rem',flexShrink:0}}>{h.sectorIcon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{h.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#5A7089'}}>{h.sectorLabel} • CEO: {h.ownerName} • Lv.{h.level}</div>
                    <div style={{fontSize:'0.7rem',color:'#10B981',marginTop:'0.15rem'}}>Günlük kâr: {fmtWord(h.dailyProfit)}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#F59E0B',fontWeight:800,fontSize:'0.85rem'}}>{fmtWord(h.value)}</div>
                    <div style={{fontSize:'0.6rem',color:'#5A7089'}}>Değer</div>
                  </div>
                </div>
              </Card>
            ))}
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
          {getReadyToCollect(selectedHolding) && (
            <Btn variant='green' size='full' onClick={()=>{collectProfit(selectedHolding);setManageModal(false);setSelectedHolding(null);}}>
              💰 Kar Topla
            </Btn>
          )}
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
    if ((cu.money||0) < 2000000) { showNotif('❌ ₺2,000,000 gerekli!','error'); return; }
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
    showNotif(`✅ ${name} kuruldu! ₺500,000 başlangıç bütçesi.`, 'success');
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
    showNotif(res + (prize ? ' +₺'+prize.toLocaleString() : '') + (fanChg>0 ? ' +'+fanChg+' taraftar' : fanChg<0 ? ' '+fanChg+' taraftar' : ''), won?'success':drew?'info':'error');
  };

  const transferPlayer = () => {
    if (!myClub) return;
    if ((myClub.budget||0)<250000) { showNotif('❌ Transfer için ₺250,000 bütçe gerekli!','error'); return; }
    const names=['Kemal Aydın','Burak Doğan','Serkan Polat','Emre Güzel','Tolga Arslan','Cem Yıldız','Ferhat Korkmaz'];
    const positions=['Kaleci','Defans','Orta Saha','Forvet','Kanat'];
    const newP={name:names[Math.floor(Math.random()*names.length)],pos:positions[Math.floor(Math.random()*positions.length)],rating:Math.floor(Math.random()*20)+65};
    setClubs(prev=>prev.map(c=>c.id===myClub.id?{...c,players:[...(c.players||[]),newP],budget:(c.budget||0)-250000,rating:Math.floor((c.rating*((c.players||[]).length)+newP.rating)/((c.players||[]).length+1))}:c));
    showNotif(`✅ ${newP.name} transfer edildi! (${newP.rating} puan) -₺250,000`, 'success');
  };

  const sortedLeague = [...clubs].sort((a,b)=>(b.points||0)-(a.points||0));
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#10B981',marginBottom:'1rem',letterSpacing:'0.05em'}}>⚽ Futbol Yönetimi</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {[{k:'clubs',l:'⚽ Kulübüm'},{k:'league',l:'🏆 Lig'},{k:'matches',l:'📅 Maçlar'},{k:'transfer',l:'🔄 Transfer'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 1rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#10B981':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(16,185,129,0.15)':'transparent',color:tab===t.k?'#10B981':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='clubs'&&(<div>
        {!myClub&&<div style={{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
          <div style={{fontWeight:700,color:'#10B981',marginBottom:'0.5rem'}}>⚽ Kulüp Kur</div>
          <p style={{fontSize:'0.85rem',color:'#999',marginBottom:'0.75rem'}}>Kendi futbol kulübünü kur, oyuncular al, liglerde şampiyon ol! Kurulum ücreti: ₺2,000,000</p>
          <button onClick={createClub} style={{padding:'0.6rem 1.2rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'8px',color:'#10B981',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>⚽ Kulüp Kur (₺2,000,000)</button>
        </div>}
        {myClub&&<div>
          <div style={{background:`linear-gradient(135deg,${myClub.color||'#10B981'}22,rgba(0,0,0,0))`,border:`1px solid ${myClub.color||'#10B981'}44`,borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',color:myClub.color||'#10B981'}}>{myClub.name}</div><div style={{fontSize:'0.78rem',color:'#999'}}>📍 {myClub.city} · Kuruluş: {myClub.founded}</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.8rem'}}>⭐</div><div style={{fontWeight:900,fontSize:'1.3rem',color:'#FFD700'}}>{myClub.rating}</div></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[{l:'Bütçe',v:`₺${((myClub.budget||0)/1000).toFixed(0)}K`,c:'#10B981'},{l:'Taraftar',v:(myClub.fans||0).toLocaleString(),c:'#60A5FA'},{l:'Hücum',v:myClub.attack||65,c:'#EF4444'},{l:'Savunma',v:myClub.defense||65,c:'#3B82F6'}].map(s=>(
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
            <div style={{fontSize:'0.85rem',color:'#bbb',marginBottom:'0.75rem'}}>Bütçe: <strong style={{color:'#10B981'}}>₺{(myClub.budget||0).toLocaleString()}</strong></div>
            <button onClick={transferPlayer} style={{width:'100%',padding:'0.7rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',color:'#F59E0B',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.9rem'}}>🔄 Rastgele Oyuncu Satın Al (₺250,000)</button>
          </div>}
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
    if ((cu.money||0) < type.cost) { showNotif(`❌ ₺${type.cost.toLocaleString()} gerekli!`,'error'); return; }
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
    showNotif(`✅ ${cycles}x üretim: +₺${earned.toLocaleString()}`,'success');
  };

  const upgradeFactory = () => {
    if (!myFact) return;
    const cost = myFact.level * 250000;
    if ((cu.money||0) < cost) { showNotif(`❌ Geliştirme maliyeti: ₺${cost.toLocaleString()}`,'error'); return; }
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
              <div style={{textAlign:'right'}}><div style={{fontWeight:700,color:'#10B981',fontSize:'1.1rem'}}>₺{myFact.income.toLocaleString()}</div><div style={{fontSize:'0.65rem',color:'#666'}}>her {myFact.prodTime/3600000}s</div></div>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.72rem',color:'#999',marginBottom:'0.25rem'}}>Sonraki üretim:</div>
              {(()=>{
                const elapsed=now-myFact.lastProd, rem=Math.max(0,myFact.prodTime-elapsed%myFact.prodTime);
                const cycles=Math.floor(elapsed/myFact.prodTime);
                return <div style={{fontWeight:700,color:cycles>0?'#10B981':'#F59E0B',fontSize:'0.9rem'}}>{cycles>0?`✅ ${cycles}x hazır! (₺${(cycles*myFact.income*myFact.level).toLocaleString()})`:`⏳ ${Math.ceil(rem/3600000)}sa ${Math.ceil((rem%3600000)/60000)}dk`}</div>;
              })()}
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button onClick={collectIncome} style={{flex:1,padding:'0.6rem',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px',color:'#10B981',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>💰 Topla</button>
              <button onClick={upgradeFactory} style={{flex:1,padding:'0.6rem',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'8px',color:'#A78BFA',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>⬆️ Geliştir (₺{(myFact.level*250000).toLocaleString()})</button>
            </div>
          </div>
        </div>}
      </div>}

      {tab==='build'&&<div>
        {FACTORY_TYPES.map(type=>(
          <div key={type.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
              <div><div style={{fontWeight:700,fontSize:'1rem'}}>{type.icon} {type.name}</div><div style={{fontSize:'0.75rem',color:'#999'}}>Gelir: ₺{type.income.toLocaleString()}/{type.prodTime/3600000}sa · Ürün: {type.product}</div></div>
              <div style={{color:'#F59E0B',fontWeight:700,fontSize:'0.9rem'}}>₺{type.cost.toLocaleString()}</div>
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
            <div style={{color:'#10B981',fontWeight:700,fontSize:'0.85rem'}}>₺{f.income.toLocaleString()}/saat</div>
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
    showNotif(`✅ Tüm kaynaklar satıldı! +₺${total.toLocaleString()}`,'success');
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
              <div style={{fontSize:'0.68rem',color:'#999',textAlign:'center',marginBottom:'0.5rem'}}>Fiyat: ₺{res.price.toLocaleString()} · Stok: <strong style={{color:qty>0?'#10B981':'#666'}}>{qty}</strong></div>
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
              <span style={{color:'#10B981'}}>₺{(qty*r.price).toLocaleString()}</span>
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

  const RANKS = ['Onbaşı','Çavuş','Astsubay','Teğmen','Yüzbaşı','Binbaşı','Albay','General','Mareşal'];
  const totalStrength = UNITS.reduce((s,u2) => s + (myArmy[u2.id]||0)*u2.strength, 0);
  const rankIdx = Math.min(RANKS.length-1, Math.floor(myArmy.wins/5));
  const currentRank = RANKS[rankIdx];

  const recruit = (unit) => {
    if ((cu.money||0) < unit.cost) { showNotif(`❌ ${unit.name} için ₺${unit.cost.toLocaleString()} gerekli!`,'error'); return; }
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
    showNotif(won?`🏆 Savaş kazanıldı! +₺${prize.toLocaleString()} +15🏅`:`💔 Savaş kaybedildi! ${losses}x asker kayıp`);
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#EF4444',marginBottom:'1rem'}}>⚔️ Ordu Yönetimi</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {[{k:'overview',l:'📊 Genel Bakış'},{k:'recruit',l:'🪖 Asker Al'},{k:'battle',l:'⚔️ Savaş'}].map(t=>(
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
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><span style={{fontSize:'1.5rem'}}>{unit.icon}</span><div><div style={{fontWeight:700,fontSize:'0.9rem'}}>{unit.name}</div><div style={{fontSize:'0.7rem',color:'#999'}}>Güç: {unit.strength} · Bakım: ₺{unit.upkeep.toLocaleString()}/gün · Adet: {myArmy[unit.id]||0}</div></div></div>
              <div style={{color:'#EF4444',fontWeight:700}}>₺{unit.cost.toLocaleString()}</div>
            </div>
            <button onClick={()=>recruit(unit)} style={{width:'100%',padding:'0.5rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',color:'#EF4444',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>🪖 Askere Al (₺{unit.cost.toLocaleString()})</button>
          </div>
        ))}
      </div>}

      {tab==='battle'&&<div>
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.07),rgba(0,0,0,0))',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>⚔️</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:700,color:'#EF4444',marginBottom:'0.25rem'}}>Savaş Meydanı</div>
          <div style={{fontSize:'0.82rem',color:'#999',marginBottom:'1rem'}}>Toplam Gücün: <strong style={{color:'#60A5FA'}}>{totalStrength}</strong> · Kazanma şansın: <strong style={{color:'#10B981'}}>~%55</strong></div>
          <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.75rem',marginBottom:'1rem',textAlign:'left'}}>
            <div style={{fontSize:'0.78rem',color:'#999',marginBottom:'0.25rem'}}>💰 Kazanç: Güç × ₺100</div>
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
    if ((cu.money||0)<op.cost) { showNotif(`❌ ₺${op.cost.toLocaleString()} gerekli!`,'error'); return; }
    const success = Math.random() < op.successRate;
    const entry = {id:Date.now(),op:op.name,icon:op.icon,result:success?'success':'fail',date:new Date().toLocaleDateString('tr-TR'),reward:success?op.reward:null};
    setSpyOps(prev=>[entry,...prev].slice(0,30));
    setSpyCooldown(prev=>({...prev,[cu.id+'_'+op.id]:now}));
    if (success) {
      updateUser({money:(cu.money||0)-op.cost+op.reward.money,meritPoints:(cu.meritPoints||0)+op.reward.merit});
      showNotif(`✅ ${op.name} başarılı! +₺${op.reward.money.toLocaleString()} +${op.reward.merit}🏅`,'success');
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
                <div style={{textAlign:'right',flexShrink:0}}><div style={{color:'#A78BFA',fontWeight:700,fontSize:'0.85rem'}}>₺{op.cost.toLocaleString()}</div><div style={{fontSize:'0.65rem',color:'#10B981'}}>Başarı: %{Math.round(op.successRate*100)}</div></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
                <div style={{fontSize:'0.72rem',color:'#FFD700'}}>Ödül: ₺{op.reward.money.toLocaleString()} +{op.reward.merit}🏅</div>
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
            <div style={{color:op.result==='success'?'#10B981':'#EF4444',fontWeight:700,fontSize:'0.8rem'}}>{op.result==='success'?`✅ +₺${op.reward?.money?.toLocaleString()}`:'💔 Başarısız'}</div>
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
    if ((cu.money||0)<5000) { showNotif('❌ Yayın ücreti: ₺5,000','error'); return; }
    const paper = {id:Date.now(),title:form.title.trim(),content:form.content.trim(),category:form.category,author:cu.username,date:new Date().toLocaleDateString('tr-TR'),likes:0,views:0};
    setPapers(prev=>[paper,...prev].slice(0,100));
    updateUser({money:(cu.money||0)-5000,meritPoints:(cu.meritPoints||0)+5});
    setForm({title:'',content:'',category:'Gündem'});
    setTab('read');
    showNotif('✅ Makale yayınlandı! +5🏅','success');
  };

  const likeArticle = (id) => {
    setPapers(prev=>prev.map(p=>p.id===id?{...p,likes:(p.likes||0)+1}:p));
  };

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#60A5FA',marginBottom:'1rem'}}>📰 Gazete & Medya</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem'}}>
        {[{k:'read',l:'📰 Haberler'},{k:'write',l:'✍️ Yaz'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'0.4rem 1rem',borderRadius:'2rem',border:`1px solid ${tab===t.k?'#60A5FA':'rgba(255,255,255,0.12)'}`,background:tab===t.k?'rgba(96,165,250,0.15)':'transparent',color:tab===t.k?'#60A5FA':'#999',cursor:'pointer',fontWeight:tab===t.k?700:400,fontSize:'0.83rem',fontFamily:'inherit'}}>{t.l}</button>
        ))}
      </div>

      {tab==='read'&&<div>
        {papers.length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#555'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>📰</div>
          Henüz haber yok. İlk makaleyi sen yaz!
        </div>}
        {papers.map(p=>(
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

      {tab==='write'&&<div>
        <div style={{background:'rgba(96,165,250,0.05)',border:'1px solid rgba(96,165,250,0.2)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.8rem',color:'#60A5FA',marginBottom:'0.5rem',fontWeight:700}}>📝 Makale Yayınla (₺5,000)</div>
          <div style={{marginBottom:'0.5rem'}}>
            <div style={{fontSize:'0.72rem',color:'#999',marginBottom:'0.25rem'}}>Kategori</div>
            <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
              {CATS.map(c=><button key={c} onClick={()=>setForm(prev=>({...prev,category:c}))} style={{padding:'0.25rem 0.6rem',borderRadius:'1rem',border:`1px solid ${form.category===c?'#60A5FA':'rgba(255,255,255,0.12)'}`,background:form.category===c?'rgba(96,165,250,0.15)':'transparent',color:form.category===c?'#60A5FA':'#999',cursor:'pointer',fontSize:'0.75rem',fontFamily:'inherit'}}>{c}</button>)}
            </div>
          </div>
          <input value={form.title} onChange={e=>setForm(prev=>({...prev,title:e.target.value}))} placeholder="Makale başlığı..." style={{width:'100%',padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'#E8EDF2',fontSize:'0.9rem',outline:'none',marginBottom:'0.5rem',fontFamily:'inherit'}} />
          <textarea value={form.content} onChange={e=>setForm(prev=>({...prev,content:e.target.value}))} placeholder="Makale içeriği... (min 50 karakter)" rows={5} style={{width:'100%',padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'#E8EDF2',fontSize:'0.85rem',outline:'none',resize:'vertical',fontFamily:'inherit',marginBottom:'0.5rem'}} />
          <button onClick={publish} style={{width:'100%',padding:'0.65rem',background:'rgba(96,165,250,0.15)',border:'1px solid rgba(96,165,250,0.3)',borderRadius:'8px',color:'#60A5FA',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.9rem'}}>📰 Yayınla (₺5,000)</button>
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
      showNotif(`⚔️ Saldırı başarılı! +₺${stolen.toLocaleString()} +10🏅 -${hpLost}❤️`,'success');
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
              <div style={{fontSize:'0.7rem',color:'#999'}}>Lv.{t.level||1} · ❤️{t.hp||100} · ₺{((t.money||0)/1000).toFixed(0)}K</div>
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
            <div style={{fontSize:'0.78rem',fontWeight:700,color:(b.result==='win'&&b.attacker===cu.username)?'#10B981':'#EF4444'}}>{(b.result==='win'&&b.attacker===cu.username)?`+₺${(b.stolen||0).toLocaleString()}`:'💔'}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SOSYAL MEDYA SAYFASI
// ═══════════════════════════════════════════════════════
function SocialPage({ profile, showNotif }) {
  const [posts, setPosts] = useLs('socialPosts', []);
  const [newPost, setNewPost] = useState('');
  const { dark } = useTheme();
  const bg = dark ? '#0F172A' : '#F8FAFC';
  const cu = profile || {};

  const publishPost = () => {
    if (!newPost.trim()) { showNotif('❌ Gönderi boş olamaz!','error'); return; }
    if (newPost.length > 280) { showNotif('❌ Maksimum 280 karakter!','error'); return; }
    const post = {id:Date.now(),author:cu.username,content:newPost.trim(),likes:[],date:new Date().toLocaleDateString('tr-TR'),time:new Date().toLocaleTimeString('tr-TR'),city:cu.city||'İstanbul'};
    setPosts(prev=>[post,...prev].slice(0,200));
    setNewPost('');
    showNotif('✅ Gönderi paylaşıldı!','success');
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

  return (
    <div style={{padding:'1rem',background:bg,minHeight:'100%'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:900,color:'#A78BFA',marginBottom:'1rem'}}>📱 Sosyal Medya</div>
      <div style={{background:'rgba(167,139,250,0.05)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem'}}>
        <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder={`${cu.username} olarak ne düşünüyorsun?`} rows={3} style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'#E8EDF2',fontSize:'0.9rem',resize:'none',fontFamily:'inherit',marginBottom:'0.5rem'}} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:'0.75rem',color:newPost.length>260?'#EF4444':'#666'}}>{newPost.length}/280</span>
          <button onClick={publishPost} style={{padding:'0.45rem 1.2rem',background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.35)',borderRadius:'8px',color:'#A78BFA',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:'0.85rem'}}>📢 Paylaş</button>
        </div>
      </div>
      {posts.map(p=>(
        <div key={p.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'1rem',marginBottom:'0.75rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
            <div><div style={{fontWeight:700,color:'#A78BFA',fontSize:'0.88rem'}}>{p.author}</div><div style={{fontSize:'0.65rem',color:'#666'}}>{p.city} · {p.date}</div></div>
            {p.author===cu.username&&<button onClick={()=>deletePost(p.id)} style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontSize:'0.85rem'}}>🗑️</button>}
          </div>
          <div style={{fontSize:'0.88rem',color:'#ccc',lineHeight:1.6,marginBottom:'0.5rem'}}>{p.content}</div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={()=>likePost(p.id)} style={{padding:'0.25rem 0.7rem',background:(p.likes||[]).includes(cu.username)?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${(p.likes||[]).includes(cu.username)?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'6px',color:(p.likes||[]).includes(cu.username)?'#EF4444':'#999',cursor:'pointer',fontSize:'0.78rem',fontFamily:'inherit'}}>❤️ {(p.likes||[]).length}</button>
          </div>
        </div>
      ))}
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
    {id:'first_million',icon:'💰',title:'İlk Milyoner',desc:'₺1,000,000 birikir',check:p=>(p.money||0)+(p.bankMoney||0)>=1000000,color:'#FFD700'},
    {id:'billionaire',icon:'🏦',title:'Milyarder',desc:'₺1,000,000,000 birikir',check:p=>(p.money||0)+(p.bankMoney||0)>=1000000000,color:'#FFD700'},
    {id:'lv10',icon:'⭐',title:'Tecrübeli',desc:'Seviye 10',check:p=>(p.level||1)>=10,color:'#60A5FA'},
    {id:'lv50',icon:'🌟',title:'Efsanevi',desc:'Seviye 50',check:p=>(p.level||1)>=50,color:'#A78BFA'},
    {id:'politician',icon:'🏛️',title:'Siyasetçi',desc:'Bir partiye katıl',check:p=>{const part=parties.find(pt=>(pt.members||[]).includes(p.username));return !!part;},color:'#F59E0B'},
    {id:'gangster',icon:'🔫',title:'Sokak Köpeği',desc:'Bir çeteye katıl',check:p=>{const g=gangs.find(g=>(g.members||[]).includes(p.username));return !!g;},color:'#EF4444'},
    {id:'merit100',icon:'🏅',title:'Kahraman',desc:'100 liyakat puanı',check:p=>(p.meritPoints||0)>=100,color:'#F59E0B'},
    {id:'merit1000',icon:'🏆',title:'Milli Kahraman',desc:'1000 liyakat puanı',check:p=>(p.meritPoints||0)>=1000,color:'#FFD700'},
    {id:'vip',icon:'👑',title:'VIP Üye',desc:'VIP ol',check:p=>p.vip||p.premium,color:'#A78BFA'},
    {id:'factory_owner',icon:'🏭',title:'Sanayici',desc:'Fabrika kur',check:p=>factories.some(f=>f.owner===p.username),color:'#F59E0B'},
    {id:'uc1000',icon:'💎',title:'UC Koleksiyoncusu',desc:'1000 UnderCoin',check:p=>(p.underCoin||0)>=1000,color:'#7DD3FC'},
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
    if(betAmt<1000){showNotif('❌ Minimum bahis: ₺1,000!','error');return;}
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
    const msgs={win:`🃏 Kazandın! +₺${payout.toLocaleString()}`,lose:'💔 Kaybettin!',push:`🤝 Beraberlik! Bahis iade.`,bust:'💥 Battı! 21\'i geçtin!'};
    showNotif(msgs[result]||'',result==='win'?'success':'error');
  };

  const startPoker = () => {
    if(betAmt<5000){showNotif('❌ Minimum poker bahsi: ₺5,000!','error');return;}
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
    showNotif(win>0?`✅ ${rank}! +₺${win.toLocaleString()}`:'💔 Kazanmadın!',win>0?'success':'error');
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
    {label:'₺10,000',icon:'💵',type:'money',value:10000,color:'#10B981',weight:25},
    {label:'₺50,000',icon:'💰',type:'money',value:50000,color:'#10B981',weight:12},
    {label:'₺200,000',icon:'💎',type:'money',value:200000,color:'#10B981',weight:4},
    {label:'20 UC',icon:'🪙',type:'uc',value:20,color:'#FFB800',weight:20},
    {label:'100 UC',icon:'💎',type:'uc',value:100,color:'#A78BFA',weight:5},
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
    if((cu.money||0)<1000){showNotif('❌ Min ₺1,000!','error');return;}
    const bet=Math.max(1000,Math.min(betAmt,cu.money||0));
    const SYMS=['🍒','🍋','🍊','⭐','💎','7️⃣'];
    const s=[SYMS[Math.floor(Math.random()*SYMS.length)],SYMS[Math.floor(Math.random()*SYMS.length)],SYMS[Math.floor(Math.random()*SYMS.length)]];
    let mult=0;
    if(s[0]===s[1]&&s[1]===s[2]){mult=s[0]==='7️⃣'?10:s[0]==='💎'?7:3;}
    else if(s[0]===s[1]||s[1]===s[2]||s[0]===s[2]) mult=1.5;
    const win=Math.floor(bet*mult);
    updateUser({money:(cu.money||0)-bet+win});
    if(win>0) showNotif(`${s.join('')} KAZANDI! +₺${(win-bet).toLocaleString()}`,'success');
    else showNotif(`${s.join('')} Kaybettin! -₺${bet.toLocaleString()}`,'error');
  };

  const playCoinFlip=()=>{
    if((cu.money||0)<500){showNotif('❌ Min ₺500!','error');return;}
    const bet=Math.max(500,Math.min(betAmt,cu.money||0));
    const won=Math.random()<0.5;
    updateUser({money:(cu.money||0)+(won?bet:-bet)});
    showNotif(won?`🪙 YAZΙ! +₺${bet.toLocaleString()}`:`🪙 TURA! -₺${bet.toLocaleString()}`,won?'success':'error');
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
          <span style={{fontSize:'0.78rem',color:'#999'}}>Bak: ₺{((cu.money||0)/1000).toFixed(0)}K</span>
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
              <div style={{fontWeight:700,color:bjState.phase==='win'?'#10B981':bjState.phase==='push'?'#F59E0B':'#EF4444'}}>{bjState.phase==='win'?`Kazandın! +₺${(bjState.bet).toLocaleString()}`:bjState.phase==='push'?'Beraberlik!':bjState.phase==='bust'?'Battı!':'Kaybettin!'}</div>
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
              <div style={{fontWeight:700,color:pokerState.win>0?'#10B981':'#EF4444',fontSize:'0.95rem'}}>{pokerState.result} {pokerState.win>0?`+₺${pokerState.win.toLocaleString()}`:'Kazanmadın!'}</div>
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

  const showNotif = useCallback((msg, type='info', icon='🔔') => {
    setToast({ msg, type });
    setNotifications(n => [...n.slice(-49), { msg, type, icon, ts:Date.now() }]);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLogin = (p) => {
    setProfile_raw(p);
    setAuthed(true);
    if (p.uid) {
      window._startPresenceHeartbeat?.(p.uid, p.username || 'Oyuncu');
      window._setupUserListener?.(p.uid);
      window.dispatchEvent(new CustomEvent('user-logged-in', { detail:{ userId:p.uid } }));
    }
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
    <ThemeCtx.Provider value={themeVal}>
      {/* Responsive outer wrapper — max 480px on desktop, centered */}
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'stretch',justifyContent:'center',background: dark ? '#060C18' : '#E5E7EB'}}>
        <div style={{position:'relative',width:'100%',maxWidth:'480px',display:'flex',flexDirection:'column',overflow:'hidden',background: dark ? '#0F172A' : '#F0F2F5',boxShadow:'0 0 60px rgba(0,0,0,0.3)'}}>
          <Header profile={profile} notifCount={notifCount} onNotif={()=>setNotifOpen(true)} page={page} />

          {/* Main scrollable content */}
          <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'calc(70px + env(safe-area-inset-bottom, 0px))',background:pageBg}}>
            {page==='home'         && <HomePage        {...pageProps} />}
            {page==='chat'         && <ChatPage        profile={profile} />}
            {page==='economy'      && <EconomyPage     {...pageProps} />}
            {page==='market'       && <MarketPage      {...pageProps} />}
            {page==='politics'     && <PoliticsPage    {...pageProps} />}
            {page==='holdings'     && <HoldingsPage    {...pageProps} />}
            {page==='gang'         && <GangPage        {...pageProps} />}
            {page==='alliance'     && <AlliancePage    {...pageProps} />}
            {page==='world'        && <WorldPage       profile={profile} onNavigate={setPage} />}
            {page==='admin'        && <AdminPage       profile={profile} showNotif={showNotif} onNavigate={setPage} />}
            {page==='players'      && <PlayersPage     profile={profile} />}
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
          </div>

          <BottomNav page={page} onChange={setPage} items={navItems} notifMap={{ chat: notifications.filter(n=>n.type==='message'&&Date.now()-n.ts<300000).length }} />

          {toast && <Notif msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
          {notifOpen && <NotifPanel notifications={notifications} onClose={()=>setNotifOpen(false)} onClear={()=>setNotifications([])} />}
        </div>
      </div>
    </ThemeCtx.Provider>
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
