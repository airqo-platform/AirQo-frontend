import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
import BillboardSkeleton from '@/components/sections/AirQualityBillboard/skeletons/BillboardSkeleton';
import {
  cleanMetadataText,
  DEFAULT_METADATA,
  resolveMetadataImage,
} from '@/lib/metadata';
import { buildSiteUrl, getPrimarySiteUrl } from '@/lib/siteUrl';

interface GridBillboardPageProps {
  params: {
    name: string;
  };
}

export async function generateMetadata({
  params,
}: GridBillboardPageProps): Promise<Metadata> {
  const gridName = cleanMetadataText(params.name, 'Air quality', 80);
  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const requestProtocol =
    requestHeaders.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const siteUrl = getPrimarySiteUrl(requestHost, requestProtocol);
  const canonicalUrl = buildSiteUrl(
    `/billboard/grid/${encodeURIComponent(params.name)}`,
    undefined,
    requestHost,
    requestProtocol,
  );
  const imageUrl = resolveMetadataImage(null, siteUrl);
  const title = `${gridName} air quality billboard | AirQo`;
  const description = cleanMetadataText(
    `View the AirQo air quality billboard for ${gridName}.`,
    DEFAULT_METADATA.defaultDescription,
  );

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl },
    keywords: [
      `${gridName} air quality`,
      `${gridName} pollution display`,
      'air quality billboard',
      'live air monitor',
      'real-time PM2.5',
      'Africa air quality',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'AirQo',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: DEFAULT_METADATA.defaultImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title,
      description,
      images: [{ url: imageUrl, alt: DEFAULT_METADATA.defaultImage.alt }],
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function GridBillboardPage({ params }: GridBillboardPageProps) {
  const gridName = params.name;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <Suspense fallback={<BillboardSkeleton centered={true} />}>
        <AirQualityBillboard
          hideControls={false}
          autoRotate={false}
          itemName={gridName}
          centered={true}
          hideDropdown={true}
        />
      </Suspense>
    </main>
  );
}
