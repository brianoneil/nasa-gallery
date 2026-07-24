const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

app.use(express.static('public'));

// Proxy NASA API calls to keep key server-side
app.get('/api/apod/today', async (req, res) => {
  try {
    const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&thumbs=true`);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/apod/gallery', async (req, res) => {
  try {
    const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&count=30&thumbs=true`);
    const data = await r.json();
    // Filter to images only, most recent first
    const images = data.filter(d => d.media_type === 'image');
    res.json(images);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/epic', async (req, res) => {
  try {
    const r = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_KEY}`);
    const data = await r.json();
    // Build image URLs and return first 12
    const images = data.slice(0, 12).map(item => {
      const date = item.date.split(' ')[0].replace(/-/g, '/');
      return {
        id: item.identifier,
        image: item.image,
        date: item.date,
        caption: item.caption,
        url: `https://epic.gsfc.nasa.gov/archive/natural/${date}/png/${item.image}.png`,
        thumb: `https://epic.gsfc.nasa.gov/archive/natural/${date}/thumbs/${item.image}.jpg`,
        coords: item.centroid_coordinates
      };
    });
    res.json(images);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`NASA Gallery running on port ${PORT}`));
