const app = require('./app');
const config = require('./config/config');

const PORT = config.server.port;

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Advanced OCR API Server Started Successfully!
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${config.server.nodeEnv}
🔗 API Base URL: http://localhost:${PORT}/api/v1
📖 Documentation: http://localhost:${PORT}/api/v1/docs
✅ Health Check: http://localhost:${PORT}/health
  `);
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
