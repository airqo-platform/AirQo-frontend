// pages/api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  const { city } = req.query;
  try {
    const response = await axios.get(
      `https://api.waqi.info/feed/${city}/?token=${process.env.NEXT_PUBLIC_WAQI_TOKEN}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
}
