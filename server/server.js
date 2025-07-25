require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

let cachedData = null;

let lastUpdated = null;

const getTimestamp = () => {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const fetchHypixelData = async () => {
  try {
    const apiKey = process.env.API_KEY;
    const response = await axios.get(`https://api.hypixel.net/v2/housing/active?key=${apiKey}`);
    cachedData = response.data;
    lastUpdated = new Date().toISOString();
    console.log(`[${getTimestamp()}] Updated active houses`);
  } catch (error) {
    console.error(`[${getTimestamp()}] Error fetching data from Hypixel: ${error.message}`);
  }
};

fetchHypixelData();
setInterval(fetchHypixelData, 10000);//every 10 sec

app.get('/api/data', (req, res) => {//give data
  if (cachedData) {
    res.json({lastUpdated, data:cachedData});
  } else {
    res.status(503).json({ error: 'Service Unavailable' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[${getTimestamp()}] Server running at http://127.0.0.1:${PORT}`);
});