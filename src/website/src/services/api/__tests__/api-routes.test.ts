import { API_ROUTES } from '@/services/api/api-routes';

describe('API_ROUTES', () => {
  describe('section existence', () => {
    it('has WEBSITE section', () => {
      expect(API_ROUTES.WEBSITE).toBeDefined();
      expect(typeof API_ROUTES.WEBSITE).toBe('object');
    });

    it('has DEVICES section', () => {
      expect(API_ROUTES.DEVICES).toBeDefined();
      expect(typeof API_ROUTES.DEVICES).toBe('object');
    });

    it('has USERS section', () => {
      expect(API_ROUTES.USERS).toBeDefined();
      expect(typeof API_ROUTES.USERS).toBe('object');
    });

    it('has PREDICT section', () => {
      expect(API_ROUTES.PREDICT).toBeDefined();
      expect(typeof API_ROUTES.PREDICT).toBe('object');
    });

    it('has PAYMENTS section', () => {
      expect(API_ROUTES.PAYMENTS).toBeDefined();
      expect(typeof API_ROUTES.PAYMENTS).toBe('object');
    });
  });

  describe('WEBSITE routes', () => {
    it('BLOGS starts with /', () => {
      expect(API_ROUTES.WEBSITE.BLOGS).toMatch(/^\/.*/);
    });

    it('BLOG_BY_SLUG returns correct format', () => {
      const result = API_ROUTES.WEBSITE.BLOG_BY_SLUG('my-post');
      expect(result).toBe('/website/api/v2/blogs/by-slug/my-post/');
    });

    it('BLOG_BY_SLUG encodes special characters', () => {
      const result = API_ROUTES.WEBSITE.BLOG_BY_SLUG('post with spaces');
      expect(result).toBe(
        '/website/api/v2/blogs/by-slug/post%20with%20spaces/',
      );
    });

    it('BLOG_DETAILS returns correct format', () => {
      const result = API_ROUTES.WEBSITE.BLOG_DETAILS('my-post');
      expect(result).toBe('/website/api/v2/blogs/my-post/');
    });

    it('BLOG_IDENTIFIERS returns correct format', () => {
      const result = API_ROUTES.WEBSITE.BLOG_IDENTIFIERS('my-post');
      expect(result).toBe('/website/api/v2/blogs/my-post/identifiers/');
    });

    it('BULK_IDENTIFIERS_BLOGS starts with /', () => {
      expect(API_ROUTES.WEBSITE.BULK_IDENTIFIERS_BLOGS).toMatch(/^\/.*/);
    });

    it('EVENTS starts with /', () => {
      expect(API_ROUTES.WEBSITE.EVENTS).toMatch(/^\/.*/);
    });

    it('EVENTS_FEATURED starts with /', () => {
      expect(API_ROUTES.WEBSITE.EVENTS_FEATURED).toMatch(/^\/.*/);
    });

    it('EVENT_BY_SLUG returns correct format', () => {
      const result = API_ROUTES.WEBSITE.EVENT_BY_SLUG('conference-2024');
      expect(result).toBe('/website/api/v2/events/by-slug/conference-2024/');
    });

    it('EVENT_IDENTIFIERS returns correct format', () => {
      const result = API_ROUTES.WEBSITE.EVENT_IDENTIFIERS('event-1');
      expect(result).toBe('/website/api/v2/events/event-1/identifiers/');
    });

    it('BULK_IDENTIFIERS_EVENTS starts with /', () => {
      expect(API_ROUTES.WEBSITE.BULK_IDENTIFIERS_EVENTS).toMatch(/^\/.*/);
    });

    it('CAREERS starts with /', () => {
      expect(API_ROUTES.WEBSITE.CAREERS).toMatch(/^\/.*/);
    });

    it('FAQ starts with /', () => {
      expect(API_ROUTES.WEBSITE.FAQ).toMatch(/^\/.*/);
    });

    it('FORUM_EVENTS starts with /', () => {
      expect(API_ROUTES.WEBSITE.FORUM_EVENTS).toMatch(/^\/.*/);
    });

    it('FORUM_EVENT_TITLES starts with /', () => {
      expect(API_ROUTES.WEBSITE.FORUM_EVENT_TITLES).toMatch(/^\/.*/);
    });

    it('IMPACT_NUMBERS starts with /', () => {
      expect(API_ROUTES.WEBSITE.IMPACT_NUMBERS).toMatch(/^\/.*/);
    });

    it('PARTNERS starts with /', () => {
      expect(API_ROUTES.WEBSITE.PARTNERS).toMatch(/^\/.*/);
    });

    it('PRESS starts with /', () => {
      expect(API_ROUTES.WEBSITE.PRESS).toMatch(/^\/.*/);
    });

    it('PUBLICATIONS starts with /', () => {
      expect(API_ROUTES.WEBSITE.PUBLICATIONS).toMatch(/^\/.*/);
    });

    it('TEAM starts with /', () => {
      expect(API_ROUTES.WEBSITE.TEAM).toMatch(/^\/.*/);
    });

    it('EXTERNAL_TEAM starts with /', () => {
      expect(API_ROUTES.WEBSITE.EXTERNAL_TEAM).toMatch(/^\/.*/);
    });

    it('TEAM_BIOGRAPHIES starts with /', () => {
      expect(API_ROUTES.WEBSITE.TEAM_BIOGRAPHIES).toMatch(/^\/.*/);
    });

    it('EXTERNAL_TEAM_BIOGRAPHIES starts with /', () => {
      expect(API_ROUTES.WEBSITE.EXTERNAL_TEAM_BIOGRAPHIES).toMatch(/^\/.*/);
    });

    it('BOARD_MEMBERS starts with /', () => {
      expect(API_ROUTES.WEBSITE.BOARD_MEMBERS).toMatch(/^\/.*/);
    });

    it('DEPARTMENTS starts with /', () => {
      expect(API_ROUTES.WEBSITE.DEPARTMENTS).toMatch(/^\/.*/);
    });

    it('HIGHLIGHTS starts with /', () => {
      expect(API_ROUTES.WEBSITE.HIGHLIGHTS).toMatch(/^\/.*/);
    });

    it('CLEAN_AIR_RESOURCES starts with /', () => {
      expect(API_ROUTES.WEBSITE.CLEAN_AIR_RESOURCES).toMatch(/^\/.*/);
    });

    it('AFRICAN_COUNTRIES starts with /', () => {
      expect(API_ROUTES.WEBSITE.AFRICAN_COUNTRIES).toMatch(/^\/.*/);
    });
  });

  describe('DEVICES routes', () => {
    it('GRIDS_SUMMARY starts with /', () => {
      expect(API_ROUTES.DEVICES.GRIDS_SUMMARY).toMatch(/^\/.*/);
    });

    it('GRIDS_SUMMARY_V2 starts with /', () => {
      expect(API_ROUTES.DEVICES.GRIDS_SUMMARY_V2).toMatch(/^\/.*/);
    });

    it('COUNTRIES_DATA starts with /', () => {
      expect(API_ROUTES.DEVICES.COUNTRIES_DATA).toMatch(/^\/.*/);
    });
  });

  describe('USERS routes', () => {
    it('NEWSLETTER_SUBSCRIBE starts with /', () => {
      expect(API_ROUTES.USERS.NEWSLETTER_SUBSCRIBE).toMatch(/^\/.*/);
    });

    it('CONTACT_US starts with /', () => {
      expect(API_ROUTES.USERS.CONTACT_US).toMatch(/^\/.*/);
    });
  });

  describe('PREDICT routes', () => {
    it('DAILY_FORECAST is defined', () => {
      expect(API_ROUTES.PREDICT.DAILY_FORECAST).toBeDefined();
      expect(typeof API_ROUTES.PREDICT.DAILY_FORECAST).toBe('string');
    });
  });

  describe('PAYMENTS routes', () => {
    it('GET_PAYMENTS_DATA starts with /', () => {
      expect(API_ROUTES.PAYMENTS.GET_PAYMENTS_DATA).toMatch(/^\/.*/);
    });
  });

  describe('dynamic route functions', () => {
    it('BLOG_BY_SLUG is a function', () => {
      expect(typeof API_ROUTES.WEBSITE.BLOG_BY_SLUG).toBe('function');
    });

    it('BLOG_DETAILS is a function', () => {
      expect(typeof API_ROUTES.WEBSITE.BLOG_DETAILS).toBe('function');
    });

    it('BLOG_IDENTIFIERS is a function', () => {
      expect(typeof API_ROUTES.WEBSITE.BLOG_IDENTIFIERS).toBe('function');
    });

    it('EVENT_BY_SLUG is a function', () => {
      expect(typeof API_ROUTES.WEBSITE.EVENT_BY_SLUG).toBe('function');
    });

    it('EVENT_IDENTIFIERS is a function', () => {
      expect(typeof API_ROUTES.WEBSITE.EVENT_IDENTIFIERS).toBe('function');
    });

    it('BLOG_BY_SLUG handles empty slug', () => {
      const result = API_ROUTES.WEBSITE.BLOG_BY_SLUG('');
      expect(result).toBe('/website/api/v2/blogs/by-slug//');
    });

    it('BLOG_BY_SLUG handles unicode characters', () => {
      const result = API_ROUTES.WEBSITE.BLOG_BY_SLUG('日本語-post');
      expect(result).toBe(
        '/website/api/v2/blogs/by-slug/%E6%97%A5%E6%9C%AC%E8%AA%9E-post/',
      );
    });

    it('EVENT_BY_SLUG handles slug with slashes', () => {
      const result = API_ROUTES.WEBSITE.EVENT_BY_SLUG('event/2024/conference');
      expect(result).toBe(
        '/website/api/v2/events/by-slug/event%2F2024%2Fconference/',
      );
    });
  });
});
