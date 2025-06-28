const express = require('express');
const app = express();
app.use(express.json());

app.get('/analyzeNumber', (req, res) => {
  const numberStr = req.query.number;

  if (!numberStr) {
    return res.status(400).json({ error: 'Missing "number" parameter.' });
  }

  const number = parseInt(numberStr);

  if (isNaN(number)) {
    return res.status(400).json({ error: '"number" parameter must be a valid integer.' });
  }

  const result = {
    formatted1: number.toLocaleString('en-US'),
    formatted2: number.toLocaleString('en-US', { useGrouping: false, minimumFractionDigits: 0 }),
    abbreviated: number.toLocaleString('en-US', { style: 'unit', unit: 'percent' }), // or similar method for abbreviation
    integer: number,
    isEven: number % 2 === 0,
    isOdd: number % 2 !== 0,
    isPrime: isPrime(number),
    isFibonacci: isFibonacci(number), // (implement isFibonacci function)
    isPerfectSquare: Number.isInteger(Math.sqrt(number)),
    isArmstrong: isArmstrong(number), // (implement isArmstrong function)
    isPalindrome: String(number) === String(number).split('').reverse().join(''),
    isDivisibleBy3: number % 3 === 0,
    numberType: 'integer',
    isGreaterThanZero: number > 0,
    isNegative: number < 0,
    absoluteValue: Math.abs(number)
  };

  res.json(result);
});
