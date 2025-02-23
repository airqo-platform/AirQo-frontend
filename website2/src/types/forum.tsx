export interface ForumEvent {
  id: number;
  title: string;
  unique_title: string;
  title_subtext: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  introduction: string;
  speakers_text_section: string;
  committee_text_section: string;
  partners_text_section: string;
  registration_link: string;
  schedule_details: string;
  registration_details: string;
  sponsorship_opportunities_about: string;
  sponsorship_opportunities_schedule: string;
  sponsorship_opportunities_partners: string;
  sponsorship_packages: string;
  travel_logistics_vaccination_details: string;
  travel_logistics_visa_details: string;
  travel_logistics_accommodation_details: string;
  glossary_details: string;
  background_image_url: string;
  background_image: string;
  location_name: string;
  location_link: string;
  sections?: any[]; // refine if you have a dedicated type
  partners?: any[];
  forum_resources?: any[];
  engagement?: any;
  programs?: any[];
  persons?: any[];
}

export interface ForumTitlesResponse {
  count: number;
  forum_events: ForumEvent[];
}
