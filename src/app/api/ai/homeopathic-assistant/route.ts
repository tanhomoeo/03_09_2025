import { NextResponse } from 'next/server';
import { analyzeHomeopathicCase } from '@/ai/flows/homeopathic-assistant-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseData } = body as { caseData?: string };
    if (
      !caseData ||
      typeof caseData !== 'string' ||
      caseData.trim().length < 20
    ) {
      return NextResponse.json(
        { error: 'Invalid or insufficient caseData' },
        { status: 400 },
      );
    }
    const result = await analyzeHomeopathicCase({ caseData });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
