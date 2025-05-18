import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const prediction = req.body;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Add prediction to Firestore
    const predictionData = {
      ...prediction,
      userId,
      createdAt: serverTimestamp(),
    };

    // Store in predictions collection
    const predictionsRef = collection(db, 'predictions');
    await addDoc(predictionsRef, predictionData);

    res.status(200).json({ message: 'Prediction stored successfully' });
  } catch (error) {
    console.error('Error storing prediction:', error);
    res.status(500).json({ message: 'Error storing prediction' });
  }
} 