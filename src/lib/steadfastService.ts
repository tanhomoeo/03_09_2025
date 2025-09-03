'use server';

import type {
  SteadfastOrder,
  SteadfastConsignment,
  SteadfastStatus,
  SteadfastBalance,
} from './types';

const BASE_URL = process.env.STEADFAST_API_URL;
const API_KEY = process.env.STEADFAST_API_KEY;
const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

async function makeSteadfastRequest<T>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body: unknown | null = null,
): Promise<T> {
  if (!BASE_URL || !API_KEY || !SECRET_KEY) {
    throw new Error(
      'Steadfast API credentials are not configured in the environment.',
    );
  }

  const headers = {
    'Api-Key': API_KEY,
    'Secret-Key': SECRET_KEY,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        // Try to parse the error response as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch {
        // If it's not JSON, it might be HTML or plain text
        const textError = await response.text();
        // Shorten long HTML error pages
        errorMessage =
          textError.length > 200
            ? textError.substring(0, 200) + '...'
            : textError;
      }
      throw new Error(
        `An error occurred with the courier service: ${errorMessage}`,
      );
    }

    const text = await response.text();
    // It's possible for a successful response to have an empty body.
    if (!text) {
      return {} as T;
    }

    const data = JSON.parse(text);

    if (data.status && data.status !== 200 && data.status !== 201) {
      throw new Error(
        data.message || 'An error occurred with the courier service.',
      );
    }

    return data as T;
  } catch (error) {
    console.error(`Steadfast API Error (${path}):`, error);
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        throw new Error(
          `Failed to parse response from Steadfast API. This might be a temporary issue with the courier service.`,
        );
      }
      throw new Error(
        `Failed to communicate with Steadfast API: ${error.message}`,
      );
    }
    throw new Error(
      'An unknown error occurred while communicating with the courier service.',
    );
  }
}

export const placeSteadfastOrder = async (
  orderData: SteadfastOrder,
): Promise<{
  status: number;
  message: string;
  consignment: SteadfastConsignment;
}> => {
  return makeSteadfastRequest<{
    status: number;
    message: string;
    consignment: SteadfastConsignment;
  }>('/create_order', 'POST', orderData);
};

export const getDeliveryStatusByInvoice = async (
  invoiceId: string,
): Promise<SteadfastStatus> => {
  return makeSteadfastRequest<SteadfastStatus>(
    `/status_by_invoice/${invoiceId}`,
  );
};

export const getDeliveryStatusByConsignmentId = async (
  consignmentId: number,
): Promise<SteadfastStatus> => {
  return makeSteadfastRequest<SteadfastStatus>(
    `/status_by_cid/${consignmentId}`,
  );
};

export const getDeliveryStatusByTrackingCode = async (
  trackingCode: string,
): Promise<SteadfastStatus> => {
  return makeSteadfastRequest<SteadfastStatus>(
    `/status_by_trackingcode/${trackingCode}`,
  );
};

export const getCurrentBalance = async (): Promise<SteadfastBalance> => {
  return makeSteadfastRequest<SteadfastBalance>('/get_balance');
};

/**
 * Fetches all consignments from Steadfast.
 * Note: This endpoint might be paginated. The current implementation fetches the first page.
 */
export const getAllConsignments = async (): Promise<{
  data: SteadfastConsignment[];
}> => {
  const response = await makeSteadfastRequest<{
    data?: SteadfastConsignment[];
  }>('/consignment/get_all');
  return { data: response.data || [] };
};

/**
 * Fetches consignments based on their status from Steadfast.
 * @param status - The delivery status to filter by.
 */
export const getConsignmentsByStatus = async (
  status: string,
): Promise<{ data: SteadfastConsignment[] }> => {
  return makeSteadfastRequest<{ data: SteadfastConsignment[] }>(
    `/get_orders_by_status?status=${status}`,
  );
};
