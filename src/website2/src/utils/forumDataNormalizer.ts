import { ForumEvent } from '@/types/forum';

export interface NormalizedForumData {
  // Basic event info
  basicInfo: {
    id: number;
    title: string;
    titleSubtext: string;
    uniqueTitle: string;
    eventStatus: string;
    backgroundImageUrl: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    locationName: string;
    locationLink: string;
    registrationLink: string;
  };

  // About page data
  about: {
    introduction: string;
    registrationDetails: string;
    travelDetails: {
      vaccination: string;
      visa: string;
      accommodation: string;
    };
  };

  // Speakers page data
  speakers: {
    speakersTextSection: string;
    persons: any[];
  };

  // Program Committee page data
  committee: {
    committeeTextSection: string;
    committeeMembers: any[];
  };

  // Partners page data
  partners: {
    partnersTextSection: string;
    partnersByCategory: {
      conveningPartners: any[];
      hostPartners: any[];
      programPartners: any[];
      fundingPartners: any[];
      sponsorPartners: any[];
    };
  };

  // Sponsorship page data
  sponsorship: {
    sponsorshipAbout: string;
    sponsorshipSchedule: string;
    sponsorshipPartners: string;
    sponsorshipPackages: string;
    sponsorPartners: any[];
  };

  // Sessions/Program page data
  sessions: {
    scheduleDetails: string;
    programs: any[];
  };

  // Resources page data
  resources: {
    forumResources: any[];
  };

  // Additional sections for custom content
  sections: any[];

  // Glossary page data
  glossary: {
    glossaryDetails: string;
  };
}

export const normalizeForumEventData = (
  event: ForumEvent,
): NormalizedForumData => {
  // Helper function to categorize partners
  const categorizePartners = (partners: any[] = []) => {
    const categories = {
      conveningPartners: [] as any[],
      hostPartners: [] as any[],
      programPartners: [] as any[],
      fundingPartners: [] as any[],
      sponsorPartners: [] as any[],
    };

    partners.forEach((partner) => {
      const category = partner.category?.toLowerCase().replace(/\s+/g, '');
      switch (category) {
        case 'co-conveningpartner':
        case 'conveningpartner':
          categories.conveningPartners.push(partner);
          break;
        case 'hostpartner':
          categories.hostPartners.push(partner);
          break;
        case 'programpartner':
          categories.programPartners.push(partner);
          break;
        case 'fundingpartner':
          categories.fundingPartners.push(partner);
          break;
        case 'sponsorpartner':
          categories.sponsorPartners.push(partner);
          break;
        default:
          // Default to program partners if category is unclear
          categories.programPartners.push(partner);
      }
    });

    return categories;
  };

  // Helper to categorize committee members
  const getCommitteeMembers = (persons: any[] = []) => {
    return persons.filter(
      (person) =>
        person.category?.toLowerCase().includes('committee') ||
        person.category?.toLowerCase().includes('organizer'),
    );
  };

  const partnersByCategory = categorizePartners(event.partners || []);

  return {
    basicInfo: {
      id: event.id,
      title: event.title,
      titleSubtext: event.title_subtext,
      uniqueTitle: event.unique_title,
      eventStatus: (event as any).event_status || 'upcoming',
      backgroundImageUrl: event.background_image_url,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      locationName: event.location_name,
      locationLink: event.location_link,
      registrationLink: event.registration_link,
    },

    about: {
      introduction: event.introduction,
      registrationDetails: event.registration_details,
      travelDetails: {
        vaccination: event.travel_logistics_vaccination_details,
        visa: event.travel_logistics_visa_details,
        accommodation: event.travel_logistics_accommodation_details,
      },
    },

    speakers: {
      speakersTextSection: event.speakers_text_section,
      persons: event.persons || [],
    },

    committee: {
      committeeTextSection: event.committee_text_section,
      committeeMembers: getCommitteeMembers(event.persons || []),
    },

    partners: {
      partnersTextSection: event.partners_text_section,
      partnersByCategory,
    },

    sponsorship: {
      sponsorshipAbout: event.sponsorship_opportunities_about,
      sponsorshipSchedule: event.sponsorship_opportunities_schedule,
      sponsorshipPartners: event.sponsorship_opportunities_partners,
      sponsorshipPackages: event.sponsorship_packages,
      sponsorPartners: partnersByCategory.sponsorPartners,
    },

    sessions: {
      scheduleDetails: event.schedule_details,
      programs: event.programs || [],
    },

    resources: {
      forumResources: event.forum_resources || [],
    },

    sections: event.sections || [],

    glossary: {
      glossaryDetails: event.glossary_details,
    },
  };
};
