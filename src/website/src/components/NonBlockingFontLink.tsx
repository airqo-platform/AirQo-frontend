'use client';

import { useEffect, useRef } from 'react';

const NonBlockingFontLink = ({ href }: { href: string }) => {
  const linkRef = useRef<HTMLLinkElement>(null);

  useEffect(() => {
    if (linkRef.current) {
      linkRef.current.media = 'all';
    }
  }, []);

  return (
    <>
      <link ref={linkRef} rel="stylesheet" href={href} media="print" />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
};

export default NonBlockingFontLink;
