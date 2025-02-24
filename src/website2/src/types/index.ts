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
  resource_link: string | null;
  resource_file: string;
  author_title: string;
  resource_category:
    | 'workshop_report'
    | 'technical_report'
    | 'toolkit'
    | 'research_publication';
  resource_authors: string;
  order: number;
}

export type ResourceCategory = Resource['resource_category'];
