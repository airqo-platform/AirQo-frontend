/**
 * Stock Type Definitions
 */

export interface ItemsStockBase {
  name: string;
  stock: number;
  unit: string;
}

export interface ItemsStock extends ItemsStockBase {
  id: string;
  created_date: string;
  updated_at: string;
  change?: number | null;
  last_stocked_at?: string | null;
  last_stock_addition?: number | null;
  stock_after_last_addition?: number | null;
}

export interface ItemsStockCreate extends ItemsStockBase {}

export interface ItemsStockUpdate {
  name?: string;
  stock?: number;
  unit?: string;
}

export interface ItemsStockResponse {
  items: ItemsStock[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface ItemsStockListParams {
  page?: number;
  page_size?: number;
  item_id?: string;
  name?: string;
  unit?: string;
  unit_filter?: string;
  min_stock?: number;
  max_stock?: number;
  low_stock_threshold?: number;
  return_list?: boolean;
}

export enum ChangeType {
  INSERT = "INSERT",
  STOCK_IN = "STOCK_IN",
  STOCK_OUT = "STOCK_OUT",
  UNIT_CHANGE = "UNIT_CHANGE",
  DELETE = "DELETE"
}

export interface ItemsStockHistory {
  history_id: string;
  item_id: string;
  old_stock?: number | null;
  new_stock: number;
  old_unit?: string | null;
  new_unit: string;
  change_type: ChangeType;
  changed_at: string;
}

export interface ItemsStockWithHistory extends ItemsStock {
  history: ItemsStockHistory[];
}
