import { NextResponse } from 'next/server';
import { bulkCreateOrders } from '@/lib/steadfastService';
import type {
  SteadfastBulkOrderItem,
  SteadfastBulkOrderResultItem,
} from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { data?: SteadfastBulkOrderItem[] };
    if (!body?.data || !Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing data array' },
        { status: 400 },
      );
    }
    const result: SteadfastBulkOrderResultItem[] = await bulkCreateOrders(
      body.data,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
