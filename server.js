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
  try {
    const { url, question } = req.body;

    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    let text = $('body').text();

    text = text.substring(0, 5000);

    if (text.toLowerCase().includes(question.toLowerCase())) {
      res.json({
        answer: 'This information seems to be available on the website.',
      });
    } else {
      res.json({
        answer: 'This information is not available on this website.',
      });
    }
  } catch (error) {
    res.json({
      answer: 'Error fetching website. Please check the URL.',
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
