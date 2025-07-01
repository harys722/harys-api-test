export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: "URL parameter required" });
  }
  
  try {
    // Use the simplest possible screenshot service
    const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(url)}`;
    
    const response = await fetch(screenshotUrl);
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    res.status(500).json({ error: "Screenshot failed" });
  }
}
