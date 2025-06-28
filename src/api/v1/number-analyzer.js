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
    return { error: "Invalid input: Please provide a valid number." }; // Crucial error handling
  }

  const results = {
    originalNumber: num,
    isPrime: isPrime(num),
    isPerfectSquare: isPerfectSquare(num),
    isArmstrong: isArmstrong(num),
    isPalindrome: isPalindrome(num),
  };

  return results;
};


// Example usage (assuming you have a way to get the URL parameter)
function handleRequest(req) {
  let num;

  try {
    // Attempt to get the number from the URL parameters (replace with your actual URL parameter extraction)
    const urlParams = new URLSearchParams(req); // or similar way to get url parameters
    num = parseInt(urlParams.get('number'), 10);

    if (isNaN(num)) {
      // If no number is provided, generate a random one
      num = Math.floor(Math.random() * 100) + 1; // Generates a random number between 1 and 100
    }
    
  } catch (error) {
      return { error: "Invalid URL parameters or unexpected error: " + error.message };
  }

  try {
    const analysis = analyzeNumber(num);
    if(analysis.error){
        return analysis;
    }
    return analysis;
  } catch (error) {
    return { error: "An error occurred during analysis: " + error.message };
  }
}

// Example usage (replace with your actual request handling)
const requestData = {
  url: "?number=121", // Example URL with parameter
};

const response = handleRequest(requestData);

console.log(JSON.stringify(response, null, 2));
