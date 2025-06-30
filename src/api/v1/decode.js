export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { string } = req.body;

  if (!string) {
    res.status(400).send("Missing 'string' in request body");
    return;
  }

  // Validate if the input is a valid base64 string
  const base64Regex = /^[a-zA-Z0-9+/=]*={0,2}$/;
  if (!base64Regex.test(string)) {
    res.status(400).send('Invalid base64 string');
    return;
  }

  try {
    const decodedContent = Buffer.from(string, 'base64').toString('utf-8');
    res.json({
      base64: {
        string: string,
        decoded: decodedContent
      },
      info: {
        credits: "Made by harys722, available only for cool people.",
        website: "https://harys.is-a.dev"
      }
    });
  } catch (error) {
    res.status(500).send("Error decoding string, please try again!");
  }
}
