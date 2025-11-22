/**
 * Category Service
 * Handles all category management operations
 */

import axios from 'axios';
import { 
  Category,
  CategoryWithDevices,
  CategoryCreate,
  CategoryUpdate,
  CategoryListParams
} from '@/types/category.types';

class CategoryService {
  private baseUrl: string;

  constructor() {
    // Use the beacon API base URL from environment or default
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Get all categories
   */
  async getAllCategories(params?: CategoryListParams): Promise<Category[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

      const url = queryParams.toString() 
        ? `${this.baseUrl}/categories?${queryParams.toString()}`
        : `${this.baseUrl}/categories`;

      const response = await axios.get(url);
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

      const url = queryParams.toString() 
        ? `${this.baseUrl}/categories/${encodeURIComponent(categoryName)}?${queryParams.toString()}`
        : `${this.baseUrl}/categories/${encodeURIComponent(categoryName)}`;

      const response = await axios.get(url);
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
      const response = await axios.post(`${this.baseUrl}/categories`, data);
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
      const response = await axios.patch(`${this.baseUrl}/categories/${encodeURIComponent(categoryName)}`, data);
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
      await axios.delete(`${this.baseUrl}/categories/${encodeURIComponent(categoryName)}`);
    } catch (error) {
      console.error(`Error deleting category ${categoryName}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
const categoryService = new CategoryService();
export default categoryService;
