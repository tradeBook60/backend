const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET } = require("../config");

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid username." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },
      SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token: `Bearer ${token}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
};

module.exports = { signup, login };
