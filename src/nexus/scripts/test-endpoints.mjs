/* eslint-disable */
/**
 * Endpoint tester for the Analytics Explore + site-details features.
 * Run: node scripts/test-endpoints.mjs <email> <password>
 * Outputs JSON for every endpoint so the tester agent can map response shapes.
 *
 * Secrets are read from environment variables / .env.local — never hard-code
 * credentials or tokens in this file.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const loadEnv = () => {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
};

const env = loadEnv();
const API = process.env.API_BASE_URL || env.API_BASE_URL || 'https://staging-analytics.airqo.net/api/v2/';
const API_TOKEN = process.env.API_TOKEN || env.API_TOKEN || '';

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/test-endpoints.mjs <email> <password>');
  process.exit(1);
}
if (!API_TOKEN) {
  console.error('API_TOKEN is not set (env or .env.local)');
  process.exit(1);
}

const results = {};

let groupsRawList = [];

const jwtFetch = async (path, options = {}) => {
  const res = await fetch(API + path.replace(/^\//, ''), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Verified live: the backend rejects `Authorization: JWT <token>` and
      // accepts the raw token (the app's ApiClient normalizes the prefix
      // before sending).
      Authorization: results.token,
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 500);
  }
  return { status: res.status, body };
};

const tokenFetch = async (path, options = {}) => {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(
    API + path.replace(/^\//, '') + `${sep}token=${API_TOKEN}&access_token=${API_TOKEN}`,
    {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    }
  );
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 500);
  }
  return { status: res.status, body };
};

// 1. Login
{
  const res = await fetch(API + 'users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: email, password }),
  });
  const text = await res.text();
  const body = JSON.parse(text);
  results.login = { status: res.status, success: body.success, hasToken: !!body.token, user: { _id: body._id, userName: body.userName, privilege: body.privilege, organization: body.organization } };
  results.token = body.token;
  if (!body.token) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }
}

// 2. Groups
{
  const { status, body } = await jwtFetch('users/groups');
  results.groups = {
    status,
    success: body.success,
    count: Array.isArray(body.groups) ? body.groups.length : Array.isArray(body.data) ? body.data.length : undefined,
    sample: (Array.isArray(body.groups) ? body.groups : Array.isArray(body.data) ? body.data : []).slice(0, 5).map(g => ({
      _id: g._id,
      name: g.name,
      longName: g.long_name,
      orgShortName: g.orgShortName ?? g.organization,
    })),
  };
  results.groupsRawSample = (Array.isArray(body.groups) ? body.groups : Array.isArray(body.data) ? body.data : [])[0];
  groupsRawList = Array.isArray(body.groups) ? body.groups : Array.isArray(body.data) ? body.data : [];
}

// 3. Cohorts for the first ACCESSIBLE group (the groups list includes groups
// the user cannot access — 403 — so iterate until one returns cohorts).
{
  const groups = results.groupsRawSample ? [results.groupsRawSample] : [];
  const allGroupIds = Array.isArray(groups[0]?._id) ? [] : [groups[0]?._id];
  let groupId = allGroupIds.find(Boolean);
  let cohortIds = [];
  let cohortsStatus = 0;
  for (const candidateId of allGroupIds) {
    const { status, body } = await jwtFetch(`users/groups/${candidateId}/cohorts`);
    cohortsStatus = status;
    if (status === 200 && Array.isArray(body.data) && body.data.length > 0) {
      groupId = candidateId;
      cohortIds = body.data;
      break;
    }
  }
  results.usedGroupId = groupId;
  results.cohorts = { status: cohortsStatus, cohortIds };
  if (cohortIds.length === 0) {
    // Fall back to fetching every group id from the raw list
    const rawGroups = groupsRawList;
    for (const g of rawGroups) {
      const { status, body } = await jwtFetch(`users/groups/${g._id}/cohorts`);
      if (status === 200 && Array.isArray(body.data) && body.data.length > 0) {
        groupId = g._id;
        cohortIds = body.data;
        results.usedGroupId = groupId;
        results.cohorts = { status, cohortIds };
        break;
      }
    }
  }
}

// 4. Cached sites (Explore table source)
{
  const cohortIds = results.cohorts?.cohortIds ?? [];
  const { status, body } = await jwtFetch('devices/cohorts/cached-sites', {
    method: 'POST',
    body: JSON.stringify({ cohort_ids: cohortIds }),
    headers: {},
  }).catch(async e => ({ status: 0, body: { error: String(e?.message ?? e) } }));
  // fallback: POST with query params variant
  let sitesBody = body;
  if (status === 404 || status === 405) {
    const r = await fetch(`${API}devices/cohorts/cached-sites?token=${API_TOKEN}&access_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohort_ids: cohortIds }),
    });
    sitesBody = await r.json();
  }
  results.cachedSites = {
    status,
    success: sitesBody.success,
    message: sitesBody.message,
    meta: sitesBody.meta,
    cache_generated_at: sitesBody.cache_generated_at,
    siteCount: Array.isArray(sitesBody.sites) ? sitesBody.sites.length : undefined,
    siteKeys: Array.isArray(sitesBody.sites) && sitesBody.sites.length > 0 ? Object.keys(sitesBody.sites[0]) : [],
    sampleSites: (Array.isArray(sitesBody.sites) ? sitesBody.sites : []).slice(0, 3),
  };
  results.allSiteIds = (Array.isArray(sitesBody.sites) ? sitesBody.sites : []).map(s => s._id);
}

// 5. Recent readings for up to 3 sites (token-authenticated — the endpoint
// rejects JWT headers, verified live)
{
  const ids = (results.allSiteIds ?? []).slice(0, 3);
  results.recentReadings = {};
  for (const id of ids) {
    const { status, body } = await tokenFetch(`devices/readings/recent?site_id=${id}`);
    const measurement = body.measurements?.[0] ?? body.data?.[0] ?? null;
    results.recentReadings[id] = {
      status,
      success: body.success,
      measurementCount: Array.isArray(body.measurements) ? body.measurements.length : undefined,
      hasHealthTips: Array.isArray(measurement?.health_tips) && measurement.health_tips.length > 0,
      hasSiteDetails: !!measurement?.siteDetails,
      sampleMeasurement: measurement,
    };
  }
}

// 6. D3 chart data (24H, 7D, 30D) for first site
{
  const id = (results.allSiteIds ?? [])[0];
  results.d3Chart = {};
  if (id) {
    const presets = [
      { name: '24H', frequency: 'hourly', startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
      { name: '7D', frequency: 'daily', startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
      { name: '30D', frequency: 'daily', startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
    ];
    for (const preset of presets) {
      const { status, body } = await tokenFetch('analytics/dashboard/chart/d3/data', {
        method: 'POST',
        body: JSON.stringify({
          sites: [id],
          startDate: preset.startDate,
          endDate: preset.endDate,
          chartType: 'line',
          frequency: preset.frequency,
          pollutant: 'pm2_5',
          organisation_name: '',
        }),
      });
      const data = Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
      results.d3Chart[preset.name] = {
        status,
        pointCount: data.length,
        samplePoints: data.slice(0, 3),
        bodyKeys: Array.isArray(body.data) ? Object.keys(body) : body && typeof body === 'object' ? Object.keys(body) : [],
        errorBody: status >= 400 && typeof body === 'object' ? body.errors ?? body : undefined,
      };
    }
  }
}

// 7. Daily + hourly forecast for first site
{
  const id = (results.allSiteIds ?? [])[0];
  results.forecast = {};
  if (id) {
    {
      const { status, body } = await tokenFetch(`predict/daily-forecasting?site_id=${id}`);
      results.forecast.daily = {
        status,
        success: body.success,
        units: body.data?.units,
        forecastSiteCount: Array.isArray(body.data?.forecasts) ? body.data.forecasts.length : undefined,
        dayCount: Array.isArray(body.data?.forecasts?.[0]?.forecasts) ? body.data.forecasts[0].forecasts.length : undefined,
        firstForecastItem: body.data?.forecasts?.[0]?.forecasts?.[0],
        siteDetails: body.data?.forecasts?.[0]?.site_details,
      };
    }
    {
      const { status, body } = await tokenFetch(`predict/hourly-forecasting?site_id=${id}&page=1&limit=24`);
      results.forecast.hourly = {
        status,
        success: body.success,
        units: body.data?.units,
        meta: body.data?.meta,
        forecastSiteCount: Array.isArray(body.data?.forecasts) ? body.data.forecasts.length : undefined,
        hourCount: Array.isArray(body.data?.forecasts?.[0]?.forecasts) ? body.data.forecasts[0].forecasts.length : undefined,
        firstForecastItem: body.data?.forecasts?.[0]?.forecasts?.[0],
      };
    }
  }
}

// 8. AQI ranges
{
  const { status, body } = await jwtFetch('devices/aqi-ranges');
  results.aqiRanges = { status, success: body.success, ranges: body.ranges ?? body.data?.ranges };
}

delete results.token;
delete results.groupsRawSample;
console.log(JSON.stringify(results, null, 2));