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

// ═══════════════════════════════════════════════════════
// YARDIMCI
// ═══════════════════════════════════════════════════════
const fmt    = (n) => Number(n||0).toLocaleString('tr-TR');
const fmtM   = (n) => `₺${fmt(Math.floor(n||0))}`;
const fmtUC  = (n) => `${fmt(n||0)} UC`;
const cls    = (...a) => a.filter(Boolean).join(' ');
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
  const [f, setF] = useState({ username:'', email:'', password:'', city:'İstanbul', gender:'male' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showPw, setShowPw] = useState(false);
  const u = (k,v) => setF(p => ({...p,[k]:v}));

  const doLogin = async () => {
    if (!f.email || !f.password) { setErr('E-posta ve şifre gerekli'); return; }
    setLoading(true); setErr('');
    // Allow typing "admin" as shorthand
    const email = (f.email.trim() === 'admin') ? 'admin@understate.tr' : f.email.trim();
    const isAdminLogin = email === 'admin@understate.tr' && f.password === 'admin123';
    try {
      let user;
      try {
        user = await fbLogin(email, f.password);
      } catch(loginErr) {
        // Auto-create admin account on first login if not found
        if ((loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') && isAdminLogin) {
          user = await fbRegister(email, f.password);
        } else {
          throw loginErr;
        }
      }
      // Try Firestore first, fall back to localStorage (handles permission errors)
      let profile = null;
      try { profile = await loadUserProfile(user.uid); } catch(_) {}
      // Check localStorage cache if Firestore failed
      if (!profile) {
        try {
          const cached = localStorage.getItem('rep_userProfile');
          if (cached) { const p = JSON.parse(cached); if (p?.uid === user.uid) profile = p; }
        } catch(_) {}
      }
      if (!profile) {
        profile = {
          uid: user.uid, email: email,
          username: isAdminLogin ? 'Admin' : 'Oyuncu',
          city: 'Ankara', gender: 'male',
          money: isAdminLogin ? 999999999 : 75000,
          bank: isAdminLogin ? 999999999 : 25000,
          underCoin: isAdminLogin ? 99999 : 200,
          xp: isAdminLogin ? 999999 : 0, level: isAdminLogin ? 99 : 1,
          meritPoints: isAdminLogin ? 9999 : 0,
          health: 100, happiness: 100, energy: 100, hunger: 100,
          premium: isAdminLogin, vip: isAdminLogin,
          isAdmin: isAdminLogin,
          registeredAt: Date.now(), lastOnline: Date.now(),
          loginStreak: 1, lastLoginDate: new Date().toDateString(),
          achievements: [], inventory: {}, badges: [],
          stats: { trades:0, messages:0, crimes:0, votes:0, battles:0, farm:0 },
          skills: { trade:0, politics:0, crime:0, military:0, farming:0 }
        };
        // Best-effort save — ignore Firestore permission errors
        saveUserProfile(user.uid, profile).catch(() => {});
      }
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('rep_userProfile', JSON.stringify(profile));
      window._setupUserListener?.(user.uid);
      window._startPresenceHeartbeat?.(user.uid, profile.username || 'Oyuncu');
      onLogin({ ...profile, uid: user.uid });
    } catch(e) {
      const msg = e.code === 'auth/wrong-password'       ? 'Hatalı şifre' :
                  e.code === 'auth/invalid-credential'   ? 'Hatalı şifre veya e-posta' :
                  e.code === 'auth/user-not-found'       ? 'Kullanıcı bulunamadı' :
                  e.code === 'auth/invalid-email'        ? 'Geçersiz e-posta' :
                  'Giriş hatası: ' + (e.message||e.code||'');
      setErr(msg);
    }
    setLoading(false);
  };

  const doRegister = async () => {
    if (!f.username.trim()||!f.email||!f.password) { setErr('Tüm alanları doldurun'); return; }
    if (f.username.length < 3) { setErr('Kullanıcı adı en az 3 karakter'); return; }
    if (f.password.length < 6) { setErr('Şifre en az 6 karakter'); return; }
    setLoading(true); setErr('');
    try {
      const user = await fbRegister(f.email, f.password);
      const profile = {
        uid: user.uid, username: f.username.trim(), email: f.email,
        city: f.city, gender: f.gender,
        money: 75000, bank: 25000, underCoin: 200,
        xp: 0, level: 1, meritPoints: 0,
        health: 100, happiness: 85, energy: 100, hunger: 80,
        job: null, party: null, gang: null, alliance: null, family: null,
        premium: false, vip: false, premiumDays: 0,
        registeredAt: Date.now(), lastOnline: Date.now(),
        loginStreak: 1, lastLoginDate: new Date().toDateString(),
        achievements: [], inventory: {}, badges: [],
        stats: { trades:0, messages:0, crimes:0, votes:0, battles:0, farm:0 },
        skills: { trade:0, politics:0, crime:0, military:0, farming:0 }
      };
      await saveUserProfile(user.uid, profile);
      localStorage.setItem('userId', user.uid);
      window._setupUserListener?.(user.uid);
      window._startPresenceHeartbeat?.(user.uid, profile.username);
      onLogin(profile);
    } catch(e) {
      const msg = e.code === 'auth/email-already-in-use' ? 'Bu e-posta zaten kayıtlı' :
                  e.code === 'auth/weak-password'         ? 'Şifre çok zayıf' :
                  'Kayıt hatası';
      setErr(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'#050D1A',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',overflowY:'auto',padding:'1.5rem 1rem 3rem',minHeight:'100dvh'}}>
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
          {tab==='register' && <AuthField label="Kullanıcı Adı" placeholder="En az 3 karakter" value={f.username} onChange={v=>u('username',v)} />}
          <AuthField label="E-posta" type="email" placeholder="ornek@mail.com" value={f.email} onChange={v=>u('email',v)} />
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
              <button onClick={()=>{u('email','demo@understate.tr');u('password','demo1234');}}
                style={{background:'none',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'8px',color:'#5A7089',cursor:'pointer',fontSize:'0.75rem',padding:'0.35rem 0.9rem',fontFamily:"'DM Sans',sans-serif"}}>
                🧪 Demo hesabı doldur
              </button>
              <button onClick={()=>{u('email','admin@understate.tr');u('password','admin123');}}
                style={{background:'none',border:'1px dashed rgba(239,68,68,0.3)',borderRadius:'8px',color:'#EF4444',cursor:'pointer',fontSize:'0.75rem',padding:'0.35rem 0.9rem',fontFamily:"'DM Sans',sans-serif"}}>
                ⚙️ Admin girişi
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{marginTop:'1.5rem',color:'rgba(255,255,255,0.2)',fontSize:'0.7rem',textAlign:'center',position:'relative',zIndex:1}}>
        🔒 Firebase Authentication • Verileriniz güvende
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
  return <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:'16px',padding:'1rem',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',...style}} onClick={onClick}>{children}</div>;
}

function Avatar({ profile, size=40 }) {
  if (!profile) return <div style={{width:size,height:size,borderRadius:'50%',background:'rgba(59,130,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.45}}>👤</div>;
  const icon = profile.gender==='female' ? '👩' : '👨';
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#1a3a5c,#0a1a2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.45,border:`2px solid rgba(59,130,246,0.3)`,flexShrink:0,overflow:'hidden'}}>
      {profile.avatar ? <img src={profile.avatar} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : icon}
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
  return (
    <div style={{position:'sticky',top:0,zIndex:100,background:'#FFFFFF',borderBottom:'1px solid rgba(0,0,0,0.08)',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
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
            [fmtM(profile?.money), 'PARA', '#10B981'],
            [fmtUC(profile?.underCoin), 'UC', '#60A5FA'],
            [`Lv.${lvl.lvl}`, profile?.username?.slice(0,8)||'...', '#F59E0B'],
          ].map(([val, lbl, color], i) => (
            <div key={i} style={{textAlign:'center',padding:'0.2rem 0.5rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRight:i<2?'none':'1px solid rgba(255,255,255,0.07)',borderRadius:i===0?'8px 0 0 8px':i===2?'0 8px 8px 0':'0'}}>
              <div style={{fontSize:'0.48rem',color:'#7A8FA6',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:700}}>{lbl}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',fontWeight:700,color,lineHeight:1.3}}>{val}</div>
            </div>
          ))}
        </div>
        {/* Notif */}
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
  { id:'home',     icon:'🏠', label:'Ana Sayfa', rgb:'59,130,246' },
  { id:'politics', icon:'🏛️', label:'Siyaset',  rgb:'245,200,66' },
  { id:'economy',  icon:'💰', label:'Ekonomi',   rgb:'16,185,129' },
  { id:'chat',     icon:'💬', label:'Sosyal',    rgb:'139,92,246' },
  { id:'world',    icon:'🌍', label:'Dünya',     rgb:'59,130,246' },
];

function BottomNav({ page, onChange, items, notifMap={} }) {
  const navList = items || NAV_ITEMS;
  const ref = useRef(null);
  useEffect(() => {
    const idx = navList.findIndex(i=>i.id===page);
    if (ref.current && idx > -1) {
      const item = ref.current.children[idx];
      if (item) item.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' });
    }
  }, [page]);
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:900,background:'#FFFFFF',borderTop:'1px solid rgba(0,0,0,0.08)',paddingBottom:'env(safe-area-inset-bottom, 0px)',boxShadow:'0 -4px 16px rgba(0,0,0,0.08)'}}>
      <div ref={ref} style={{display:'flex',WebkitOverflowScrolling:'touch',gap:'2px',padding:'5px 4px'}}>
        {navList.map(it => {
          const active = page===it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
              style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'3px',padding:'0.4rem 0.3rem',borderRadius:'12px',border:`1px solid ${active?`rgba(${it.rgb},0.2)`:'transparent'}`,background:active?`rgba(${it.rgb},0.09)`:'transparent',cursor:'pointer',minWidth:'0',WebkitTapHighlightColor:'transparent',position:'relative',transition:'all 0.15s',margin:'1px'}}>
              <span style={{fontSize:'1.25rem',lineHeight:1,filter:active?`drop-shadow(0 0 5px rgba(${it.rgb},0.5))`:'none',transition:'all 0.15s',transform:active?'scale(1.1)':'scale(1)'}}>{it.icon}</span>
              <span style={{fontSize:'0.5rem',fontWeight:900,letterSpacing:'0.04em',color:active?`rgb(${it.rgb})`:'#94A3B8',textTransform:'uppercase',whiteSpace:'nowrap',transition:'color 0.15s'}}>{it.label}</span>
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
function AdminPage({ profile, showNotif, onNavigate }) {
  const [tab, setTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetUid, setTargetUid] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [msg, setMsg] = useState('');

  const onlineCnt = useOnlineCount();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await window._fb?.db?.collection('games').doc(GAME_ID).collection('users').limit(50).get();
      if (snap) {
        const list = [];
        snap.forEach(doc => { const d = doc.data(); if (d?.userProfile) list.push({...d.userProfile, docId: doc.id}); });
        setUsers(list);
      }
    } catch(e) { setMsg('Kullanıcılar yüklenemedi: ' + e.message); }
    setLoading(false);
  };

  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab]);

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true); setFoundUser(null);
    try {
      const snap = await window._fb?.db?.collection('games').doc(GAME_ID).collection('users')
        .where('userProfile.email','==',searchEmail.trim()).limit(1).get();
      if (snap && !snap.empty) {
        snap.forEach(doc => setFoundUser({...doc.data()?.userProfile, docId: doc.id}));
      } else { setMsg('Kullanıcı bulunamadı'); }
    } catch(e) { setMsg('Arama hatası: ' + e.message); }
    setLoading(false);
  };

  const giveGold = async (user) => {
    const amt = parseInt(giftAmount) || 0;
    if (!amt || !user) return;
    try {
      const ref = window._fb?.db?.collection('games').doc(GAME_ID).collection('users').doc(user.docId || user.uid);
      const updated = { ...user, money: (user.money||0) + amt };
      await ref.set({ userProfile: updated }, { merge: true });
      setMsg(`✅ ${user.username} kullanıcısına ₺${amt.toLocaleString()} verildi`);
      showNotif?.(`${user.username} kullanıcısına para verildi`, 'success', '💰');
    } catch(e) { setMsg('Hata: ' + e.message); }
  };

  const banUser = async (user) => {
    if (!window.confirm(`${user.username} kullanıcısını yasakla?`)) return;
    try {
      const ref = window._fb?.db?.collection('games').doc(GAME_ID).collection('users').doc(user.docId || user.uid);
      await ref.set({ userProfile: { ...user, banned: !user.banned } }, { merge: true });
      setMsg(`${user.banned ? '✅ Yasak kaldırıldı' : '🚫 Kullanıcı yasaklandı'}: ${user.username}`);
      loadUsers();
    } catch(e) { setMsg('Hata: ' + e.message); }
  };

  const sendAnnouncement = async () => {
    if (!announcement.trim()) return;
    try {
      await window._fb?.db?.collection('games').doc(GAME_ID).collection('announcements').add({
        text: announcement.trim(), by: profile?.username || 'Admin',
        ts: Date.now(), type: 'system'
      });
      setMsg('✅ Duyuru gönderildi');
      setAnnouncement('');
    } catch(e) { setMsg('Hata: ' + e.message); }
  };

  const cardStyle = {background:'#fff',borderRadius:'16px',padding:'1rem',boxShadow:'0 2px 12px rgba(0,0,0,0.07)',marginBottom:'0.75rem'};
  const inputStyle = {width:'100%',padding:'0.6rem 0.8rem',borderRadius:'10px',border:'1px solid #E2E8F0',fontSize:'0.85rem',background:'#F8FAFC',boxSizing:'border-box',outline:'none',fontFamily:"'DM Sans',sans-serif"};
  const btnStyle = (color='#3B82F6') => ({padding:'0.5rem 1rem',borderRadius:'10px',border:'none',background:color,color:'#fff',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'});
  const tabs = [['dashboard','📊 Panel'],['users','👥 Kullanıcılar'],['announce','📢 Duyuru'],['tools','🛠️ Araçlar']];

  return (
    <div style={{minHeight:'100vh',background:'#F0F2F5',padding:'0.75rem'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1E293B,#0F172A)',borderRadius:'18px',padding:'1rem 1.25rem',marginBottom:'0.75rem',color:'#fff'}}>
        <div style={{fontSize:'0.65rem',color:'#94A3B8',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>YÖNETİM PANELİ</div>
        <div style={{fontSize:'1.2rem',fontWeight:900,fontFamily:"'Syne',sans-serif"}}>⚙️ Admin Paneli</div>
        <div style={{fontSize:'0.75rem',color:'#64748B',marginTop:'0.25rem'}}>Hoş geldin, {profile?.username}</div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.75rem',overflowX:'auto',paddingBottom:'2px'}}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:'0.4rem 0.85rem',borderRadius:'20px',border:'none',background:tab===id?'#1E293B':'#fff',color:tab===id?'#fff':'#64748B',fontWeight:700,fontSize:'0.72rem',cursor:'pointer',whiteSpace:'nowrap',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',transition:'all 0.15s'}}>
            {label}
          </button>
        ))}
      </div>

      {msg && <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:'10px',padding:'0.6rem 0.9rem',fontSize:'0.8rem',color:'#166534',marginBottom:'0.75rem'}}>{msg} <span onClick={()=>setMsg('')} style={{float:'right',cursor:'pointer'}}>✕</span></div>}

      {/* Dashboard tab */}
      {tab==='dashboard' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem',marginBottom:'0.75rem'}}>
            {[['👥','Toplam Kullanıcı',users.length||'?'],['🟢','Şu An Online',onlineCnt],['🎮','Oyun ID',GAME_ID],['⚙️','Admin','Aktif']].map(([ic,lbl,val])=>(
              <div key={lbl} style={{...cardStyle,textAlign:'center',padding:'0.85rem'}}>
                <div style={{fontSize:'1.4rem'}}>{ic}</div>
                <div style={{fontSize:'1.1rem',fontWeight:900,color:'#1E293B'}}>{val}</div>
                <div style={{fontSize:'0.65rem',color:'#94A3B8',fontWeight:700,textTransform:'uppercase'}}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={cardStyle}>
            <div style={{fontWeight:800,fontSize:'0.85rem',color:'#1E293B',marginBottom:'0.5rem'}}>Hızlı Erişim</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
              {[['👥','Kullanıcılar','users'],['📢','Duyuru','announce'],['🛠️','Araçlar','tools']].map(([ic,lbl,t])=>(
                <button key={t} onClick={()=>setTab(t)} style={btnStyle('#334155')}>{ic} {lbl}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab==='users' && (
        <div>
          <div style={cardStyle}>
            <div style={{fontWeight:800,fontSize:'0.85rem',color:'#1E293B',marginBottom:'0.75rem'}}>Kullanıcı Ara</div>
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem'}}>
              <input value={searchEmail} onChange={e=>setSearchEmail(e.target.value)} placeholder="E-posta ile ara..." style={{...inputStyle,flex:1}} onKeyDown={e=>e.key==='Enter'&&searchUser()} />
              <button onClick={searchUser} style={btnStyle()}>Ara</button>
            </div>
            {foundUser && (
              <div style={{background:'#F8FAFC',borderRadius:'12px',padding:'0.75rem',border:'1px solid #E2E8F0'}}>
                <div style={{fontWeight:800,color:'#1E293B'}}>{foundUser.username}</div>
                <div style={{fontSize:'0.75rem',color:'#64748B'}}>{foundUser.email} • Seviye {foundUser.level||1}</div>
                <div style={{fontSize:'0.75rem',color:'#059669',marginTop:'0.25rem'}}>₺{(foundUser.money||0).toLocaleString()} nakit</div>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem',alignItems:'center'}}>
                  <input value={giftAmount} onChange={e=>setGiftAmount(e.target.value)} placeholder="Para miktarı..." style={{...inputStyle,width:'120px'}} type="number" />
                  <button onClick={()=>giveGold(foundUser)} style={btnStyle('#059669')}>💰 Ver</button>
                  <button onClick={()=>banUser(foundUser)} style={btnStyle(foundUser.banned?'#059669':'#EF4444')}>{foundUser.banned?'✅ Yasağı Kaldır':'🚫 Yasakla'}</button>
                </div>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div style={{fontWeight:800,fontSize:'0.85rem',color:'#1E293B'}}>Son Kullanıcılar</div>
              <button onClick={loadUsers} style={btnStyle('#334155')}>↻ Yenile</button>
            </div>
            {loading ? <div style={{textAlign:'center',color:'#94A3B8',padding:'1rem'}}>Yükleniyor...</div> :
              users.length === 0 ? <div style={{textAlign:'center',color:'#94A3B8',padding:'1rem'}}>Kullanıcı bulunamadı</div> :
              users.map(u => (
                <div key={u.uid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.6rem 0',borderBottom:'1px solid #F1F5F9'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'0.82rem',color:u.banned?'#EF4444':'#1E293B'}}>{u.username} {u.banned?'🚫':''}</div>
                    <div style={{fontSize:'0.7rem',color:'#94A3B8'}}>{u.email} • Sv.{u.level||1} • ₺{(u.money||0).toLocaleString()}</div>
                  </div>
                  <button onClick={()=>banUser(u)} style={{padding:'0.25rem 0.6rem',borderRadius:'8px',border:'none',background:u.banned?'#F0FDF4':'#FEF2F2',color:u.banned?'#059669':'#EF4444',fontWeight:700,fontSize:'0.7rem',cursor:'pointer'}}>
                    {u.banned?'Aç':'Ban'}
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Announce tab */}
      {tab==='announce' && (
        <div style={cardStyle}>
          <div style={{fontWeight:800,fontSize:'0.85rem',color:'#1E293B',marginBottom:'0.75rem'}}>📢 Tüm Oyunculara Duyuru</div>
          <textarea
            value={announcement}
            onChange={e=>setAnnouncement(e.target.value)}
            placeholder="Duyuru mesajını yazın..."
            rows={5}
            style={{...inputStyle,resize:'vertical',marginBottom:'0.75rem'}}
          />
          <button onClick={sendAnnouncement} style={{...btnStyle('#3B82F6'),width:'100%',padding:'0.75rem'}}>📢 Duyuruyu Gönder</button>
        </div>
      )}

      {/* Tools tab */}
      {tab==='tools' && (
        <div>
          <div style={cardStyle}>
            <div style={{fontWeight:800,fontSize:'0.85rem',color:'#1E293B',marginBottom:'0.75rem'}}>🛠️ Sistem Araçları</div>
            <div style={{display:'grid',gap:'0.6rem'}}>
              <button onClick={()=>{localStorage.clear();setMsg('✅ Yerel depolama temizlendi');}} style={{...btnStyle('#F59E0B'),width:'100%',padding:'0.75rem'}}>🗑️ Yerel Depolamayı Temizle</button>
              <button onClick={()=>window.location.reload()} style={{...btnStyle('#8B5CF6'),width:'100%',padding:'0.75rem'}}>♻️ Oyunu Yeniden Başlat</button>
              <button onClick={()=>onNavigate('profile')} style={{...btnStyle('#334155'),width:'100%',padding:'0.75rem'}}>👤 Profilime Git</button>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{fontWeight:800,fontSize:'0.85rem',color:'#1E293B',marginBottom:'0.5rem'}}>ℹ️ Sistem Bilgisi</div>
            {[['Oyun ID',GAME_ID],['Admin E-posta','admin@understate.tr'],['Sürüm','v8.0'],['Platform','Firebase RTDB+Firestore']].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid #F1F5F9',fontSize:'0.78rem'}}>
                <span style={{color:'#64748B'}}>{k}</span>
                <span style={{color:'#1E293B',fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
              return (
                <div key={m.id||i} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'0.45rem',alignItems:'flex-end'}}>
                  {!isMe && (
                    <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,#1a3a5c,#0a1a2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',border:'1px solid rgba(59,130,246,0.2)',flexShrink:0}}>
                      {m.gender==='female'?'👩':'👨'}
                    </div>
                  )}
                  <div style={{maxWidth:'78%'}}>
                    {!isMe && <div style={{fontSize:'0.63rem',color:m.premium?'#F59E0B':'#5A7089',fontWeight:700,marginBottom:'2px',paddingLeft:'4px'}}>{m.username} {m.premium&&'⭐'}</div>}
                    <div style={{background:isMe?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.05)',border:`1px solid ${isMe?'rgba(59,130,246,0.25)':'rgba(255,255,255,0.08)'}`,borderRadius:isMe?'12px 12px 3px 12px':'12px 12px 12px 3px',padding:'0.5rem 0.75rem',fontSize:'0.87rem',color:'#D0E0F0',lineHeight:1.5,wordBreak:'break-word'}}>
                      {m.text}
                    </div>
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
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
              {[['💰','Nakit',fmtM(profile?.money),'#10B981'],['🏦','Banka',fmtM(profile?.bank),'#3B82F6'],['📈','Portföy',fmtM(Object.entries(portfolio).reduce((a,[sym,d])=>a+(stocks[sym]||0)*(d.qty||0),0)),'#F59E0B'],['🪙','UC',fmtUC(profile?.underCoin),'#8B5CF6']].map(([ic,lb,v,c])=>(
                <Card key={lb} style={{padding:'0.85rem',textAlign:'center'}}>
                  <div style={{fontSize:'1.3rem',marginBottom:'0.25rem'}}>{ic}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'1rem',fontWeight:700,color:c,marginBottom:'0.15rem'}}>{v}</div>
                  <div style={{fontSize:'0.6rem',color:'#3B4E63',fontWeight:700,textTransform:'uppercase'}}>{lb}</div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{fontSize:'0.75rem',color:'#5A7089',fontWeight:700,textTransform:'uppercase',marginBottom:'0.6rem'}}>⚡ Hızlı Erişim</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                {['stocks','farm','casino','bank'].map(s=>(
                  <button key={s} onClick={()=>setSub(s)} style={{padding:'0.6rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.07)',background:'rgba(255,255,255,0.03)',color:'#8BA0B5',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer',fontSize:'0.82rem'}}>
                    {s==='stocks'?'📈 Borsa':s==='farm'?'🌾 Tarım':s==='casino'?'🎰 Kumarhane':'🏦 Banka'}
                  </button>
                ))}
              </div>
            </Card>
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

function BankPage({ profile, setProfile, showNotif }) {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('deposit');

  const doTransfer = () => {
    const n = parseInt(amount);
    if (!n || n <= 0) { showNotif('Geçerli tutar girin', 'error'); return; }
    if (action==='deposit') {
      if (n > (profile?.money||0)) { showNotif('Yetersiz nakit', 'error'); return; }
      setProfile(p => { const np={...p, money:p.money-n, bank:(p.bank||0)+n}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`🏦 ₺${fmt(n)} yatırıldı`, 'success');
    } else {
      if (n > (profile?.bank||0)) { showNotif('Yetersiz bakiye', 'error'); return; }
      setProfile(p => { const np={...p, money:(p.money||0)+n, bank:p.bank-n}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
      showNotif(`💰 ₺${fmt(n)} çekildi`, 'success');
    }
    setAmount('');
  };

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
        <Card style={{textAlign:'center',padding:'1rem'}}><div style={{color:'#10B981',fontWeight:800,fontSize:'1.1rem'}}>{fmtM(profile?.money)}</div><div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.2rem',textTransform:'uppercase'}}>Nakit</div></Card>
        <Card style={{textAlign:'center',padding:'1rem'}}><div style={{color:'#3B82F6',fontWeight:800,fontSize:'1.1rem'}}>{fmtM(profile?.bank)}</div><div style={{fontSize:'0.62rem',color:'#3B4E63',marginTop:'0.2rem',textTransform:'uppercase'}}>Banka</div></Card>
      </div>
      <Card>
        <div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'3px',marginBottom:'1rem',gap:'3px'}}>
          {[['deposit','💳 Yatır'],['withdraw','🏧 Çek']].map(([v,l])=>(
            <button key={v} onClick={()=>setAction(v)} style={{flex:1,padding:'0.5rem',borderRadius:'8px',border:'none',background:action===v?'rgba(59,130,246,0.15)':'transparent',color:action===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Tutar girin..."
          style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'0.7rem 1rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',marginBottom:'0.75rem',boxSizing:'border-box'}} />
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.4rem',marginBottom:'0.75rem'}}>
          {[10000,50000,100000].map(n=><button key={n} onClick={()=>setAmount(String(n))} style={{padding:'0.4rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'#8BA0B5',fontSize:'0.75rem',cursor:'pointer',fontWeight:700}}>{fmtM(n)}</button>)}
        </div>
        <Btn variant='primary' size='full' onClick={doTransfer}>{action==='deposit'?'💳 Yatır':'🏧 Çek'}</Btn>
        <div style={{fontSize:'0.68rem',color:'#3B4E63',marginTop:'0.75rem',textAlign:'center'}}>💡 Bankadaki para %0.5 günlük faiz kazanır</div>
      </Card>
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
// SİYASET SAYFASI
// ═══════════════════════════════════════════════════════
function PoliticsPage({ profile, setProfile, showNotif }) {
  const [parties, setParties] = useLs('parties', []);
  const [laws, setLaws] = useLs('laws', []);
  const [electionState] = useLs('electionState', null);
  const [createModal, setCreateModal] = useState(false);
  const [pForm, setPForm] = useState({ name:'', ideology:'merkez', desc:'' });
  const [sub, setSub] = useState('parties');

  const myParty = parties.find(p => p.leaderId===profile?.uid || p.members?.includes(profile?.uid));

  const createParty = () => {
    if (!pForm.name.trim()) { showNotif('Parti adı gerekli', 'error'); return; }
    if (myParty) { showNotif('Zaten bir partiye üyesin', 'error'); return; }
    if ((profile?.money||0) < 10000) { showNotif('Parti kurmak için ₺10.000 gerekli', 'error'); return; }
    const party = { id:genId(), name:pForm.name.trim(), ideology:pForm.ideology, desc:pForm.desc, leaderId:profile?.uid, leaderName:profile?.username, members:[profile?.uid], memberCount:1, treasury:0, support:5, createdAt:Date.now() };
    setParties([...parties, party]);
    setProfile(p => { const np={...p, party:party.id, money:(p.money||0)-10000}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    showNotif(`🏛️ ${pForm.name} partisi kuruldu!`, 'success');
  };

  const joinParty = (party) => {
    if (myParty) { showNotif('Zaten bir partidesin', 'error'); return; }
    const updated = parties.map(p => p.id===party.id ? {...p, members:[...(p.members||[]),profile.uid], memberCount:(p.memberCount||0)+1} : p);
    setParties(updated);
    setProfile(p => { const np={...p, party:party.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${party.name} partisine katıldın`, 'success');
  };

  const subs = [{ id:'parties', label:'🏛️ Partiler' }, { id:'laws', label:'⚖️ Yasalar' }, { id:'election', label:'🗳️ Seçim' }];

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
            {myParty && (
              <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(11,21,39,0.9))',border:'1px solid rgba(139,92,246,0.25)',borderRadius:'14px',padding:'0.85rem',marginBottom:'0.75rem'}}>
                <div style={{fontSize:'0.7rem',color:'#A78BFA',fontWeight:700,textTransform:'uppercase',marginBottom:'0.25rem'}}>✅ Üyesin</div>
                <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'1rem'}}>{myParty.name}</div>
                <div style={{fontSize:'0.72rem',color:'#5A7089'}}>{myParty.memberCount} üye • {myParty.ideology} • {myParty.leaderId===profile?.uid?'👑 Lidersin':'Üye'}</div>
              </div>
            )}
            {!myParty && <Btn variant='ghost' size='sm' onClick={()=>setCreateModal(true)} style={{marginBottom:'0.75rem',width:'100%'}}>+ Yeni Parti Kur (₺10.000)</Btn>}
            {parties.map(party => (
              <Card key={party.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:`1px solid ${party.id===myParty?.id?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.05)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <div style={{fontWeight:800,color:'#E8EDF2',marginBottom:'0.2rem'}}>{party.name}</div>
                    <div style={{fontSize:'0.72rem',color:'#5A7089'}}>{party.memberCount||0} üye • {party.ideology}</div>
                    <div style={{fontSize:'0.7rem',color:'#8BA0B5',marginTop:'0.2rem'}}>{party.desc}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#A78BFA',fontWeight:800}}>%{party.support||0}</div>
                    <div style={{fontSize:'0.6rem',color:'#5A7089'}}>Destek</div>
                    {!myParty && party.leaderId!==profile?.uid && (
                      <Btn variant='ghost' size='sm' onClick={()=>joinParty(party)} style={{marginTop:'0.4rem'}}>Katıl</Btn>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {parties.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz parti yok. İlk sen kur!</div>}
          </div>
        )}
        {sub==='laws' && (
          <div>
            <div style={{textAlign:'center',color:'#3B4E63',padding:'1rem',fontSize:'0.85rem'}}>⚖️ Aktif yasa yok</div>
          </div>
        )}
        {sub==='election' && (
          <div>
            <Card style={{textAlign:'center',padding:'1.5rem'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🗳️</div>
              <div style={{fontWeight:700,color:'#E8EDF2',marginBottom:'0.5rem'}}>Seçim Sistemi</div>
              <div style={{fontSize:'0.8rem',color:'#5A7089'}}>Bir sonraki seçim: 7 gün sonra</div>
            </Card>
          </div>
        )}
      </div>
      {createModal && (
        <Modal title="🏛️ Parti Kur" onClose={()=>setCreateModal(false)}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Parti Adı</div>
            <input value={pForm.name} onChange={e=>setPForm(p=>({...p,name:e.target.value}))} placeholder="Parti adı"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Siyasi Eğilim</div>
            <select value={pForm.ideology} onChange={e=>setPForm(p=>({...p,ideology:e.target.value}))}
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}}>
              {['sol','merkez-sol','merkez','merkez-sağ','sağ','liberal','milliyetçi','eko-yeşil'].map(v=><option key={v} value={v} style={{background:'#0B1527'}}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Kısa Açıklama</div>
            <textarea value={pForm.desc} onChange={e=>setPForm(p=>({...p,desc:e.target.value}))} placeholder="Parti hakkında kısa bir açıklama..." rows={3}
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.65rem',fontSize:'0.78rem',color:'#F59E0B',marginBottom:'1rem'}}>
            💡 Parti kurmak ₺10.000 gerektirir. Nakit: {fmtM(profile?.money)}
          </div>
          <Btn variant='primary' size='full' onClick={createParty}>🏛️ Partiyi Kur</Btn>
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

  const myGang = gangs.find(g => g.leaderId===profile?.uid || g.members?.includes(profile?.uid));

  const createGang = () => {
    if (!gForm.name.trim()) { showNotif('İsim gerekli', 'error'); return; }
    if (myGang) { showNotif('Zaten bir çeteye üyesin', 'error'); return; }
    const cost = gForm.type==='gang' ? 20000 : 50000;
    if ((profile?.money||0) < cost) { showNotif(`${fmtM(cost)} gerekli`, 'error'); return; }
    const gang = { id:genId(), name:gForm.name.trim(), type:gForm.type, desc:gForm.desc, leaderId:profile?.uid, leaderName:profile?.username, members:[profile?.uid], memberCount:1, treasury:0, power:10, territory:0, createdAt:Date.now() };
    setGangs([...gangs, gang]);
    setProfile(p => { const np={...p, gang:gang.id, money:(p.money||0)-cost}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    showNotif(`⚔️ ${gForm.name} kuruldu!`, 'success');
  };

  const joinGang = (gang) => {
    if (myGang) { showNotif('Zaten üyesin', 'error'); return; }
    const upd = gangs.map(g => g.id===gang.id ? {...g, members:[...(g.members||[]),profile.uid], memberCount:(g.memberCount||0)+1} : g);
    setGangs(upd);
    setProfile(p => { const np={...p, gang:gang.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${gang.name}'e katıldın`, 'success');
  };

  return (
    <div>
      <div style={{display:'flex',gap:'4px',padding:'0.5rem 0.7rem',overflowX:'auto',scrollbarWidth:'none',background:'rgba(6,12,24,0.97)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {[{id:'gangs',label:'⚔️ Çeteler'},{id:'attack',label:'🥊 Saldırı'},{id:'territory',label:'🗺️ Bölge'}].map(s=>(
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
              <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(11,21,39,0.9))',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'14px',padding:'0.85rem',marginBottom:'0.75rem'}}>
                <div style={{fontSize:'0.7rem',color:'#FCA5A5',fontWeight:700,textTransform:'uppercase',marginBottom:'0.25rem'}}>{myGang.type==='family'?'👨‍👩‍👧‍👦 Aile':'⚔️ Çete'}</div>
                <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'1rem'}}>{myGang.name}</div>
                <div style={{fontSize:'0.72rem',color:'#5A7089'}}>{myGang.memberCount} üye • Güç: {myGang.power} • {myGang.leaderId===profile?.uid?'👑 Lidersin':'Üye'}</div>
              </div>
            )}
            {!myGang && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
                <Btn variant='danger' size='sm' onClick={()=>{setGForm(p=>({...p,type:'gang'}));setCreateModal(true);}}>⚔️ Çete Kur (₺20K)</Btn>
                <Btn variant='ghost' size='sm' onClick={()=>{setGForm(p=>({...p,type:'family'}));setCreateModal(true);}}>👨‍👩‍👧‍👦 Aile Kur (₺50K)</Btn>
              </div>
            )}
            {gangs.map(gang => (
              <Card key={gang.id} style={{marginBottom:'0.5rem',padding:'0.85rem',border:`1px solid ${gang.type==='family'?'rgba(245,158,11,0.2)':'rgba(239,68,68,0.15)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <div style={{fontWeight:800,color:'#E8EDF2'}}>{gang.type==='family'?'👨‍👩‍👧‍👦':'⚔️'} {gang.name}</div>
                    <div style={{fontSize:'0.72rem',color:'#5A7089'}}>{gang.memberCount} üye • Güç: {gang.power}</div>
                  </div>
                  {!myGang && (
                    <Btn variant='ghost' size='sm' onClick={()=>joinGang(gang)}>Katıl</Btn>
                  )}
                </div>
              </Card>
            ))}
            {gangs.length === 0 && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>Henüz çete yok</div>}
          </div>
        )}
        {sub==='attack' && (
          <div>
            {['Sokak kavgası (₺1K risk)','Gasp girişimi (₺5K risk)','Banka soygunu (₺20K risk)','Araba hırsızlığı','Fidye']['map']?.map || [['🥊','Sokak Kavgası','%80 başarı','₺500-2.000','₺500'],['🔫','Gasp Girişimi','%60 başarı','₺2.000-8.000','₺3.000'],['💣','Banka Soygunu','%30 başarı','₺20K-100K','₺10.000'],['🚗','Araba Hırsızlığı','%70 başarı','₺5.000-15.000','₺2.000']].map(([ic,name,rate,earn,fine])=>(
              <button key={name} onClick={()=>{
                const success = Math.random() < parseFloat(rate)/100;
                const amount = success ? Math.floor(Math.random()*5000)+2000 : 0;
                const penalty = success ? 0 : parseInt(fine.replace(/[₺K.]/g,''))*1000;
                setProfile(p=>{const np={...p,money:(p.money||0)+amount-penalty,xp:(p.xp||0)+(success?100:20)};localStorage.setItem('rep_userProfile',JSON.stringify(np));return np;});
                showNotif(success?`🎉 Başarılı! +${fmtM(amount)}`:`😔 Başarısız! -${fine} ceza`, success?'success':'error');
              }}
                style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem',background:'rgba(20,36,60,0.8)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'12px',width:'100%',marginBottom:'0.5rem',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
                <span style={{fontSize:'1.5rem',width:'32px',textAlign:'center',flexShrink:0}}>{ic}</span>
                <div style={{flex:1,textAlign:'left'}}>
                  <div style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{name}</div>
                  <div style={{fontSize:'0.67rem',color:'#10B981'}}>{rate} • Kazanç: {earn}</div>
                  <div style={{fontSize:'0.65rem',color:'#EF4444'}}>Ceza riski: {fine}</div>
                </div>
                <span style={{color:'#EF4444',fontSize:'0.85rem'}}>→</span>
              </button>
            ))}
          </div>
        )}
        {sub==='territory' && (
          <Card style={{textAlign:'center',padding:'2rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🗺️</div>
            <div style={{color:'#5A7089'}}>Bölge sistemi yakında</div>
          </Card>
        )}
      </div>
      {createModal && (
        <Modal title={gForm.type==='gang'?'⚔️ Çete Kur':'👨‍👩‍👧‍👦 Aile Kur'} onClose={()=>setCreateModal(false)}>
          <div style={{marginBottom:'0.85rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>İsim</div>
            <input value={gForm.name} onChange={e=>setGForm(p=>({...p,name:e.target.value}))} placeholder="İsim girin"
              style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />
          </div>
          <Btn variant='danger' size='full' onClick={createGang}>Kur</Btn>
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
  const [createModal, setCreateModal] = useState(false);
  const [aForm, setAForm] = useState({ name:'', tag:'', desc:'', type:'open' });
  const [searchQ, setSearchQ] = useState('');
  const [inviteSearch, setInviteSearch] = useState('');

  const myAlliance = alliances.find(a => a.leaderId===profile?.uid || a.members?.includes(profile?.uid));

  const createAlliance = () => {
    if (!aForm.name.trim()||!aForm.tag.trim()) { showNotif('İsim ve etiket gerekli', 'error'); return; }
    if (aForm.tag.length>5) { showNotif('Etiket max 5 karakter', 'error'); return; }
    if (myAlliance) { showNotif('Zaten bir ittifaka üyesin', 'error'); return; }
    if ((profile?.money||0) < 30000) { showNotif('İttifak kurmak ₺30.000 gerektirir', 'error'); return; }
    const a = { id:genId(), name:aForm.name.trim(), tag:aForm.tag.toUpperCase(), desc:aForm.desc, type:aForm.type, leaderId:profile?.uid, leaderName:profile?.username, members:[profile?.uid], memberCount:1, level:1, treasury:0, xp:0, createdAt:Date.now() };
    setAlliances([...alliances, a]);
    setProfile(p => { const np={...p, alliance:a.id, money:(p.money||0)-30000}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    setCreateModal(false);
    showNotif(`🤝 ${aForm.name} İttifakı kuruldu!`, 'success');
  };

  const joinAlliance = (a) => {
    if (myAlliance) { showNotif('Zaten bir ittifaka üyesin', 'error'); return; }
    if (a.type==='closed') { showNotif('Bu ittifak kapalı', 'error'); return; }
    const upd = alliances.map(al => al.id===a.id ? {...al, members:[...(al.members||[]),profile.uid], memberCount:(al.memberCount||0)+1} : al);
    setAlliances(upd);
    setProfile(p => { const np={...p, alliance:a.id}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif(`✅ ${a.name}'e katıldın!`, 'success');
  };

  const leaveAlliance = () => {
    if (!myAlliance) return;
    if (myAlliance.leaderId===profile?.uid) { showNotif('Lider ittifakı terk edemez. Önce liderliği devret.', 'error'); return; }
    const upd = alliances.map(a => a.id===myAlliance.id ? {...a, members:a.members.filter(m=>m!==profile.uid), memberCount:(a.memberCount||1)-1} : a);
    setAlliances(upd);
    setProfile(p => { const np={...p, alliance:null}; localStorage.setItem('rep_userProfile',JSON.stringify(np)); return np; });
    showNotif('İttifaktan ayrıldın', 'info');
  };

  const filtered = alliances.filter(a => !searchQ || a.name.toLowerCase().includes(searchQ.toLowerCase()) || a.tag.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={{padding:'0.7rem'}}>
      {/* Benim İttifakım */}
      {myAlliance && (
        <Card style={{marginBottom:'0.75rem',background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(11,21,39,0.9))',border:'1px solid rgba(16,185,129,0.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.15rem'}}>
                <div style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'6px',padding:'2px 7px',fontWeight:900,fontSize:'0.75rem',color:'#10B981'}}>
                  [{myAlliance.tag}]
                </div>
                {myAlliance.leaderId===profile?.uid && <Tag color='gold'>👑 Lider</Tag>}
              </div>
              <div style={{fontWeight:900,fontSize:'1.05rem',color:'#E8EDF2'}}>{myAlliance.name}</div>
              <div style={{fontSize:'0.72rem',color:'#5A7089'}}>{myAlliance.memberCount} üye • Lv.{myAlliance.level||1} • {fmtM(myAlliance.treasury)} kasa</div>
            </div>
            <Btn variant='ghost' size='sm' onClick={leaveAlliance}>Ayrıl</Btn>
          </div>
          <div style={{fontSize:'0.78rem',color:'#8BA0B5',marginBottom:'0.6rem'}}>{myAlliance.desc}</div>
          <div style={{display:'flex',gap:'0.4rem'}}>
            <Btn variant='green' size='sm'>👥 Üyeler</Btn>
            <Btn variant='ghost' size='sm'>💰 Kasa</Btn>
            {myAlliance.leaderId===profile?.uid && <Btn variant='ghost' size='sm'>⚙️ Yönet</Btn>}
          </div>
        </Card>
      )}

      {/* Arama */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.75rem'}}>
        <div style={{flex:1,display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0 0.75rem'}}>
          <span style={{color:'#3B4E63',marginRight:'0.4rem'}}>🔍</span>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="İttifak ara..."
            style={{flex:1,background:'none',border:'none',outline:'none',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',padding:'0.55rem 0'}} />
        </div>
        {!myAlliance && <Btn variant='primary' size='sm' onClick={()=>setCreateModal(true)}>+ Kur</Btn>}
      </div>

      {/* Liste */}
      <div style={{fontSize:'0.68rem',color:'#3B4E63',fontWeight:700,textTransform:'uppercase',marginBottom:'0.5rem',letterSpacing:'0.08em'}}>Tüm İttifaklar ({filtered.length})</div>
      {filtered.map(a => (
        <Card key={a.id} style={{marginBottom:'0.5rem',padding:'0.85rem'}}>
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
      {filtered.length === 0 && !myAlliance && <div style={{textAlign:'center',color:'#3B4E63',padding:'2rem',fontSize:'0.85rem'}}>İttifak bulunamadı. İlk sen kur! 🤝</div>}

      {createModal && (
        <Modal title="🤝 İttifak Kur" onClose={()=>setCreateModal(false)}>
          {[
            ['name','İttifak Adı','İttifak adını girin',false],
            ['tag','Etiket (Max 5)','ORG',false],
            ['desc','Açıklama','Kısa bir açıklama...',true],
          ].map(([k,l,ph,ta])=>(
            <div key={k} style={{marginBottom:'0.85rem'}}>
              <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>{l}</div>
              {ta ? <textarea value={aForm[k]} onChange={e=>setAForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} rows={2}
                style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'14px',outline:'none',resize:'none',boxSizing:'border-box'}} />
              : <input value={aForm[k]} onChange={e=>setAForm(p=>({...p,[k]:e.target.value}))} placeholder={ph}
                style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'0.65rem 0.9rem',color:'#E8EDF2',fontFamily:"'DM Sans',sans-serif",fontSize:'16px',outline:'none',boxSizing:'border-box'}} />}
            </div>
          ))}
          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#5A7089',marginBottom:'0.4rem',fontWeight:700}}>Katılım Tipi</div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              {[['open','🔓 Açık'],['invite','📩 Davet']].map(([v,l])=>(
                <button key={v} onClick={()=>setAForm(p=>({...p,type:v}))} style={{flex:1,padding:'0.55rem',borderRadius:'10px',border:`1px solid ${aForm.type===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.08)'}`,background:aForm.type===v?'rgba(59,130,246,0.12)':'rgba(255,255,255,0.03)',color:aForm.type===v?'#60A5FA':'#5A7089',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'0.6rem',fontSize:'0.78rem',color:'#F59E0B',marginBottom:'1rem'}}>
            💡 Kurmak ₺30.000 gerektirir. Nakit: {fmtM(profile?.money)}
          </div>
          <Btn variant='primary' size='full' onClick={createAlliance}>🤝 İttifak Kur</Btn>
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
  const [tab, setTab] = useState('online');
  const onlineCnt = useOnlineCount();
  const [onlinePlayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rep_onlinePlayers')||'[]'); } catch{return [];}
  });

  const mockPlayers = [
    { username:'Ahmet_45', city:'İstanbul', level:12, xp:8500, gender:'male', premium:true, money:250000 },
    { username:'Zeynep_K', city:'Ankara', level:8, xp:4200, gender:'female', premium:false, money:120000 },
    { username:'Mert_Pro', city:'İzmir', level:25, xp:42000, gender:'male', premium:true, money:800000 },
    { username:'Selin_33', city:'Bursa', level:5, xp:1200, gender:'female', premium:false, money:60000 },
    { username:'Kadir_X', city:'Antalya', level:17, xp:18000, gender:'male', premium:false, money:350000 },
  ];

  const filtered = mockPlayers.filter(p => !search || p.username.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()));

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
        {[['online','🟢 Online'],['all','👥 Tümü'],['top','🏆 Liderlik']].map(([v,l])=>(
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

      {/* Oyuncu listesi */}
      {(tab==='online'?mockPlayers.slice(0,3):tab==='top'?[...mockPlayers].sort((a,b)=>b.money-a.money):filtered).map((p,i) => (
        <button key={p.username} onClick={()=>setSelectedPlayer(p)}
          style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'rgba(15,28,48,0.85)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'12px',width:'100%',marginBottom:'0.4rem',cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all 0.15s',textAlign:'left'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <Avatar profile={p} size={42} />
            {tab==='online' && <div style={{position:'absolute',bottom:0,right:0,width:'10px',height:'10px',borderRadius:'50%',background:'#10B981',border:'2px solid #0a1628'}} />}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
              <span style={{fontWeight:800,color:'#E8EDF2',fontSize:'0.9rem'}}>{p.username}</span>
              {p.premium && <span style={{background:'linear-gradient(90deg,#A78BFA,#7C3AED)',color:'#fff',fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:'8px'}}>VIP</span>}
            </div>
            <div style={{fontSize:'0.68rem',color:'#5A7089'}}>{p.city} • Lv.{p.level} • {getLevelInfo(p.xp).title}</div>
          </div>
          {tab==='top' && <div style={{fontSize:'0.75rem',color:'#F59E0B',fontWeight:800}}>#{i+1}</div>}
          <span style={{color:'#3B4E63',fontSize:'0.85rem'}}>›</span>
        </button>
      ))}

      {selectedPlayer && (
        <Modal title={`👤 ${selectedPlayer.username}`} onClose={()=>setSelectedPlayer(null)}>
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <Avatar profile={selectedPlayer} size={64} />
            <div style={{fontWeight:800,fontSize:'1.1rem',color:'#E8EDF2',marginTop:'0.6rem'}}>{selectedPlayer.username}</div>
            <div style={{fontSize:'0.75rem',color:'#5A7089'}}>{selectedPlayer.city} • {getLevelInfo(selectedPlayer.xp).title}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'1rem'}}>
            {[['💰','Para',fmtM(selectedPlayer.money)],['⭐','Seviye','Lv.'+selectedPlayer.level],['📊','XP',fmt(selectedPlayer.xp)],['🏙️','Şehir',selectedPlayer.city]].map(([ic,lb,v])=>(
              <div key={lb} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'0.65rem',textAlign:'center'}}>
                <div style={{fontSize:'0.6rem',color:'#3B4E63',textTransform:'uppercase',marginBottom:'0.2rem'}}>{ic} {lb}</div>
                <div style={{fontWeight:700,color:'#E8EDF2',fontSize:'0.9rem'}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <Btn variant='primary' size='sm' style={{flex:1}}>✉️ Mesaj Gönder</Btn>
            <Btn variant='ghost' size='sm' style={{flex:1}}>🤝 İttifak Davet</Btn>
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
  const lvl = getLevelInfo(profile?.xp || 0);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: profile?.username||'', city: profile?.city||'İstanbul' });
  const [tab, setTab] = useState('stats');

  const saveProfile = async () => {
    if (!editForm.username.trim()) { showNotif('Kullanıcı adı boş olamaz', 'error'); return; }
    const updated = { ...profile, username:editForm.username.trim(), city:editForm.city };
    setProfile(updated);
    localStorage.setItem('rep_userProfile', JSON.stringify(updated));
    if (profile?.uid) await saveUserProfile(profile.uid, updated);
    setEditModal(false);
    showNotif('✅ Profil güncellendi', 'success');
  };

  const achievements = [
    { id:'first_login', name:'İlk Giriş', icon:'🎉', desc:'Oyuna ilk kez girdin', done:true },
    { id:'first_message', name:'İlk Mesaj', icon:'💬', desc:'İlk mesajını attın', done:(profile?.stats?.messages||0)>0 },
    { id:'first_trade', name:'İlk Ticaret', icon:'🤝', desc:'İlk ticaretini yaptın', done:(profile?.stats?.trades||0)>0 },
    { id:'level5', name:'5. Seviye', icon:'⭐', desc:'Seviye 5 ulaştın', done:(profile?.level||1)>=5 },
    { id:'rich', name:'Milyoner', icon:'💰', desc:'1 milyon ₺ biriktir', done:(profile?.money||0)>=1000000 },
    { id:'social', name:'Sosyal Kelebek', icon:'🦋', desc:'10 mesaj gönder', done:(profile?.stats?.messages||0)>=10 },
  ];

  return (
    <div style={{padding:'0.7rem'}}>
      {/* Profil kartı */}
      <Card style={{marginBottom:'0.75rem',textAlign:'center',padding:'1.5rem 1rem',background:'linear-gradient(135deg,rgba(11,21,39,0.95),rgba(15,31,54,0.9))'}}>
        <div style={{marginBottom:'0.75rem'}}>
          <Avatar profile={profile} size={72} />
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
          <div style={{fontWeight:900,fontSize:'1.15rem',color:'#E8EDF2'}}>{profile?.username || 'Oyuncu'}</div>
          {profile?.premium && <span style={{background:'linear-gradient(90deg,#F59E0B,#D97706)',color:'#000',fontSize:'0.55rem',fontWeight:800,padding:'2px 6px',borderRadius:'8px'}}>VIP</span>}
        </div>
        <div style={{fontSize:'0.75rem',color:'#5A7089',marginBottom:'0.75rem'}}>{lvl.title} • {profile?.city} • Üye: {profile?.registeredAt ? new Date(profile.registeredAt).toLocaleDateString('tr-TR') : '-'}</div>
        <div style={{marginBottom:'0.4rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#3B4E63',marginBottom:'0.25rem'}}>
            <span>Lv.{lvl.lvl}</span><span>{fmt(profile?.xp||0)} / {fmt(lvl.next.xp)} XP</span><span>Lv.{lvl.next.lvl}</span>
          </div>
          <ProgressBar pct={lvl.pct} color='#3B82F6' h={8} />
        </div>
        <div style={{display:'flex',gap:'0.4rem',justifyContent:'center',marginTop:'0.75rem'}}>
          <Btn variant='ghost' size='sm' onClick={()=>setEditModal(true)}>✏️ Düzenle</Btn>
          <Btn variant='danger' size='sm' onClick={onLogout}>🚪 Çıkış</Btn>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{display:'flex',gap:'4px',marginBottom:'0.75rem'}}>
        {[['stats','📊 İstatistik'],['achievements','🏆 Başarımlar'],['settings','⚙️ Ayarlar']].map(([v,l])=>(
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
// ANA UYGULAMA
// ═══════════════════════════════════════════════════════
function App() {
  const [profile, setProfile_raw] = useState(() => {
    try { const s=localStorage.getItem('rep_userProfile'); return s?JSON.parse(s):null; } catch{return null;}
  });
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('userId') && !!localStorage.getItem('rep_userProfile'));
  const [page, setPage] = useState('home');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

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
    await fbLogout().catch(()=>{});
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

  const isAdmin = profile?.email === 'admin@understate.tr';
  const pageProps = { profile, setProfile, showNotif, onNavigate: setPage };
  const navItems = isAdmin
    ? [...NAV_ITEMS, { id:'admin', icon:'⚙️', label:'Admin', rgb:'239,68,68' }]
    : NAV_ITEMS;

  return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'#060C18',overflow:'hidden'}}>
      <Header profile={profile} notifCount={notifCount} onNotif={()=>setNotifOpen(true)} page={page} />

      {/* Main scrollable content */}
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:'calc(70px + env(safe-area-inset-bottom, 0px))',background:'#F0F2F5'}}>
        {page==='home'     && <HomePage     {...pageProps} />}
        {page==='chat'     && <ChatPage     profile={profile} />}
        {page==='economy'  && <EconomyPage  {...pageProps} />}
        {page==='market'   && <MarketPage   {...pageProps} />}
        {page==='politics' && <PoliticsPage {...pageProps} />}
        {page==='gang'     && <GangPage     {...pageProps} />}
        {page==='alliance' && <AlliancePage {...pageProps} />}
        {page==='world'    && <WorldPage    profile={profile} onNavigate={setPage} />}
        {page==='admin'    && <AdminPage    profile={profile} showNotif={showNotif} onNavigate={setPage} />}
        {page==='players'  && <PlayersPage  profile={profile} />}
        {page==='profile'  && <ProfilePage  {...pageProps} onLogout={handleLogout} />}
        {page==='premium'  && <PremiumPage  {...pageProps} />}
      </div>

      <BottomNav page={page} onChange={setPage} items={navItems} notifMap={{ chat: notifications.filter(n=>n.type==='message'&&Date.now()-n.ts<300000).length }} />

      {toast && <Notif msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      {notifOpen && <NotifPanel notifications={notifications} onClose={()=>setNotifOpen(false)} onClear={()=>setNotifications([])} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════
const styleEl = document.createElement('style');
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F0F2F5; color: #1A2233; font-family: 'DM Sans', sans-serif; overflow: hidden; }
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
`;
document.head.appendChild(styleEl);

// ═══════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

// Loading screen kapat (auth yoksa da bir süre sonra kapat)
setTimeout(() => window._hideLoading?.(), 4000);
