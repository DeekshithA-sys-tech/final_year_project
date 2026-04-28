const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads')); // For local uploads fallback

// Routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const inferenceRoutes = require('./src/routes/inferenceRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/inference', inferenceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', uploadRoutes);

// Error Default Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

module.exports = app;
