import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { symbol, interval = '1day' } = req.query;

  if (!symbol) {
    return res.status(400).json({ message: 'Stock symbol is required' });
  }

  try {
    const response = await fetch(
      `https://api.twelvedata.com/rsi?symbol=${symbol}&interval=${interval}&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Twelve Data API request failed');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Twelve Data API error:', error);
    res.status(500).json({ message: 'Error fetching stock data' });
  }
} 