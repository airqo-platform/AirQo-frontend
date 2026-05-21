'use client';

import { useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';
import {
  PADDLE_CHECKOUT_CLOSED_EVENT,
  PADDLE_CHECKOUT_COMPLETED_EVENT,
  PADDLE_SCRIPT_ID,
  PADDLE_SCRIPT_SRC,
  getPaddleEnvironment,
  getPaymentClientToken,
} from '@/shared/lib/paddle';

const PaddleProvider = () => {
  const initializedRef = useRef(false);
  const paymentClientToken = getPaymentClientToken();
  const paddleEnvironment = getPaddleEnvironment();

  const initializePaddle = useCallback(() => {
    if (
      initializedRef.current ||
      typeof window === 'undefined' ||
      !paymentClientToken
    ) {
      return;
    }

    const paddle = window.Paddle;
    if (!paddle || typeof paddle.Initialize !== 'function') {
      return;
    }

    paddle.Initialize({
      token: paymentClientToken,
      ...(paddleEnvironment ? { environment: paddleEnvironment } : {}),
      eventCallback: event => {
        if (event.name === 'checkout.completed') {
          window.dispatchEvent(new Event(PADDLE_CHECKOUT_COMPLETED_EVENT));
        }

        if (event.name === 'checkout.closed') {
          window.dispatchEvent(new Event(PADDLE_CHECKOUT_CLOSED_EVENT));
        }
      },
    });

    initializedRef.current = true;
  }, [paddleEnvironment, paymentClientToken]);

  useEffect(() => {
    initializePaddle();
  }, [initializePaddle]);

  if (!paymentClientToken) {
    return null;
  }

  return (
    <Script
      id={PADDLE_SCRIPT_ID}
      src={PADDLE_SCRIPT_SRC}
      strategy="afterInteractive"
      onLoad={initializePaddle}
    />
  );
};

export default PaddleProvider;
