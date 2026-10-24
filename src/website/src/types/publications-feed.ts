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

export interface LivePublicationsResponse {
  results: LivePublication[];
  count: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  updatedAt: string;
  providers: PublicationFeedProvider[];
}
