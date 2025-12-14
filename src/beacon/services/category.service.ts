/**
 * Category Service
 * Handles all category management operations
 */

import axios, { AxiosRequestConfig } from 'axios';
import { config } from '@/lib/config';
import authService from './api-service';
import { 
  Category,
  CategoryWithDevices,
  CategoryCreate,
  CategoryUpdate,
  CategoryListParams
} from '@/types/category.types';

class CategoryService {
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
   * Get auth headers - skip for localhost
   */
  private getAuthHeaders(): Record<string, string> {
    if (config.isLocalhost) {
      return {};
    }
    
    const token = authService.getToken();
    if (token) {
      return { 'Authorization': token };
    }
    return {};
  }

  /**
   * Get axios config with auth headers
   */
  private getAxiosConfig(additionalConfig?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...additionalConfig,
      headers: {
        ...this.getAuthHeaders(),
        ...additionalConfig?.headers,
      },
    };
  }

  /**
   * Get all categories
   */
  async getAllCategories(params?: CategoryListParams): Promise<Category[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

      const endpoint = this.getEndpoint('/categories');
      const url = queryParams.toString() 
        ? `${this.baseUrl}${endpoint}?${queryParams.toString()}`
        : `${this.baseUrl}${endpoint}`;

      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get a specific category by name with devices
   */
  async getCategoryByName(
    categoryName: string, 
    params?: {
      skip?: number;
      limit?: number;
      network?: string;
      search?: string;
    }
  ): Promise<CategoryWithDevices> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.network) queryParams.append('network', params.network);
      if (params?.search) queryParams.append('search', params.search);

      const endpoint = this.getEndpoint(`/categories/${encodeURIComponent(categoryName)}`);
      const url = queryParams.toString() 
        ? `${this.baseUrl}${endpoint}?${queryParams.toString()}`
        : `${this.baseUrl}${endpoint}`;

      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: CategoryCreate): Promise<Category> {
    try {
      const endpoint = this.getEndpoint('/categories');
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryName: string, data: CategoryUpdate): Promise<Category> {
    try {
      const endpoint = this.getEndpoint(`/categories/${encodeURIComponent(categoryName)}`);
      const response = await axios.patch(`${this.baseUrl}${endpoint}`, data, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryName: string): Promise<void> {
    try {
      const endpoint = this.getEndpoint(`/categories/${encodeURIComponent(categoryName)}`);
      await axios.delete(`${this.baseUrl}${endpoint}`, this.getAxiosConfig());
    } catch (error) {
      console.error(`Error deleting category ${categoryName}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
const categoryService = new CategoryService();
export default categoryService;
