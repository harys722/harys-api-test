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
  return Number.isInteger(Math.sqrt(test1)) || Number.isInteger(Math.sqrt(test2));
};

function getEndpoint(req) {
  const numberParam = req.url.split('?')[1];
  const queryParams = new URLSearchParams(numberParam || "");

  // Extract values, handling potential errors gracefully
  const num = queryParams.get('number');
  const min = parseInt(queryParams.get('min'));
  const max = parseInt(queryParams.get('max'));

  // If 'number' is provided, prioritize it.
  if (num) {
    const parsedNumber = parseInt(num);
    if (isNaN(parsedNumber)) {
      return { error: "Invalid number in URL parameter." };
    }
    return {
      number: parsedNumber,
      isPrime: isPrime(parsedNumber),
      isFibonacci: isFibonacci(parsedNumber),
    };
  }

   // Generate random number based on min/max or default range
  let randomNumber;
  if (!isNaN(min) && !isNaN(max) && min < max) {
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    randomNumber = Math.floor(Math.random() * 10000) + 1; // Default 1-10000
  }

  return {
    number: randomNumber,
    isPrime: isPrime(randomNumber),
    isFibonacci: isFibonacci(randomNumber),
  };
}


// Example usage (replace with your actual endpoint handling)
const endpoint = (req) => {
  try {
    const result = getEndpoint(req);
    if (result.error) {
      return {
        status: 400,
        error: result.error,
      };
    }
    return {
      status: 200,
      data: result,
    };
  } catch (error) {
      return {
          status: 500,
          error: "Internal Server Error",
      };
  }
};




// Example usage (replace with your actual endpoint handling)
const request = new URL('https://harys-api-test.vercel.app/api/v1/number-analyzer?number=17&min=10&max=20');
const result = endpoint({ url: request.toString() });
console.log(JSON.stringify(result, null, 2));

const request2 = new URL('https://harys-api-test.vercel.app/api/v1/number-analyzer?min=20&max=30');
const result2 = endpoint({ url: request2.toString() });
console.log(JSON.stringify(result2, null, 2));

const request3 = new URL('https://harys-api-test.vercel.app/api/v1/number-analyzer?number=abc');
const result3 = endpoint({ url: request3.toString() });
console.log(JSON.stringify(result3, null, 2));
