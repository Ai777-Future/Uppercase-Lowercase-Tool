import express from "express";
import { getUsers, suspendUser, getLogs } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, adminOnly, getUsers);
router.put("/suspend/:id", protect, adminOnly, suspendUser);
router.get("/logs", protect, adminOnly, getLogs);

export default router;
