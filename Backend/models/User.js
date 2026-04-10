const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: { type: String, unique: true }, // Dùng để định danh từ GitHub
  username: String,
  email: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);