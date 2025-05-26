import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Use server-side environment variable (no NEXT_PUBLIC_ prefix needed)
    const SLACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

    if (!SLACK_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        error: 'Slack webhook URL not configured',
      });
    }

    // Simply forward the payload from the logger to Slack
    // All formatting is now handled by the logger
    await axios.post(SLACK_WEBHOOK_URL, req.body);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending to Slack:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
    });
  }
}
