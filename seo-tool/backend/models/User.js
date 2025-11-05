import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // admin or user
  suspended: { type: Boolean, default: false }
});

export default mongoose.model("User", userSchema);
