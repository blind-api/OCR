require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    tempDir: process.env.TEMP_DIR || 'temp'
  },
  ocr: {
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'eng',
    supportedLanguages: process.env.SUPPORTED_LANGUAGES?.split(',') || ['eng'],
    engineMode: parseInt(process.env.OCR_ENGINE_MODE) || 1,
    pageSegMode: parseInt(process.env.OCR_PAGE_SEG_MODE) || 3
  },
  api: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT) || 1000,
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;

