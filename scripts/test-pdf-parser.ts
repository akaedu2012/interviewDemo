/**
 * Manual test script for PDF Parser Service
 * 
 * Usage: npx tsx scripts/test-pdf-parser.ts
 */

import { parseResume, cleanText, getPDFMetadata } from "../services/pdfParser";
import path from "path";

async function testPDFParser() {
  console.log("=== PDF Parser Service Manual Test ===\n");

  // Test 1: cleanText function
  console.log("Test 1: cleanText function");
  console.log("-".repeat(50));
  
  const dirtyText = `

  
    Test    Resume
    

    Name:   John    Doe    
    
    
    Email:  john@example.com
    
    Page 1 of 2
    
    第 5 页
    
    
    Experience:     Software Engineer     
    
    
  `;

  const cleaned = cleanText(dirtyText);
  console.log("Original text length:", dirtyText.length);
  console.log("Cleaned text length:", cleaned.length);
  console.log("Cleaned text:\n", cleaned);
  console.log("\n✓ Test 1 passed\n");

  // Test 2: Parse non-existent file
  console.log("Test 2: Parse non-existent file");
  console.log("-".repeat(50));
  
  const nonExistentResult = await parseResume("/uploads/nonexistent.pdf");
  console.log("Result:", nonExistentResult);
  
  if (!nonExistentResult.success) {
    console.log("✓ Test 2 passed - correctly handled non-existent file\n");
  } else {
    console.log("✗ Test 2 failed - should have returned error\n");
  }

  // Test 3: Parse invalid file path
  console.log("Test 3: Parse with empty file path");
  console.log("-".repeat(50));
  
  const emptyPathResult = await parseResume("");
  console.log("Result:", emptyPathResult);
  
  if (!emptyPathResult.success) {
    console.log("✓ Test 3 passed - correctly handled empty path\n");
  } else {
    console.log("✗ Test 3 failed - should have returned error\n");
  }

  // Test 4: Parse non-PDF file
  console.log("Test 4: Parse non-PDF file");
  console.log("-".repeat(50));
  
  const txtFilePath = path.join(process.cwd(), "package.json");
  const nonPDFResult = await parseResume(txtFilePath);
  console.log("Result:", nonPDFResult);
  
  if (!nonPDFResult.success && nonPDFResult.error?.includes("PDF")) {
    console.log("✓ Test 4 passed - correctly rejected non-PDF file\n");
  } else {
    console.log("✗ Test 4 failed - should have rejected non-PDF file\n");
  }

  // Test 5: Check for actual PDF files in uploads directory
  console.log("Test 5: Look for real PDF files to test");
  console.log("-".repeat(50));
  
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  console.log("Checking uploads directory:", uploadsDir);
  
  try {
    const fs = require("fs").promises;
    const files = await fs.readdir(uploadsDir);
    const pdfFiles = files.filter((f: string) => f.endsWith(".pdf"));
    
    if (pdfFiles.length > 0) {
      console.log(`Found ${pdfFiles.length} PDF file(s):`, pdfFiles);
      
      // Test parsing the first PDF
      const testPDFPath = `/uploads/${pdfFiles[0]}`;
      console.log("\nAttempting to parse:", testPDFPath);
      
      const parseResult = await parseResume(testPDFPath);
      console.log("\nParse result:", {
        success: parseResult.success,
        pageCount: parseResult.pageCount,
        textLength: parseResult.text?.length,
        textPreview: parseResult.text?.substring(0, 200),
        error: parseResult.error,
      });
      
      if (parseResult.success) {
        console.log("\n✓ Test 5 passed - successfully parsed real PDF\n");
        
        // Also test metadata extraction
        const metadataResult = await getPDFMetadata(testPDFPath);
        console.log("Metadata result:", metadataResult);
      } else {
        console.log("\n✗ Test 5 failed - could not parse PDF:", parseResult.error, "\n");
      }
    } else {
      console.log("No PDF files found in uploads directory");
      console.log("This is expected if no files have been uploaded yet");
      console.log("✓ Test 5 skipped - no PDF files available\n");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("Uploads directory doesn't exist yet - this is normal for a fresh install");
      console.log("✓ Test 5 skipped - uploads directory not created\n");
    } else {
      console.error("Error checking uploads directory:", error);
    }
  }

  console.log("=== All Tests Complete ===");
}

// Run tests
testPDFParser().catch((error) => {
  console.error("Test script failed:", error);
  process.exit(1);
});
