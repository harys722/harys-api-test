// Example API endpoint file (e.g., api/your-endpoint.js)
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Your API logic here
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Hello from API!' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
