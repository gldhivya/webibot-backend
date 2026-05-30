const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('WebiBot Backend Running 🚀');
});

// Check available Gemini models
app.get('/models', async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    res.json(error.response?.data || error.message);
  }
});

// Analyze website
app.post('/analyze', async (req, res) => {
  const { url, question } = req.body;

  try {
    // Fetch website
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let text = $('body').text().replace(/\s+/g, ' ').trim();

    // Limit content sent to Gemini
    text = text.substring(0, 5000);

    const prompt = `
Answer ONLY using the website content below.

If the answer is not available, reply exactly:
"This information is not available on this website."

Website Content:
${text}

Question:
${question}
`;

    // Gemini call
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const answer =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'This information is not available on this website.';

    res.json({ answer });

  } catch (error) {
    console.error(
      'ERROR:',
      error.response?.data || error.message
    );

    res.status(500).json({
      answer: 'Error fetching website or processing request.',
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
