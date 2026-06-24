import { z } from "zod";

// Zod schema for validating candidate status
const candidateStatusSchema = z.object({
  status: z.enum(["待筛选", "初筛通过", "面试中", "已录用", "已淘汰"], {
    errorMap: () => ({ message: "Invalid status value. Must be one of: 待筛选, 初筛通过, 面试中, 已录用, 已淘汰" }),
  }),
});

console.log("Testing Zod validation for candidate status...\n");

// Test valid status
console.log("Test 1: Valid status '待筛选'");
const validResult = candidateStatusSchema.safeParse({ status: "待筛选" });
console.log("Success:", validResult.success);
if (validResult.success) {
  console.log("Data:", validResult.data);
} else {
  console.log("Errors:", validResult.error.errors);
}

console.log("\n---\n");

// Test invalid status
console.log("Test 2: Invalid status '无效状态'");
const invalidResult = candidateStatusSchema.safeParse({ status: "无效状态" });
console.log("Success:", invalidResult.success);
if (!invalidResult.success) {
  console.log("Errors:", invalidResult.error.errors);
}

console.log("\n---\n");

// Test missing status
console.log("Test 3: Missing status");
const missingResult = candidateStatusSchema.safeParse({});
console.log("Success:", missingResult.success);
if (!missingResult.success) {
  console.log("Errors:", missingResult.error.errors);
}
