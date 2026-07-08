import { ForumEvent } from '@/types/forum';

import { normalizeForumEventData } from '../forumDataNormalizer';

const createBaseEvent = (overrides: Partial<ForumEvent> = {}): ForumEvent => ({
  id: 1,
  title: 'AirQo Forum 2025',
  unique_title: 'airqo-forum-2025',
  title_subtext: 'Annual Conference',
  start_date: '2025-06-15',
  end_date: '2025-06-17',
  start_time: '09:00',
  end_time: '17:00',
  introduction: 'Welcome to the forum',
  speakers_text_section: 'Our speakers',
  committee_text_section: 'Committee info',
  partners_text_section: 'Our partners',
  registration_link: 'https://register.airqo.events',
  schedule_details: 'Schedule here',
  registration_details: 'Register now',
  sponsorship_opportunities_about: 'Sponsorship info',
  sponsorship_opportunities_schedule: 'Sponsor schedule',
  sponsorship_opportunities_partners: 'Sponsor partners',
  sponsorship_packages: 'Packages info',
  travel_logistics_vaccination_details: 'Vaccination info',
  travel_logistics_visa_details: 'Visa info',
  travel_logistics_accommodation_details: 'Accommodation info',
  glossary_details: 'Glossary info',
  background_image_url: 'https://example.com/bg.jpg',
  background_image: 'bg.jpg',
  location_name: 'Kampala Serena Hotel',
  location_link: 'https://maps.example.com',
  ...overrides,
});

