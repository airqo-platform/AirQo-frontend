export const PADDLE_SCRIPT_ID = 'paddle-sdk';
export const PADDLE_SCRIPT_SRC = 'https://cdn.paddle.com/paddle/v2/paddle.js';
export const PADDLE_CHECKOUT_COMPLETED_EVENT =
  'airqo:paddle-checkout-completed';
export const PADDLE_CHECKOUT_CLOSED_EVENT = 'airqo:paddle-checkout-closed';

export const getPaddleEnvironment = ():
  | 'sandbox'
  | 'production'
  | undefined => {
  const environment =
    process.env.NEXT_PUBLIC_PAYMENT_ENVIRONMENT?.trim().toLowerCase();

  if (environment === 'sandbox' || environment === 'production') {
    return environment;
  }

  return undefined;
};

export const getPaymentClientToken = (): string =>
  process.env.NEXT_PUBLIC_PAYMENT_CLIENT_TOKEN?.trim() || '';
