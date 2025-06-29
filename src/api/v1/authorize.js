const API_KEYS = process.env.API_KEYS || '';
const validKeys = API_KEYS.split(',');

export default function handler(request, response) {
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    response.status(401).json({ message: 'Unauthorized: Missing Authorization header' });
    return;
  }

  const token = authHeader.trim();

  if (!validKeys.includes(token)) {
    response.status(401).json({ message: 'Unauthorized: Invalid API key' });
    return;
  }

  response.status(200).json({ message: 'Hello! You are authorized.' });
}
