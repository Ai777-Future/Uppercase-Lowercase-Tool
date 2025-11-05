import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import db from "../db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/create-batch",
  upload.fields([{ name: "attachments" }, { name: "csvFile", maxCount: 1 }]),
  (req, res) => {
    try {
      const { subject, html, scheduledAt, recipientsText } = req.body;

      // recipients can arrive as CSV text or file
      let rows = [];
      if (req.files?.csvFile?.[0]) {
        const csvRaw = fs.readFileSync(req.files.csvFile[0].path, "utf8");
        rows = parse(csvRaw, { columns: true, skip_empty_lines: true });
        fs.unlinkSync(req.files.csvFile[0].path);
      } else if (recipientsText) {
        // format: firstName,lastName,email on each line or CSV header included
        rows = parse(recipientsText, { columns: true, skip_empty_lines: true });
      }

      if (!rows.length) return res.status(400).json({ ok: false, msg: "No recipients found." });

      const createdAt = new Date().toISOString();
      const info = db.prepare(
        `INSERT INTO batches (subject, html, created_at, scheduled_at, status)
         VALUES (?, ?, ?, ?, 'pending')`
      ).run(subject, html, createdAt, scheduledAt || null);

      const batchId = info.lastInsertRowid;

      const insertRec = db.prepare(
        `INSERT INTO recipients (batch_id, first, last, email) VALUES (?, ?, ?, ?)`
      );

      for (const r of rows) {
        insertRec.run(batchId, r.firstName || r.first || "", r.lastName || r.last || "", r.email || r.mail || "");
      }

      // move attachments to dedicated dir for this batch
      if (req.files?.attachments?.length) {
        const dir = `uploads/batch-${batchId}`;
        fs.mkdirSync(dir, { recursive: true });
        for (const f of req.files.attachments) {
          fs.renameSync(f.path, path.join(dir, f.originalname));
        }
      }

      res.json({ ok: true, batchId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, msg: "Failed to create batch." });
    }
  }
);

// list batches + stats
router.get("/batches", (req, res) => {
  const batches = db.prepare(`SELECT * FROM batches ORDER BY id DESC`).all();
  const counts = db.prepare(`
    SELECT batch_id,
      SUM(CASE WHEN status='queued' THEN 1 ELSE 0 END) AS queued,
      SUM(CASE WHEN status='sent' THEN 1 ELSE 0 END) AS sent,
      SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
    FROM recipients GROUP BY batch_id
  `).all();

  const byBatch = Object.fromEntries(counts.map(c => [c.batch_id, c]));
  res.json({ ok: true, batches: batches.map(b => ({ ...b, stats: byBatch[b.id] || { queued: 0, sent: 0, failed: 0 } })) });
});

// view recipients of a batch
router.get("/batches/:id/recipients", (req, res) => {
  const recs = db.prepare(`SELECT * FROM recipients WHERE batch_id=? ORDER BY id`).all(req.params.id);
  res.json({ ok: true, recipients: recs });
});

export default router;
