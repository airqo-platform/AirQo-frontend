/**
 * Stock Service
 * Handles all stock management operations
 */

import axios from 'axios';
import { config } from '@/lib/config';
import { 
  ItemsStock,
  ItemsStockCreate,
  ItemsStockUpdate,
  ItemsStockResponse,
  ItemsStockListParams,
  ItemsStockWithHistory
} from '@/types/stock.types';

class StockService {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;

  constructor() {
    // Use centralized config for API URL
    this.baseUrl = config.beaconApiUrl;
    this.apiPrefix = config.apiPrefix || '/api/v1';
  }

  /**
   * Get the appropriate endpoint based on environment
   */
  private getEndpoint(path: string): string {
    return config.isLocalhost ? path : `${this.apiPrefix}/beacon${path}`;
  }

  /**
   * Get all stock items
   */
  async getAllItems(params?: ItemsStockListParams): Promise<ItemsStockResponse | ItemsStock[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.page_size !== undefined) {
        // Ensure page_size doesn't exceed the maximum of 100
        const pageSize = Math.min(params.page_size, 100);
        queryParams.append('page_size', pageSize.toString());
      }
      if (params?.item_id) queryParams.append('item_id', params.item_id);
      if (params?.name) queryParams.append('name', params.name);
      if (params?.unit) queryParams.append('unit', params.unit);
      if (params?.unit_filter) queryParams.append('unit_filter', params.unit_filter);
      if (params?.min_stock !== undefined) queryParams.append('min_stock', params.min_stock.toString());
      if (params?.max_stock !== undefined) queryParams.append('max_stock', params.max_stock.toString());
      if (params?.low_stock_threshold !== undefined) queryParams.append('low_stock_threshold', params.low_stock_threshold.toString());
      if (params?.return_list !== undefined) queryParams.append('return_list', params.return_list.toString());

      const endpoint = this.getEndpoint('/items-stock');
      const url = queryParams.toString() 
        ? `${this.baseUrl}${endpoint}?${queryParams.toString()}`
        : `${this.baseUrl}${endpoint}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
  }

  /**
   * Get a specific stock item by ID with history
   */
  async getItemById(itemId: string, historyLimit: number = 50): Promise<ItemsStockWithHistory> {
    try {
      const endpoint = this.getEndpoint(`/items-stock/${itemId}`);
      const response = await axios.get(
        `${this.baseUrl}${endpoint}?history_limit=${historyLimit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new stock item
   */
  async createItem(data: ItemsStockCreate): Promise<ItemsStock> {
    try {
      const endpoint = this.getEndpoint('/items-stock');
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating stock item:', error);
      throw error;
    }
  }

  /**
   * Update an existing stock item
   */
  async updateItem(itemId: string, data: ItemsStockUpdate): Promise<ItemsStock> {
    try {
      const endpoint = this.getEndpoint(`/items-stock/${itemId}`);
      const response = await axios.put(`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating stock item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold: number = 10): Promise<ItemsStockResponse> {
    try {
      const endpoint = this.getEndpoint('/items-stock');
      const response = await axios.get(
        `${this.baseUrl}${endpoint}?low_stock_threshold=${threshold}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }
}

// Export singleton instance
const stockService = new StockService();
export default stockService;
