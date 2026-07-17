const axios = require('axios');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL required');

  try {
    const method = req.method || 'GET';
    
    const response = await axios({
      method: method,
      url: targetUrl,
      data: method === 'POST' ? req.body : undefined,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      responseType: 'text',
      validateStatus: () => true 
    });

    let html = response.data;

    if (typeof html === 'string') {
      const origin = new URL(targetUrl).origin;

      html = html.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
      html = html.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
      
      html = html.replace(/if\s*\(top\s*!==\s*self\)/gi, 'if(false)');
      html = html.replace(/window\.top\.location/gi, 'window.self.location');

      html = html.replace(/(src|href)=" \/\//g, '$1="https://');
      
      html = html.replace(/(src|href|action|data|srcset)="\//g, `$1="${origin}/`);
      html = html.replace(/(src|href|action|data|srcset)="(?!http|https|data:|\/\/|#)/g, `$1="${origin}/`);

      if (!html.includes('<base')) {
          html = html.replace('<head>', `<head><base href="${origin}/">`);
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(response.status).send(html);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};
