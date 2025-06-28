// Utility functions (unchanged, included for completeness)
const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isFibonacci = (num) => {
  const test1 = 5 * num * num + 4;
  const test2 = 5 * num * num - 4;
  return isPerfectSquare(test1) || isPerfectSquare(test2);
};

const isPerfectSquare = (num) => {
  const sqrt = Math.sqrt(num);
  return sqrt === Math.floor(sqrt);
};

const isArmstrong = (num) => {
  const strNum = num.toString();
  const numDigits = strNum.length;
  let sum = 0;
  for (let digit of strNum) {
    sum += Math.pow(parseInt(digit), numDigits);
  }
  return sum === num;
};

const isPalindrome = (num) => {
  const str = num.toString();
  return str === str.split('').reverse().join('');
};

// Main handler
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send("Method Not Allowed, this endpoint only uses 'GET' requests.");
    return;
  }

  const query = req.query;
  let number;

  // Check if user provided a specific number
  if (query.number !== undefined) {
    // Parse the number
    number = parseFloat(query.number);
    if (isNaN(number)) {
      res.status(400).send("Invalid 'number' parameter.");
      return;
    }
  } else {
    // No specific number provided, generate one
    const minParam = query.min !== undefined ? parseFloat(query.min) : undefined;
    const maxParam = query.max !== undefined ? parseFloat(query.max) : undefined;

    // Determine range
    let minRange, maxRange;

    if (minParam !== undefined && maxParam !== undefined) {
      minRange = minParam;
      maxRange = maxParam;
    } else if (minParam !== undefined && maxParam === undefined) {
      minRange = minParam;
      maxRange = 10000; // default upper bound
    } else if (minParam === undefined && maxParam !== undefined) {
      minRange = 1; // default lower bound
      maxRange = maxParam;
    } else {
      // Neither min nor max provided, default to 1-10,000
      minRange = 1;
      maxRange = 10000;
    }

    // Generate random number within range
    number = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
  }

  // Proceed with analysis
  const absoluteValue = Math.abs(number);
  const isNegative = number < 0;
  const isGreaterThanZero = number > 0;
  const isEven = number % 2 === 0;
  const isOdd = !isEven;
  const isPrimeNum = isPrime(number);
  const isFib = isFibonacci(number);
  const isSquare = isPerfectSquare(number);
  const isArm = isArmstrong(number);
  const isPalin = isPalindrome(number);
  const isDiv3 = number % 3 === 0;

  // Formatting
  const formatted1 = number.toLocaleString('en-US');
  const formatted2 = number.toLocaleString('de-DE');
  const abbrev = (() => {
    if (Math.abs(number) >= 1_000_000_000) {
      return (number / 1_000_000_000).toFixed(1) + 'B';
    } else if (Math.abs(number) >= 1_000_000) {
      return (number / 1_000_000).toFixed(1) + 'M';
    } else if (Math.abs(number) >= 1_000) {
      return (number / 1_000).toFixed(1) + 'K';
    }
    return number.toString();
  })();

  res.json({
    number,
    formatted1,
    formatted2,
    abbreviated: abbrev,
    isEven,
    isOdd,
    isPrime: isPrimeNum,
    isFibonacci: isFib,
    isPerfectSquare: isSquare,
    isArmstrong: isArm,
    isPalindrome: isPalin,
    isDivisibleBy3: isDiv3,
    numberType: Number.isInteger(number) ? 'integer' : 'float',
    isGreaterThanZero,
    isNegative,
    absoluteValue
  });
}
