# Advanced OCR API - Unlimited Usage

A powerful, production-ready OCR (Optical Character Recognition) API built with Node.js that provides unlimited text extraction from images and PDF documents. This API supports over 30 languages and offers advanced features like batch processing, detailed text analysis, and custom preprocessing options.

## 🚀 Features

- **Unlimited OCR Processing** - No usage restrictions or rate limits for OCR operations
- **Multi-Language Support** - 30+ languages including English, Arabic, Chinese, Japanese, Korean, and more
- **Image Processing** - Support for JPEG, PNG, BMP, TIFF, WebP formats
- **PDF Processing** - Extract text from entire PDFs or specific pages
- **Batch Processing** - Process multiple images simultaneously
- **Detailed Analysis** - Get word-level, line-level, and paragraph-level text positioning
- **Image Preprocessing** - Built-in enhancement, denoising, and deskewing capabilities
- **RESTful API** - Clean, well-documented REST endpoints
- **High Performance** - Optimized for speed and accuracy
- **Production Ready** - Includes security, logging, and error handling

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Supported Languages](#supported-languages)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Error Handling](#error-handling)

## 🛠 Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn
- ImageMagick (for PDF processing)
- Poppler (for PDF to image conversion)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/advanced-ocr-api.git
cd advanced-ocr-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Install system dependencies (Ubuntu/Debian)**
```bash
sudo apt-get update
sudo apt-get install -y imagemagick poppler-utils
```

4. **Start the server**
```bash
npm start
```

The API will be available at `http://localhost:3000`

## 🚀 Quick Start

### Basic Image OCR

```bash
curl -X POST http://localhost:3000/api/v1/ocr/extract \
  -F "file=@your-image.jpg" \
  -F "language=eng"
```

### PDF Text Extraction

```bash
curl -X POST http://localhost:3000/api/v1/pdf/extract \
  -F "file=@your-document.pdf" \
  -F "language=eng"
```

### Check API Health

```bash
curl http://localhost:3000/health
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Image OCR Endpoints

#### Extract Text from Image
```http
POST /ocr/extract
```

**Parameters:**
- `file` (required): Image file (JPEG, PNG, BMP, TIFF, WebP)
- `language` (optional): Language code (default: 'eng')
- `psm` (optional): Page segmentation mode (default: '3')
- `oem` (optional): OCR engine mode (default: '3')
- `whitelist` (optional): Character whitelist
- `blacklist` (optional): Character blacklist
- `preserveInterword` (optional): Preserve interword spaces
- `enhance` (optional): Enable image enhancement
- `denoise` (optional): Enable denoising
- `deskew` (optional): Enable deskewing

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted text content",
    "confidence": 95.67,
    "wordCount": 42,
    "lineCount": 8,
    "paragraphCount": 3,
    "blockCount": 1,
    "processingTime": "1250ms",
    "language": "eng",
    "fileInfo": {
      "originalName": "image.jpg",
      "size": 245760,
      "mimetype": "image/jpeg"
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## 💡 Usage Examples

### JavaScript/Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function extractTextFromImage(imagePath, language = 'eng') {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('language', language);
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/ocr/extract',
      form,
      { headers: form.getHeaders() }
    );
    
    return response.data.data.text;
  } catch (error) {
    console.error('OCR Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
extractTextFromImage('./document.jpg', 'eng')
  .then(text => console.log('Extracted text:', text))
  .catch(error => console.error('Error:', error));
```

### Python

```python
import requests

def extract_text_from_image(image_path, language='eng'):
    url = 'http://localhost:3000/api/v1/ocr/extract'
    
    with open(image_path, 'rb') as file:
        files = {'file': file}
        data = {'language': language}
        
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            return response.json()['data']['text']
        else:
            raise Exception(f"OCR failed: {response.json()}")

# Usage
try:
    text = extract_text_from_image('./document.jpg', 'eng')
    print(f"Extracted text: {text}")
except Exception as e:
    print(f"Error: {e}")
```

## 🌍 Supported Languages

The API supports 30+ languages with their respective language codes:

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | eng | Arabic | ara |
| Bengali | ben | Bulgarian | bul |
| Czech | ces | Chinese (Simplified) | chi_sim |
| Chinese (Traditional) | chi_tra | Danish | dan |
| German | deu | Greek | ell |
| Finnish | fin | French | fra |
| Hebrew | heb | Hindi | hin |
| Hungarian | hun | Indonesian | ind |
| Italian | ita | Japanese | jpn |
| Korean | kor | Dutch | nld |
| Norwegian | nor | Polish | pol |
| Portuguese | por | Romanian | ron |
| Russian | rus | Spanish | spa |
| Swedish | swe | Thai | tha |
| Turkish | tur | Ukrainian | ukr |
| Vietnamese | vie | | |

## 🚀 Deployment to Render

### Step-by-Step Deployment Guide

1. **Prepare your code for deployment**
   - Ensure all dependencies are in package.json
   - Set up environment variables
   - Configure the start script

2. **Create a Render account** at [render.com](https://render.com)

3. **Create a new Web Service**
   - Connect your GitHub repository
   - Choose "Web Service" type
   - Configure build and start commands

4. **Configure deployment settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Instance Type:** Choose based on your needs

5. **Set environment variables:**
   ```
   NODE_ENV=production
   PORT=10000
   HOST=0.0.0.0
   ```

6. **Deploy** - Render will automatically build and deploy your API

Your API will be available at: `https://your-service-name.onrender.com`

## ⚙️ Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Upload Configuration
MAX_FILE_SIZE=50mb
UPLOAD_DIR=uploads
TEMP_DIR=temp

# OCR Configuration
DEFAULT_LANGUAGE=eng
DEFAULT_PSM=3
DEFAULT_OEM=3
DEFAULT_DENSITY=300

# Security
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

## 🔧 Error Handling

The API provides comprehensive error handling with detailed error messages:

### Error Response Format

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `NO_FILE` | No file uploaded | 400 |
| `UNSUPPORTED_FILE_TYPE` | Invalid file format | 400 |
| `FILE_TOO_LARGE` | File exceeds size limit | 400 |
| `OCR_PROCESSING_ERROR` | OCR processing failed | 500 |
| `PDF_CONVERSION_ERROR` | PDF conversion failed | 500 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |

## 📊 Performance Tips

1. **Image Quality**: Use high-resolution images (300 DPI or higher)
2. **File Size**: Compress images while maintaining quality
3. **Language Selection**: Specify the correct language
4. **Batch Processing**: Use batch endpoints for multiple files

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Prevents abuse
- **File Validation**: Strict file type checking
- **Size Limits**: Prevents large file attacks

## 📄 License

This project is licensed under the MIT License.

---

**Advanced OCR API - Built for unlimited, high-performance text extraction**

