const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min

  console.log("EMAIL:", process.env.EMAIL);
  console.log("PASSWORD:", process.env.PASSWORD);

  await user.save();

  const resetLink = `https://reset-password-frontend-vd2b.vercel.app/reset-password/${token}`;

  console.log("RESET LINK:", resetLink);

  res.json({
    message: "Reset link generated",
    resetLink: resetLink
  });
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "Registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
