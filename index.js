import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
console.log("🚀 Server starting...");

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY missing");
}


const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`✅ AI backend running on port ${PORT}`);
});

