const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { pool, testDbConnection } = require('../config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Performance Middleware
app.use(helmet({
    contentSecurityPolicy: false // Disabled for Leaflet maps to load tiles
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('combined')); // Logging

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Database Connection Test
testDbConnection();

// Health Check API
app.get('/api/health', async (req, res) => {
    try {
        const dbRes = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            timestamp: new Date(),
            database: 'connected',
            db_time: dbRes.rows[0].now
        });
    } catch (err) {
        console.error('Health check failed', err);
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// Serve frontend for all other routes (SPA support if needed, or just index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Handle Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
        });
    });
});
