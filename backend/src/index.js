require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const skillAuditRoutes = require('./routes/skillAudit');
const roadmapRoutes = require('./routes/roadmap');
const opportunityRoutes = require('./routes/opportunities');
const enterpriseRoutes = require('./routes/enterpriseRoute');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skill-audit', skillAuditRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Skiller AI API is running ✅', version: '1.0.0' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Skiller AI Backend running on port ${PORT}`);
});

module.exports = app;