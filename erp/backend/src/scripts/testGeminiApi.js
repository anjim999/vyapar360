// Test script to validate Gemini API key
// Run: node src/scripts/testGeminiApi.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("🔍 Gemini API Key Test Script");
console.log("═".repeat(50));

if (!GEMINI_API_KEY) {
    console.log("❌ ERROR: GEMINI_API_KEY is not set in .env file");
    process.exit(1);
}

console.log(`✅ API Key found: ${GEMINI_API_KEY.slice(0, 10)}...${GEMINI_API_KEY.slice(-4)}`);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testModel(modelName) {
    console.log(`\n📡 Testing model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hello, Vyapar360!' in exactly 3 words.");
        const response = result.response.text();
        console.log(`   ✅ SUCCESS! Response: "${response.trim()}"`);
        return true;
    } catch (error) {
        if (error.status === 429) {
            console.log(`   ⚠️  QUOTA EXCEEDED (429): Free tier limit reached`);
            console.log(`   📅 Reset Time: Midnight Pacific Time (~1:30 PM IST)`);

            // Extract retry delay if available
            if (error.errorDetails) {
                const retryInfo = error.errorDetails.find(d => d['@type']?.includes('RetryInfo'));
                if (retryInfo?.retryDelay) {
                    console.log(`   ⏱️  Retry in: ${retryInfo.retryDelay}`);
                }
            }
        } else if (error.status === 404) {
            console.log(`   ❌ MODEL NOT FOUND (404): ${modelName} is not available`);
        } else if (error.status === 400) {
            console.log(`   ❌ INVALID API KEY (400): Check your API key`);
        } else if (error.status === 403) {
            console.log(`   ❌ FORBIDDEN (403): API key doesn't have access to this model`);
        } else {
            console.log(`   ❌ ERROR (${error.status || 'unknown'}): ${error.message}`);
        }
        return false;
    }
}

async function runTests() {
    const models = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
    ];

    console.log("\n🧪 Testing Gemini Models...");

    let anySuccess = false;
    for (const model of models) {
        const success = await testModel(model);
        if (success) anySuccess = true;
    }

    console.log("\n" + "═".repeat(50));
    if (anySuccess) {
        console.log("🎉 API Key is VALID and working!");
    } else {
        console.log("⚠️  All tests failed - likely due to quota limits");
        console.log("💡 Wait for quota reset (~1:30 PM IST) and try again");
    }
    console.log("═".repeat(50));
}

runTests().catch(console.error);
