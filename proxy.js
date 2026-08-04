const axios = require('axios');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL required');

  try {
    const method = req.method;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    };

    const response = await axios({
      method: method,
      url: targetUrl,
      headers: headers,
      data: req.method === 'POST' ? req.body : undefined,
      responseType: 'text',
      validateStatus: () => true 
    });

    let html = response.data;
    const origin = new URL(targetUrl).origin;

    html = html.replace(/(src|href|action|data)="\//g, `$1="${origin}/`);
    html = html.replace(/(src|href|action|data)="(?!http|data:|\/\/)/g, `$1="${origin}/`);

    if (!html.includes('<base')) {
      html = html.replace('<head>', `<head><base href="${origin}/">`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    res.send(html);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};
