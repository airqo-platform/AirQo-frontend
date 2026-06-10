import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  const healthCheck = {
    service: 'airqo-frontend',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    backend_connectivity: null,
    response_time: null
  };

  try {
    // Test backend connectivity
    const backendUrl = process.env.BACKEND_API_URL ;
    if (!backendUrl) {
      throw new Error('BACKEND_API_URL is not defined');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${backendUrl}/health`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    healthCheck.backend_connectivity = response.ok ? 'connected' : 'error';
  } catch (error) {
    healthCheck.backend_connectivity = 'disconnected';
    healthCheck.backend_error = error.message;
  }

  healthCheck.response_time = Date.now() - startTime;
  
  const status = healthCheck.backend_connectivity === 'connected' ? 200 : 503;
  return NextResponse.json(healthCheck, { status });
}