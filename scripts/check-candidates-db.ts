/**
 * 检查数据库中的候选人数据
 */

import { db } from "../db";
import { candidates } from "../db/schema";

async function checkCandidates() {
  try {
    console.log("📊 Checking candidates in database...\n");
    
    const allCandidates = await db.select().from(candidates);
    
    console.log(`Total candidates: ${allCandidates.length}\n`);
    
    if (allCandidates.length > 0) {
      console.log("Candidates:");
      allCandidates.forEach((candidate, index) => {
        console.log(`${index + 1}. ID: ${candidate.id}`);
        console.log(`   Name: ${candidate.name}`);
        console.log(`   Email: ${candidate.email}`);
        console.log(`   Status: ${candidate.status}`);
        console.log(`   Created: ${candidate.createdAt}\n`);
      });
    } else {
      console.log("⚠️  No candidates found in database.");
      console.log("💡 You can upload a resume first to test the candidate detail API.");
    }
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

checkCandidates();
