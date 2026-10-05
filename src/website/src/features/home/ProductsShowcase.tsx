import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

const IMAGE_WIDTH = 800;

const monitorHome = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757020397/website/photos/monitorHome_dmmrsk_tof2wo.webp',
  { width: IMAGE_WIDTH },
);
const analyticsHome = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728175853/website/photos/analyticsHome_l3hgcy.png',
  { width: IMAGE_WIDTH },
);
const apiWrapper = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png',
  { width: IMAGE_WIDTH },
);

const products = [
  {
    subtitle: 'Air Quality Monitor',
    title: 'Binos Monitor',
    desc: 'Locally built, solar-ready monitors engineered for African cities.',
    href: '/products/monitor',
    cta: 'Explore Binos monitors',
    imageUrl: monitorHome,
  },
  {
    subtitle: 'AirQo Nexus',
    title: 'Interactive air quality platform',
    desc: 'Visualise real-time and historical air quality data across Africa.',
    href: '/products/nexus',
    cta: 'Explore AirQo Nexus',
    imageUrl: analyticsHome,
  },
  {
    subtitle: 'Air Quality API',
    title: 'Open data for developers',
    desc: 'Build on open air quality data with our developer API.',
    href: '/products/api',
    cta: 'Read the API docs',
    imageUrl: apiWrapper,
  },
] as const;

const ProductsShowcase = () => {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-4">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">
            Our platform
          </span>
          <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">
            From monitors to open data
          </h2>
          <p className="text-lg text-gray-600">
            An end-to-end system for measuring, understanding and acting on air
            quality across Africa.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.href}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-[#F7FAFF] shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <span className="inline-block w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-600">
                  {product.subtitle}
                </span>
                <h3 className="text-xl font-semibold text-gray-900">
                  {product.title}
                </h3>
                <p className="text-gray-600">{product.desc}</p>
                <Link
                  href={product.href}
                  className="mt-auto inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                >
                  {product.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsShowcase;
