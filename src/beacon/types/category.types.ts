/**
 * Category Type Definitions
 */

export interface CategoryBase {
  name: string;
  description?: string | null;
  level?: string | null;
}

export interface Category extends CategoryBase {
  created_at: string;
  updated_at?: string | null;
  // Dynamic fields
  field1?: string | null;
  field2?: string | null;
  field3?: string | null;
  field4?: string | null;
  field5?: string | null;
  field6?: string | null;
  field7?: string | null;
  field8?: string | null;
  field9?: string | null;
  field10?: string | null;
  field11?: string | null;
  field12?: string | null;
  field13?: string | null;
  field14?: string | null;
  field15?: string | null;
  // Config fields
  config1?: string | null;
  config2?: string | null;
  config3?: string | null;
  config4?: string | null;
  config5?: string | null;
  config6?: string | null;
  config7?: string | null;
  config8?: string | null;
  config9?: string | null;
  config10?: string | null;
  // Metadata fields
  metadata1?: string | null;
  metadata2?: string | null;
  metadata3?: string | null;
  metadata4?: string | null;
  metadata5?: string | null;
  metadata6?: string | null;
  metadata7?: string | null;
  metadata8?: string | null;
  metadata9?: string | null;
  metadata10?: string | null;
  metadata11?: string | null;
  metadata12?: string | null;
  metadata13?: string | null;
  metadata14?: string | null;
  metadata15?: string | null;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
  level?: string | null;
  // Dynamic fields
  field1?: string | null;
  field2?: string | null;
  field3?: string | null;
  field4?: string | null;
  field5?: string | null;
  field6?: string | null;
  field7?: string | null;
  field8?: string | null;
  field9?: string | null;
  field10?: string | null;
  field11?: string | null;
  field12?: string | null;
  field13?: string | null;
  field14?: string | null;
  field15?: string | null;
  // Config fields
  config1?: string | null;
  config2?: string | null;
  config3?: string | null;
  config4?: string | null;
  config5?: string | null;
  config6?: string | null;
  config7?: string | null;
  config8?: string | null;
  config9?: string | null;
  config10?: string | null;
  // Metadata fields
  metadata1?: string | null;
  metadata2?: string | null;
  metadata3?: string | null;
  metadata4?: string | null;
  metadata5?: string | null;
  metadata6?: string | null;
  metadata7?: string | null;
  metadata8?: string | null;
  metadata9?: string | null;
  metadata10?: string | null;
  metadata11?: string | null;
  metadata12?: string | null;
  metadata13?: string | null;
  metadata14?: string | null;
  metadata15?: string | null;
}

export interface CategoryUpdate extends CategoryCreate { }

export interface CategoryListParams {
  page?: number;
  page_size?: number;
  name?: string;
}
