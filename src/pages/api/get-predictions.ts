import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  limit 
} from 'firebase/firestore';

interface PredictionData {
  id: string;
  userId: string;
  symbol: string;
  predictedPrice: string;
  lastPrice: string;
  createdAt: Date;
  interval: string;
  actualPrice?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const predictionsRef = collection(db, 'predictions');
    
    // Query by userId only and sort client-side
    const q = query(
      predictionsRef,
      where('userId', '==', userId),
      // Add a reasonable limit to prevent loading too much data
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    
    // Convert to array and sort in memory
    const predictions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null
    })) as PredictionData[];

    // Sort by createdAt in descending order
    const sortedPredictions = predictions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    res.status(200).json(sortedPredictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ 
      message: 'Error fetching predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 