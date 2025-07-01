export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        usage: 'Add ?url=https://example.com to your request',
        example: '/api/screenshot?url=google.com'
      });
    }

    // Clean and validate URL
    let targetUrl = url.trim();
    
    // Add https:// if no protocol specified
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Basic URL validation
    try {
      new URL(targetUrl);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format',
        provided: url,
        example: 'google.com or https://google.com'
      });
    }

    // Use a simple and reliable screenshot service
    const screenshotUrl = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(targetUrl)}&dimension=1280x720&format=png&cacheLimit=0`;

    // Fetch the screenshot
    const response = await fetch(screenshotUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Screenshot service error',
        status: response.status,
        message: 'Failed to generate screenshot'
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
    res.setHeader('Content-Length', imageBuffer.byteLength);
    
    return res.send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Screenshot API Error:', error.message);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process screenshot request',
      details: error.message
    });
  }
}
