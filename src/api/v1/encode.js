export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send("Method Not Allowed, this endpoint uses only 'POST' requests.");
    return;
  }

  let { string } = req.body;

  if (string === undefined || string === null) {
    res.status(400).send("Missing 'string' in request body");
    return;
  }

  if (typeof string !== 'string') {
    string = String(string);
  }

  try {
    const encodedContent = Buffer.from(string).toString('base64');

    res.json({
      base64: {
        string: string,
        encoded: encodedContent
      },
      info: {
        credits: "Made by harys722, available only for cool people.",
        website: "https://harys.is-a.dev"
      }
    });
  } catch (error) {
    console.error('Encoding error:', error);
    res.status(500).send("Error encoding content, please try again!");
  }
}
