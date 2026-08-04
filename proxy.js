const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.raw({ type: '*/*', limit: '10mb' }));

app.all('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url parameter');
  }
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      data: req.method === 'POST' ? req.body : undefined,
      responseType: 'text',
      validateStatus: () => true,
    });
    let html = response.data;
    const origin = new URL(targetUrl).origin;
    html = html.replace(/(src|href|action|data)="\//g, `$1="${origin}/`);
    html = html.replace(/(src|href|action|data)="(?!http|data:|\/\/)/g, `$1="${origin}/`);
    if (!html.includes('<base')) {
      html = html.replace('<head>', `<head><base href="${origin}/">`);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send('Proxy error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
