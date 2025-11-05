import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/batch/:id.csv", (req, res) => {
  const batchId = req.params.id;
  const rows = db.prepare(`
    SELECT r.id, r.first, r.last, r.email, r.status, r.error, r.sent_at,
           b.subject, b.created_at, b.scheduled_at
    FROM recipients r
    JOIN batches b ON r.batch_id=b.id
    WHERE r.batch_id=?
    ORDER BY r.id
  `).all(batchId);

  const header = "id,first,last,email,status,error,sent_at,subject,created_at,scheduled_at\n";
  const body = rows.map(r =>
    [r.id, r.first, r.last, r.email, r.status, (r.error||"").replaceAll(",", " "), r.sent_at||"", r.subject, r.created_at, r.scheduled_at||""].join(",")
  ).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="batch-${batchId}.csv"`);
  res.send(header + body);
});

export default router;
