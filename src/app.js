const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const config = require('./config/config');

const app = express();

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, '..', config.upload.uploadDir),
    path.join(__dirname, '..', config.upload.tempDir),
    path.join(__dirname, '..', 'public')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: config.api.corsOrigin === '*' ? true : config.api.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.nodeEnv,
    version: require('../package.json').version
  });
});

// API routes
app.use('/api/v1', require('./routes'));

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Advanced OCR API - Unlimited Usage',
    version: '1.0.0',
    features: [
      'Image OCR with 100+ language support',
      'PDF OCR processing',
      'Multi-page document processing',
      'Advanced image preprocessing',
      'High accuracy text extraction',
      'RESTful API endpoints'
    ],
    endpoints: {
      health: '/health',
      imageOCR: '/api/v1/ocr/image',
      pdfOCR: '/api/v1/ocr/pdf',
      languages: '/api/v1/languages',
      documentation: '/api/v1/docs'
    }
  });
});

// 404 handler - FIXED for Express v5
app.use('/*splat', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/',
      '/health',
      '/api/v1/ocr/image',
      '/api/v1/ocr/pdf',
      '/api/v1/languages'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: `File size exceeds the limit of ${config.upload.maxFileSize}`
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid file field',
      message: 'Unexpected file field in the request'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.server.nodeEnv === 'development' && { stack: err.stack })
  });
});

module.exports = app;
