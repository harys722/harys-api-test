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

// Vercel serverless function handler
export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle only GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Get equation from query parameters and decode URL encoding
    let { equation } = req.query;
    
    // Fix URL encoding issue where + becomes space
    if (equation) {
        equation = equation.replace(/\s+/g, '+');
    }
    
    // Check if equation parameter exists
    if (!equation) {
        return res.status(400).json({ 
            error: 'Missing equation parameter',
            usage: 'Example: /v1/solve-equation?equation=2+2*3'
        });
    }
    
    try {
        // Calculate result
        const result = evaluateExpression(equation);
        
        // Return successful response
        return res.status(200).json({
            equation: equation,
            result: result,
            success: true
        });
        
    } catch (error) {
        // Return error response
        return res.status(400).json({
            error: error.message,
            equation: equation,
            success: false
        });
    }
}
