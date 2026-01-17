import { NextResponse } from 'next/server';
import { deals } from '@/lib/deals';

/**
 * GET /api/deals
 * Returns all deals (server-side loaded from files or MOCK_DEALS fallback)
 */
export async function GET() {
  return NextResponse.json({ deals });
}
