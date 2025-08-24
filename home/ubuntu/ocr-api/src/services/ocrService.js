const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

class OCRService {
    constructor() {
        this.supportedLanguages = [
            'eng', 'ara', 'ben', 'bul', 'ces', 'chi_sim', 'chi_tra', 'dan',
            'deu', 'ell', 'fin', 'fra', 'heb', 'hin', 'hun', 'ind', 'ita',
            'jpn', 'kor', 'nld', 'nor', 'pol', 'por', 'ron', 'rus', 'spa',
            'swe', 'tha', 'tur', 'ukr', 'vie'
        ];
        
        this.defaultOptions = {
            logger: m => console.log(m),
            errorHandler: err => console.error(err)
        };
    }

    /**
     * Extract text from image using Tesseract OCR
     * @param {string} imagePath - Path to the image file
     * @param {Object} options - OCR options
     * @returns {Promise<Object>} OCR result with text and confidence
     */
    async extractTextFromImage(imagePath, options = {}) {
        try {
            const {
                language = 'eng',
                psm = '3',
                oem = '3',
                whitelist = '',
                blacklist = '',
                preserveInterword = false
            } = options;

            // Validate language
            const languages = language.split('+');
            for (const lang of languages) {
                if (!this.supportedLanguages.includes(lang)) {
                    throw new Error(`Unsupported language: ${lang}`);
                }
            }

            // Configure Tesseract options
            const tesseractOptions = {
                lang: language,
                oem: parseInt(oem),
                psm: parseInt(psm),
                preserve_interword_spaces: preserveInterword ? '1' : '0'
            };

            if (whitelist) {
                tesseractOptions.tessedit_char_whitelist = whitelist;
            }

            if (blacklist) {
                tesseractOptions.tessedit_char_blacklist = blacklist;
            }

            console.log(`Starting OCR processing for: ${imagePath}`);
            console.log(`Language: ${language}, PSM: ${psm}, OEM: ${oem}`);

            const { data } = await Tesseract.recognize(imagePath, language, {
                logger: this.defaultOptions.logger,
                ...tesseractOptions
            });

            // Extract detailed information
            const result = {
                text: data.text.trim(),
                confidence: data.confidence,
                words: data.words.map(word => ({
                    text: word.text,
                    confidence: word.confidence,
                    bbox: word.bbox
                })),
                lines: data.lines.map(line => ({
                    text: line.text,
                    confidence: line.confidence,
                    bbox: line.bbox
                })),
                paragraphs: data.paragraphs.map(paragraph => ({
                    text: paragraph.text,
                    confidence: paragraph.confidence,
                    bbox: paragraph.bbox
                })),
                blocks: data.blocks.map(block => ({
                    text: block.text,
                    confidence: block.confidence,
                    bbox: block.bbox
                }))
            };

            console.log(`OCR completed. Confidence: ${result.confidence}%`);
            return result;

        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error(`OCR processing failed: ${error.message}`);
        }
    }

    /**
     * Extract text with advanced image preprocessing
     * @param {string} imagePath - Path to the image file
     * @param {Object} options - OCR and preprocessing options
     * @returns {Promise<Object>} Enhanced OCR result
     */
    async extractTextWithPreprocessing(imagePath, options = {}) {
        try {
            const {
                enhance = true,
                denoise = true,
                deskew = true,
                language = 'eng',
                ...ocrOptions
            } = options;

            let processedImagePath = imagePath;

            // If preprocessing is enabled, apply image enhancements
            if (enhance || denoise || deskew) {
                processedImagePath = await this.preprocessImage(imagePath, {
                    enhance,
                    denoise,
                    deskew
                });
            }

            const result = await this.extractTextFromImage(processedImagePath, {
                language,
                ...ocrOptions
            });

            // Clean up temporary processed image if created
            if (processedImagePath !== imagePath) {
                fs.unlinkSync(processedImagePath);
            }

            return result;

        } catch (error) {
            console.error('Enhanced OCR Error:', error);
            throw new Error(`Enhanced OCR processing failed: ${error.message}`);
        }
    }

    /**
     * Preprocess image for better OCR results
     * @param {string} imagePath - Path to the original image
     * @param {Object} options - Preprocessing options
     * @returns {Promise<string>} Path to processed image
     */
    async preprocessImage(imagePath, options = {}) {
        // For now, return the original path
        // In a production environment, you would implement image preprocessing
        // using libraries like Sharp or ImageMagick
        console.log('Image preprocessing requested but not implemented in this demo');
        return imagePath;
    }

    /**
     * Get supported languages
     * @returns {Array<string>} List of supported language codes
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Validate file format
     * @param {string} filePath - Path to the file
     * @returns {boolean} True if format is supported
     */
    isValidImageFormat(filePath) {
        const supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'];
        const ext = path.extname(filePath).toLowerCase();
        return supportedFormats.includes(ext);
    }

    /**
     * Get file information
     * @param {string} filePath - Path to the file
     * @returns {Object} File information
     */
    getFileInfo(filePath) {
        try {
            const stats = fs.statSync(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            return {
                size: stats.size,
                extension: ext,
                isValid: this.isValidImageFormat(filePath),
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            throw new Error(`Unable to get file info: ${error.message}`);
        }
    }
}

module.exports = new OCRService();

