import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

export default async function handler(req, res) {
  const url = req.query.url;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid parameter `url`. Must be a valid URL"
    });
  }

  let browser;

  try {
    chrome.setGraphicsMode = true;
    chrome.setHeadlessMode = true;

    browser = await puppeteer.launch({
      executablePath: await chrome.executablePath(),
      headless: chrome.headless,
      args: chrome.args,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const buffer = await page.screenshot({ type: 'png' });

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal Server Error', error: error.message });
  } finally {
    if (browser) await browser.close();
  }
}
