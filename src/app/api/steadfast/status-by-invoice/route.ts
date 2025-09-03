import { NextResponse } from 'next/server';
import { getDeliveryStatusByInvoice } from '@/lib/steadfastService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get('invoice');
    if (!invoice) return NextResponse.json({ error: 'Missing invoice' }, { status: 400 });
    const data = await getDeliveryStatusByInvoice(invoice);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
