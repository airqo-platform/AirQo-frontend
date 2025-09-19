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
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
