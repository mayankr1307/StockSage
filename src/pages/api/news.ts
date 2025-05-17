import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=stock%20market&apiKey=${process.env.NEWS_API_KEY}&sortBy=publishedAt&language=en`
    );

    if (!response.ok) {
      throw new Error('News API request failed');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
} 