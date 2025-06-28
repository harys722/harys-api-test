export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method Not Allowed. Only GET requests are accepted." });
  }

  const equation = req.query.equation;

  if (!equation || typeof equation !== 'string') {
    return res.status(400).json({ error: "Missing or invalid 'equation' parameter." });
  }

  // Input validation: limit length and allowed characters
  if (equation.length > 100) {
    return res.status(400).json({ error: "Equation is too long. Maximum length is 100 characters." });
  }
  if (!/^[0-9+\-*/().\s]+$/.test(equation)) {
    return res.status(400).json({ error: "Equation contains invalid characters." });
  }

  try {
    const result = evaluateExpression(equation);
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error('Result is not a valid number');
    }
    res.status(200).json({ equation, result });
  } catch (error) {
    res.status(400).json({ error: error.message || "Invalid equation or error during evaluation." });
  }
}

// Recursive descent parser for arithmetic expressions
function evaluateExpression(expr) {
  // Remove all whitespace
  expr = expr.replace(/\s+/g, '+');

  if (!expr) {
    throw new Error('Empty equation');
  }

  // Tokenize
  const tokens = tokenize(expr);
  let current = 0;

  function tokenize(str) {
    const tokens = [];
    let numberBuffer = '';
    let i = 0;

    while (i < str.length) {
      const ch = str[i];

      if (/\d|\./.test(ch)) {
        numberBuffer += ch;
      } else if (ch === '-' && (i === 0 || '+-*/('.includes(str[i - 1]))) {
        // Handle unary minus
        numberBuffer += ch;
      } else {
        if (numberBuffer) {
          const num = parseFloat(numberBuffer);
          if (isNaN(num)) {
            throw new Error(`Invalid number format at position ${i - numberBuffer.length}`);
          }
          tokens.push({ type: 'number', value: num });
          numberBuffer = '';
        }

        if ('+-*/()'.includes(ch)) {
          tokens.push({ type: 'operator', value: ch });
        } else if (ch !== ' ') {
          throw new Error(`Invalid character at position ${i}: ${ch}`);
        }
      }
      i++;
    }

    if (numberBuffer) {
      const num = parseFloat(numberBuffer);
      if (isNaN(num)) {
        throw new Error(`Invalid number format at end of expression`);
      }
      tokens.push({ type: 'number', value: num });
    }

    return tokens;
  }

  function peek() {
    return tokens[current] || null;
  }

  function consume(type, value = null) {
    const token = peek();
    if (!token || token.type !== type || (value !== null && token.value !== value)) {
      throw new Error(`Unexpected token at position ${current}: expected ${value || type}, got ${token ? token.value : 'EOF'}`);
    }
    current++;
    return token;
  }

  // Parse expression: handles + and -
  function parseExpression() {
    let node = parseTerm();
    while (peek() && peek().type === 'operator' && ['+', '-'].includes(peek().value)) {
      const op = consume('operator').value;
      const right = parseTerm();
      node = { type: 'binary', operator: op, left: node, right };
    }
    return node;
  }

  // Parse term: handles * and /
  function parseTerm() {
    let node = parseFactor();
    while (peek() && peek().type === 'operator' && ['*', '/'].includes(peek().value)) {
      const op = consume('operator').value;
      const right = parseFactor();
      node = { type: 'binary', operator: op, left: node, right };
    }
    return node;
  }

  // Parse factor: handles numbers and parentheses
  function parseFactor(depth = 0) {
    if (depth > 50) {
      throw new Error('Expression too complex: maximum nesting depth exceeded');
    }

    const token = peek();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'operator' && token.value === '(') {
      consume('operator', '(');
      const node = parseExpression();
      consume('operator', ')');
      return node;
    } else if (token.type === 'number') {
      return consume('number');
    } else {
      throw new Error(`Invalid syntax at position ${current}: expected number or '(', got ${token.value}`);
    }
  }

  // Evaluate the AST
  function evaluateNode(node, depth = 0) {
    if (depth > 50) {
      throw new Error('Evaluation too complex: maximum recursion depth exceeded');
    }

    if (node.type === 'number') {
      return node.value;
    } else if (node.type === 'binary') {
      const leftVal = evaluateNode(node.left, depth + 1);
      const rightVal = evaluateNode(node.right, depth + 1);

      if (typeof leftVal !== 'number' || typeof rightVal !== 'number') {
        throw new Error('Invalid operand types');
      }

      switch (node.operator) {
        case '+': return leftVal + rightVal;
        case '-': return leftVal - rightVal;
        case '*': return leftVal * rightVal;
        case '/':
          if (rightVal === 0) {
            throw new Error('Division by zero');
          }
          return leftVal / rightVal;
        default:
          throw new Error(`Unknown operator: ${node.operator}`);
      }
    }
  }

  // Debug: Log tokens for verification
  console.log('Tokens:', tokens);

  // Parse and evaluate
  const ast = parseExpression();

  // Ensure all tokens are consumed
  if (peek()) {
    throw new Error(`Unexpected token after expression: ${peek().value}`);
  }

  const result = evaluateNode(ast);
  console.log('AST:', ast, 'Result:', result);

  return result;
}
