export interface LiqPayCheckoutParams {
  data: string;
  signature: string;
  checkoutUrl: string;
}

export type LiqPayStatus =
  | 'success'
  | 'sandbox'
  | 'failure'
  | 'error'
  | 'reversed'
  | 'subscribed'
  | 'unsubscribed'
  | 'wait_secure'
  | 'wait_accept'
  | 'wait_card'
  | 'wait_lc'
  | 'processing'
  | '3ds_verify'
  | 'cvv_verify'
  | 'otp_verify'
  | 'receiver_verify'
  | 'sender_verify';

export interface LiqPayCallbackPayload {
  public_key: string;
  version: string | number;
  action: string;
  payment_id: number;
  status: LiqPayStatus;
  order_id: string;
  amount: number;
  currency: string;
  description?: string;
  transaction_id?: number;
  sender_card_mask2?: string;
  sender_card_type?: string;
  sender_phone?: string;
  err_code?: string;
  err_description?: string;
  sandbox?: 0 | 1;
}

export const LIQPAY_FINAL_SUCCESS: LiqPayStatus[] = ['success', 'sandbox'];
export const LIQPAY_FINAL_FAIL: LiqPayStatus[] = [
  'failure',
  'error',
  'reversed',
];
