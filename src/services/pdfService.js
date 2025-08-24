const pdf2pic = require('pdf2pic');
const fs = require('fs');
const path = require('path');
const ocrService = require('./ocrService');

class PDFService {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp');
        this.ensureTempDir();
    }

    /**
     * Ensure temp directory exists
     */
    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Convert PDF to images
     * @param {string} pdfPath - Path to PDF file
     * @param {Object} options - Conversion options
     * @returns {Promise<Array>} Array of image paths
     */
    async convertPdfToImages(pdfPath, options = {}) {
        try {
            const {
                density = 300,
                saveFilename = 'page',
                savePath = this.tempDir,
                format = 'png',
                width = 2000,
                height = 2000
            } = options;

            console.log(`Converting PDF to images: ${pdfPath}`);

            const convert = pdf2pic.fromPath(pdfPath, {
                density: density,
                saveFilename: saveFilename,
                savePath: savePath,
                format: format,
                width: width,
                height: height
            });

            const results = await convert.bulk(-1); // Convert all pages
            
            const imagePaths = results.map(result => result.path);
            console.log(`Converted ${imagePaths.length} pages to images`);
            
            return imagePaths;

        } catch (error) {
            console.error('PDF conversion error:', error);
            throw new Error(`Failed to convert PDF to images: ${error.message}`);
        }
    }

    /**
     * Extract text from PDF using OCR
     * @param {string} pdfPath - Path to PDF file
     * @param {Object} options - OCR options
     * @returns {Promise<Object>} OCR results for all pages
     */
    async extractTextFromPdf(pdfPath, options = {}) {
        try {
            const {
                language = 'eng',
                psm = '3',
                oem = '3',
                density = 300,
                combinePages = true,
                includePageNumbers = true,
                ...ocrOptions
            } = options;

            console.log(`Starting PDF OCR processing: ${pdfPath}`);
            const startTime = Date.now();

            // Convert PDF to images
            const imagePaths = await this.convertPdfToImages(pdfPath, {
                density,
                saveFilename: `pdf_page_${Date.now()}`,
                savePath: this.tempDir
            });

            const pageResults = [];
            let combinedText = '';
            let totalConfidence = 0;
            let totalWords = 0;

            // Process each page
            for (let i = 0; i < imagePaths.length; i++) {
                const imagePath = imagePaths[i];
                console.log(`Processing page ${i + 1}/${imagePaths.length}`);

                try {
                    const pageResult = await ocrService.extractTextFromImage(imagePath, {
                        language,
                        psm,
                        oem,
                        ...ocrOptions
                    });

                    const pageData = {
                        pageNumber: i + 1,
                        text: pageResult.text,
                        confidence: pageResult.confidence,
                        wordCount: pageResult.words.length,
                        lineCount: pageResult.lines.length,
                        words: pageResult.words,
                        lines: pageResult.lines
                    };

                    pageResults.push(pageData);

                    // Combine text from all pages
                    if (combinePages) {
                        if (includePageNumbers && pageResult.text.trim()) {
                            combinedText += `\n\n--- Page ${i + 1} ---\n\n`;
                        }
                        combinedText += pageResult.text + '\n';
                    }

                    totalConfidence += pageResult.confidence;
                    totalWords += pageResult.words.length;

                } catch (pageError) {
                    console.error(`Error processing page ${i + 1}:`, pageError);
                    pageResults.push({
                        pageNumber: i + 1,
                        text: '',
                        confidence: 0,
                        wordCount: 0,
                        lineCount: 0,
                        error: pageError.message
                    });
                }

                // Clean up temporary image
                try {
                    fs.unlinkSync(imagePath);
                } catch (cleanupError) {
                    console.warn(`Failed to cleanup image ${imagePath}:`, cleanupError);
                }
            }

            const processingTime = Date.now() - startTime;
            const averageConfidence = imagePaths.length > 0 ? totalConfidence / imagePaths.length : 0;

            const result = {
                text: combinePages ? combinedText.trim() : null,
                pages: pageResults,
                summary: {
                    totalPages: imagePaths.length,
                    totalWords: totalWords,
                    averageConfidence: averageConfidence,
                    processingTime: processingTime,
                    language: language,
                    successfulPages: pageResults.filter(p => !p.error).length,
                    failedPages: pageResults.filter(p => p.error).length
                }
            };

            console.log(`PDF OCR completed. ${result.summary.totalPages} pages processed in ${processingTime}ms`);
            return result;

        } catch (error) {
            console.error('PDF OCR Error:', error);
            throw new Error(`PDF OCR processing failed: ${error.message}`);
        }
    }

    /**
     * Extract text from specific PDF pages
     * @param {string} pdfPath - Path to PDF file
     * @param {Array<number>} pageNumbers - Array of page numbers to process (1-based)
     * @param {Object} options - OCR options
     * @returns {Promise<Object>} OCR results for specified pages
     */
    async extractTextFromPdfPages(pdfPath, pageNumbers, options = {}) {
        try {
            const {
                language = 'eng',
                psm = '3',
                oem = '3',
                density = 300,
                ...ocrOptions
            } = options;

            console.log(`Processing specific PDF pages: ${pageNumbers.join(', ')}`);
            const startTime = Date.now();

            // Convert all pages to images first
            const allImagePaths = await this.convertPdfToImages(pdfPath, {
                density,
                saveFilename: `pdf_selective_${Date.now()}`,
                savePath: this.tempDir
            });

            const pageResults = [];
            let totalConfidence = 0;
            let totalWords = 0;

            // Process only specified pages
            for (const pageNum of pageNumbers) {
                const imageIndex = pageNum - 1; // Convert to 0-based index
                
                if (imageIndex < 0 || imageIndex >= allImagePaths.length) {
                    pageResults.push({
                        pageNumber: pageNum,
                        text: '',
                        confidence: 0,
                        wordCount: 0,
                        lineCount: 0,
                        error: `Page ${pageNum} does not exist. PDF has ${allImagePaths.length} pages.`
                    });
                    continue;
                }

                const imagePath = allImagePaths[imageIndex];
                console.log(`Processing page ${pageNum}`);

                try {
                    const pageResult = await ocrService.extractTextFromImage(imagePath, {
                        language,
                        psm,
                        oem,
                        ...ocrOptions
                    });

                    pageResults.push({
                        pageNumber: pageNum,
                        text: pageResult.text,
                        confidence: pageResult.confidence,
                        wordCount: pageResult.words.length,
                        lineCount: pageResult.lines.length,
                        words: pageResult.words,
                        lines: pageResult.lines
                    });

                    totalConfidence += pageResult.confidence;
                    totalWords += pageResult.words.length;

                } catch (pageError) {
                    console.error(`Error processing page ${pageNum}:`, pageError);
                    pageResults.push({
                        pageNumber: pageNum,
                        text: '',
                        confidence: 0,
                        wordCount: 0,
                        lineCount: 0,
                        error: pageError.message
                    });
                }
            }

            // Clean up all temporary images
            for (const imagePath of allImagePaths) {
                try {
                    fs.unlinkSync(imagePath);
                } catch (cleanupError) {
                    console.warn(`Failed to cleanup image ${imagePath}:`, cleanupError);
                }
            }

            const processingTime = Date.now() - startTime;
            const averageConfidence = pageResults.length > 0 ? totalConfidence / pageResults.length : 0;

            const result = {
                pages: pageResults,
                summary: {
                    requestedPages: pageNumbers.length,
                    totalPagesInPdf: allImagePaths.length,
                    totalWords: totalWords,
                    averageConfidence: averageConfidence,
                    processingTime: processingTime,
                    language: language,
                    successfulPages: pageResults.filter(p => !p.error).length,
                    failedPages: pageResults.filter(p => p.error).length
                }
            };

            console.log(`PDF selective OCR completed. ${pageNumbers.length} pages processed in ${processingTime}ms`);
            return result;

        } catch (error) {
            console.error('PDF Selective OCR Error:', error);
            throw new Error(`PDF selective OCR processing failed: ${error.message}`);
        }
    }

    /**
     * Get PDF information
     * @param {string} pdfPath - Path to PDF file
     * @returns {Promise<Object>} PDF information
     */
    async getPdfInfo(pdfPath) {
        try {
            // Convert first page to get page count
            const imagePaths = await this.convertPdfToImages(pdfPath, {
                density: 150, // Lower density for info only
                saveFilename: `pdf_info_${Date.now()}`,
                savePath: this.tempDir
            });

            const pageCount = imagePaths.length;

            // Clean up temporary images
            for (const imagePath of imagePaths) {
                try {
                    fs.unlinkSync(imagePath);
                } catch (cleanupError) {
                    console.warn(`Failed to cleanup info image ${imagePath}:`, cleanupError);
                }
            }

            const stats = fs.statSync(pdfPath);

            return {
                pageCount: pageCount,
                fileSize: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isValid: true
            };

        } catch (error) {
            console.error('PDF Info Error:', error);
            throw new Error(`Failed to get PDF info: ${error.message}`);
        }
    }

    /**
     * Validate PDF file
     * @param {string} filePath - Path to the file
     * @returns {boolean} True if file is a valid PDF
     */
    isValidPdf(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.pdf';
    }
}

module.exports = new PDFService();

