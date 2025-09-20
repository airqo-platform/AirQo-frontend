export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  total_pages: number;
  current_page: number;
  results: T[];
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}

export interface BoardMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image?: string;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  title: string;
  // department may sometimes be returned as an object (id/name) or as a string in some endpoints
  department?: { id?: string; name?: string } | string;
  location?: string;
  type?: string;
  // Short description (legacy)
  description?: string;
  // Detailed descriptions returned by v2 detail endpoints
  descriptions?: Array<{ id: number; description: string }>;
  // Structured bullet sections used by detail responses
  bullets?: Array<{
    id?: number;
    name?: string;
    bullet_points?: Array<{ id?: number; point?: string }>;
  }>;
  // Requirements may be either an array of strings or a rich structure in some responses
  requirements?: string[];
  // Public identifier for friendly URLs
  public_identifier?: string;
  // External/apply URL for the job posting
  apply_url?: string;
  // Closing date for the job (ISO string)
  closing_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  image?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Extended event shape returned by v2 API (some fields optional)
export interface EventV2 extends Event {
  public_identifier?: string;
  api_url?: string;
  event_tag?: string;
  title_subtext?: string;
  start_time?: string; // e.g. '09:00:00'
  end_time?: string; // e.g. '17:00:00'
  event_image_url?: string;
  background_image_url?: string;
  event_details?: string; // quill delta JSON string or HTML
  location_name?: string;
  registration_link?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  answer_html: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  // id may be numeric or a string (public_identifier). Keep flexible.
  id: string | number;
  // public identifier used for friendly URLs (e.g. 'partner-name')
  public_identifier?: string;
  // display name
  partner_name?: string;
  // possible partner logo and image fields returned by v2 API
  partner_logo?: string;
  partner_logo_url?: string;
  partner_image_url?: string;
  // legacy fields
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  // classification/category info
  website_category?: string;
  category?: string;
  type?: string;
  // descriptions array (v2 detail response)
  descriptions?: Array<{ id: number; description: string }>;
  is_active?: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Press {
  id: string;
  title: string;
  publication: string;
  date: string;
  url: string;
  excerpt?: string;
  image?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CleanAirResource {
  id: string;
  title: string;
  description: string;
  type: string;
  file_url?: string;
  external_url?: string;
  thumbnail?: string;
  tags: string[];
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ImpactNumber {
  id: string;
  metric: string;
  value: number;
  unit: string;
  description: string;
  icon?: string;
  order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumEvent {
  id: number;
  title: string;
  title_subtext?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location_name?: string;
  location_link?: string;
  registration_link?: string;
  unique_title: string;
  background_image_url?: string;
  event_status: 'upcoming' | 'past' | 'ongoing';
  order: number;
  created: string;
  modified: string;
}

export interface ForumEventDetail extends ForumEvent {
  introduction?: string; // Quill delta JSON
  speakers_text_section?: string; // Quill delta JSON
  committee_text_section?: string; // Quill delta JSON
  partners_text_section?: string; // Quill delta JSON
  schedule_details?: string; // Quill delta JSON
  registration_details?: string; // Quill delta JSON
  sponsorship_opportunities_about?: string; // Quill delta JSON
  sponsorship_opportunities_schedule?: string; // Quill delta JSON
  sponsorship_opportunities_partners?: string; // Quill delta JSON
  sponsorship_packages?: string; // Quill delta JSON
  travel_logistics_vaccination_details?: string; // Quill delta JSON
  travel_logistics_visa_details?: string; // Quill delta JSON
  travel_logistics_accommodation_details?: string; // Quill delta JSON
  glossary_details?: string; // Quill delta JSON
  is_deleted?: boolean;
}

// African Countries interfaces
export interface CityContentDescription {
  id: number;
  paragraph: string;
  order: number;
}

export interface CityContentImage {
  id: number;
  image_url: string;
  order: number;
}

export interface CityContent {
  id: number;
  title: string;
  order: number;
  description: CityContentDescription[];
  image: CityContentImage[];
}

export interface City {
  id: number;
  city_name: string;
  order: number;
  content: CityContent[];
}

export interface AfricanCountry {
  id: number;
  country_name: string;
  country_flag_url: string;
  cities_count: number;
  order: number;
  created: string;
  modified: string;
}

export interface AfricanCountryDetail extends AfricanCountry {
  city: City[];
}
