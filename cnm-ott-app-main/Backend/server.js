require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session'); // Cần cái này để giữ đăng nhập
const User = require('./models/User');

const app = express(); // <--- ĐÂY LÀ DÒNG KIÊN ĐANG THIẾU

// 1. Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startupchat')
  .then(() => console.log("✅ Đã kết nối MongoDB thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối Mongo:", err));

// 2. Middleware (Cấu hình cơ bản cho Express)
app.use(session({ 
  secret: 'startupchat_secret', 
  resave: false, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// 3. Cấu hình Passport GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://192.168.1.28:3000/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          username: profile.displayName || profile.username,
          email: profile.emails ? profile.emails[0].value : "",
          avatar: profile.photos ? profile.photos[0].value : ""
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 4. Các đường dẫn (Routes)
app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Khi thành công, trả về dữ liệu User để kiểm tra
    res.send(`<h1>Đăng nhập thành công!</h1><p>Chào ${req.user.username}</p>`);
  }
);

// 5. Chạy Server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại: http://192.168.1.28:${PORT}`);
});