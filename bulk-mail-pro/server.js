import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import emailsRouter from "./routes/emails.js";
import templatesRouter from "./routes/templates.js";
import trackingRouter from "./routes/tracking.js";
import exportsRouter from "./routes/exports.js";
import { startScheduler } from "./scheduler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", emailsRouter);
app.use("/api/templates", templatesRouter);
app.use("/t", trackingRouter);
app.use("/api/exports", exportsRouter);

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bulk-Mail-Pro running on http://localhost:${port}`);
});

// start cron worker
startScheduler();
