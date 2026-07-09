export const API_ROUTES = {
  WEBSITE: {
    BLOGS: '/website/api/v2/blogs/',
    BLOG_BY_SLUG: (slug: string) =>
      `/website/api/v2/blogs/by-slug/${encodeURIComponent(slug)}/`,
    BLOG_DETAILS: (slug: string) =>
      `/website/api/v2/blogs/${encodeURIComponent(slug)}/`,
    BLOG_IDENTIFIERS: (slug: string) =>
      `/website/api/v2/blogs/${encodeURIComponent(slug)}/identifiers/`,
    BULK_IDENTIFIERS_BLOGS: '/website/api/v2/blogs/bulk-identifiers/',
    EVENTS: '/website/api/v2/events/',
    EVENTS_FEATURED: '/website/api/v2/events/featured/',
    EVENT_BY_SLUG: (slug: string) =>
      `/website/api/v2/events/by-slug/${encodeURIComponent(slug)}/`,
    EVENT_IDENTIFIERS: (slug: string) =>
      `/website/api/v2/events/${encodeURIComponent(slug)}/identifiers/`,
    BULK_IDENTIFIERS_EVENTS: '/website/api/v2/events/bulk-identifiers/',
    CAREERS: '/website/api/v2/careers/',
    FAQ: '/website/api/v2/faqs/',
    FORUM_EVENTS: '/website/api/v2/forum-events/',
    FORUM_EVENT_TITLES: '/website/api/v2/forum-event-titles/',
    IMPACT_NUMBERS: '/website/api/v2/impact-numbers/',
    PARTNERS: '/website/api/v2/partners/',
    PRESS: '/website/api/v2/press/',
    PUBLICATIONS: '/website/api/v2/publications/',
    TEAM: '/website/api/v2/team-members/',
    EXTERNAL_TEAM: '/website/api/v2/external-team-members/',
    TEAM_BIOGRAPHIES: '/website/api/v2/team-biographies/',
    EXTERNAL_TEAM_BIOGRAPHIES: '/website/api/v2/external-team-biographies/',
    BOARD_MEMBERS: '/website/api/v2/board-members/',
    DEPARTMENTS: '/website/api/v2/departments/',
    HIGHLIGHTS: '/website/api/v2/highlights/',
    CLEAN_AIR_RESOURCES: '/website/api/v2/clean-air-resources/',
    AFRICAN_COUNTRIES: '/website/api/v2/african-countries/',
  },
  DEVICES: {
    GRIDS_SUMMARY: '/api/v2/devices/grids/summary',
    GRIDS_SUMMARY_V2: '/api/v2/devices/grids/summary',
    COUNTRIES_DATA: '/api/v2/devices/grids/countries',
    GRIDS_REPRESENTATIVE: 'devices/readings/grids',
    GRID_MEASUREMENTS: 'devices/measurements/grids',
    NETWORK_COVERAGE_SUMMARY: 'devices/network-coverage',
    NETWORK_COVERAGE_MONITOR_DETAIL: 'devices/network-coverage/monitors',
    NETWORK_COVERAGE_COUNTRY_MONITORS: 'devices/network-coverage/countries',
    NETWORK_COVERAGE_EXPORT_CSV: 'devices/network-coverage/export.csv',
    NETWORK_COVERAGE_REGISTRY: 'devices/network-coverage/registry',
    NETWORK_COVERAGE_IMPACT: 'devices/network-coverage/impact',
    NETWORK_COVERAGE_CITIES: 'devices/network-coverage/cities',
  },
  USERS: {
    NEWSLETTER_SUBSCRIBE: '/api/v2/users/newsletter/subscribe',
    CONTACT_US: '/api/v2/users/inquiries/register',
    SELFIES: 'users/selfies',
  },
  PREDICT: {
    DAILY_FORECAST: 'predict/daily-forecast',
  },
  PAYMENTS: {
    GET_PAYMENTS_DATA: '/api/getpaymentsdata/',
  },
} as const;
