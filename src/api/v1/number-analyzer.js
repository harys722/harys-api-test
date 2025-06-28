// Utility functions
const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isFibonacci = (num) => {
  // A number is Fibonacci if one of (5*n^2 + 4) or (5*n^2 - 4) is a perfect square
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

  const { number } = req.query;

  if (typeof number !== 'number') {
    res.status(400).send("Please provide a 'number' in the url parameters.");
    return;
  }

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
  const formatted1 = number.toLocaleString('en-US'); // 300,000
  const formatted2 = number.toLocaleString('de-DE'); // 300.000
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
    formatted1,
    formatted2,
    abbreviated: abbrev,
    integer: number,
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
    absoluteValue: absoluteValue
  });
}
