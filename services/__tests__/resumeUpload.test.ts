import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { validateFile, uploadResume, storeFile } from "../resumeUpload";
import { FILE_UPLOAD } from "@/lib/constants";
import { promises as fs } from "fs";
import path from "path";

describe("Resume Upload Service", () => {
  describe("validateFile", () => {
    it("should validate a valid PDF file", () => {
      const validFile = new File(["dummy content"], "resume.pdf", {
        type: "application/pdf",
      });

      const result = validateFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-PDF file type", () => {
      const invalidFile = new File(["dummy content"], "document.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const result = validateFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("文件格式不支持");
    });

    it("should reject file with invalid extension", () => {
      const invalidFile = new File(["dummy content"], "resume.txt", {
        type: "application/pdf", // Type is correct but extension is wrong
      });

      const result = validateFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("扩展名不支持"))).toBe(true);
    });

    it("should reject file that exceeds size limit", () => {
      const largeContent = new ArrayBuffer(FILE_UPLOAD.MAX_FILE_SIZE + 1);
      const largeFile = new File([largeContent], "large_resume.pdf", {
        type: "application/pdf",
      });

      const result = validateFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("大小超出限制"))).toBe(true);
    });

    it("should reject empty file", () => {
      const emptyFile = new File([], "empty.pdf", {
        type: "application/pdf",
      });

      const result = validateFile(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("文件为空"))).toBe(true);
    });
  });

  describe("storeFile", () => {
    const testUploadDir = path.join(process.cwd(), "public", "uploads");

    afterEach(async () => {
      // Clean up test files
      try {
        const files = await fs.readdir(testUploadDir);
        for (const file of files) {
          if (file.startsWith("test-")) {
            await fs.unlink(path.join(testUploadDir, file));
          }
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it("should store a file and return the file path", async () => {
      const testContent = "Test PDF content";
      const testFile = new File([testContent], "test-resume.pdf", {
        type: "application/pdf",
      });
      const fileId = "test-" + Date.now();

      const filePath = await storeFile(testFile, fileId);

      expect(filePath).toContain("/uploads/");
      expect(filePath).toContain(fileId);
      expect(filePath).toContain(".pdf");

      // Verify file exists
      const fullPath = path.join(process.cwd(), "public", filePath);
      const fileExists = await fs
        .access(fullPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const storedContent = await fs.readFile(fullPath, "utf-8");
      expect(storedContent).toBe(testContent);
    });

    it("should create upload directory if it doesn't exist", async () => {
      const testContent = "Test PDF content";
      const testFile = new File([testContent], "test-resume.pdf", {
        type: "application/pdf",
      });
      const fileId = "test-" + Date.now();

      // This should not throw even if directory doesn't exist
      const filePath = await storeFile(testFile, fileId);

      expect(filePath).toBeTruthy();
    });
  });

  describe("uploadResume", () => {
    const testUploadDir = path.join(process.cwd(), "public", "uploads");

    afterEach(async () => {
      // Clean up test files
      try {
        const files = await fs.readdir(testUploadDir);
        for (const file of files) {
          await fs.unlink(path.join(testUploadDir, file));
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it("should upload a valid file and return metadata", async () => {
      const testContent = "Test PDF content";
      const testFile = new File([testContent], "resume.pdf", {
        type: "application/pdf",
      });

      const result = await uploadResume(testFile);

      expect(result.fileId).toBeTruthy();
      expect(result.fileName).toBe("resume.pdf");
      expect(result.filePath).toContain("/uploads/");
      expect(result.fileSize).toBe(testContent.length);
      expect(result.uploadedAt).toBeInstanceOf(Date);
    });

    it("should reject invalid file", async () => {
      const invalidFile = new File(["content"], "document.txt", {
        type: "text/plain",
      });

      await expect(uploadResume(invalidFile)).rejects.toThrow();
    });
  });
});
