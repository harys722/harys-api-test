const http = require('http');
const url = require('url');

// Safe math evaluation function
function evaluateExpression(expression) {
    try {
        // Remove whitespace and validate characters
        const cleanExpression = expression.replace(/\s/g, '');
        
        // Only allow numbers, basic operators, parentheses, and decimal points
        if (!/^[0-9+\-*/().]+$/.test(cleanExpression)) {
            throw new Error('Invalid characters in expression');
        }
        
        // Prevent potential security issues by using Function constructor
        // This is safer than eval() but still allows basic math
        const result = Function('"use strict"; return (' + cleanExpression + ')')();
        
        // Check if result is a valid number
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid calculation result');
        }
        
        return result;
    } catch (error) {
        throw new Error('Invalid mathematical expression');
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Parse URL and query parameters
    const parsedUrl = url.parse(req.url, true);
    const { equation } = parsedUrl.query;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle only GET requests
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    // Check if equation parameter exists
    if (!equation) {
        res.statusCode = 400;
        res.end(JSON.stringify({ 
            error: 'Missing equation parameter',
            usage: 'Example: /calculator?equation=2+2*3'
        }));
        return;
    }
    
    try {
        // Calculate result
        const result = evaluateExpression(equation);
        
        // Return successful response
        res.statusCode = 200;
        res.end(JSON.stringify({
            equation: equation,
            result: result,
            success: true
        }));
        
    } catch (error) {
        // Return error response
        res.statusCode = 400;
        res.end(JSON.stringify({
            error: error.message,
            equation: equation,
            success: false
        }));
    }
});
