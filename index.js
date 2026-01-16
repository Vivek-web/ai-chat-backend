import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/test-models", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    console.log("📩 Received message:", userMessage);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

app.listen(PORT, () => {
  console.log(`✅ AI backend running on port ${PORT}`);
});

