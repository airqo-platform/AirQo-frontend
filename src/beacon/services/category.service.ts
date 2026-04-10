/**
 * Category Service
 * Handles all category management operations
 */

import axios, { AxiosRequestConfig } from 'axios';
import { config } from '@/lib/config';
import authService from './api-service';
import { isMockMode, getMockCategories } from '@/lib/mock-data';
import {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryListParams,
  CategoryListResponse
} from '@/types/category.types';

class CategoryService {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;

  constructor() {
    // Use centralized config for API URL
    this.baseUrl = config.beaconApiUrl;
    this.apiPrefix = config.beaconApiPrefix || (config.isLocalhost ? '/api/v1' : '/api/v1/beacon');
  }

  /**
   * Get the appropriate endpoint based on environment
   */
  private getEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiPrefix}${cleanPath}`;
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
  async getAllCategories(params?: CategoryListParams): Promise<CategoryListResponse> {
    if (isMockMode()) return getMockCategories() as any

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.page_size !== undefined) queryParams.append('page_size', params.page_size.toString());
      if (params?.name) queryParams.append('name', params.name);

      const endpoint = this.getEndpoint('/categories/');
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
   * Get a specific category by name
   */
  async getCategoryByName(categoryName: string): Promise<Category> {
    if (isMockMode()) {
      const all = getMockCategories() as any
      return all.categories.find((c: any) => c.name === categoryName) || all.categories[0]
    }

    try {
      const endpoint = this.getEndpoint(`/categories/${encodeURIComponent(categoryName)}`);
      const url = `${this.baseUrl}${endpoint}`;

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
