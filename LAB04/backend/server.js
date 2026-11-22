require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');

const { UPLOAD_DIR } = require('./middleware/upload.middleware');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab4_homework';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sử dụng UPLOAD_DIR dùng chung đã định nghĩa
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'The file is too large (max 2 MB)!' : err.message;
    return res.status(400).json({ success: false, message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => console.log(`Server listening at: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });