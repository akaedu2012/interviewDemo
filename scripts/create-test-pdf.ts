/**
 * Create a minimal test PDF for testing the PDF parser
 * 
 * Usage: npx tsx scripts/create-test-pdf.ts
 */

import { promises as fs } from "fs";
import path from "path";

async function createTestPDF() {
  console.log("Creating minimal test PDF...\n");

  // Minimal PDF structure with text content
  // This is a valid PDF 1.4 document with one page containing text
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 700 Td
(John Doe - Software Engineer) Tj
0 -20 Td
(Email: john.doe@example.com) Tj
0 -20 Td
(Phone: +1-555-0100) Tj
0 -40 Td
(EXPERIENCE:) Tj
0 -20 Td
(Senior Developer at Tech Corp) Tj
0 -20 Td
(2020 - Present) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
568
%%EOF`;

  // Save to uploads directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const pdfPath = path.join(uploadsDir, "test-resume.pdf");

  try {
    // Ensure directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Write PDF content
    await fs.writeFile(pdfPath, pdfContent, "utf-8");

    console.log("✓ Test PDF created successfully!");
    console.log("  Path:", pdfPath);
    console.log("  Size:", (await fs.stat(pdfPath)).size, "bytes");
    console.log("\nYou can now run: npx tsx scripts/test-pdf-parser.ts");
  } catch (error) {
    console.error("Failed to create test PDF:", error);
    process.exit(1);
  }
}

createTestPDF();
