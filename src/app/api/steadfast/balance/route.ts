import { NextResponse } from 'next/server';
import { getCurrentBalance } from '@/lib/steadfastService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCurrentBalance();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
