type PaddleCheckoutEvent = {
  name: string;
};

interface PaddleCheckoutOpenOptions {
  transactionId: string;
}

interface PaddleInitializeOptions {
  token: string;
  environment?: 'sandbox';
  eventCallback?: (event: PaddleCheckoutEvent) => void;
}

interface PaddleCheckout {
  open(options: PaddleCheckoutOpenOptions): void;
}

interface PaddleGlobal {
  Initialize(options: PaddleInitializeOptions): void;
  Checkout: PaddleCheckout;
}

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

export {};
