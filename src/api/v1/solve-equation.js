// /pages/api/calculate.js

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: "Method Not Allowed. This endpoint only uses 'GET' requests." });
    return;
  }

  const equation = req.query.equation;

  if (!equation || typeof equation !== 'string') {
    res.status(400).json({ error: "Missing or invalid 'equation' parameter." });
    return;
  }

  try {
    // Evaluate the mathematical expression
    const result = eval(equation);
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Result is not a number');
    }
    res.json({ equation, result });
  } catch (error) {
    res.status(400).json({ error: "Invalid equation or error during evaluation." });
  }
}
