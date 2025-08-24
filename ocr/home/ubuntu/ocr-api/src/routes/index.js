const express = require('express');
const router = express.Router();

// Import route modules
const ocrRoutes = require('./ocrRoutes');
const pdfRoutes = require('./pdfRoutes');
const ocrController = require('../controllers/ocrController');

// API information endpoint
router.get('/info', ocrController.getApiInfo);

// Language support endpoint
router.get('/languages', ocrController.getSupportedLanguages);

// OCR routes
router.use('/ocr', ocrRoutes);

// PDF routes  
router.use('/pdf', pdfRoutes);

// Documentation endpoint
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        data: {
            title: 'Advanced OCR API Documentation',
            version: '1.0.0',
            description: 'Complete API documentation for the Advanced OCR service',
            baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
            endpoints: {
                'GET /info': {
                    description: 'Get API information and features',
                    parameters: 'None',
                    response: 'API details and capabilities'
                },
                'GET /languages': {
                    description: 'Get list of supported languages',
                    parameters: 'None',
                    response: 'Array of supported language codes and names'
                },
                'POST /ocr/extract': {
                    description: 'Extract text from a single image',
                    parameters: {
                        file: 'Image file (required)',
                        language: 'Language code (optional, default: eng)',
                        psm: 'Page segmentation mode (optional, default: 3)',
                        oem: 'OCR engine mode (optional, default: 3)',
                        whitelist: 'Character whitelist (optional)',
                        blacklist: 'Character blacklist (optional)',
                        preserveInterword: 'Preserve interword spaces (optional)',
                        enhance: 'Enable image enhancement (optional)',
                        denoise: 'Enable denoising (optional)',
                        deskew: 'Enable deskewing (optional)'
                    },
                    response: 'Extracted text with confidence and metadata'
                },
                'POST /ocr/extract-detailed': {
                    description: 'Extract detailed text with word/line positions',
                    parameters: {
                        file: 'Image file (required)',
                        language: 'Language code (optional)',
                        includeWords: 'Include word-level data (optional)',
                        includeLines: 'Include line-level data (optional)',
                        includeParagraphs: 'Include paragraph-level data (optional)',
                        includeBlocks: 'Include block-level data (optional)'
                    },
                    response: 'Detailed text extraction with positional data'
                },
                'POST /ocr/batch': {
                    description: 'Process multiple images in batch',
                    parameters: {
                        files: 'Array of image files (required)',
                        language: 'Language code (optional)',
                        psm: 'Page segmentation mode (optional)',
                        oem: 'OCR engine mode (optional)'
                    },
                    response: 'Array of OCR results for each image'
                },
                'POST /pdf/extract': {
                    description: 'Extract text from entire PDF',
                    parameters: {
                        file: 'PDF file (required)',
                        language: 'Language code (optional)',
                        density: 'Image density for conversion (optional, default: 300)',
                        combinePages: 'Combine all pages into single text (optional)',
                        includePageNumbers: 'Include page numbers in output (optional)'
                    },
                    response: 'Extracted text from all PDF pages'
                },
                'POST /pdf/extract-pages': {
                    description: 'Extract text from specific PDF pages',
                    parameters: {
                        file: 'PDF file (required)',
                        pages: 'Comma-separated page numbers (required)',
                        language: 'Language code (optional)',
                        density: 'Image density for conversion (optional)'
                    },
                    response: 'Extracted text from specified pages'
                },
                'POST /pdf/info': {
                    description: 'Get PDF file information',
                    parameters: {
                        file: 'PDF file (required)'
                    },
                    response: 'PDF metadata including page count and file size'
                },
                'POST /pdf/convert-images': {
                    description: 'Convert PDF pages to images',
                    parameters: {
                        file: 'PDF file (required)',
                        density: 'Image density (optional, default: 300)',
                        format: 'Image format (optional, default: png)',
                        width: 'Image width (optional, default: 2000)',
                        height: 'Image height (optional, default: 2000)'
                    },
                    response: 'Base64 encoded images for each page'
                }
            },
            supportedFormats: {
                images: ['JPEG', 'PNG', 'BMP', 'TIFF', 'WebP'],
                documents: ['PDF']
            },
            supportedLanguages: [
                'English (eng)', 'Arabic (ara)', 'Bengali (ben)', 'Bulgarian (bul)',
                'Czech (ces)', 'Chinese Simplified (chi_sim)', 'Chinese Traditional (chi_tra)',
                'Danish (dan)', 'German (deu)', 'Greek (ell)', 'Finnish (fin)',
                'French (fra)', 'Hebrew (heb)', 'Hindi (hin)', 'Hungarian (hun)',
                'Indonesian (ind)', 'Italian (ita)', 'Japanese (jpn)', 'Korean (kor)',
                'Dutch (nld)', 'Norwegian (nor)', 'Polish (pol)', 'Portuguese (por)',
                'Romanian (ron)', 'Russian (rus)', 'Spanish (spa)', 'Swedish (swe)',
                'Thai (tha)', 'Turkish (tur)', 'Ukrainian (ukr)', 'Vietnamese (vie)'
            ],
            limits: {
                maxFileSize: '50MB',
                maxFilesPerRequest: 10,
                rateLimit: '1000 requests per 15 minutes'
            },
            examples: {
                curl: {
                    imageOCR: `curl -X POST "${req.protocol}://${req.get('host')}/api/v1/ocr/extract" \\
  -F "file=@image.jpg" \\
  -F "language=eng" \\
  -F "psm=3"`,
                    pdfOCR: `curl -X POST "${req.protocol}://${req.get('host')}/api/v1/pdf/extract" \\
  -F "file=@document.pdf" \\
  -F "language=eng" \\
  -F "density=300"`
                }
            }
        },
        metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }
    });
});

module.exports = router;

