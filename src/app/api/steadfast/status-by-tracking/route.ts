import { NextResponse } from 'next/server';
import { getDeliveryStatusByTrackingCode } from '@/lib/steadfastService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get('trackingCode');
    if (!trackingCode) return NextResponse.json({ error: 'Missing trackingCode' }, { status: 400 });
    const data = await getDeliveryStatusByTrackingCode(trackingCode);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
