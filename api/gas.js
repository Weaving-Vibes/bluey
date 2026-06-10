// api/gas.js — Vercel Serverless Proxy for Google Apps Script
// Forwards all query params to GAS and returns the response with CORS headers.

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbzhgXMf04FQ8H4RfHzOJ87h8RKk_VNgEAiOFdwBBoKBYEpBs0XTMOAh6yA8ZgGOSQOm/exec';

export default async function handler(req, res) {
  // Allow all origins (your Vercel domain will call this)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Forward all query params from the frontend to GAS
    const params = new URLSearchParams(req.query).toString();
    const url = params ? `${GAS_URL}?${params}` : GAS_URL;

    const gasRes = await fetch(url, {
      // GAS redirects — follow them
      redirect: 'follow',
    });

    const text = await gasRes.text();

    // Try to parse as JSON, fall back to raw text
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: 'Non-JSON response from GAS', raw: text };
    }

    return res.status(200).json(body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}