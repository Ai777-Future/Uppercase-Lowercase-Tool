import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("UsageLog", usageLogSchema);
