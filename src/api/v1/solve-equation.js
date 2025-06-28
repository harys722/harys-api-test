export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: "Method Not Allowed. This endpoint only accepts GET requests." });
    return;
  }

  const equation = req.query.equation;

  if (!equation || typeof equation !== 'string') {
    res.status(400).json({ error: "Missing or invalid 'equation' parameter." });
    return;
  }

  try {
    const result = safeEval(equation);
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Result is not a number');
    }
    res.json({ equation, result });
  } catch (error) {
    res.status(400).json({ error: "Invalid equation or error during evaluation." });
  }
}

// Helper function outside the handler
function safeEval(expr) {
  // Remove whitespace
  expr = expr.replace(/\s+/g, '');

  // Validate the expression: only digits, operators, parentheses
  if (!/^[0-9+\-*/().]+$/.test(expr)) {
    throw new Error('Invalid characters in expression');
  }

  // Evaluate safely using Function constructor with strict mode
  return Function(`'use strict'; return (${expr})`)();
}
