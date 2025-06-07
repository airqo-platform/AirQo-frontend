import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      return NextResponse.json(
        { error: "Configuration error. Contact administrator." },
        { status: 500 }
      );
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',  // Or your preferred model
        messages: [
          {
            role: 'system',
            content: 'You are a specialized IoT device monitoring assistant that analyzes data transmission patterns and device health metrics. Your analysis helps maintenance teams identify and troubleshoot device connectivity issues.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      
      // Return appropriate error messages based on status codes
      if (response.status === 401) {
        return NextResponse.json(
          { error: "API key is invalid" },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: `API error: ${response.status}` },
          { status: 500 }
        );
      }
    }
    
    const data = await response.json();
    
    // Return the analysis result
    return NextResponse.json({ analysis: data.choices[0].message.content });
    
  } catch (error) {
    console.error("Error in analyze-device API route:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}