function evaluateExpression(expr) {
  expr = expr.replace(/\s+/g, '');

  if (!/^[0-9+\-*/().^a-zA-Z]+$/.test(expr)) {
    throw new Error('Invalid characters in expression');
  }

  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  const result = evaluateRPN(rpn);
  return result;
}

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const char = expr[i];

    if (/\d/.test(char) || (char === '.' && /\d/.test(expr[i + 1]))) {
      let numStr = char;
      i++;
      while (i < expr.length && (/[\d.]/.test(expr[i]))) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
    } else if (/[+\-*/^()]/.test(char)) {
      tokens.push({ type: 'operator', value: char });
      i++;
    } else if (/[a-zA-Z]/.test(char)) {
      let funcName = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        funcName += expr[i];
        i++;
      }
      tokens.push({ type: 'func', value: funcName });
    } else {
      throw new Error(`Unexpected character: ${char}`);
    }
  }
  return tokens;
}

function toRPN(tokens) {
  const output = [];
  const operators = [];
  const precedence = {
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    '^': 4,
  };
  const rightAssociative = { '^': true };

  for (let token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'func') {
      operators.push(token);
    } else if (token.type === 'operator') {
      if (token.value === '(') {
        operators.push(token);
      } else if (token.value === ')') {
        while (
          operators.length &&
          operators[operators.length - 1].value !== '('
        ) {
          output.push(operators.pop());
        }
        if (
          !operators.length ||
          operators[operators.length - 1].value !== '('
        ) {
          throw new Error('Mismatched parentheses');
        }
        operators.pop(); // Remove '('
        // If function on top, pop it
        if (
          operators.length &&
          operators[operators.length - 1].type === 'func'
        ) {
          output.push(operators.pop());
        }
      } else {
        while (
          operators.length &&
          ((precedence[operators[operators.length - 1].value] || 0) >
            precedence[token.value] ||
            (precedence[operators[operators.length - 1].value] ===
              precedence[token.value] &&
              !rightAssociative[token.value])) &&
          operators[operators.length - 1].value !== '('
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      }
    }
  }

  while (operators.length) {
    const op = operators.pop();
    if (op.value === '(' || op.value === ')') {
      throw new Error('Mismatched parentheses');
    }
    output.push(op);
  }

  return output;
}

function evaluateRPN(rpn) {
  const stack = [];
  const functions = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log,
    sqrt: Math.sqrt,
    abs: Math.abs,
  };

  for (let token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'operator') {
      if (stack.length < 2) throw new Error('Invalid expression');
      const b = stack.pop();
      const a = stack.pop();
      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(a / b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unknown operator: ${token.value}`);
      }
    } else if (token.type === 'func') {
      if (stack.length < 1) throw new Error('Invalid function call');
      const arg = stack.pop();
      const func = functions[token.value.toLowerCase()];
      if (!func) throw new Error(`Unknown function: ${token.value}`);
      stack.push(func(arg));
    }
  }

  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}
