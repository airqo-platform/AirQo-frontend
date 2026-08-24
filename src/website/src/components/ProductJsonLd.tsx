import type { MetadataConfig } from '@/lib/metadata';
import {
  generateBreadcrumbSchema,
  generateProductSchema,
  getProductDisplayName,
} from '@/lib/metadata/structuredData';
import { buildSiteUrl, getPrimarySiteUrl } from '@/lib/siteUrl';

interface ProductJsonLdProps {
  /**
   * The METADATA_CONFIGS entry for the product page. Both the Product and
   * BreadcrumbList schemas are derived from this single entry.
   */
  config: MetadataConfig;
}

/**
 * Server component that renders Product + BreadcrumbList JSON-LD structured
 * data for a product marketing page.
 */
const ProductJsonLd = ({ config }: ProductJsonLdProps) => {
  const siteUrl = getPrimarySiteUrl();

  const productSchema = generateProductSchema(config, siteUrl);
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Our Products', url: buildSiteUrl('/products', siteUrl) },
      {
        name: getProductDisplayName(config.title),
        url: buildSiteUrl(config.url, siteUrl),
      },
    ],
    siteUrl,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};

export default ProductJsonLd;
