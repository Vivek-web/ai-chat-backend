import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

console.log("🚀 Server starting...");
console.log("Node version:", process.version);
console.log("Environment:", process.env.NODE_ENV || "development");

dotenv.config();

console.log("✅ Environment loaded");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY missing - API calls will fail");
} else {
  console.log("✅ GEMINI_API_KEY found");
}


const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AI Backend is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.get("/test-models", async (req, res) => {
//   try {
//     const { data } = await axios.get(
//       `https://generativelanguage.googleapis.com/v1beta/models`,
//       {
//         params: { key: process.env.GEMINI_API_KEY }
//       }
//     );
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    console.log("📩 Received message:", userMessage);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const aiText = response.text();

    console.log("✅ AI response:", aiText.substring(0, 100));
    res.json({ answer: aiText });
  }catch (error) {
  console.error("🔥 Gemini error:", error.message);
  console.error("Full error:", error);

  res.status(500).json({
    error: "AI error",
    details: error.message
  });
}

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ AI backend running on port ${PORT}`);
  console.log(`🌐 Server ready to accept connections`);
}).on('error', (err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

