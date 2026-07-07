import { apiQueryKeys } from '@/queries/query-keys';

describe('apiQueryKeys', () => {
  describe('blogs', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.blogs()).toEqual(['blogs', undefined]);
    });

    it('returns correct key with empty params', () => {
      expect(apiQueryKeys.blogs({})).toEqual(['blogs', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.blogs({ page: 1, page_size: 10 })).toEqual([
        'blogs',
        { page: 1, page_size: 10 },
      ]);
    });

    it('filters out undefined values from params', () => {
      expect(
        apiQueryKeys.blogs({ page: 1, search: undefined, ordering: 'date' }),
      ).toEqual(['blogs', { page: 1, ordering: 'date' }]);
    });

    it('returns undefined for params with all undefined values', () => {
      expect(
        apiQueryKeys.blogs({
          page: undefined,
          search: undefined,
          ordering: undefined,
        }),
      ).toEqual(['blogs', undefined]);
    });

    it('normalizes array category to comma-separated string', () => {
      expect(apiQueryKeys.blogs({ category: ['tech', 'science'] })).toEqual([
        'blogs',
        { category: 'tech,science' },
      ]);
    });

    it('keeps string category as-is', () => {
      expect(apiQueryKeys.blogs({ category: 'tech' })).toEqual([
        'blogs',
        { category: 'tech' },
      ]);
    });

    it('handles category with other params', () => {
      expect(
        apiQueryKeys.blogs({
          page: 2,
          category: ['a', 'b'],
          search: 'test',
        }),
      ).toEqual(['blogs', { page: 2, category: 'a,b', search: 'test' }]);
    });
  });

  describe('blogDetails', () => {
    it('returns correct key with slug', () => {
      expect(apiQueryKeys.blogDetails('my-blog-post')).toEqual([
        'blogDetails',
        'my-blog-post',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.blogDetails(null)).toEqual(['blogDetails', null]);
    });
  });

  describe('blogIdentifiers', () => {
    it('returns correct key with slug', () => {
      expect(apiQueryKeys.blogIdentifiers('some-slug')).toEqual([
        'blogIdentifiers',
        'some-slug',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.blogIdentifiers(null)).toEqual([
        'blogIdentifiers',
        null,
      ]);
    });
  });

  describe('pressArticles', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.pressArticles()).toEqual([
        'pressArticles',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.pressArticles({ page: 1, page_size: 5 })).toEqual([
        'pressArticles',
        { page: 1, page_size: 5 },
      ]);
    });

    it('filters out undefined values', () => {
      expect(
        apiQueryKeys.pressArticles({ page: 1, page_size: undefined }),
      ).toEqual(['pressArticles', { page: 1 }]);
    });
  });

  describe('impactNumbers', () => {
    it('returns correct key', () => {
      expect(apiQueryKeys.impactNumbers()).toEqual(['impactNumbers']);
    });
  });

  describe('airQoEvents', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.airQoEvents()).toEqual(['airQoEvents', undefined]);
    });

    it('returns correct key with params', () => {
      expect(
        apiQueryKeys.airQoEvents({
          page: 1,
          page_size: 10,
          event_status: 'upcoming',
        }),
      ).toEqual([
        'airQoEvents',
        { page: 1, page_size: 10, event_status: 'upcoming' },
      ]);
    });

    it('filters out undefined event_status', () => {
      expect(
        apiQueryKeys.airQoEvents({ page: 1, event_status: undefined }),
      ).toEqual(['airQoEvents', { page: 1 }]);
    });
  });

  describe('cleanAirEvents', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.cleanAirEvents()).toEqual([
        'cleanAirEvents',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.cleanAirEvents({ page: 2, page_size: 20 })).toEqual([
        'cleanAirEvents',
        { page: 2, page_size: 20 },
      ]);
    });
  });

  describe('upcomingEvents', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.upcomingEvents()).toEqual([
        'upcomingEvents',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.upcomingEvents({ page: 1 })).toEqual([
        'upcomingEvents',
        { page: 1 },
      ]);
    });
  });

  describe('pastEvents', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.pastEvents()).toEqual(['pastEvents', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.pastEvents({ page: 1, page_size: 5 })).toEqual([
        'pastEvents',
        { page: 1, page_size: 5 },
      ]);
    });
  });

  describe('featuredEvents', () => {
    it('returns correct key', () => {
      expect(apiQueryKeys.featuredEvents()).toEqual(['featuredEvents']);
    });
  });

  describe('eventDetails', () => {
    it('returns correct key with id', () => {
      expect(apiQueryKeys.eventDetails('evt-123')).toEqual([
        'eventDetails',
        'evt-123',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.eventDetails(null)).toEqual(['eventDetails', null]);
    });
  });

  describe('highlights', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.highlights()).toEqual(['highlights', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.highlights({ page: 1, page_size: 10 })).toEqual([
        'highlights',
        { page: 1, page_size: 10 },
      ]);
    });
  });

  describe('careers', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.careers()).toEqual(['careers', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.careers({ page: 3, page_size: 15 })).toEqual([
        'careers',
        { page: 3, page_size: 15 },
      ]);
    });
  });

  describe('careerDetail', () => {
    it('returns correct key with identifier', () => {
      expect(apiQueryKeys.careerDetail('senior-dev')).toEqual([
        'careerDetails',
        'senior-dev',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.careerDetail(null)).toEqual(['careerDetails', null]);
    });
  });

  describe('departments', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.departments()).toEqual(['departments', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.departments({ page: 1 })).toEqual([
        'departments',
        { page: 1 },
      ]);
    });
  });

  describe('publications', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.publications()).toEqual(['publications', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.publications({ page: 1, page_size: 10 })).toEqual([
        'publications',
        { page: 1, page_size: 10 },
      ]);
    });

    it('normalizes array category to comma-separated string', () => {
      expect(
        apiQueryKeys.publications({ category: ['report', 'paper'] }),
      ).toEqual(['publications', { category: 'report,paper' }]);
    });

    it('keeps string category as-is', () => {
      expect(apiQueryKeys.publications({ category: 'report' })).toEqual([
        'publications',
        { category: 'report' },
      ]);
    });

    it('filters out undefined values', () => {
      expect(
        apiQueryKeys.publications({
          page: 1,
          page_size: undefined,
          category: undefined,
        }),
      ).toEqual(['publications', { page: 1 }]);
    });
  });

  describe('boardMembers', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.boardMembers()).toEqual(['boardMembers', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.boardMembers({ page: 1 })).toEqual([
        'boardMembers',
        { page: 1 },
      ]);
    });
  });

  describe('teamMembers', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.teamMembers()).toEqual(['teamMembers', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.teamMembers({ page: 1, page_size: 20 })).toEqual([
        'teamMembers',
        { page: 1, page_size: 20 },
      ]);
    });
  });

  describe('externalTeamMembers', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.externalTeamMembers()).toEqual([
        'externalTeamMembers',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.externalTeamMembers({ page: 2 })).toEqual([
        'externalTeamMembers',
        { page: 2 },
      ]);
    });
  });

  describe('teamBiography', () => {
    it('returns correct key with member id', () => {
      expect(apiQueryKeys.teamBiography('member-42')).toEqual([
        'teamBiography',
        'member-42',
      ]);
    });

    it('returns correct key with numeric id', () => {
      expect(apiQueryKeys.teamBiography(42)).toEqual(['teamBiography', 42]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.teamBiography(null)).toEqual(['teamBiography', null]);
    });
  });

  describe('externalTeamBiography', () => {
    it('returns correct key with member id', () => {
      expect(apiQueryKeys.externalTeamBiography('ext-1')).toEqual([
        'externalTeamBiography',
        'ext-1',
      ]);
    });

    it('returns correct key with numeric id', () => {
      expect(apiQueryKeys.externalTeamBiography(7)).toEqual([
        'externalTeamBiography',
        7,
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.externalTeamBiography(null)).toEqual([
        'externalTeamBiography',
        null,
      ]);
    });
  });

  describe('partners', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.partners()).toEqual(['partners', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.partners({ page: 1, featured: true })).toEqual([
        'partners',
        { page: 1, featured: true },
      ]);
    });

    it('filters out undefined values', () => {
      expect(apiQueryKeys.partners({ page: 1, featured: undefined })).toEqual([
        'partners',
        { page: 1 },
      ]);
    });
  });

  describe('partnerDetails', () => {
    it('returns correct key with identifier', () => {
      expect(apiQueryKeys.partnerDetails('partner-abc')).toEqual([
        'partnerDetails',
        'partner-abc',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.partnerDetails(null)).toEqual([
        'partnerDetails',
        null,
      ]);
    });
  });

  describe('forumEvents', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.forumEvents()).toEqual(['forumEvents', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.forumEvents({ page: 1, page_size: 10 })).toEqual([
        'forumEvents',
        { page: 1, page_size: 10 },
      ]);
    });
  });

  describe('forumEventDetails', () => {
    it('returns correct key with title', () => {
      expect(apiQueryKeys.forumEventDetails('air-quality-summit')).toEqual([
        'forumEventDetails',
        'air-quality-summit',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.forumEventDetails(null)).toEqual([
        'forumEventDetails',
        null,
      ]);
    });
  });

  describe('forumEventTitles', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.forumEventTitles()).toEqual([
        'forumEventTitles',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.forumEventTitles({ page: 1 })).toEqual([
        'forumEventTitles',
        { page: 1 },
      ]);
    });
  });

  describe('cleanAirResources', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.cleanAirResources()).toEqual([
        'cleanAirResources',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.cleanAirResources({ page: 1, page_size: 5 })).toEqual(
        ['cleanAirResources', { page: 1, page_size: 5 }],
      );
    });
  });

  describe('africanCountries', () => {
    it('returns correct key', () => {
      expect(apiQueryKeys.africanCountries()).toEqual(['africanCountries']);
    });
  });

  describe('africanCountryDetail', () => {
    it('returns correct key with country id', () => {
      expect(apiQueryKeys.africanCountryDetail(42)).toEqual([
        'africanCountryDetail',
        42,
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.africanCountryDetail(null)).toEqual([
        'africanCountryDetail',
        null,
      ]);
    });
  });

  describe('faqs', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.faqs()).toEqual(['faqs', undefined]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.faqs({ page: 1, page_size: 20 })).toEqual([
        'faqs',
        { page: 1, page_size: 20 },
      ]);
    });
  });

  describe('gridsSummaryExternal', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.gridsSummaryExternal()).toEqual([
        'gridsSummaryExternal',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(
        apiQueryKeys.gridsSummaryExternal({
          limit: 50,
          skip: 0,
          page: 1,
          tenant: 'airqo',
          detailLevel: 'full',
          search: 'kampala',
          admin_level: '1',
        }),
      ).toEqual([
        'gridsSummaryExternal',
        {
          limit: 50,
          skip: 0,
          page: 1,
          tenant: 'airqo',
          detailLevel: 'full',
          search: 'kampala',
          admin_level: '1',
        },
      ]);
    });

    it('filters out undefined values', () => {
      expect(
        apiQueryKeys.gridsSummaryExternal({
          limit: 10,
          search: undefined,
          tenant: undefined,
        }),
      ).toEqual(['gridsSummaryExternal', { limit: 10 }]);
    });
  });

  describe('gridsSummaryV2', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.gridsSummaryV2()).toEqual([
        'gridsSummaryV2',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(
        apiQueryKeys.gridsSummaryV2({
          limit: 25,
          skip: 10,
          page: 2,
          search: 'test',
          admin_level: '0',
        }),
      ).toEqual([
        'gridsSummaryV2',
        { limit: 25, skip: 10, page: 2, search: 'test', admin_level: '0' },
      ]);
    });
  });

  describe('countriesData', () => {
    it('returns correct key', () => {
      expect(apiQueryKeys.countriesData()).toEqual(['countriesData']);
    });
  });

  describe('gridsSummary', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.gridsSummary()).toEqual(['gridsSummary', undefined]);
    });

    it('returns correct key with params', () => {
      expect(
        apiQueryKeys.gridsSummary({
          limit: 10,
          skip: 0,
          page: 1,
          admin_level: '2',
          search: 'nairobi',
        }),
      ).toEqual([
        'gridsSummary',
        { limit: 10, skip: 0, page: 1, admin_level: '2', search: 'nairobi' },
      ]);
    });
  });

  describe('networkCoverageSummary', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.networkCoverageSummary()).toEqual([
        'networkCoverageSummary',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(
        apiQueryKeys.networkCoverageSummary({
          tenant: 'airqo',
          search: 'monitor',
          activeOnly: true,
          types: 'outdoor',
          network: 'main',
        }),
      ).toEqual([
        'networkCoverageSummary',
        {
          tenant: 'airqo',
          search: 'monitor',
          activeOnly: true,
          types: 'outdoor',
          network: 'main',
        },
      ]);
    });
  });

  describe('networkCoverageCountryMonitors', () => {
    it('returns correct key with country id and no params', () => {
      expect(apiQueryKeys.networkCoverageCountryMonitors('UG')).toEqual([
        'networkCoverageCountryMonitors',
        'UG',
        undefined,
      ]);
    });

    it('returns correct key with country id and params', () => {
      expect(
        apiQueryKeys.networkCoverageCountryMonitors('KE', {
          tenant: 'airqo',
          activeOnly: true,
          types: 'outdoor',
          network: 'main',
        }),
      ).toEqual([
        'networkCoverageCountryMonitors',
        'KE',
        {
          tenant: 'airqo',
          activeOnly: true,
          types: 'outdoor',
          network: 'main',
        },
      ]);
    });

    it('returns correct key with null country id', () => {
      expect(apiQueryKeys.networkCoverageCountryMonitors(null)).toEqual([
        'networkCoverageCountryMonitors',
        null,
        undefined,
      ]);
    });
  });

  describe('networkCoverageMonitor', () => {
    it('returns correct key with monitor id and no params', () => {
      expect(apiQueryKeys.networkCoverageMonitor('mon-1')).toEqual([
        'networkCoverageMonitor',
        'mon-1',
        undefined,
      ]);
    });

    it('returns correct key with monitor id and params', () => {
      expect(
        apiQueryKeys.networkCoverageMonitor('mon-1', { tenant: 'airqo' }),
      ).toEqual(['networkCoverageMonitor', 'mon-1', { tenant: 'airqo' }]);
    });

    it('returns correct key with null monitor id', () => {
      expect(apiQueryKeys.networkCoverageMonitor(null)).toEqual([
        'networkCoverageMonitor',
        null,
        undefined,
      ]);
    });
  });

  describe('networkCoverageImpact', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.networkCoverageImpact()).toEqual([
        'networkCoverageImpact',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(
        apiQueryKeys.networkCoverageImpact({
          tenant: 'airqo',
          activeOnly: false,
          types: 'indoor',
          network: 'secondary',
        }),
      ).toEqual([
        'networkCoverageImpact',
        {
          tenant: 'airqo',
          activeOnly: false,
          types: 'indoor',
          network: 'secondary',
        },
      ]);
    });
  });

  describe('networkCoverageCities', () => {
    it('returns correct key with no params', () => {
      expect(apiQueryKeys.networkCoverageCities()).toEqual([
        'networkCoverageCities',
        undefined,
      ]);
    });

    it('returns correct key with params', () => {
      expect(apiQueryKeys.networkCoverageCities({ country: 'Uganda' })).toEqual(
        ['networkCoverageCities', { country: 'Uganda' }],
      );
    });
  });

  describe('gridRepresentativeReading', () => {
    it('returns correct key with grid id', () => {
      expect(apiQueryKeys.gridRepresentativeReading('grid-abc')).toEqual([
        'gridRepresentativeReading',
        'grid-abc',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.gridRepresentativeReading(null)).toEqual([
        'gridRepresentativeReading',
        null,
      ]);
    });
  });

  describe('gridMeasurements', () => {
    it('returns correct key with grid id and no params', () => {
      expect(apiQueryKeys.gridMeasurements('grid-1')).toEqual([
        'gridMeasurements',
        'grid-1',
        undefined,
      ]);
    });

    it('returns correct key with grid id and params', () => {
      expect(
        apiQueryKeys.gridMeasurements('grid-1', {
          limit: 100,
          skip: 0,
          page: 1,
          startTime: '2024-01-01',
          endTime: '2024-12-31',
          frequency: 'hourly',
        }),
      ).toEqual([
        'gridMeasurements',
        'grid-1',
        {
          limit: 100,
          skip: 0,
          page: 1,
          startTime: '2024-01-01',
          endTime: '2024-12-31',
          frequency: 'hourly',
        },
      ]);
    });

    it('returns correct key with null grid id', () => {
      expect(apiQueryKeys.gridMeasurements(null)).toEqual([
        'gridMeasurements',
        null,
        undefined,
      ]);
    });

    it('filters out undefined values from params', () => {
      expect(
        apiQueryKeys.gridMeasurements('grid-1', {
          limit: 50,
          startTime: undefined,
          frequency: undefined,
        }),
      ).toEqual(['gridMeasurements', 'grid-1', { limit: 50 }]);
    });
  });

  describe('dailyForecast', () => {
    it('returns correct key with site id', () => {
      expect(apiQueryKeys.dailyForecast('site-99')).toEqual([
        'dailyForecast',
        'site-99',
      ]);
    });

    it('returns correct key with null', () => {
      expect(apiQueryKeys.dailyForecast(null)).toEqual(['dailyForecast', null]);
    });
  });
});

describe('compactParams (tested indirectly)', () => {
  it('returns undefined when all params are undefined', () => {
    expect(
      apiQueryKeys.careers({
        page: undefined,
        page_size: undefined,
      }),
    ).toEqual(['careers', undefined]);
  });

  it('returns undefined for empty object', () => {
    expect(apiQueryKeys.careers({})).toEqual(['careers', undefined]);
  });

  it('keeps falsy values that are not undefined', () => {
    expect(apiQueryKeys.partners({ page: 0, featured: false })).toEqual([
      'partners',
      { page: 0, featured: false },
    ]);
  });

  it('keeps empty string values', () => {
    expect(apiQueryKeys.blogs({ search: '' })).toEqual([
      'blogs',
      { search: '' },
    ]);
  });

  it('keeps null values', () => {
    expect(apiQueryKeys.networkCoverageMonitor('id', { tenant: null })).toEqual(
      ['networkCoverageMonitor', 'id', { tenant: null }],
    );
  });
});
