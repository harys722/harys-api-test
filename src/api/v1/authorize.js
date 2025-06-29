// This code is designed for deployment on Vercel as a serverless function

// Access the environment variable set in GitHub secrets (via Vercel environment variables)
const API_KEYS = process.env.API_KEYS || ''; // e.g., 'key1,key2,key3'
const validKeys = API_KEYS.split(',');

export default function handler(request, response) {
  const authHeader = request.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Unauthorized: Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  if (!validKeys.includes(token)) {
    response.status(401).json({ message: 'Unauthorized: Invalid API key' });
    return;
  }

  // If API key is valid, respond with success
  response.status(200).json({ message: 'Hello! You are authorized.' });
}
