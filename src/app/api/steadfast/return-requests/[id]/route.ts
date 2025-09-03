import { NextResponse } from 'next/server';
import { getReturnRequest } from '@/lib/steadfastService';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const idNum = Number(params.id);
    if (!idNum || Number.isNaN(idNum)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const data = await getReturnRequest(idNum);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
