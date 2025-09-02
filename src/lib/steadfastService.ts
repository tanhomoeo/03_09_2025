'use server';

import type { SteadfastOrder, SteadfastConsignment, SteadfastStatus, SteadfastBalance } from './types';

const BASE_URL = process.env.STEADFAST_API_URL;
const API_KEY = process.env.STEADFAST_API_KEY;
const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

async function makeSteadfastRequest<T>(
  path: string,
  method: 'GET' | 'POST' = 'POST',
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
    return makeSteadfastRequest<SteadfastStatus>(`/status_by_invoice/${invoiceId}`, 'GET');
};

export const getDeliveryStatusByConsignmentId = async (consignmentId: number): Promise<SteadfastStatus> => {
    return makeSteadfastRequest<SteadfastStatus>(`/status_by_cid/${consignmentId}`, 'GET');
};

export const getDeliveryStatusByTrackingCode = async (trackingCode: string): Promise<SteadfastStatus> => {
    return makeSteadfastRequest<SteadfastStatus>(`/status_by_trackingcode/${trackingCode}`, 'GET');
};


export const getCurrentBalance = async (): Promise<SteadfastBalance> => {
    return makeSteadfastRequest<SteadfastBalance>('/get_balance', 'GET');
};

// You can add bulk order and return request functions here later if needed.
