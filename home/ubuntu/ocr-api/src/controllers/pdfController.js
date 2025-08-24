const pdfService = require('../services/pdfService');
const fs = require('fs');

class PDFController {
    /**
     * Extract text from entire PDF
     */
    async extractFromPdf(req, res) {
        try {
            const { file } = req;
            const {
                language = 'eng',
                psm = '3',
                oem = '3',
                density = 300,
                combinePages = true,
                includePageNumbers = true
            } = req.body;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No PDF file uploaded',
                    code: 'NO_FILE'
                });
            }

            if (!pdfService.isValidPdf(file.path)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid PDF file',
                    code: 'INVALID_PDF'
                });
            }

            console.log(`Processing PDF: ${file.originalname}`);

            const options = {
                language,
                psm,
                oem,
                density: parseInt(density),
                combinePages: combinePages === 'true',
                includePageNumbers: includePageNumbers === 'true'
            };

            const startTime = Date.now();
            const result = await pdfService.extractTextFromPdf(file.path, options);
            const processingTime = Date.now() - startTime;

            const response = {
                success: true,
                data: {
                    text: result.text,
                    pages: result.pages,
                    summary: {
                        ...result.summary,
                        totalProcessingTime: `${processingTime}ms`,
                        fileInfo: {
                            originalName: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype
                        }
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('PDF OCR Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'PDF_OCR_ERROR'
            });
        }
    }

    /**
     * Extract text from specific PDF pages
     */
    async extractFromPdfPages(req, res) {
        try {
            const { file } = req;
            const {
                pages,
                language = 'eng',
                psm = '3',
                oem = '3',
                density = 300
            } = req.body;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No PDF file uploaded',
                    code: 'NO_FILE'
                });
            }

            if (!pages) {
                return res.status(400).json({
                    success: false,
                    error: 'No pages specified. Provide page numbers as comma-separated values (e.g., "1,3,5")',
                    code: 'NO_PAGES_SPECIFIED'
                });
            }

            if (!pdfService.isValidPdf(file.path)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid PDF file',
                    code: 'INVALID_PDF'
                });
            }

            // Parse page numbers
            let pageNumbers;
            try {
                pageNumbers = pages.split(',').map(p => parseInt(p.trim())).filter(p => p > 0);
                if (pageNumbers.length === 0) {
                    throw new Error('No valid page numbers');
                }
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid page numbers format. Use comma-separated positive integers (e.g., "1,3,5")',
                    code: 'INVALID_PAGE_FORMAT'
                });
            }

            console.log(`Processing PDF pages ${pageNumbers.join(', ')}: ${file.originalname}`);

            const options = {
                language,
                psm,
                oem,
                density: parseInt(density)
            };

            const startTime = Date.now();
            const result = await pdfService.extractTextFromPdfPages(file.path, pageNumbers, options);
            const processingTime = Date.now() - startTime;

            const response = {
                success: true,
                data: {
                    pages: result.pages,
                    summary: {
                        ...result.summary,
                        totalProcessingTime: `${processingTime}ms`,
                        requestedPages: pageNumbers,
                        fileInfo: {
                            originalName: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype
                        }
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('PDF Pages OCR Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'PDF_PAGES_OCR_ERROR'
            });
        }
    }

    /**
     * Get PDF information
     */
    async getPdfInfo(req, res) {
        try {
            const { file } = req;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No PDF file uploaded',
                    code: 'NO_FILE'
                });
            }

            if (!pdfService.isValidPdf(file.path)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid PDF file',
                    code: 'INVALID_PDF'
                });
            }

            console.log(`Getting PDF info: ${file.originalname}`);

            const startTime = Date.now();
            const pdfInfo = await pdfService.getPdfInfo(file.path);
            const processingTime = Date.now() - startTime;

            const response = {
                success: true,
                data: {
                    fileInfo: {
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                        uploadedAt: new Date().toISOString()
                    },
                    pdfInfo: {
                        ...pdfInfo,
                        processingTime: `${processingTime}ms`
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('PDF Info Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'PDF_INFO_ERROR'
            });
        }
    }

    /**
     * Convert PDF to images (utility endpoint)
     */
    async convertToImages(req, res) {
        try {
            const { file } = req;
            const {
                density = 300,
                format = 'png',
                width = 2000,
                height = 2000
            } = req.body;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No PDF file uploaded',
                    code: 'NO_FILE'
                });
            }

            if (!pdfService.isValidPdf(file.path)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid PDF file',
                    code: 'INVALID_PDF'
                });
            }

            console.log(`Converting PDF to images: ${file.originalname}`);

            const options = {
                density: parseInt(density),
                format,
                width: parseInt(width),
                height: parseInt(height)
            };

            const startTime = Date.now();
            const imagePaths = await pdfService.convertPdfToImages(file.path, options);
            const processingTime = Date.now() - startTime;

            // Read images as base64 for response
            const images = [];
            for (let i = 0; i < imagePaths.length; i++) {
                try {
                    const imageBuffer = fs.readFileSync(imagePaths[i]);
                    const base64Image = imageBuffer.toString('base64');
                    
                    images.push({
                        pageNumber: i + 1,
                        format: format,
                        size: imageBuffer.length,
                        data: `data:image/${format};base64,${base64Image}`
                    });

                    // Clean up temporary image
                    fs.unlinkSync(imagePaths[i]);
                } catch (imageError) {
                    console.error(`Error processing image ${i + 1}:`, imageError);
                    images.push({
                        pageNumber: i + 1,
                        error: imageError.message
                    });
                }
            }

            const response = {
                success: true,
                data: {
                    images: images,
                    summary: {
                        totalPages: imagePaths.length,
                        successfulConversions: images.filter(img => !img.error).length,
                        failedConversions: images.filter(img => img.error).length,
                        processingTime: `${processingTime}ms`,
                        options: options,
                        fileInfo: {
                            originalName: file.originalname,
                            size: file.size,
                            mimetype: file.mimetype
                        }
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('PDF Conversion Error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'PDF_CONVERSION_ERROR'
            });
        }
    }
}

module.exports = new PDFController();

