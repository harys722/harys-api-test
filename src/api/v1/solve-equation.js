function evaluateExpression(expr) {
  expr = expr.replace(/\s+/g, '');

  // Tokenize
  const tokens = tokenize(expr);
  // Convert to RPN
  const rpn = toRPN(tokens);
  // Evaluate RPN
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

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
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
      } else {
        while (
          operators.length &&
          ((precedence[operators[operators.length - 1].value] || 0) > precedence[token.value]) ||
          (
            precedence[operators[operators.length - 1].value] === precedence[token.value] &&
            !rightAssociative[token.value]
          ) &&
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
  for (const token of rpn) {
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
    } else {
      throw new Error(`Unknown token type: ${token.type}`);
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}