describe('forumDataNormalizer', () => {
  describe('normalizeForumEventData', () => {
    it('normalizes basic event info correctly', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);

      expect(result.basicInfo.id).toBe(1);
      expect(result.basicInfo.title).toBe('AirQo Forum 2025');
      expect(result.basicInfo.uniqueTitle).toBe('airqo-forum-2025');
      expect(result.basicInfo.titleSubtext).toBe('Annual Conference');
      expect(result.basicInfo.startDate).toBe('2025-06-15');
      expect(result.basicInfo.endDate).toBe('2025-06-17');
      expect(result.basicInfo.startTime).toBe('09:00');
      expect(result.basicInfo.endTime).toBe('17:00');
      expect(result.basicInfo.locationName).toBe('Kampala Serena Hotel');
      expect(result.basicInfo.backgroundImageUrl).toBe(
        'https://example.com/bg.jpg',
      );
    });

    it('defaults event_status to upcoming', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.basicInfo.eventStatus).toBe('upcoming');
    });

    it('uses event_status when present', () => {
      const event = createBaseEvent() as any;
      event.event_status = 'ongoing';
      const result = normalizeForumEventData(event);
      expect(result.basicInfo.eventStatus).toBe('ongoing');
    });

    it('normalizes about section', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);

      expect(result.about.introduction).toBe('Welcome to the forum');
      expect(result.about.registrationDetails).toBe('Register now');
      expect(result.about.travelDetails.vaccination).toBe('Vaccination info');
      expect(result.about.travelDetails.visa).toBe('Visa info');
      expect(result.about.travelDetails.accommodation).toBe(
        'Accommodation info',
      );
    });

    it('normalizes speakers section', () => {
      const persons = [
        { name: 'Speaker 1', category: 'speaker' },
        { name: 'Speaker 2', category: 'speaker' },
      ];
      const event = createBaseEvent({ persons });
      const result = normalizeForumEventData(event);

      expect(result.speakers.speakersTextSection).toBe('Our speakers');
      expect(result.speakers.persons).toEqual(persons);
    });

    it('defaults persons to empty array', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.speakers.persons).toEqual([]);
    });

    it('extracts committee members correctly', () => {
      const persons = [
        { name: 'Speaker 1', category: 'speaker' },
        { name: 'Committee Member', category: 'committee' },
        { name: 'Organizer', category: 'organizer' },
        { name: 'Another Speaker', category: 'Speaker' },
      ];
      const event = createBaseEvent({ persons });
      const result = normalizeForumEventData(event);

      expect(result.committee.committeeMembers).toHaveLength(2);
      expect(result.committee.committeeMembers[0].name).toBe(
        'Committee Member',
      );
      expect(result.committee.committeeMembers[1].name).toBe('Organizer');
    });

    it('defaults committee members to empty array when no matches', () => {
      const persons = [{ name: 'Speaker', category: 'speaker' }];
      const event = createBaseEvent({ persons });
      const result = normalizeForumEventData(event);
      expect(result.committee.committeeMembers).toEqual([]);
    });

    it('categorizes partners by type', () => {
      const partners = [
        { name: 'Conv Partner', category: 'conveningpartner' },
        { name: 'Co-Conv Partner', category: 'co-conveningpartner' },
        { name: 'Host Partner', category: 'hostpartner' },
        { name: 'Program Partner', category: 'programpartner' },
        { name: 'Funding Partner', category: 'fundingpartner' },
        { name: 'Sponsor Partner', category: 'sponsorpartner' },
      ];
      const event = createBaseEvent({ partners });
      const result = normalizeForumEventData(event);

      expect(result.partners.partnersByCategory.conveningPartners).toHaveLength(
        2,
      );
      expect(result.partners.partnersByCategory.hostPartners).toHaveLength(1);
      expect(result.partners.partnersByCategory.programPartners).toHaveLength(
        1,
      );
      expect(result.partners.partnersByCategory.fundingPartners).toHaveLength(
        1,
      );
      expect(result.partners.partnersByCategory.sponsorPartners).toHaveLength(
        1,
      );
    });

    it('defaults unknown partner category to programPartners', () => {
      const partners = [{ name: 'Mystery Partner', category: 'unknown' }];
      const event = createBaseEvent({ partners });
      const result = normalizeForumEventData(event);
      expect(result.partners.partnersByCategory.programPartners).toHaveLength(
        1,
      );
    });

    it('handles missing partners array', () => {
      const event = createBaseEvent({ partners: undefined });
      const result = normalizeForumEventData(event);
      expect(result.partners.partnersByCategory.conveningPartners).toEqual([]);
      expect(result.partners.partnersByCategory.hostPartners).toEqual([]);
      expect(result.partners.partnersByCategory.programPartners).toEqual([]);
      expect(result.partners.partnersByCategory.fundingPartners).toEqual([]);
      expect(result.partners.partnersByCategory.sponsorPartners).toEqual([]);
    });

    it('handles empty partners array', () => {
      const event = createBaseEvent({ partners: [] });
      const result = normalizeForumEventData(event);
      expect(result.partners.partnersByCategory.conveningPartners).toEqual([]);
    });

    it('normalizes sponsorship section', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);

      expect(result.sponsorship.sponsorshipAbout).toBe('Sponsorship info');
      expect(result.sponsorship.sponsorshipSchedule).toBe('Sponsor schedule');
      expect(result.sponsorship.sponsorshipPartners).toBe('Sponsor partners');
      expect(result.sponsorship.sponsorshipPackages).toBe('Packages info');
    });

    it('populates sponsorPartners from partners', () => {
      const partners = [{ name: 'Gold Sponsors', category: 'sponsorpartner' }];
      const event = createBaseEvent({ partners });
      const result = normalizeForumEventData(event);
      expect(result.sponsorship.sponsorPartners).toHaveLength(1);
      expect(result.sponsorship.sponsorPartners[0].name).toBe('Gold Sponsors');
    });

    it('normalizes sessions section', () => {
      const programs = [{ name: 'Program 1' }, { name: 'Program 2' }];
      const event = createBaseEvent({ programs });
      const result = normalizeForumEventData(event);

      expect(result.sessions.scheduleDetails).toBe('Schedule here');
      expect(result.sessions.programs).toEqual(programs);
    });

    it('defaults programs to empty array', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.sessions.programs).toEqual([]);
    });

    it('normalizes resources section', () => {
      const forum_resources = [{ name: 'Resource 1' }];
      const event = createBaseEvent({ forum_resources });
      const result = normalizeForumEventData(event);
      expect(result.resources.forumResources).toEqual(forum_resources);
    });

    it('normalizes sections', () => {
      const sections = [{ title: 'Section 1' }];
      const event = createBaseEvent({ sections });
      const result = normalizeForumEventData(event);
      expect(result.sections).toEqual(sections);
    });

    it('defaults sections to empty array', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.sections).toEqual([]);
    });

    it('normalizes glossary section', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.glossary.glossaryDetails).toBe('Glossary info');
    });

    it('normalizes supports section', () => {
      const supports = [{ name: 'Support 1' }];
      const event = createBaseEvent({ supports });
      const result = normalizeForumEventData(event);
      expect(result.supports).toEqual(supports);
    });

    it('defaults supports to empty array', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.supports).toEqual([]);
    });

    it('normalizes engagement section', () => {
      const engagement = {
        title: 'Engagement',
        objectives: [{ text: 'Obj 1' }],
      };
      const event = createBaseEvent({ engagement });
      const result = normalizeForumEventData(event);
      expect(result.engagement).toEqual(engagement);
    });

    it('defaults engagement to null', () => {
      const event = createBaseEvent();
      const result = normalizeForumEventData(event);
      expect(result.engagement).toBeNull();
    });

    it('handles partner category case insensitivity', () => {
      const partners = [{ name: 'Partner', category: 'ConveningPartner' }];
      const event = createBaseEvent({ partners });
      const result = normalizeForumEventData(event);
      expect(result.partners.partnersByCategory.conveningPartners).toHaveLength(
        1,
      );
    });

    it('handles partner category with spaces', () => {
      const partners = [{ name: 'Partner', category: 'convening  partner' }];
      const event = createBaseEvent({ partners });
      const result = normalizeForumEventData(event);
      expect(result.partners.partnersByCategory.conveningPartners).toHaveLength(
        1,
      );
    });
  });
});
