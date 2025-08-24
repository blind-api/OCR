const ocrService = require('../services/ocrService');
const fs = require('fs');
const path = require('path');

class OCRController {
    /**
     * Extract text from a single image
     */
    async extractText(req, res) {
        try {
            const { file } = req;
            const {
                language = 'eng',
                psm = '3',
                oem = '3',
                whitelist = '',
                blacklist = '',
                preserveInterword = false,
                enhance = false,
                denoise = false,
                deskew = false
            } = req.body;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded',
                    code: 'NO_FILE'
                });
            }

            console.log(`Processing file: ${file.originalname}`);

            const options = {
                language,
                psm,
                oem,
                whitelist,
                blacklist,
                preserveInterword: preserveInterword === 'true',
                enhance: enhance === 'true',
                denoise: denoise === 'true',
                deskew: deskew === 'true'
            };

            const startTime = Date.now();
            
            let result;
            if (options.enhance || options.denoise || options.deskew) {
                result = await ocrService.extractTextWithPreprocessing(file.path, options);
            } else {
                result = await ocrService.extractTextFromImage(file.path, options);
            }

            const processingTime = Date.now() - startTime;

            const response = {
                success: true,
                data: {
                    text: result.text,
                    confidence: result.confidence,
                    wordCount: result.words.length,
                    lineCount: result.lines.length,
                    paragraphCount: result.paragraphs.length,
                    blockCount: result.blocks.length,
                    processingTime: `${processingTime}ms`,
                    language: language,
                    fileInfo: {
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('OCR Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'OCR_PROCESSING_ERROR'
            });
        }
    }

    /**
     * Extract detailed text information including positions
     */
    async extractDetailedText(req, res) {
        try {
            const { file } = req;
            const {
                language = 'eng',
                psm = '3',
                oem = '3',
                includeWords = true,
                includeLines = true,
                includeParagraphs = true,
                includeBlocks = true
            } = req.body;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded',
                    code: 'NO_FILE'
                });
            }

            console.log(`Processing detailed extraction for: ${file.originalname}`);

            const options = { language, psm, oem };
            const startTime = Date.now();
            
            const result = await ocrService.extractTextFromImage(file.path, options);
            const processingTime = Date.now() - startTime;

            const response = {
                success: true,
                data: {
                    text: result.text,
                    confidence: result.confidence,
                    processingTime: `${processingTime}ms`,
                    language: language,
                    fileInfo: {
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype
                    }
                }
            };

            // Include detailed information based on request
            if (includeWords === 'true') {
                response.data.words = result.words;
            }
            if (includeLines === 'true') {
                response.data.lines = result.lines;
            }
            if (includeParagraphs === 'true') {
                response.data.paragraphs = result.paragraphs;
            }
            if (includeBlocks === 'true') {
                response.data.blocks = result.blocks;
            }

            response.metadata = {
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };

            res.json(response);

        } catch (error) {
            console.error('Detailed OCR Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'DETAILED_OCR_ERROR'
            });
        }
    }

    /**
     * Process multiple images in batch
     */
    async batchExtract(req, res) {
        try {
            const { files } = req;
            const {
                language = 'eng',
                psm = '3',
                oem = '3'
            } = req.body;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded',
                    code: 'NO_FILES'
                });
            }

            console.log(`Processing batch of ${files.length} files`);

            const options = { language, psm, oem };
            const startTime = Date.now();
            const results = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    console.log(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);
                    
                    const result = await ocrService.extractTextFromImage(file.path, options);
                    
                    results.push({
                        success: true,
                        fileInfo: {
                            originalName: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype,
                            index: i
                        },
                        data: {
                            text: result.text,
                            confidence: result.confidence,
                            wordCount: result.words.length,
                            lineCount: result.lines.length
                        }
                    });
                } catch (error) {
                    console.error(`Error processing file ${file.originalname}:`, error);
                    results.push({
                        success: false,
                        fileInfo: {
                            originalName: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype,
                            index: i
                        },
                        error: error.message
                    });
                }
            }

            const processingTime = Date.now() - startTime;
            const successCount = results.filter(r => r.success).length;

            const response = {
                success: true,
                data: {
                    results: results,
                    summary: {
                        totalFiles: files.length,
                        successfulFiles: successCount,
                        failedFiles: files.length - successCount,
                        processingTime: `${processingTime}ms`,
                        language: language
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('Batch OCR Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'BATCH_OCR_ERROR'
            });
        }
    }

    /**
     * Get supported languages
     */
    async getSupportedLanguages(req, res) {
        try {
            const languages = ocrService.getSupportedLanguages();
            
            const languageMap = {
                'eng': 'English',
                'ara': 'Arabic',
                'ben': 'Bengali',
                'bul': 'Bulgarian',
                'ces': 'Czech',
                'chi_sim': 'Chinese (Simplified)',
                'chi_tra': 'Chinese (Traditional)',
                'dan': 'Danish',
                'deu': 'German',
                'ell': 'Greek',
                'fin': 'Finnish',
                'fra': 'French',
                'heb': 'Hebrew',
                'hin': 'Hindi',
                'hun': 'Hungarian',
                'ind': 'Indonesian',
                'ita': 'Italian',
                'jpn': 'Japanese',
                'kor': 'Korean',
                'nld': 'Dutch',
                'nor': 'Norwegian',
                'pol': 'Polish',
                'por': 'Portuguese',
                'ron': 'Romanian',
                'rus': 'Russian',
                'spa': 'Spanish',
                'swe': 'Swedish',
                'tha': 'Thai',
                'tur': 'Turkish',
                'ukr': 'Ukrainian',
                'vie': 'Vietnamese'
            };

            const languageList = languages.map(code => ({
                code: code,
                name: languageMap[code] || code,
                supported: true
            }));

            res.json({
                success: true,
                data: {
                    languages: languageList,
                    totalCount: languageList.length
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            });

        } catch (error) {
            console.error('Languages Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'LANGUAGES_ERROR'
            });
        }
    }

    /**
     * Health check endpoint
     */
    async healthCheck(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    status: 'healthy',
                    service: 'Advanced OCR API',
                    version: '1.0.0',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString(),
                    features: [
                        'Image OCR',
                        'PDF OCR',
                        'Multi-language support',
                        'Batch processing',
                        'Detailed text analysis',
                        'Custom preprocessing'
                    ]
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'HEALTH_CHECK_ERROR'
            });
        }
    }

    /**
     * API information endpoint
     */
    async getApiInfo(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    name: 'Advanced OCR API',
                    version: '1.0.0',
                    description: 'A powerful OCR API with unlimited usage, supporting images and PDFs with multi-language recognition',
                    endpoints: {
                        'POST /api/ocr/extract': 'Extract text from single image',
                        'POST /api/ocr/extract-detailed': 'Extract detailed text with positions',
                        'POST /api/ocr/batch': 'Process multiple images',
                        'POST /api/ocr/pdf': 'Extract text from PDF',
                        'GET /api/ocr/languages': 'Get supported languages',
                        'GET /api/health': 'Health check',
                        'GET /api/info': 'API information'
                    },
                    supportedFormats: ['JPEG', 'PNG', 'BMP', 'TIFF', 'WebP', 'PDF'],
                    maxFileSize: '50MB',
                    maxFilesPerRequest: 10,
                    features: [
                        'Unlimited OCR processing',
                        '30+ language support',
                        'Batch processing',
                        'PDF text extraction',
                        'Detailed text analysis',
                        'Custom OCR parameters',
                        'Image preprocessing',
                        'High accuracy recognition'
                    ]
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    documentation: 'https://your-api-docs.com'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'API_INFO_ERROR'
            });
        }
    }
}

module.exports = new OCRController();

