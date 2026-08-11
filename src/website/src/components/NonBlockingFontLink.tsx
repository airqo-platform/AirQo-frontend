'use client';

const NonBlockingFontLink = ({ href }: { href: string }) => (
  <link
    rel="stylesheet"
    href={href}
    media="print"
    onLoad={(event) => {
      event.currentTarget.media = 'all';
    }}
  />
);

export default NonBlockingFontLink;
