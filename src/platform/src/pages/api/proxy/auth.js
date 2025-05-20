import axios from 'axios';

export default async function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res
      .status(404)
      .json({ error: 'This endpoint is only available in development mode' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Set up the target URL
  const targetUrl = 'https://analytics.airqo.net/api/v2/users/loginUser';

  try {
    const response = await axios.post(targetUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    res.status(status).json({
      error: true,
      message,
    });
  }
}
