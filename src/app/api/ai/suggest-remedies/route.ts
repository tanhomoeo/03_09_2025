import { NextResponse } from 'next/server';
import { suggestRemedies } from '@/ai/flows/suggest-remedies';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symptoms } = body as { symptoms?: string };
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 10) {
      return NextResponse.json({ error: 'Invalid or insufficient symptoms' }, { status: 400 });
    }
    const result = await suggestRemedies({ symptoms });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
