
import { type NextRequest, NextResponse } from 'next/server';
import type { DeliveryStatusPayload, TrackingUpdatePayload } from '@/lib/types';
import { updateConsignmentStatus, addTrackingEvent } from '@/lib/firestoreService';

// This is the secret key that Steadfast will use to authenticate their requests.
// It should be stored securely in your environment variables.
const WEBHOOK_SECRET = process.env.STEADFAST_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authorization Header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the JSON payload from the request body
    const payload: DeliveryStatusPayload | TrackingUpdatePayload = await request.json();

    // 3. Process the webhook based on the notification type
    switch (payload.notification_type) {
      case 'delivery_status': {
        // Update the order status in Firestore
        const updateSuccess = await updateConsignmentStatus(payload.consignment_id, payload.status);

        if (updateSuccess) {
          console.log(`Successfully updated Consignment ID ${payload.consignment_id} to status: ${payload.status}`);
        } else {
          console.error(`Failed to update Consignment ID ${payload.consignment_id} to status: ${payload.status}`);
        }
        break;
      }

      case 'tracking_update':
        await addTrackingEvent(
          payload.consignment_id,
          payload.tracking_message,
        );
        console.log(`Received Tracking Update: Consignment ID ${payload.consignment_id}: ${payload.tracking_message}`);
        break;

      default:
        // Handle unknown notification types
        return NextResponse.json({ status: 'error', message: 'Unknown notification type' }, { status: 400 });
    }

    // 4. Respond with a success message
    return NextResponse.json({ status: 'success', message: 'Webhook received successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error processing Steadfast webhook:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ status: 'error', message: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ status: 'error', message: 'An internal server error occurred.' }, { status: 500 });
  }
}
