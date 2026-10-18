# Publications feed

## Decision

The AirQo resources page now has a server-side live research feed. OpenAlex is the primary provider because it exposes works, authors, institutions, affiliations, open-access locations, and persistent identifiers through a free REST API. Crossref is used as a free metadata backfill and DOI verification source.

The existing AirQo-managed publications API remains the fallback. If either provider is unavailable, the page continues to render the curated resources already stored by AirQo; if both providers fail, the live feed request returns an error and the fallback is shown.

This is a low-cost scheduled-feed design rather than a request-per-visitor design:

```text
browser -> /api/publications/live -> OpenAlex + Crossref
                              \-> 6-hour server/provider cache
```

The route is server-only, so `OPENALEX_API_KEY` and the Crossref contact address never reach the browser. The response is also served with `s-maxage=21600` and `stale-while-revalidate=86400`.

## One-time production setup

1. Create a free OpenAlex account and copy its API key into `OPENALEX_API_KEY`. The current free account includes $1 of API usage per day and is more than enough for a feed that refreshes only a few times per day.
2. Resolve the exact AirQo research identity before going live. Prefer one of these, in order:
   - `OPENALEX_WORKS_FILTER=authorships.institutions.id:<OPENALEX_OR_ROR_ID>` for the institution-backed feed.
   - `OPENALEX_AUTHOR_IDS=A...,...` for a curated list of AirQo researchers.
   - `OPENALEX_INSTITUTION_ID=<OPENALEX_OR_ROR_ID>` for the common single-institution case.

   OpenAlex's name search fallback is intentionally `AirQo` only, so it is useful for development but should be replaced with an exact identifier or filter before production. This avoids accidentally presenting unrelated Makerere University publications as AirQo publications.

3. Add `CROSSREF_MAILTO` with a monitored AirQo email address. Crossref does not require a subscription, but the `mailto` parameter puts the requests in its polite pool and gives Crossref a way to contact the team about API usage.
4. Keep `CROSSREF_AFFILIATION=AirQo` unless the research team confirms a better affiliation spelling. Crossref metadata is deposited by publishers and may have less complete affiliations than OpenAlex, so it is used for enrichment/backfill rather than as the sole source of truth.
5. Set `PUBLICATIONS_FEED_ENABLED=true` and deploy. If the OpenAlex filter needs adjustment, update the environment variable without changing frontend code.

## Current behavior

- The Research Publications tab calls `/api/publications/live`.
- Results are fetched in batches of up to 100 records, merged by normalized DOI or title, sorted newest first, and paginated in the server response.
- Each result links to its canonical DOI or publisher record. Where OpenAlex provides a free copy, the page also offers an open-access link.
- Metadata source and refresh time are visible on the page so visitors can distinguish external metadata from AirQo-authored content.
- The old curated resources feed remains available for all other tabs and as a graceful fallback for Research Publications.

Google Scholar profile links should remain manually verified links supplied by AirQo. Google Scholar does not provide a general public API for reliably discovering and maintaining profile URLs. The feed therefore links publications to DOI/publisher records and should not scrape Scholar. A later enhancement can add verified Scholar URLs to the team/member records and render them alongside the external author metadata.

## Provider review

- [OpenAlex authentication and rate limits](https://help.openalex.org/api/authentication/)
- [OpenAlex pricing](https://help.openalex.org/access/pricing/)
- [OpenAlex works and authorships](https://help.openalex.org/data/works/)
- [OpenAlex filtering](https://help.openalex.org/api/filtering/)
- [Crossref REST API](https://support.crossref.org/hc/en-us/articles/214320426-REST-API)
- [Crossref current rate limits](https://www.crossref.org/blog/announcing-changes-to-rest-api-rate-limits/)
- [Scopus APIs and eligibility](https://dev.elsevier.com/sc_apis.html)

Scopus is not part of the initial implementation. Elsevier describes non-commercial academic/public-sector access as potentially free, but an API key alone does not grant product-data access; entitlement, institutional IP authentication, or an institutional token may still be required. It is worth evaluating through Makerere or an existing AirQo institutional subscription after the OpenAlex/Crossref feed has been validated.

## Operational checks

- Review the first 100 records after setting the exact OpenAlex filter and remove false positives by tightening the filter or author list.
- Check for missing DOI or incorrect author affiliation metadata during the first two refreshes.
- Monitor the Next.js logs for `Live publications feed error` and provider HTTP failures.
- Keep the curated AirQo records until the external feed has had at least one full review cycle.
