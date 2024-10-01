import React from 'react';

interface NoInternetSVGProps {
  className?: string;
}

const NoInternetSVG: React.FC<NoInternetSVGProps> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 384c-97.2 0-176-78.8-176-176S158.8 80 256 80s176 78.8 176 176-78.8 176-176 176zm95.8-272H160.2c-9.6 0-18.4 5.8-22.2 14.8s-1.8 19.6 5.4 26.6l95.8 95.8c7 7 16.2 10.8 25.8 10.8s18.8-3.8 25.8-10.8l95.8-95.8c7.2-7 9-17.6 5.4-26.6s-12.6-14.8-22.2-14.8zm-95.8 160c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24z" />
  </svg>
);

export default NoInternetSVG;
