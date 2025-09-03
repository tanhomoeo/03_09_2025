import { NextResponse } from 'next/server';
import { getDeliveryStatusByConsignmentId } from '@/lib/steadfastService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');
    if (!cid)
      return NextResponse.json({ error: 'Missing cid' }, { status: 400 });
    const data = await getDeliveryStatusByConsignmentId(Number(cid));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
