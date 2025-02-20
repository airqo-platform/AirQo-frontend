import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Set up the target URL
  const targetUrl =
    'https://analytics.airqo.net/api/v2/analytics/data-download';

  try {
    const response = await axios.post(targetUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Error while proxying request',
      message: error.message,
    });
  }
}
