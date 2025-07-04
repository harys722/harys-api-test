export default function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { handler } = req.query; // array of path segments
  
  // define valid API routes
  const validRoutes = ['ALL', 'API'];
  
  if (handler && validRoutes.includes(handler[0])) {
    // process valid route
    res.json({ message: `Processing ${handler[0]}` });
  } else {
    // return error for invalid route
    res.status(400).json({
      success: "false",
      error: "The requested resource does not exist",
      message: "Make sure you are sending a request to a valid endpoint or web-page",
      info: {
        credits: "Made by harys722, available only for cool people.",
        support: "https://harys.is-a.dev/api"
      }
    });
  }
}
