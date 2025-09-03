import { NextResponse } from 'next/server';
import { placeSteadfastOrder } from '@/lib/steadfastService';
import type { SteadfastOrder } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SteadfastOrder;
    const data = await placeSteadfastOrder(payload);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
