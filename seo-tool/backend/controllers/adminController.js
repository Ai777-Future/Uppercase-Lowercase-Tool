import User from "../models/User.js";
import UsageLog from "../models/UsageLog.js";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isSuspended = true;
      await user.save();
      res.json({ message: "User suspended" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logs
export const getLogs = async (req, res) => {
  try {
    const logs = await UsageLog.find().populate("user", "name email");
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
