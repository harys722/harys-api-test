import questions from '../../data/questions';
import { checkApiKey } from '../../data/auth';

export default function handler(request, response) {
  // Check API key first
  if (!checkApiKey(request, response)) {
    return;
  }

  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Only allow GET
  if (request.method !== 'GET') {
    return response.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  // Main logic
  try {
    console.log('Questions:', questions);
    if (!Array.isArray(questions)) {
      throw new Error('Questions is not an array');
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];

    response.status(200).json({
      question: randomQuestion,
      id: randomIndex + 1,
      total_questions: questions.length,
      info: {
        credits: "Made by harys722, only available for cool people!",
        website: "https://harys.is-a.dev/"
      }
    });
  } catch (error) {
    console.error('Error generating question:', error);
    response.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to generate random question'
    });
  }
}
