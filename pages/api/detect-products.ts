import { GoogleCloudVision } from '@google-cloud/vision';

const vision = new GoogleCloudVision();

export default async function handler(req, res) {
  const { imageUrl } = req.body;
  
  try {
    const [result] = await vision.labelDetection(imageUrl);
    const labels = result.labelAnnotations;
    
    // Filter and process relevant product labels
    const products = labels
      .filter(label => label.score > 0.8)
      .map(label => label.description);
    
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect products' });
  }
} 