# Publications feed

## Decision

The AirQo resources page has a server-side live research feed. Django admin is the source of truth for feed enablement and publication policy. The Next.js server reads that non-secret policy from the website API, then fetches OpenAlex and Crossref, applies the configured filters, and applies staff metadata overrides.

The existing AirQo-managed publications API remains the fallback. If one provider is unavailable, the live feed is served from the remaining provider. If both providers fail, the live route returns an error and the curated AirQo resources remain visible. If the backend disables the feed, the route returns an empty disabled response and the curated resources remain visible. When the live feed succeeds but returns no records, curated research resources are also shown as an empty-feed fallback.

This is a low-cost scheduled-feed design rather than a request-per-visitor design:

```text
browser -> /api/publications/live -> Django feed policy (no-store)
                                   -> OpenAlex + Crossref (6-hour provider cache)
                                   -> Django metadata overrides (no-store)
```

The OpenAlex API key is read only by the Next.js server from `OPENALEX_API_KEY`, sent in an Authorization bearer header, and never returned to the browser or placed in a URL. The live route is `no-store` so an admin disable takes effect without waiting for a response-cache window; provider data is cached for six hours.

## One-time production setup

1. Set `OPENALEX_API_KEY` in the frontend deployment's server-side secret store. Do not prefix it with `NEXT_PUBLIC_`. OpenAlex supports bearer authentication; the key increases the daily budget and supports cursor paging beyond the first page. This feed requests at most the first 100 results per configured query. See [OpenAlex authentication](https://help.openalex.org/api/authentication/).
2. Apply the Django website migrations and deploy the backend API before deploying a frontend that requires the new settings contract. The migrations create a default settings record using the currently verified AirQo author IDs, `AirQo` affiliation, official provider endpoints, and air-quality relevance terms.
3. In `/website/admin/`, edit **Publications → Live publication feed settings** to enable or disable the feed, change OpenAlex author IDs, set affiliations and relevance keywords, change the relevance requirement, or update the Crossref contact email. The provider URL fields are restricted to the official HTTPS `/works` endpoints. These settings are stored in the backend database; no frontend redeploy or secret rotation is needed when they change.
4. Keep the existing `API_URL` pointing to the website backend. The frontend reads the public, read-only settings endpoint without `API_TOKEN`; only authenticated Django staff can edit settings. The provider key is not stored in the backend.
5. Crossref requires no API key and follows the configured affiliations as a secondary metadata source.

## Current behavior

- The Research Publications tab calls `/api/publications/live`.
- Before contacting providers, the Next.js server fetches `/website/api/v2/live-publication-feed-settings/`. A disabled backend setting prevents provider requests.
- OpenAlex author IDs, affiliation matching, relevance keywords, and the relevance requirement come from that backend response, not frontend environment variables.
- OpenAlex author IDs constrain OpenAlex discovery; configured affiliations independently drive Crossref discovery. The merged AirQo publications feed can therefore include a Crossref record even when its authors are not in the OpenAlex author-ID list.
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

- Review the first 100 records after changing backend filters and remove false positives by tightening affiliations, keywords, or author IDs in Django admin.
- Check for missing DOI or incorrect author affiliation metadata during the first two refreshes.
- Monitor the Next.js logs for `Live publications feed error` and provider HTTP failures.
- If both providers are unreachable, the live route returns a temporary error and the Research Publications tab falls back to curated records. Confirm the deployment has outbound HTTPS access to OpenAlex and Crossref before diagnosing this as an admin override issue.
- Feed setting changes are read without caching by Next.js, and the live route response is not cached. OpenAlex and Crossref provider responses remain cached for six hours.
- Keep the curated AirQo records until the external feed has had at least one full review cycle.

## Staff-managed metadata corrections

Staff can correct live-feed authors and the displayed publication source (journal or venue) in the Django website admin at `/website/admin/`, under **Publications → Live publication metadata overrides**. Enter one author per line. Leave either field empty to keep the provider's value.

Each record is keyed by one of these stable identifiers:

- `doi:<normalized-doi>`, for example `doi:10.1234/example`. The DOI is normalized to lowercase and without a DOI URL prefix.
- `openalex:<work-id>`, for example `openalex:W123456789`. Use this for works without a DOI, or when you prefer to identify a specific OpenAlex work.

The Next.js server needs the existing `API_URL` to point to the Django website backend. It requests the public, read-only override endpoint `/website/api/v2/live-publication-overrides/` with repeated `identifier` query parameters, for example `?identifier=doi%3A10.1234%2Fexample&identifier=openalex%3AW123456789`. The response is a JSON array with `external_identifier`, `authors` (an array), and `journal`. The request does not include `API_TOKEN`; writes through the API are not enabled, and edits use the authenticated Django admin. The website checks the override endpoint without caching and its feed response cache is one minute, while provider metadata remains cached for six hours.
