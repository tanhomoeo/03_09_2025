import { NextResponse } from 'next/server';
import { getRemedyDetails } from '@/ai/flows/remedy-details';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { remedyName } = body as { remedyName?: string };
    if (!remedyName || typeof remedyName !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing remedyName' }, { status: 400 });
    }
    const result = await getRemedyDetails({ remedyName });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
