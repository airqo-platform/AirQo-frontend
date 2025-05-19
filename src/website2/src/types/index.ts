export interface PressArticle {
  id: number;
  article_title: string;
  article_intro: string;
  article_link: string;
  date_published: string;
  publisher_logo: string;
  publisher_logo_url: string;
  website_category: string;
  article_tag: string;
}

export interface Resource {
  id: number;
  resource_file_url: string;
  created: string;
  modified: string;
  is_deleted: boolean;
  resource_title: string;
  title?: string; // Alternative title field
  resource_link: string | null;
  link?: string | null; // Alternative link field
  resource_file: string;
  author_title: string;
  resource_category:
    | 'workshop_report'
    | 'technical_report'
    | 'toolkit'
    | 'research_publication';
  resource_authors: string;
  authors?: string; // Alternative authors field
  description?: string; // Optional description field
  order: number;
}

export type ResourceCategory = Resource['resource_category'];
