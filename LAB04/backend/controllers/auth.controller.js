const User = require('../models/User');
const jwt = require('jsonwebtoken');

function toUserResponse(user) {
  return {
    id: user._id,
    _id: user._id,
    fullName: user.fullName,
    age: user.age,
    gender: user.gender,
    email: user.email,
    type: user.type,
    avatarUrl: user.avatarUrl
  };
}

const register = async (req, res) => {
  try {
    const { fullName, age, gender, email, password, type } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email and password are required' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const user = new User({
      fullName,
      age: Number(age) || 18,
      gender: gender || 'male',
      email,
      password,
      type: type === 'admin' ? 'admin' : 'normal'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: toUserResponse(user)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const userData = toUserResponse(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
      data: { token, user: userData }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid' });
    }
    res.json({ success: true, data: toUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };