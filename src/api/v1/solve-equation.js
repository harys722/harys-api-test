addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const expression = url.searchParams.get('equation')
  
  if (!expression) {
    return new Response('No equation provided', { status: 400 })
  }
  
  try {
    const tokens = tokenize(expression)
    const ast = parseExpression(tokens)
    const result = evaluateNode(ast)
    return new Response(result.toString())
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 400 })
  }
}

// Tokenizer function
function tokenize(str) {
  const tokens = []
  let numberBuffer = ''
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (/\d/.test(char) || char === '.') {
      numberBuffer += char
    } else {
      if (numberBuffer) {
        tokens.push({ type: 'number', value: parseFloat(numberBuffer) })
        numberBuffer = ''
      }
      if ('+-*/()'.includes(char)) {
        tokens.push({ type: 'operator', value: char })
      } else if (/\s/.test(char)) {
        // skip whitespace
        continue
      } else {
        throw new Error(`Invalid character: ${char}`)
      }
    }
  }
  if (numberBuffer) {
    tokens.push({ type: 'number', value: parseFloat(numberBuffer) })
  }
  return tokens
}

// Recursive descent parser
function parseExpression(tokens) {
  let position = 0

  function peek() {
    return tokens[position] || null
  }

  function consume(type, value = null) {
    const token = tokens[position]
    if (!token || token.type !== type || (value !== null && token.value !== value)) {
      throw new Error(`Unexpected token: ${token ? token.value : 'EOF'}`)
    }
    position++
    return token
  }

  // Parse factor
  function parseFactor() {
    const token = peek()
    if (!token) throw new Error('Unexpected end of input')

    if (token.type === 'operator' && token.value === '-') {
      consume('operator', '-')
      const factor = parseFactor()
      return { type: 'binary', operator: '-', left: { type: 'number', value: 0 }, right: factor }
    }

    if (token.type === 'number') {
      consume('number')
      return { type: 'number', value: token.value }
    }

    if (token.type === 'operator' && token.value === '(') {
      consume('operator', '(')
      const expr = parseExpressionRecursive()
      if (peek() && peek().type === 'operator' && peek().value === ')') {
        consume('operator', ')')
        return expr
      } else {
        throw new Error('Expected closing parenthesis')
      }
    }

    throw new Error(`Unexpected token: ${token.value}`)
  }

  // Parse term (multiplication/division)
  function parseTerm() {
    let node = parseFactor()

    while (true) {
      const token = peek()
      if (token && token.type === 'operator' && (token.value === '*' || token.value === '/')) {
        consume('operator')
        const right = parseFactor()
        node = { type: 'binary', operator: token.value, left: node, right: right }
      } else {
        break
      }
    }
    return node
  }

  // Parse expression (addition/subtraction)
  function parseExpressionRecursive() {
    let node = parseTerm()

    while (true) {
      const token = peek()
      if (token && token.type === 'operator' && (token.value === '+' || token.value === '-')) {
        consume('operator')
        const right = parseTerm()
        node = { type: 'binary', operator: token.value, left: node, right: right }
      } else {
        break
      }
    }
    return node
  }

  return parseExpressionRecursive()
}

// Evaluate the AST
function evaluateNode(node) {
  if (node.type === 'number') {
    return node.value
  } else if (node.type === 'binary') {
    const leftVal = evaluateNode(node.left)
    const rightVal = evaluateNode(node.right)
    switch (node.operator) {
      case '+': return leftVal + rightVal
      case '-': return leftVal - rightVal
      case '*': return leftVal * rightVal
      case '/': 
        if (rightVal === 0) throw new Error('Division by zero')
        return leftVal / rightVal
      default: throw new Error('Unknown operator')
    }
  } else {
    throw new Error('Invalid node type')
  }
}
