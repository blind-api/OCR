const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');
const { uploadSingle, uploadMultiple, handleUploadError, cleanupFiles, validateFile } = require('../middleware/upload');

// Apply cleanup middleware to all routes
router.use(cleanupFiles);

/**
 * @route POST /api/ocr/extract
 * @desc Extract text from a single image
 * @access Public
 */
router.post('/extract', 
    uploadSingle,
    handleUploadError,
    validateFile,
    ocrController.extractText
);

/**
 * @route POST /api/ocr/extract-detailed
 * @desc Extract detailed text information including positions
 * @access Public
 */
router.post('/extract-detailed',
    uploadSingle,
    handleUploadError,
    validateFile,
    ocrController.extractDetailedText
);

/**
 * @route POST /api/ocr/batch
 * @desc Process multiple images in batch
 * @access Public
 */
router.post('/batch',
    uploadMultiple,
    handleUploadError,
    validateFile,
    ocrController.batchExtract
);

/**
 * @route GET /api/ocr/languages
 * @desc Get supported languages
 * @access Public
 */
router.get('/languages', ocrController.getSupportedLanguages);

module.exports = router;

