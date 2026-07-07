export { generateMetadata } from './generateMetadata';
export {
  getCurrentDomain,
  getDomainForContext,
  isValidDomain,
  sanitizeUrl,
} from './generateMetadata';
export { generateViewport } from './generateViewport';
export type { ImageMetadata, MetadataConfig } from './metadata.config';
export {
  compact,
  DEFAULT_METADATA,
  PRIMARY_SITE_URL,
  SUPPORTED_DOMAINS,
} from './metadata.config';
export type { MetadataConfigKey } from './pageMetadata';
export {
  getMetadataConfig,
  getPageMetadata,
  METADATA_CONFIGS,
} from './pageMetadata';
export {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateWebsiteSchema,
} from './structuredData';
