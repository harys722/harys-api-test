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
  // Remove all whitespace for processing
  const cleanedExpr = expr.replace(/\s+/g, '');

  if (!cleanedExpr) {
    throw new Error('Empty equation');
  }

  // Tokenize
  const tokens = tokenize(cleanedExpr);
  let current = 0;

  function tokenize(str) {
    const tokens = [];
    let i = 0;

    while (i < str.length) {
      const ch = str[i];

      if (/\d/.test(ch)) {
        // Parse number (including decimals)
        let numberStr = '';
        let hasDecimal = false;
        
        while (i < str.length && (/\d/.test(str[i]) || (str[i] === '.' && !hasDecimal))) {
          if (str[i] === '.') {
            hasDecimal = true;
          }
          numberStr += str[i];
          i++;
        }
        
        // Don't increment i at the end of the while loop since we already did it
        i--;
        
        const num = parseFloat(numberStr);
        if (isNaN(num) || numberStr.endsWith('.')) {
          throw new Error(`Invalid number format: ${numberStr}`);
        }
        tokens.push({ type: 'number', value: num });
      } else if (ch === '-' && (i === 0 || '+-*/('.includes(str[i - 1]))) {
        // Handle unary minus - parse the negative number
        let numberStr = '-';
        let hasDecimal = false;
        i++; // Move past the minus sign
        
        if (i >= str.length || !/\d/.test(str[i])) {
          throw new Error('Invalid unary minus: no number follows');
        }
        
        while (i < str.length && (/\d/.test(str[i]) || (str[i] === '.' && !hasDecimal))) {
          if (str[i] === '.') {
            hasDecimal = true;
          }
          numberStr += str[i];
          i++;
        }
        
        i--; // Back up one since the outer loop will increment
        
        const num = parseFloat(numberStr);
        if (isNaN(num) || numberStr.endsWith('.')) {
          throw new Error(`Invalid number format: ${numberStr}`);
        }
        tokens.push({ type: 'number', value: num });
      } else if ('+-*/()'.includes(ch)) {
        tokens.push({ type: 'operator', value: ch });
      } else {
        throw new Error(`Invalid character at position ${i}: ${ch}`);
      }
      i++;
    }

    // Validate token sequence
    for (let j = 0; j < tokens.length; j++) {
      const current = tokens[j];
      const next = tokens[j + 1];
      
      // Check for consecutive numbers without operators
      if (current.type === 'number' && next && next.type === 'number') {
        throw new Error('Missing operator between numbers');
      }
      
      // Check for consecutive operators (except opening parenthesis followed by operator)
      if (current.type === 'operator' && next && next.type === 'operator') {
        if (!(current.value === '(' || next.value === ')')) {
          throw new Error(`Invalid operator sequence: ${current.value}${next.value}`);
        }
      }
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

      // Ensure we're working with numbers
      if (typeof leftVal !== 'number' || typeof rightVal !== 'number' || 
          isNaN(leftVal) || isNaN(rightVal)) {
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
    } else {
      throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  // Parse and evaluate
  const ast = parseExpression();

  // Ensure all tokens are consumed
  if (peek()) {
    throw new Error(`Unexpected token after expression: ${peek().value}`);
  }

  return evaluateNode(ast);
}
