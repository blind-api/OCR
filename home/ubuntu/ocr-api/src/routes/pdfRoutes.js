const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { uploadSingle, handleUploadError, cleanupFiles, validateFile } = require('../middleware/upload');

// Apply cleanup middleware to all routes
router.use(cleanupFiles);

/**
 * @route POST /api/pdf/extract
 * @desc Extract text from entire PDF
 * @access Public
 */
router.post('/extract',
    uploadSingle,
    handleUploadError,
    validateFile,
    pdfController.extractFromPdf
);

/**
 * @route POST /api/pdf/extract-pages
 * @desc Extract text from specific PDF pages
 * @access Public
 */
router.post('/extract-pages',
    uploadSingle,
    handleUploadError,
    validateFile,
    pdfController.extractFromPdfPages
);

/**
 * @route POST /api/pdf/info
 * @desc Get PDF information
 * @access Public
 */
router.post('/info',
    uploadSingle,
    handleUploadError,
    validateFile,
    pdfController.getPdfInfo
);

/**
 * @route POST /api/pdf/convert-images
 * @desc Convert PDF to images
 * @access Public
 */
router.post('/convert-images',
    uploadSingle,
    handleUploadError,
    validateFile,
    pdfController.convertToImages
);

module.exports = router;

