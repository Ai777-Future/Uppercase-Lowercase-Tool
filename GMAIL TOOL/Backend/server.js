// server.js
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));



// --- configure transporter ---
// Gmail के लिए: 2FA ON करें, फिर App Password बनाकर .env में रखें
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
}

});

function interpolate(tpl, data){
  return tpl
    .replace(/{{\s*firstName\s*}}/gi, data.firstName || '')
    .replace(/{{\s*lastName\s*}}/gi, data.lastName || '');
}

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.get('/', (_, res) => res.json({ ok:true, msg:'Email sender API up' }));

app.post('/send', async (req, res) => {
  const { subject, message, recipients } = req.body || {};
  if(!subject || !message || !Array.isArray(recipients)) {
    return res.status(400).json({ ok:false, error:'Invalid payload' });
  }

  const sanitized = recipients
    .filter(r => r && r.firstName && r.email && emailRx.test(r.email))
    .map(r => ({ firstName: String(r.firstName).trim(), lastName: String(r.lastName||'').trim(), email: String(r.email).trim() }));

  const results = [];
  for (const r of sanitized) {
    const personalizedSubject = interpolate(subject, r);
    const personalizedMessage = interpolate(message, r);
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Mailer'}" <${process.env.GMAIL_USER}>`,
        to: r.email,
        subject: personalizedSubject,
        text: personalizedMessage,
        // अगर HTML भेजना चाहो:
        // html: `<p>${personalizedMessage.replace(/\n/g,'<br>')}</p>`
      });
      results.push({ email: r.email, ok:true, id: info.messageId });
    } catch (err) {
      results.push({ email: r.email, ok:false, error: err && err.response ? err.response : (err.message || 'send error') });
    }
    // छोटा delay (tune as needed)
    await sleep(750);
  }

  res.json({ ok:true, total: sanitized.length, results });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
