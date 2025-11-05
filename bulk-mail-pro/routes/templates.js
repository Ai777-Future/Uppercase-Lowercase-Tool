import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/", (req, res) => {
  const list = db.prepare(`SELECT id,name,subject,updated_at FROM templates ORDER BY updated_at DESC`).all();
  res.json({ ok: true, templates: list });
});

router.get("/:id", (req, res) => {
  const t = db.prepare(`SELECT * FROM templates WHERE id=?`).get(req.params.id);
  if (!t) return res.status(404).json({ ok: false });
  res.json({ ok: true, template: t });
});

router.post("/", (req, res) => {
  const { name, subject, html } = req.body;
  const now = new Date().toISOString();
  try {
    db.prepare(`
      INSERT INTO templates (name, subject, html, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET subject=excluded.subject, html=excluded.html, updated_at=excluded.updated_at
    `).run(name, subject, html, now);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, msg: e.message });
  }
});

export default router;
