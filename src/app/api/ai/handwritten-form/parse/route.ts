import { NextResponse } from 'next/server';
import { parseHandwrittenForm } from '@/ai/flows/handwritten-patient-form-parser-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { photoDataUri } = body as { photoDataUri?: string };
    if (!photoDataUri || typeof photoDataUri !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing photoDataUri' }, { status: 400 });
    }
    const result = await parseHandwrittenForm({ photoDataUri });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
