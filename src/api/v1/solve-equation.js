export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { equation } = req.query;

  if (!equation) {
    return res.status(400).json({ error: "Missing equation parameter" });
  }

  if (typeof equation !== 'string' || equation.length > 200) {
    return res.status(400).json({ error: "Invalid equation format or too long" });
  }

  try {
    const result = calculate(equation);
    return res.status(200).json({ 
      equation: equation.trim(),
      result: result 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

function calculate(expression) {
  // Clean and validate input
  const cleaned = expression.replace(/\s+/g, '');
  
  if (!cleaned) {
    throw new Error('Empty expression');
  }

  // Security check - only allow safe characters
  if (!/^[0-9+\-*/().]+$/.test(cleaned)) {
    throw new Error('Invalid characters in expression');
  }

  // Convert to postfix notation and evaluate
  return evaluatePostfix(infixToPostfix(cleaned));
}

function infixToPostfix(infix) {
  const output = [];
  const operators = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  
  let i = 0;
  while (i < infix.length) {
    const char = infix[i];
    
    // Handle numbers (including decimals and negative numbers)
    if (isDigit(char) || (char === '-' && isUnaryMinus(infix, i))) {
      let number = '';
      
      // Handle negative sign
      if (char === '-') {
        number += char;
        i++;
      }
      
      // Read the number
      while (i < infix.length && (isDigit(infix[i]) || infix[i] === '.')) {
        number += infix[i];
        i++;
      }
      
      // Validate the number
      const num = parseFloat(number);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${number}`);
      }
      
      output.push(num);
      continue;
    }
    
    // Handle operators
    if (precedence[char]) {
      while (operators.length > 0 && 
             operators[operators.length - 1] !== '(' &&
             precedence[operators[operators.length - 1]] >= precedence[char]) {
        output.push(operators.pop());
      }
      operators.push(char);
    }
    // Handle left parenthesis
    else if (char === '(') {
      operators.push(char);
    }
    // Handle right parenthesis
    else if (char === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop());
      }
      if (operators.length === 0) {
        throw new Error('Mismatched parentheses');
      }
      operators.pop(); // Remove the '('
    }
    else {
      throw new Error(`Invalid character: ${char}`);
    }
    
    i++;
  }
  
  // Pop remaining operators
  while (operators.length > 0) {
    const op = operators.pop();
    if (op === '(' || op === ')') {
      throw new Error('Mismatched parentheses');
    }
    output.push(op);
  }
  
  return output;
}

function evaluatePostfix(postfix) {
  const stack = [];
  
  for (const token of postfix) {
    if (typeof token === 'number') {
      stack.push(token);
    } else {
      if (stack.length < 2) {
        throw new Error('Invalid expression structure');
      }
      
      const b = stack.pop();
      const a = stack.pop();
      
      let result;
      switch (token) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '/':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          result = a / b;
          break;
        default:
          throw new Error(`Unknown operator: ${token}`);
      }
      
      if (!isFinite(result)) {
        throw new Error('Result is not a finite number');
      }
      
      stack.push(result);
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression structure');
  }
  
  return stack[0];
}

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isUnaryMinus(expression, index) {
  // Minus is unary if it's at the start or after an operator or opening parenthesis
  return index === 0 || 
         expression[index - 1] === '(' || 
         '+-*/'.includes(expression[index - 1]);
}
