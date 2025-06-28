export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: "Method Not Allowed. Only GET requests are accepted." });
    return;
  }

  const equation = req.query.equation;

  if (!equation || typeof equation !== 'string') {
    res.status(400).json({ error: "Missing or invalid 'equation' parameter." });
    return;
  }

  try {
    const result = evaluateExpression(equation);
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Result is not a number');
    }
    res.json({ equation, result });
  } catch (error) {
    res.status(400).json({ error: "Invalid equation or error during evaluation." });
  }
}

// Recursive descent parser for arithmetic expressions
function evaluateExpression(expr) {
  // Remove whitespace for cleaner parsing
  expr = expr.replace(/\s+/g,'+');

  // Tokenize
  const tokens = tokenize(expr);
  let current = 0;

  function tokenize(str) {
    const tokens = [];
    let numberBuffer = '';

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];

      if (/\d/.test(ch) || ch === '.') {
        numberBuffer += ch;
      } else {
        if (numberBuffer) {
          tokens.push({ type: 'number', value: parseFloat(numberBuffer) });
          numberBuffer = '';
        }

        if ('+-*/()'.includes(ch)) {
          tokens.push({ type: 'operator', value: ch });
        } else {
          throw new Error('Invalid character: ' + ch);
        }
      }
    }
    if (numberBuffer) {
      tokens.push({ type: 'number', value: parseFloat(numberBuffer) });
    }
    return tokens;
  }

  function peek() {
    return tokens[current] || null;
  }

  function consume(type, value = null) {
    const token = tokens[current];
    if (!token || token.type !== type || (value !== null && token.value !== value)) {
      throw new Error('Unexpected token');
    }
    current++;
    return token;
  }

  // Parse expression with correct precedence: expression -> term -> factor
  function parseExpression() {
    let node = parseTerm();
    while (peek() && peek().type === 'operator' && (peek().value === '+' || peek().value === '-')) {
      const op = consume('operator').value;
      const right = parseTerm();
      node = { type: 'binary', operator: op, left: node, right: right };
    }
    return node;
  }

  function parseTerm() {
    let node = parseFactor();
    while (peek() && peek().type === 'operator' && (peek().value === '*' || peek().value === '/')) {
      const op = consume('operator').value;
      const right = parseFactor();
      node = { type: 'binary', operator: op, left: node, right: right };
    }
    return node;
  }

  function parseFactor() {
    const token = peek();

    if (token.type === 'operator' && token.value === '(') {
      consume('operator', '(');
      const node = parseExpression();
      consume('operator', ')');
      return node;
    } else if (token.type === 'number') {
      consume('number');
      return { type: 'number', value: token.value };
    } else {
      throw new Error('Invalid syntax');
    }
  }

  function evaluateNode(node) {
    if (node.type === 'number') {
      return node.value;
    } else if (node.type === 'binary') {
      const leftVal = evaluateNode(node.left);
      const rightVal = evaluateNode(node.right);
      switch (node.operator) {
        case '+': return leftVal + rightVal;
        case '-': return leftVal - rightVal;
        case '*': return leftVal * rightVal;
        case '/': return leftVal / rightVal;
        default: throw new Error('Unknown operator');
      }
    }
  }

  const ast = parseExpression();
  return evaluateNode(ast);
}
