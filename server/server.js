require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

const getTimestamp = () => { //timestamp for logging
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

let requestCount = 0;
let lastReset = Date.now();

setInterval(() => { //reset request count
  requestCount = 0;
  lastReset = Date.now();
}, 60 * 1000);

const canMakeRequest = () => requestCount < 10; // 10 requests per minute

async function safeHypixelFetch(url, res) {
  if (!canMakeRequest()) {
    const error = 'Rate limit exceeded. Try again later.';
    res.status(429).json({ error });
    return { success: false, error };
  }

  try {
    requestCount++;
    const { data } = await axios.get(url);
    res.json(data);
    return { success: true };
  } catch (err) {
    const error = `Failed to fetch from Hypixel: ${err.message}`;
    res.status(500).json({ error });
    return { success: false, error };
  }
}

app.get('/api/house/:houseId', async (req, res) => { //get a house's info
  const houseId = req.params.houseId;
  const apiKey = process.env.API_KEY;
  const url = `https://api.hypixel.net/v2/housing/house?house=${houseId}&key=${apiKey}`;
  
  const result = await safeHypixelFetch(url, res);
  if (result.success) {
    console.log(`[${getTimestamp()}] Fetched house info for house ${houseId}`);
  } else {
    console.error(`[${getTimestamp()}] Failed to fetch house info for house ${houseId} - ${result.error}`);
  }
});

app.get('/api/houses/:playerId', async (req, res) => { //get a player's houses
  const playerId = req.params.playerId;
  const apiKey = process.env.API_KEY;
  const url = `https://api.hypixel.net/v2/housing/houses?player=${playerId}&key=${apiKey}`;
  
  const result = await safeHypixelFetch(url, res);
  if (result.success) {
    console.log(`[${getTimestamp()}] Fetched houses for player ${playerId}`);
  } else {
    console.error(`[${getTimestamp()}] Failed to fetch houses for player ${playerId} - ${result.error}`);
  }
});

let cachedData = null;
let lastUpdated = null;

const fetchHypixelData = async () => { //get active houses
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
setInterval(fetchHypixelData, 10000); //every 10 sec

app.get('/api/active', (req, res) => { //give cached data
  if (cachedData) {
    res.json({lastUpdated, data:cachedData});
  } else {
    res.status(503).json({ error: 'Service Unavailable' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[${getTimestamp()}] Server running at http://127.0.0.1:${PORT}`);
});