// Next.js
import { NextRequest, NextResponse } from 'next/server';

// External libraries
import Anthropic from '@anthropic-ai/sdk';

// Internal
import { API, VALIDATION } from '@/lib/constants';
import { createExtractionPrompt } from '@/lib/memory/extractor';
import { Message, Memory } from '@/lib/memory/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, currentMemory }: { messages: Message[]; currentMemory: Memory } = body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    // Skip extraction if conversation is too short
    if (messages.length < VALIDATION.MIN_MESSAGES_FOR_EXTRACTION) {
      return NextResponse.json({ extraction: null });
    }
    
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const extractionPrompt = createExtractionPrompt(messages, currentMemory);
    
    const response = await client.messages.create({
      model: API.EXTRACT_MODEL,
      max_tokens: API.MAX_EXTRACT_TOKENS,
      system: 'You are a precise data extraction assistant. Extract structured information from conversations. Always respond with valid JSON only, no additional text.',
      messages: [
        {
          role: 'user',
          content: extractionPrompt,
        },
      ],
    });
    
    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');
    const extraction = textContent?.type === 'text' ? textContent.text : '{}';
    
    return NextResponse.json({
      extraction,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
    
  } catch (error) {
    console.error('Extract API error:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API authentication failed. Memory extraction unavailable.' },
          { status: 401 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Memory extraction will retry later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Memory extraction failed. Your conversation is saved, but learnings may not be captured.' },
      { status: 500 }
    );
  }
}
