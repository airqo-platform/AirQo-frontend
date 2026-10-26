export const PUBLICATIONS_FEED_REVALIDATE_SECONDS = 6 * 60 * 60;
export const PUBLICATIONS_FEED_DEFAULT_PAGE_SIZE = 12;
export const PUBLICATIONS_FEED_MAX_PAGE_SIZE = 50;

const splitEnvironmentList = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const getPublicationsFeedConfig = () => {
  const openAlexApiKey = process.env.OPENALEX_API_KEY?.trim();

  return {
    enabled:
      process.env.PUBLICATIONS_FEED_ENABLED !== 'false' &&
      Boolean(openAlexApiKey),
    openAlexApiUrl:
      process.env.OPENALEX_API_URL || 'https://api.openalex.org/works',
    openAlexApiKey,
    openAlexInstitutionId: process.env.OPENALEX_INSTITUTION_ID,
    openAlexAuthorIds: splitEnvironmentList(process.env.OPENALEX_AUTHOR_IDS),
    openAlexWorksFilter: process.env.OPENALEX_WORKS_FILTER,
    openAlexRelevanceRequired:
      process.env.OPENALEX_RELEVANCE_REQUIRED !== 'false',
    crossrefApiUrl:
      process.env.CROSSREF_API_URL || 'https://api.crossref.org/works',
    crossrefMailto: process.env.CROSSREF_MAILTO,
    crossrefAffiliation: process.env.CROSSREF_AFFILIATION || 'AirQo',
  };
};
