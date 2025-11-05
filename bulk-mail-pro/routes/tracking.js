import express from "express";
import db from "../db.js";

const router = express.Router();

// 1x1 transparent PNG
const PNG = Buffer.from(
  "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000154A0F53A0000000049454E44AE426082",
  "hex"
);

// open tracking
router.get("/o.png", (req, res) => {
  const rid = Number(req.query.rid);
  if (rid) {
    db.prepare(`INSERT INTO events (recipient_id, type, meta, created_at) VALUES (?, 'open', '{}', ?)`)
      .run(rid, new Date().toISOString());
    db.prepare(`UPDATE recipients SET status='opened' WHERE id=? AND status='sent'`).run(rid);
  }
  res.setHeader("Content-Type", "image/png");
  res.send(PNG);
});

// click tracking
router.get("/c", (req, res) => {
  const rid = Number(req.query.rid);
  const url = String(req.query.url || "");
  if (rid) {
    db.prepare(`INSERT INTO events (recipient_id, type, meta, created_at) VALUES (?, 'click', ?, ?)`)
      .run(rid, JSON.stringify({ url }), new Date().toISOString());
    db.prepare(`UPDATE recipients SET status='clicked' WHERE id=?`).run(rid);
  }
  try {
    const safe = decodeURIComponent(url);
    res.redirect(safe);
  } catch {
    res.status(400).send("Bad URL");
  }
});

export default router;
