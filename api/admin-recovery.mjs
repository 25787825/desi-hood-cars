import crypto from 'node:crypto';

const ADMIN_EMAIL = 'desihoodcars@gmail.com';
const CODE_TTL_MS = 10 * 60 * 1000;

function getSecret() {
  return process.env.ADMIN_RECOVERY_SECRET || process.env.RESEND_API_KEY || 'desihood-cars-recovery-key';
}

function hashCode(email, code, exp) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(`${email.toLowerCase()}|${code}|${exp}`)
    .digest('hex');
}

function signPayload(payloadObj) {
  const data = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = String(body.action || '');
    const email = String(body.email || '').trim().toLowerCase();

    if (email !== ADMIN_EMAIL) {
      return res.status(403).json({
        ok: false,
        message: 'Email does not match the authorized Owner Admin email.'
      });
    }

    if (action === 'send-code') {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return res.status(503).json({
          ok: false,
          emailConfigured: false,
          message: 'Email delivery requires RESEND_API_KEY configured in Vercel Environment Variables.'
        });
      }

      const code = String(crypto.randomInt(100000, 1000000));
      const exp = Date.now() + CODE_TTL_MS;
      const codeHash = hashCode(email, code, exp);
      const token = signPayload({ email, exp, codeHash });
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Desi Hood Cars Security <onboarding@resend.dev>';

      const mailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [ADMIN_EMAIL],
          subject: 'Desi Hood Cars Admin Recovery — 6-Digit Verification Code',
          html: `
            <div style="font-family:Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:28px;border-radius:14px;max-width:480px;margin:0 auto;">
              <h2 style="margin:0 0 8px;color:#ffffff;">Desi Hood Cars &bull; Admin Security</h2>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 18px;">Use the 6-digit recovery code below to reset your Hidden Admin Panel Password/PIN. Valid for 10 minutes.</p>
              <div style="background:#111827;border:1px solid #ef4444;border-radius:10px;padding:16px;text-align:center;font-size:28px;font-weight:800;letter-spacing:8px;color:#f87171;">
                ${code}
              </div>
              <p style="font-size:11px;color:#64748b;margin:16px 0 0;">If you did not request this reset, ignore this message.</p>
            </div>
          `
        })
      });

      if (!mailRes.ok) {
        const errText = await mailRes.text();
        return res.status(502).json({
          ok: false,
          emailConfigured: true,
          message: `Email service error (${mailRes.status}): ${errText.slice(0, 140)}`
        });
      }

      return res.status(200).json({
        ok: true,
        emailSent: true,
        expiresInMinutes: 10,
        token
      });
    }

    if (action === 'verify-code') {
      const code = String(body.code || '').trim();
      const token = String(body.token || '').trim();
      const payload = verifyToken(token);

      if (!payload || payload.email !== email) {
        return res.status(400).json({ ok: false, message: 'Invalid or missing recovery token. Please request a new 6-digit code.' });
      }
      if (Date.now() > payload.exp) {
        return res.status(400).json({ ok: false, message: 'This 6-digit recovery code has expired. Please request a new code.' });
      }

      const candidateHash = hashCode(email, code, payload.exp);
      if (candidateHash.length !== payload.codeHash.length ||
          !crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(payload.codeHash))) {
        return res.status(401).json({ ok: false, message: 'Incorrect 6-digit recovery code. Please check your email and try again.' });
      }

      return res.status(200).json({ ok: true, verified: true });
    }

    return res.status(400).json({ ok: false, message: 'Unknown recovery action.' });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message || 'Recovery server error' });
  }
}
