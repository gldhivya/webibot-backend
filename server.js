const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("WebiBot Backend Running 🚀");
});

// MAIN API
app.post("/analyze", async (req, res) => {
  const { url, question } = req.body;

  try {
    // 1️⃣ Fetch website
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let text = $("body").text().replace(/\s+/g, " ").trim();
    text = text.substring(0, 3000);

    // 2️⃣ Gemini API call (FINAL CORRECT)
    const geminiResponse = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Answer ONLY using this website content. If not found, say: "This information is not available on this website."\n\nContent: ${text}\n\nQuestion: ${question}`
              }
            ]
          }
        ]
      }
    );

    // 3️⃣ Safe response
    const answer =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "This information is not available on this website.";

    res.json({ answer });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.json({
      answer: "Error fetching website or processing request.",
    });
  }
});

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
