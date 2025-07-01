module.exports = async (req, res) => {
  const targetUrl = req.body['my-url'] || 'https://harys-open-apis.vercel.app/api';
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Authorization': req.headers['authorization'] || '',
      },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).send({ error: 'Proxy failed: ' + error.message });
  }
};
