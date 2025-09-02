
'use server';

import type { SteadfastOrder, SteadfastConsignment, SteadfastStatus, SteadfastBalance } from './types';

const BASE_URL = process.env.STEADFAST_API_URL;
const API_KEY = process.env.STEADFAST_API_KEY;
const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

async function makeSteadfastRequest<T>(
  path: string,
  method: 'GET' | 'POST' = 'GET', // Default to GET for fetching data
  body: Record<string, unknown> | null = null,
): Promise<T> {
  if (!BASE_URL || !API_KEY || !SECRET_KEY) {
    throw new Error('Steadfast API credentials are not configured in the environment.');
  }

  const headers = {
    'Api-Key': API_KEY,
    'Secret-Key': SECRET_KEY,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store', // Ensure fresh data is fetched every time
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (response.status >= 400) {
      throw new Error(data.message || 'An error occurred with the courier service.');
    }
    
    return data as T;
  } catch (error) {
    console.error(`Steadfast API Error (${path}):`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch from Steadfast API: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the courier service.');
  }
}

export const placeSteadfastOrder = async (orderData: SteadfastOrder): Promise<{ status: number; message: string; consignment: SteadfastConsignment }> => {
  return makeSteadfastRequest<{ status: number; message: string; consignment: SteadfastConsignment }>('/create_order', 'POST', orderData);
};

export const getDeliveryStatusByInvoice = async (invoiceId: string): Promise<SteadfastStatus> => {
    return makeSteadfastRequest<SteadfastStatus>(`/status_by_invoice/${invoiceId}`);
};

export const getDeliveryStatusByConsignmentId = async (consignmentId: number): Promise<SteadfastStatus> => {
    return makeSteadfastRequest<SteadfastStatus>(`/status_by_cid/${consignmentId}`);
};

export const getDeliveryStatusByTrackingCode = async (trackingCode: string): Promise<SteadfastStatus> => {
    return makeSteadfastRequest<SteadfastStatus>(`/status_by_trackingcode/${trackingCode}`);
};


export const getCurrentBalance = async (): Promise<SteadfastBalance> => {
    return makeSteadfastRequest<SteadfastBalance>('/get_balance');
};

/**
 * Fetches all consignments from Steadfast.
 * Note: This endpoint might be paginated. The current implementation fetches the first page.
 */
export const getAllConsignments = async (): Promise<{data: SteadfastConsignment[]}> => {
    return makeSteadfastRequest<{data: SteadfastConsignment[]}>('/get_all_orders');
};

/**
 * Fetches consignments based on their status from Steadfast.
 * @param status - The delivery status to filter by.
 */
export const getConsignmentsByStatus = async (status: string): Promise<{data: SteadfastConsignment[]}> => {
    return makeSteadfastRequest<{data: SteadfastConsignment[]}>(`/get_orders_by_status?status=${status}`);
};
