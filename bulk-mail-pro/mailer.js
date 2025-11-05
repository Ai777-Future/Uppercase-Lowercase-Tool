import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
  SMTP_SERVICE, SENDGRID_API_KEY
} = process.env;

let transporter;

export function getTransporter() {
  if (transporter) return transporter;

  // SendGrid (if key provided)
  if (SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: { api_key: SENDGRID_API_KEY }
    });
    return transporter;
  }

  // Service shorthand (e.g. "gmail")
  if (SMTP_SERVICE) {
    transporter = nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    return transporter;
  }

  // Generic SMTP
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  return transporter;
}

/**
 * Renders final HTML with placeholders + embeds tracking.
 */
export function renderHtmlWithTracking({ html, subject, recipient, baseUrl, recipientId }) {
  const safe = (s="") => String(s ?? "");
  let rendered = html
    .replaceAll("{{firstName}}", safe(recipient.first))
    .replaceAll("{{lastName}}", safe(recipient.last))
    .replaceAll("{{email}}", safe(recipient.email));

  // wrap links for click-tracking
  rendered = rendered.replace(
    /href="([^"]+)"/g,
    (m, url) => `href="${baseUrl}/t/c?rid=${recipientId}&url=${encodeURIComponent(url)}"`
  );

  // 1x1 tracking pixel
  rendered += `<img src="${baseUrl}/t/o.png?rid=${recipientId}" width="1" height="1" style="display:none" alt="" />`;

  // also personalize subject similarly
  const renderedSubject = subject
    .replaceAll("{{firstName}}", safe(recipient.first))
    .replaceAll("{{lastName}}", safe(recipient.last))
    .replaceAll("{{email}}", safe(recipient.email));

  return { rendered, renderedSubject };
}
