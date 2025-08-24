const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter for images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/bmp',
        'image/tiff',
        'image/webp',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Maximum 10 files per request
    }
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Middleware for multiple file upload
const uploadMultiple = upload.array('files', 10);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 50MB.',
                    code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    error: 'Too many files. Maximum is 10 files per request.',
                    code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    error: 'Unexpected field name in file upload.',
                    code: 'UNEXPECTED_FIELD'
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: `Upload error: ${error.message}`,
                    code: 'UPLOAD_ERROR'
                });
        }
    }

    if (error.message.includes('Unsupported file type')) {
        return res.status(400).json({
            success: false,
            error: error.message,
            code: 'UNSUPPORTED_FILE_TYPE'
        });
    }

    next(error);
};

// Cleanup middleware to remove uploaded files after processing
const cleanupFiles = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Clean up uploaded files
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

// Validation middleware
const validateFile = (req, res, next) => {
    if (!req.file && (!req.files || req.files.length === 0)) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded. Please provide a file.',
            code: 'NO_FILE_UPLOADED'
        });
    }
    next();
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    handleUploadError,
    cleanupFiles,
    validateFile,
    uploadsDir
};

