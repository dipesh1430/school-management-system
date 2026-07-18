const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Import Routes
const systemRoutes = require('./routes/systemRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

// Initialize background workers
require('./workers/timetableWorker');

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/schools', require('./routes/schoolRoutes'));
app.use('/api/v1/classes', require('./routes/classRoutes'));
app.use('/api/v1/subjects', require('./routes/subjectRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/homework', require('./routes/homeworkRoutes'));
app.use('/api/v1/communication', require('./routes/communicationRoutes'));
app.use('/api/v1/library', require('./routes/libraryRoutes'));
app.use('/api/v1/transport', require('./routes/transportRoutes'));
app.use('/api/v1/exams', require('./routes/examRoutes'));
app.use('/api/v1/ptm', require('./routes/ptmRoutes'));
app.use('/api/v1/chat', require('./routes/chatRoutes'));
app.use('/api/v1/fees', require('./routes/feeRoutes'));
app.use('/api/v1/leaves', require('./routes/leaveRoutes'));
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/timetables', timetableRoutes);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-saas';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
