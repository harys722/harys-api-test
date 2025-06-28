// Utility functions
const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isPerfectSquare = (num) => {
  const sqrtNum = Math.sqrt(num);
  return Number.isInteger(sqrtNum);
};

const isArmstrong = (num) => {
  const numStr = String(num);
  const numDigits = numStr.length;
  let sum = 0;
  for (let digit of numStr) {
    sum += Math.pow(parseInt(digit), numDigits);
  }
  return sum === num;
};

const isPalindrome = (num) => {
  const numStr = String(num);
  return numStr === numStr.split("").reverse().join("");
};


const analyzeNumber = (num) => {
  if (typeof num !== 'number' || !Number.isFinite(num)) {
    return { error: "Invalid input. Please provide a valid number." };
  }
  const formatted1 = num.toLocaleString('en-US');
  const formatted2 = num.toLocaleString('en-GB');
  const abbreviated = num.toLocaleString('en-US', { notation: 'compact' });
  const isEven = num % 2 === 0;
  const isOdd = !isEven;
  const result = {
    formatted1,
    formatted2,
    abbreviated,
    integer: num,
    isEven,
    isOdd,
    isPrime: isPrime(num),
    isFibonacci: isFibonacci(num),
    isPerfectSquare: isPerfectSquare(num),
    isArmstrong: isArmstrong(num),
    isPalindrome: isPalindrome(num),
    isDivisibleBy3: num % 3 === 0,
    numberType: "integer",
    isGreaterThanZero: num > 0,
    isNegative: num < 0,
    absoluteValue: Math.abs(num)
  };

   if (isNaN(result.isFibonacci)) {
    result.isFibonacci = false;
  }

  return result;
};



function handleRequest(urlParams) {
    let num;
    if (urlParams && urlParams.number) {
      num = parseInt(urlParams.number);
    } else {
      num = Math.floor(Math.random() * 100000); // Generate random number
    }

    const analysisResult = analyzeNumber(num);

    if (analysisResult.error) {
      return analysisResult;
    } else {
      return analysisResult;
    }
}


const urlParams = {
  number: '300000'
};

const result = handleRequest(urlParams);
console.log(JSON.stringify(result, null, 2)); 

// Example with random number:
const randomResult = handleRequest({});
console.log(JSON.stringify(randomResult, null, 2)); 
