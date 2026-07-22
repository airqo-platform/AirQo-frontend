import React from 'react';

const Image = (
  props: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
  }
) => {
  const { src, alt, ...rest } = props;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...rest} />;
};

Image.displayName = 'NextImage';

export default Image;
