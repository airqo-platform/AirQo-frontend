import type { Metadata } from 'next';
import { headers } from 'next/headers';

import {
  cleanMetadataText,
  DEFAULT_METADATA,
  resolveMetadataImage,
} from '@/lib/metadata';
import { buildSiteUrl, getPrimarySiteUrl } from '@/lib/siteUrl';
import { partnersService } from '@/services/website';

import PartnerDetailsPage from './PartnerDetailsPage';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const requestProtocol =
    requestHeaders.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const canonicalUrl = buildSiteUrl(
    `/partners/${encodeURIComponent(params.id)}`,
    undefined,
    requestHost,
    requestProtocol,
  );
  const siteUrl = getPrimarySiteUrl(requestHost, requestProtocol);

  let partner = null;
  try {
    partner = await partnersService.getPartnerDetails(params.id);
  } catch {
    // A missing partner record should not make the page metadata request fail.
  }

  const partnerName = partner?.partner_name?.trim() || partner?.name?.trim();
  const title = partnerName
    ? `${partnerName} | AirQo partner`
    : 'Partner details | AirQo';
  const description = cleanMetadataText(
    partner?.descriptions?.map(({ description: text }) => text).join(' ') ||
      partner?.description,
    partnerName
      ? `Learn about ${partnerName} and its work with AirQo.`
      : 'Organizations working with AirQo to improve air quality across Africa.',
  );
  const imageUrl = resolveMetadataImage(
    partner?.partner_image_url || partner?.partner_logo_url,
    siteUrl,
  );
  const imageAlt = partnerName
    ? `${partnerName} partner profile`
    : DEFAULT_METADATA.defaultImage.alt;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      siteName: 'AirQo',
      title,
      description,
      images: [{ url: imageUrl, alt: imageAlt, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title,
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
    robots: { index: Boolean(partner), follow: true },
  };
}

export default function PartnerDetailsRoute() {
  return <PartnerDetailsPage />;
}
