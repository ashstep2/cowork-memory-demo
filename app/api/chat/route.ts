// Next.js
import { NextRequest, NextResponse } from 'next/server';

// External libraries
import Anthropic from '@anthropic-ai/sdk';

// Internal
import { SYSTEM_PROMPT } from '@/lib/claude';
import { API } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, memoryContext, dealContext } = body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Build the full system prompt with memory and deal context
    let fullSystemPrompt = SYSTEM_PROMPT;
    
    if (memoryContext) {
      fullSystemPrompt += `\n\n${memoryContext}`;
    }
    
    if (dealContext) {
      fullSystemPrompt += `\n\n<current_deal_context>\n${dealContext}\n</current_deal_context>`;
    }
    
    // Format messages for the API
    const apiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    
    const response = await client.messages.create({
      model: API.CHAT_MODEL,
      max_tokens: API.MAX_CHAT_TOKENS,
      system: fullSystemPrompt,
      messages: apiMessages,
    });
    
    // Extract text content
    const textContent = response.content.find(block => block.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';
    
    return NextResponse.json({
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API authentication failed. Please check your Anthropic API key configuration.' },
          { status: 401 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timed out. The AI service is taking longer than expected. Please try again.' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unable to process your message. Please try again or refresh the page.' },
      { status: 500 }
    );
  }
}
