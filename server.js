require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Sambung MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fail statik (HTML, CSS, JS, gambar upload)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API Routes
app.use('/api/classes', require('./routes/classes'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/spin', require('./routes/spin'));

// Semak status server
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server berjalan lancar! 🎉' }));

// Fallback ke index.html untuk laluan lain
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
