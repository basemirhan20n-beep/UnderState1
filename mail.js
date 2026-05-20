/**
 * UnderState Mail Servisi — Brevo Transactional Email API
 * Brevo REST API v3 kullanır (SMTP yerine — daha güvenilir)
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
const SMTP_USER     = process.env.BREVO_SMTP_USER || 'basemirhan28@gmail.com';
const SENDER_NAME   = 'UnderState';
const SENDER_EMAIL  = SMTP_USER;

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

// Supabase log (lazy require)
function logToSupabase(entry) {
  try {
    const sb = require('./supabase-server');
    if (sb?.supabase) {
      sb.supabase.from('mail_log').insert(entry).catch(() => {});
    }
  } catch (_) {}
}

async function sendMail({ to, toName, subject, html, type = 'general', playerId }) {
  if (!BREVO_API_KEY) {
    console.warn('[Mail] BREVO_API_KEY eksik — mail gönderilemiyor');
    return { ok: false, reason: 'API key eksik' };
  }
  if (!to) return { ok: false, reason: 'E-posta adresi yok' };

  const body = {
    sender:   { name: SENDER_NAME, email: SENDER_EMAIL },
    to:       [{ email: to, name: toName || to }],
    subject,
    htmlContent: html
  };

  try {
    const res = await fetch(BREVO_URL, {
      method:  'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.log(`📧 Mail gönderildi → ${to} [${type}]`);
      logToSupabase({ to_email: to, to_name: toName || '', subject, type, status: 'sent', player_id: playerId || null });
      return { ok: true };
    } else {
      const reason = data.message || JSON.stringify(data);
      console.warn(`[Mail] Brevo hata (${res.status}): ${reason}`);
      logToSupabase({ to_email: to, subject, type, status: 'failed', error: reason, player_id: playerId || null });
      return { ok: false, reason };
    }
  } catch (e) {
    console.warn('[Mail] Fetch hatası:', e.message);
    logToSupabase({ to_email: to, subject, type, status: 'failed', error: e.message, player_id: playerId || null });
    return { ok: false, reason: e.message };
  }
}

// ── HTML Şablonları ───────────────────────────────────────────

function welcomeHtml(username) {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;color:#E2E8F0}
.wrap{max-width:560px;margin:0 auto;padding:32px 16px}
.logo{text-align:center;margin-bottom:24px;font-size:2rem;font-weight:900;letter-spacing:.3rem}
.u{color:#D00000;text-shadow:0 0 15px rgba(208,0,0,.6)}.n{color:#fff}
.card{background:#0A1628;border:1px solid rgba(208,0,0,.25);border-radius:12px;padding:32px}
h1{color:#fff;font-size:1.4rem;margin:0 0 12px}
p{color:#94A3B8;line-height:1.7;margin:0 0 16px}
.hi{color:#D00000;font-weight:700}
.stat{display:inline-block;background:rgba(208,0,0,.1);border:1px solid rgba(208,0,0,.2);border-radius:8px;padding:10px 16px;margin:4px;text-align:center}
.sn{font-size:1.2rem;font-weight:800;color:#D00000}.sl{font-size:.7rem;color:#64748B;text-transform:uppercase}
hr{border:none;border-top:1px solid rgba(255,255,255,.07);margin:20px 0}
ul{color:#94A3B8;padding-left:20px;line-height:2}
.footer{text-align:center;color:#334155;font-size:.75rem;margin-top:24px}
</style></head>
<body><div class="wrap">
<div class="logo"><span class="u">[U</span><span class="n">NDER</span><span class="u">]</span></div>
<div class="card">
<h1>🎮 Hoş geldin, <span class="hi">${username}</span>!</h1>
<p>UnderState'e katıldın. Türkiye'nin en kapsamlı çevrimiçi şehir ve devlet simülasyonuna hoş geldin.</p>
<hr>
<p style="color:#CBD5E1;font-weight:600;margin-bottom:12px">Başlangıç bonusların:</p>
<div>
  <div class="stat"><div class="sn">₺10.000</div><div class="sl">Başlangıç Parası</div></div>
  <div class="stat"><div class="sn">50 UC</div><div class="sl">UnderCoin</div></div>
  <div class="stat"><div class="sn">Lv1</div><div class="sl">Seviye</div></div>
</div>
<hr>
<p>İlk adımların:</p>
<ul>
  <li>Bir şehir seç ve çalışmaya başla 💼</li>
  <li>Global sohbette diğer oyuncularla tanış 💬</li>
  <li>Parti kur veya katıl, seçimlere gir 🗳️</li>
  <li>Çete kur, şehirleri ele geçir ⚔️</li>
</ul>
</div>
<div class="footer">© 2026 UnderState — Şehir &amp; Devlet Simülasyonu</div>
</div></body></html>`;
}

function passwordResetHtml(username, code) {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8">
<style>
body{margin:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;color:#E2E8F0}
.wrap{max-width:520px;margin:0 auto;padding:32px 16px}
.logo{text-align:center;margin-bottom:24px;font-size:2rem;font-weight:900;letter-spacing:.3rem}
.u{color:#D00000}.n{color:#fff}
.card{background:#0A1628;border:1px solid rgba(208,0,0,.25);border-radius:12px;padding:32px}
h1{color:#fff;font-size:1.3rem;margin:0 0 12px}
p{color:#94A3B8;line-height:1.7;margin:0 0 16px}
.code{font-size:2.5rem;font-weight:900;color:#D00000;letter-spacing:.4rem;text-align:center;background:rgba(208,0,0,.08);border:2px solid rgba(208,0,0,.3);border-radius:10px;padding:16px;margin:20px 0;font-family:monospace}
.warn{color:#F59E0B;font-size:.82rem}
.footer{text-align:center;color:#334155;font-size:.75rem;margin-top:24px}
</style></head>
<body><div class="wrap">
<div class="logo"><span class="u">[U</span><span class="n">NDER</span><span class="u">]</span></div>
<div class="card">
<h1>🔐 Şifre Sıfırlama</h1>
<p>Merhaba <strong style="color:#fff">${username}</strong>, şifre sıfırlama talebinde bulundun.</p>
<p>Aşağıdaki kodu oyun içinde gir:</p>
<div class="code">${code}</div>
<p class="warn">⚠️ Bu kod 15 dakika geçerlidir. Bu talebi sen yapmadıysan yoksay.</p>
</div>
<div class="footer">© 2026 UnderState</div>
</div></body></html>`;
}

function banNotificationHtml(username, reason, until) {
  const untilStr = until ? new Date(until).toLocaleString('tr-TR') : 'Süresiz';
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8">
<style>
body{margin:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;color:#E2E8F0}
.wrap{max-width:520px;margin:0 auto;padding:32px 16px}
.logo{text-align:center;margin-bottom:24px;font-size:2rem;font-weight:900;letter-spacing:.3rem}
.u{color:#D00000}.n{color:#fff}
.card{background:#0A1628;border:1px solid rgba(239,68,68,.4);border-radius:12px;padding:32px}
h1{color:#EF4444;font-size:1.3rem;margin:0 0 12px}
p{color:#94A3B8;line-height:1.7;margin:0 0 16px}
.reason{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:12px 16px;color:#FCA5A5;font-style:italic}
.footer{text-align:center;color:#334155;font-size:.75rem;margin-top:24px}
</style></head>
<body><div class="wrap">
<div class="logo"><span class="u">[U</span><span class="n">NDER</span><span class="u">]</span></div>
<div class="card">
<h1>🚫 Hesap Askıya Alındı</h1>
<p>Merhaba <strong style="color:#fff">${username}</strong>, hesabın aşağıdaki nedenle askıya alındı:</p>
<div class="reason">${reason || 'Kural ihlali'}</div>
<p style="margin-top:16px">Ban süresi: <strong style="color:#FCA5A5">${untilStr}</strong></p>
<p style="font-size:.82rem;color:#64748B">Haksız olduğunu düşünüyorsan yöneticilere itiraz edebilirsin.</p>
</div>
<div class="footer">© 2026 UnderState</div>
</div></body></html>`;
}

function electionResultHtml(username, position, winner, votes) {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8">
<style>
body{margin:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;color:#E2E8F0}
.wrap{max-width:520px;margin:0 auto;padding:32px 16px}
.logo{text-align:center;margin-bottom:24px;font-size:2rem;font-weight:900;letter-spacing:.3rem}
.u{color:#D00000}.n{color:#fff}
.card{background:#0A1628;border:1px solid rgba(167,139,250,.3);border-radius:12px;padding:32px}
h1{color:#A78BFA;font-size:1.3rem;margin:0 0 12px}
p{color:#94A3B8;line-height:1.7;margin:0 0 16px}
.winner{font-size:1.5rem;font-weight:900;color:#10B981;text-align:center;padding:12px;background:rgba(16,185,129,.1);border-radius:8px;margin:16px 0}
.footer{text-align:center;color:#334155;font-size:.75rem;margin-top:24px}
</style></head>
<body><div class="wrap">
<div class="logo"><span class="u">[U</span><span class="n">NDER</span><span class="u">]</span></div>
<div class="card">
<h1>🗳️ Seçim Sonuçlandı: ${position}</h1>
<p>Merhaba <strong style="color:#fff">${username}</strong>,</p>
<p><strong style="color:#A78BFA">${position}</strong> seçimi tamamlandı.</p>
<div class="winner">🏆 Kazanan: ${winner} (${votes} oy)</div>
<p style="font-size:.82rem;color:#64748B">Sonuçların tamamını oyun içinde görebilirsin.</p>
</div>
<div class="footer">© 2026 UnderState</div>
</div></body></html>`;
}

function generalNotifHtml(username, title, message) {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8">
<style>
body{margin:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;color:#E2E8F0}
.wrap{max-width:520px;margin:0 auto;padding:32px 16px}
.logo{text-align:center;margin-bottom:24px;font-size:2rem;font-weight:900;letter-spacing:.3rem}
.u{color:#D00000}.n{color:#fff}
.card{background:#0A1628;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:32px}
h1{color:#fff;font-size:1.2rem;margin:0 0 12px}
p{color:#94A3B8;line-height:1.7;margin:0 0 16px}
.footer{text-align:center;color:#334155;font-size:.75rem;margin-top:24px}
</style></head>
<body><div class="wrap">
<div class="logo"><span class="u">[U</span><span class="n">NDER</span><span class="u">]</span></div>
<div class="card">
<h1>${title}</h1>
<p>Merhaba <strong style="color:#fff">${username}</strong>,</p>
<p>${message}</p>
</div>
<div class="footer">© 2026 UnderState</div>
</div></body></html>`;
}

// ── Dışa açık yardımcı fonksiyonlar ─────────────────────────

async function sendWelcome(to, username, playerId) {
  return sendMail({ to, toName: username, subject: '🎮 UnderState\'e Hoş Geldin!', html: welcomeHtml(username), type: 'welcome', playerId });
}

async function sendPasswordReset(to, username, code, playerId) {
  return sendMail({ to, toName: username, subject: '🔐 UnderState Şifre Sıfırlama Kodu', html: passwordResetHtml(username, code), type: 'password_reset', playerId });
}

async function sendBanNotification(to, username, reason, until, playerId) {
  return sendMail({ to, toName: username, subject: '🚫 UnderState Hesap Askıya Alındı', html: banNotificationHtml(username, reason, until), type: 'ban', playerId });
}

async function sendElectionResult(to, username, position, winner, votes, playerId) {
  return sendMail({ to, toName: username, subject: `🗳️ Seçim Sonucu: ${position}`, html: electionResultHtml(username, position, winner, votes), type: 'election_result', playerId });
}

async function sendNotification(to, username, title, message, playerId) {
  return sendMail({ to, toName: username, subject: `📢 UnderState: ${title}`, html: generalNotifHtml(username, title, message), type: 'notification', playerId });
}

module.exports = { sendMail, sendWelcome, sendPasswordReset, sendBanNotification, sendElectionResult, sendNotification };
