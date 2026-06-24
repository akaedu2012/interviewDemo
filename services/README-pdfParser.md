# PDF Parser Service

## Overview

The PDF Parser Service is responsible for extracting text content from PDF files uploaded to the resume analysis system. It uses the `pdf-parse` library to handle PDF parsing and provides text cleaning utilities.

## Features

- **Text Extraction**: Extracts all text content from multi-page PDF documents
- **Text Cleaning**: Removes excessive whitespace, special characters, and normalizes formatting
- **Error Handling**: Gracefully handles various PDF-related errors (encrypted, corrupted, empty files)
- **Metadata Extraction**: Can retrieve PDF metadata (page count) without full text extraction
- **Batch Processing**: Supports parsing multiple PDF files in parallel

## API Reference

### `parseResume(filePath: string): Promise<ParseResult>`

Extracts text content from a PDF file.

**Parameters:**
- `filePath` (string): Path to the PDF file (absolute or relative to public directory)

**Returns:** `Promise<ParseResult>`
```typescript
interface ParseResult {
  success: boolean;
  text?: string;        // Cleaned text content (if successful)
  error?: string;       // Error message (if failed)
  pageCount?: number;   // Number of pages (if successful)
}
```

**Example:**
```typescript
import { parseResume } from '@/services/pdfParser';

const result = await parseResume('/uploads/resume.pdf');
if (result.success) {
  console.log(`Extracted ${result.text.length} characters from ${result.pageCount} pages`);
  console.log(result.text);
} else {
  console.error(`Failed to parse PDF: ${result.error}`);
}
```

**Error Cases:**
- File doesn't exist or is inaccessible
- File is not a PDF format
- PDF is encrypted or password-protected
- PDF is corrupted or invalid
- PDF contains no extractable text (scanned/image-only PDFs)
- Empty file

### `cleanText(rawText: string): string`

Cleans and normalizes extracted text by removing excessive whitespace and special characters.

**Parameters:**
- `rawText` (string): Raw text extracted from PDF

**Returns:** `string` - Cleaned text

**Cleaning Operations:**
1. Normalizes line endings (`\r\n` → `\n`)
2. Removes consecutive empty lines (max 1 empty line)
3. Trims whitespace from each line
4. Removes special Unicode characters (zero-width spaces, control characters)
5. Normalizes multiple spaces to single space
6. Removes common page headers/footers ("Page X of Y")
7. Trims leading/trailing whitespace

**Example:**
```typescript
import { cleanText } from '@/services/pdfParser';

const dirty = `

  Name:   John    Doe    

  Page 1 of 2
`;

const clean = cleanText(dirty);
// Result: "Name: John Doe"
```

### `parseMultipleResumes(filePaths: string[]): Promise<Array<{filePath: string, result: ParseResult}>>`

Parses multiple PDF files in parallel.

**Parameters:**
- `filePaths` (string[]): Array of file paths to parse

**Returns:** `Promise<Array<{filePath: string, result: ParseResult}>>`

**Example:**
```typescript
import { parseMultipleResumes } from '@/services/pdfParser';

const paths = [
  '/uploads/resume1.pdf',
  '/uploads/resume2.pdf',
  '/uploads/resume3.pdf',
];

const results = await parseMultipleResumes(paths);
results.forEach(({ filePath, result }) => {
  if (result.success) {
    console.log(`✓ ${filePath}: ${result.pageCount} pages`);
  } else {
    console.log(`✗ ${filePath}: ${result.error}`);
  }
});
```

### `getPDFMetadata(filePath: string): Promise<{success: boolean, pageCount?: number, error?: string}>`

Retrieves PDF metadata (page count) without extracting full text content.

**Parameters:**
- `filePath` (string): Path to the PDF file

**Returns:** Object with success status, page count, and optional error

**Example:**
```typescript
import { getPDFMetadata } from '@/services/pdfParser';

const metadata = await getPDFMetadata('/uploads/resume.pdf');
if (metadata.success) {
  console.log(`PDF has ${metadata.pageCount} pages`);
}
```

## Usage in the Application

The PDF Parser Service is typically used in the resume upload workflow:

1. User uploads a PDF file → **Resume Upload Service** stores the file
2. **PDF Parser Service** extracts text from the stored file
3. **AI Extractor Service** uses the extracted text to extract structured information
4. Extracted data is saved to the database via **Candidate Manager Service**

**Integration Example:**
```typescript
import { uploadResume } from '@/services/resumeUpload';
import { parseResume } from '@/services/pdfParser';
import { extractAll } from '@/services/aiExtractor';

async function processResume(file: File) {
  // Step 1: Upload and store file
  const uploadResult = await uploadResume(file);
  
  // Step 2: Parse PDF to extract text
  const parseResult = await parseResume(uploadResult.filePath);
  
  if (!parseResult.success) {
    throw new Error(`PDF parsing failed: ${parseResult.error}`);
  }
  
  // Step 3: Use AI to extract structured data
  for await (const progress of extractAll(parseResult.text)) {
    console.log(`Extraction stage: ${progress.stage}`);
  }
}
```

## Testing

Run the manual test script to verify PDF parser functionality:

```bash
# Create a test PDF
npx tsx scripts/create-test-pdf.ts

# Run tests
npx tsx scripts/test-pdf-parser.ts
```

## Technical Details

**Library:** `pdf-parse` v2.4.5  
**API Used:** 
- `PDFParse` class from pdf-parse
- `.getText()` method for text extraction
- `VerbosityLevel.ERRORS` to suppress non-error logs

**File Path Handling:**
- Supports absolute paths
- Supports relative paths (prefixed with `/uploads/`)
- Automatically resolves paths relative to `public` directory

**Performance:**
- Text extraction is synchronous but wrapped in async API
- Batch parsing uses `Promise.all` for parallel processing
- Parser resources are properly cleaned up with `.destroy()`

## Error Codes

The service returns descriptive error messages for various failure scenarios:

| Error Message | Cause |
|---------------|-------|
| "文件路径为空" | Empty file path provided |
| "文件不存在或无法访问" | File not found or permission denied |
| "文件格式不正确，仅支持 PDF 格式" | File extension is not `.pdf` |
| "PDF 文件为空" | File size is 0 bytes |
| "PDF 文件已加密或需要密码" | PDF requires password/decryption |
| "PDF 文件损坏或格式无效" | Corrupted or malformed PDF |
| "PDF 文件中未提取到文本内容" | Scanned PDF with no text layer |
| "PDF 解析错误: [details]" | Other parsing errors |

## Limitations

1. **Scanned PDFs**: Cannot extract text from image-based/scanned PDFs without OCR
2. **Encrypted PDFs**: Cannot parse password-protected or encrypted PDFs
3. **Complex Layouts**: May not preserve complex table or column layouts perfectly
4. **Non-text Content**: Images, charts, and graphics are not extracted
5. **Font Encoding**: May have issues with certain font encodings or non-standard character sets

## Future Enhancements

Potential improvements for the PDF parser:

- [ ] Add OCR support for scanned PDFs (using Tesseract.js or similar)
- [ ] Support password-protected PDFs with user-provided passwords
- [ ] Preserve table structure detection and parsing
- [ ] Extract metadata (author, creation date, etc.)
- [ ] Support other document formats (DOCX, RTF)
- [ ] Add progress callbacks for large files
- [ ] Implement caching for already-parsed files
