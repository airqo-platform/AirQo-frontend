export type PublicationFeedProvider = 'openalex' | 'crossref';

export interface LivePublication {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  journal?: string;
  year?: number;
  publishedDate?: string;
  doi?: string;
  url: string;
  openAccessUrl?: string;
  source: PublicationFeedProvider;
  sourceLabel: string;
  sourceRecordUrl: string;
  isOpenAccess?: boolean;
}

export interface LivePublicationMetadataOverride {
  external_identifier: string;
  authors: string[];
  journal?: string | null;
}

export interface LivePublicationFeedSettings {
  enabled: boolean;
  openalex_author_ids: string[];
  allowed_affiliations: string[];
  relevance_keywords: string[];
  relevance_required: boolean;
  openalex_api_url: string;
  crossref_api_url: string;
  crossref_mailto: string;
  updated_at: string;
}

export interface LivePublicationsResponse {
  enabled: boolean;
  results: LivePublication[];
  count: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  updatedAt: string;
  providers: PublicationFeedProvider[];
  degraded?: boolean;
}
