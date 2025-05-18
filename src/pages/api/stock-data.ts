import { NextApiRequest, NextApiResponse } from 'next';
import { getPricePrediction } from '../../utils/predictionModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { symbol, interval = '1day' } = req.query;

  if (!symbol) {
    return res.status(400).json({ message: 'Stock symbol is required' });
  }

  try {
    // Fetch both RSI and time series data
    const [rsiResponse, timeSeriesResponse] = await Promise.all([
      fetch(
        `https://api.twelvedata.com/rsi?symbol=${symbol}&interval=${interval}&apikey=${process.env.TWELVE_DATA_API_KEY}`
      ),
      fetch(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=30&apikey=${process.env.TWELVE_DATA_API_KEY}`
      )
    ]);

    if (!rsiResponse.ok || !timeSeriesResponse.ok) {
      throw new Error('Twelve Data API request failed');
    }

    const [rsiData, timeSeriesData] = await Promise.all([
      rsiResponse.json(),
      timeSeriesResponse.json()
    ]);

    // Prepare data for the prediction model
    const historicalPrices = timeSeriesData.values.map((value: any) => parseFloat(value.close));

    // Get prediction from the ML model
    const modelPrediction = await getPricePrediction({
      historicalPrices,
      symbol: symbol as string,
      interval: interval as string
    });

    // Combine the data
    const response = {
      ...rsiData,
      timeSeries: timeSeriesData.values,
      prediction: {
        nextDay: modelPrediction.predictedPrice.toFixed(2),
        lastPrice: modelPrediction.lastPrice.toFixed(2)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Error generating prediction' });
  }
} 