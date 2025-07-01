export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get URL from query parameter
    const { url } = req.query;

    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL parameter',
        usage: 'Add ?url=https://example.com to your request'
      });
    }

    // Validate URL format
    let targetUrl;
    try {
      // Add https:// if no protocol specified
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        targetUrl = 'https://' + url;
      } else {
        targetUrl = url;
      }
      new URL(targetUrl); // This will throw if URL is invalid
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format',
        provided: url,
        example: 'https://example.com'
      });
    }

    // Use a screenshot service API
    // We'll use htmlcsstoimage.com's free API (no auth required for basic usage)
    const screenshotApiUrl = `https://htmlcsstoimage.com/demo_run`;
    
    const payload = {
      html: `<script>window.location.href = "${targetUrl}";</script>`,
      css: "",
      google_fonts: "",
      selector: "",
      ms_delay: 1500,
      device_scale: 1,
      viewport_width: 1280,
      viewport_height: 720
    };

    const screenshotResponse = await fetch(screenshotApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!screenshotResponse.ok) {
      // Fallback to a simpler approach using a different service
      const fallbackUrl = `https://mini.s-shot.ru/1280x720/PNG/1024/Z100/?${encodeURIComponent(targetUrl)}`;
      
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (fallbackResponse.ok) {
        const imageBuffer = await fallbackResponse.arrayBuffer();
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        return res.send(Buffer.from(imageBuffer));
      } else {
        return res.status(500).json({
          error: 'Screenshot service unavailable',
          message: 'Unable to generate screenshot at this time'
        });
      }
    }

    const result = await screenshotResponse.json();
    
    if (result.url) {
      // Fetch the actual image
      const imageResponse = await fetch(result.url);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      return res.send(Buffer.from(imageBuffer));
    } else {
      return res.status(500).json({
        error: 'Failed to generate screenshot',
        message: 'Screenshot service returned unexpected response'
      });
    }

  } catch (error) {
    console.error('Screenshot API Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process screenshot request'
    });
  }
}
