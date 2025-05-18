import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if API key exists
  if (!process.env.TWELVE_DATA_API_KEY) {
    return res.status(500).json({ message: 'API key not configured' });
  }

  try {
    // Parse the request body
    const { userId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all predictions for this user
    const predictionsRef = collection(db, 'predictions');
    const q = query(
      predictionsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const updatedPredictions = [];

    for (const predDoc of querySnapshot.docs) {
      const prediction = predDoc.data();
      
      // Skip predictions that already have an actual price
      if ('actualPrice' in prediction) {
        continue;
      }
      
      // Only update predictions that are past their interval
      const predictionTime = prediction.createdAt.toDate();
      const interval = prediction.interval;
      const now = new Date();
      
      // Convert interval to milliseconds
      let intervalMs = 24 * 60 * 60 * 1000; // Default to 1 day if interval is not recognized
      
      if (interval.includes('min')) {
        intervalMs = parseInt(interval) * 60 * 1000;
      } else if (interval.includes('h')) {
        intervalMs = parseInt(interval) * 60 * 60 * 1000;
      } else if (interval === '1day') {
        intervalMs = 24 * 60 * 60 * 1000;
      } else if (interval === '1week') {
        intervalMs = 7 * 24 * 60 * 60 * 1000;
      } else if (interval === '1month') {
        intervalMs = 30 * 24 * 60 * 60 * 1000;
      }

      // Only update if the prediction interval has passed
      if (now.getTime() - predictionTime.getTime() >= intervalMs) {
        try {
          // Fetch actual price from Twelve Data API
          const apiUrl = `https://api.twelvedata.com/time_series?symbol=${prediction.symbol}&interval=${prediction.interval}&outputsize=1&apikey=${process.env.TWELVE_DATA_API_KEY}`;
          
          const response = await fetch(apiUrl);
          const data = await response.json();
          
          if (!response.ok || data.status === 'error') {
            console.error(`API Error for prediction ${predDoc.id}:`, data.message || response.statusText);
            continue;
          }

          if (!data.values || !data.values[0] || !data.values[0].close) {
            console.error(`Invalid data format for prediction ${predDoc.id}`);
            continue;
          }

          const actualPrice = data.values[0].close;

          // Update the prediction with actual price
          await updateDoc(doc(db, 'predictions', predDoc.id), {
            actualPrice: actualPrice
          });

          updatedPredictions.push({
            id: predDoc.id,
            symbol: prediction.symbol,
            actualPrice: actualPrice
          });
        } catch (error) {
          console.error(`Error updating prediction ${predDoc.id}:`, error);
          continue;
        }
      }
    }
    
    return res.status(200).json({ 
      message: 'Predictions updated successfully',
      updatedCount: updatedPredictions.length,
      updatedPredictions 
    });
  } catch (error) {
    console.error('Error updating predictions:', error);
    return res.status(500).json({ 
      message: 'Error updating predictions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 