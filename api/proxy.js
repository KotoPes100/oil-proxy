const axios = require('axios');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL required');

  try {
    const response = await axios.get(targetUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      },
      responseType: 'text'
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
    res.status(500).send('Error: ' + err.message);
  }
};
