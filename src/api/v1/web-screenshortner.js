export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Get URL from query parameter
  const { url } = req.query;

  // Check if URL is provided
  if (!url) {
    return res.status(400).json({
      error: 'Missing URL parameter',
      usage: 'Add ?url=https://example.com',
      example: '/api/screenshot?url=google.com'
    });
  }

  // Clean the URL
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http')) {
    targetUrl = 'https://' + targetUrl;
  }

  // Redirect to screenshot service
  const screenshotServiceUrl = `https://mini.s-shot.ru/1280x720/PNG/1024/Z100/?${encodeURIComponent(targetUrl)}`;
  
  // Simply redirect to the screenshot service
  res.redirect(302, screenshotServiceUrl);
}
