const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('WebiBot Backend Running 🚀');
});

app.post('/analyze', async (req, res) => {
  const { url, question } = req.body;

  try {
    const axios = require('axios');
    const cheerio = require('cheerio');

    // Fetch website
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let text = $('body').text().replace(/\s+/g, ' ').trim();
    text = text.substring(0, 3000);

    // Call AI
    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "Answer ONLY using the provided website content. If answer not found, say: 'This information is not available on this website.'",
          },
          {
            role: 'user',
            content: `Website Content: ${text}\n\nQuestion: ${question}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const answer = aiResponse.data.choices[0].message.content;

    res.json({ answer });
  } catch (error) {
    res.json({
      answer: 'Error fetching website or processing request.',
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
