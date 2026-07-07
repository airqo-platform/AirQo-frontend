export type ImageConfig = {
  defaultPlaceholder: string;
  cloudinaryBaseUrl: string;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  formats: string[];
};

const imagesConfig: ImageConfig = {
  defaultPlaceholder: '/images/placeholder.png',
  cloudinaryBaseUrl: 'https://res.cloudinary.com/airqo/image/upload',
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
  formats: ['webp', 'avif', 'png', 'jpg'],
};

export default imagesConfig;
