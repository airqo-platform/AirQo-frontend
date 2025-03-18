import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Set up the target URL
  const targetUrl = 'https://analytics.airqo.net/api/v2/devices/summary';

  try {
    // Pass query parameters from the request to the target URL
    const response = await axios.get(targetUrl, {
      headers: {
        Authorization: req.headers.authorization,
      },
      params: req.query,
    });

    // Forward the response back to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    // Handle errors and respond appropriately
    res.status(error.response?.status || 500).json({
      error: 'Error while proxying request',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}
