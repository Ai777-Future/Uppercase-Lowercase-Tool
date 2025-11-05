import cron from "node-cron";
import db from "./db.js";
import { getTransporter, renderHtmlWithTracking } from "./mailer.js";
import fs from "fs";

const baseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

export function startScheduler() {
  // every minute: pick due batches
  cron.schedule("* * * * *", async () => {
    const now = new Date().toISOString();

    const due = db.prepare(`
      SELECT * FROM batches
      WHERE status IN ('pending','failed')
        AND (scheduled_at IS NULL OR scheduled_at <= ?)
      ORDER BY id ASC
      LIMIT 1
    `).get(now);

    if (!due) return;

    // mark sending
    db.prepare(`UPDATE batches SET status='sending' WHERE id=?`).run(due.id);

    try {
      await processBatch(due.id);
      db.prepare(`UPDATE batches SET status='done' WHERE id=?`).run(due.id);
    } catch (e) {
      console.error("Batch failed", e);
      db.prepare(`UPDATE batches SET status='failed' WHERE id=?`).run(due.id);
    }
  });
}

async function processBatch(batchId) {
  const transporter = getTransporter();

  const batch = db.prepare(`SELECT * FROM batches WHERE id=?`).get(batchId);
  const recipients = db.prepare(`SELECT * FROM recipients WHERE batch_id=? AND status IN ('queued','failed')`).all(batchId);

  // attachments (if any) are stored with files on disk per batch
  const attachDir = `uploads/batch-${batchId}`;
  let attachments = [];
  if (fs.existsSync(attachDir)) {
    attachments = fs.readdirSync(attachDir).map(name => ({
      filename: name,
      path: `${attachDir}/${name}`
    }));
  }

  for (const r of recipients) {
    try {
      const { rendered, renderedSubject } = renderHtmlWithTracking({
        html: batch.html, subject: batch.subject, recipient: r,
        baseUrl, recipientId: r.id
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: r.email,
        subject: renderedSubject,
        html: rendered,
        attachments
      });

      db.prepare(`UPDATE recipients
        SET status='sent', message_id=?, sent_at=?
        WHERE id=?`).run(info.messageId || "", new Date().toISOString(), r.id);

    } catch (err) {
      db.prepare(`UPDATE recipients SET status='failed', error=? WHERE id=?`)
        .run(String(err.message || err), r.id);
    }
  }

  // cleanup attachments dir after send
  if (fs.existsSync(attachDir)) {
    fs.rmSync(attachDir, { recursive: true, force: true });
  }
}
