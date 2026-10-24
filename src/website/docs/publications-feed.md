# Publications feed

## Decision

The AirQo resources page now has a server-side live research feed. OpenAlex is the primary provider because it exposes works, authors, institutions, affiliations, open-access locations, and persistent identifiers through a free REST API. Crossref is used as a free metadata backfill and DOI verification source.

The existing AirQo-managed publications API remains the fallback. If one provider is unavailable, the live feed is served from the remaining provider; if both providers fail (or the feed is disabled), the live feed request returns an error and the curated AirQo resources are shown instead. If the live feed succeeds but returns no records while curated research resources exist, the curated resources are also shown as a last-resort empty-feed fallback.

This is a low-cost scheduled-feed design rather than a request-per-visitor design:

```text
browser -> /api/publications/live -> OpenAlex + Crossref
                              \-> 6-hour server/provider cache
```

The route is server-only, so `OPENALEX_API_KEY` and the Crossref contact address never reach the browser. The response is also served with `s-maxage=21600` and `stale-while-revalidate=86400`.

## One-time production setup

1. Create a free OpenAlex account and copy its API key into `OPENALEX_API_KEY`. The current free account includes $1 of API usage per day and is more than enough for a feed that refreshes only a few times per day.
2. Use the verified author filter configured for production:
   `OPENALEX_AUTHOR_IDS=A5047583981,A5051886991,A5076584166,A5002704292,A5014863511,A5017420345,A5015937838,A5067893766,A5089230857,A5036111960`.

   `OPENALEX_RELEVANCE_REQUIRED=true` removes unrelated work by the same researchers unless the record has an AirQo affiliation or air-quality, pollution, sensor, or monitoring relevance. Do not use a Makerere institution filter because it covers the university's entire research output. The `search=AirQo` fallback is retained only for development and recovery.

3. Add `CROSSREF_MAILTO` with a monitored AirQo email address. Crossref does not require a subscription, but the `mailto` parameter puts the requests in its polite pool and gives Crossref a way to contact the team about API usage.
4. Keep `CROSSREF_MAILTO=info@airqo.net` and `CROSSREF_AFFILIATION=AirQo` unless the research team confirms a better monitored address or affiliation spelling. Crossref metadata is deposited by publishers and may have less complete affiliations than OpenAlex, so it is used for enrichment/backfill rather than as the sole source of truth.
5. Set `PUBLICATIONS_FEED_ENABLED=true` and deploy. If the OpenAlex filter needs adjustment, update the environment variable without changing frontend code.

## Current behavior

- The Research Publications tab calls `/api/publications/live`.
- Results are fetched in batches of up to 100 records, merged by normalized DOI or title, sorted newest first, and paginated in the server response.
- Each live result links to its canonical DOI first, then its publisher landing page, and finally its OpenAlex record when no DOI or landing page is available. Where OpenAlex or Crossref provides a free copy, the page also offers a separate open-access link.
- Curated resource cards use the exact AirQo-managed `link` for “Read More” and the separate `resource_file_url` for downloads. Both are validated as HTTPS URLs before rendering, so a missing or malformed destination is not presented as a clickable action.
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
