const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("WebiBot Backend Running 🚀");
});

// CHECK AVAILABLE GEMINI MODELS
app.get("/models", async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    res.json(error.response?.data || error.message);
  }
});

// ANALYZE API
app.post("/analyze", async (req, res) => {
  const { url, question } = req.body;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let text = $("body").text().replace(/\s+/g, " ").trim();
    text = text.substring(0, 3000);

    res.json({
      answer:
        "Model test mode enabled. First open /models and send me the result.",
    });
  } catch (error) {
    console.error(error);
    res.json({
      answer: "Error fetching website.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
