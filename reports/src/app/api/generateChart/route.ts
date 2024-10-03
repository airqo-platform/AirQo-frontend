// app/api/generateChart/route.tsx
import ChartJsImage from 'chartjs-to-image';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { chartConfig, width, height } = await req.json();

    // Validate the request body
    if (
      !chartConfig ||
      typeof width !== 'number' ||
      typeof height !== 'number'
    ) {
      console.error('Invalid request parameters', {
        chartConfig,
        width,
        height,
      });
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request parameters' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const myChart = new ChartJsImage();
    myChart.setConfig(chartConfig);
    myChart.setWidth(width);
    myChart.setHeight(height);

    const url = await myChart.toDataUrl();
    return new NextResponse(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating chart image:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'An error occurred while generating the chart image.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
