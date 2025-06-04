// Quick test script to check authentication API
const fetch = require('node-fetch');

async function testAuth() {
  const API_BASE_URL = 'https://analytics.airqo.net/api/v2';
  const url = `${API_BASE_URL}/users/loginUser`;

  console.log('Testing authentication API...');
  console.log('URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: 'test@example.com',
        password: 'testpassword',
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('Response body:', responseText.substring(0, 500));

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed JSON successfully');
    } catch (e) {
      console.log('Failed to parse as JSON:', e.message);
    }
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testAuth();
