import { NextResponse } from 'next/server';
import { categorizeCaseNotes } from '@/ai/flows/categorize-case-notes-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseNotesText } = body as { caseNotesText?: string };
    if (!caseNotesText || typeof caseNotesText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing caseNotesText' },
        { status: 400 },
      );
    }
    const result = await categorizeCaseNotes({ caseNotesText });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
