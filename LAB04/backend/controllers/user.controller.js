const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../middleware/upload.middleware');

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

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: toUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, age, gender } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (age !== undefined && age !== '') user.age = Number(age);
    if (gender) user.gender = gender;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: toUserResponse(user)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file!' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Xóa avatar cũ nếu tồn tại trong thư mục uploads
    if (user.avatarUrl && user.avatarUrl.includes('/uploads/')) {
      const oldFilename = path.basename(user.avatarUrl);
      const oldPath = path.join(UPLOAD_DIR, oldFilename);
      await fs.promises.unlink(oldPath).catch(() => null);
    }

    user.avatarUrl = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatarUrl,
      data: toUserResponse(user)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, updateAvatar };