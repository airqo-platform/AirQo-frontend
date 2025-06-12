import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  try {
    const response = await axios.get(
      `https://api.waqi.info/feed/${city}/?token=${process.env.WAQI_TOKEN}`,
    );
    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
