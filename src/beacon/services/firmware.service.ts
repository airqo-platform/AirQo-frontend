/**
 * Firmware Service
 * Handles all firmware management operations
 */

import axios from 'axios';
import { 
  FirmwareVersion, 
  FirmwareUploadData, 
  FirmwareUpdateData,
  FirmwareListParams,
  FirmwareDownloadParams,
  FirmwareType 
} from '@/types/firmware.types';

class FirmwareService {
  private baseUrl: string;

  constructor() {
    // Use the beacon API base URL from environment or default
    this.baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:8000';
  }

  /**
   * Get all firmware versions
   */
  async getAllFirmwares(params?: FirmwareListParams): Promise<FirmwareVersion[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.firmware_type) queryParams.append('firmware_type', params.firmware_type);

      const response = await axios.get(`${this.baseUrl}/firmware?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching firmware versions:', error);
      throw error;
    }
  }

  /**
   * Get the latest firmware version
   */
  async getLatestFirmware(firmware_type?: FirmwareType): Promise<FirmwareVersion> {
    try {
      const queryParams = firmware_type ? `?firmware_type=${firmware_type}` : '';
      const response = await axios.get(`${this.baseUrl}/firmware/latest${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest firmware:', error);
      throw error;
    }
  }

  /**
   * Get specific firmware by ID
   */
  async getFirmwareById(firmwareId: string): Promise<FirmwareVersion> {
    try {
      const response = await axios.get(`${this.baseUrl}/firmware/${firmwareId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching firmware by ID:', error);
      throw error;
    }
  }

  /**
   * Upload new firmware
   */
  async uploadFirmware(data: FirmwareUploadData): Promise<FirmwareVersion> {
    try {
      const formData = new FormData();
      formData.append('firmware_version', data.firmware_version);
      formData.append('firmware_type', data.firmware_type);
      formData.append('description', data.description);
      formData.append('firmware_file', data.firmware_file);

      if (data.firmware_bootloader) {
        formData.append('firmware_bootloader', data.firmware_bootloader);
      }

      // Add changelog entries
      for (let i = 1; i <= 10; i++) {
        const changeKey = `change${i}` as keyof FirmwareUploadData;
        if (data[changeKey]) {
          formData.append(changeKey, data[changeKey] as string);
        }
      }

      const response = await axios.post(`${this.baseUrl}/firmware/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading firmware:', error);
      throw error;
    }
  }

  /**
   * Update firmware metadata
   */
  async updateFirmware(firmwareId: string, data: FirmwareUpdateData): Promise<FirmwareVersion> {
    try {
      const response = await axios.patch(`${this.baseUrl}/firmware/${firmwareId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating firmware:', error);
      throw error;
    }
  }

  /**
   * Download firmware file
   */
  async downloadFirmware(params: FirmwareDownloadParams): Promise<Blob> {
    try {
      let url: string;
      
      if (params.firmware_id) {
        url = `${this.baseUrl}/firmware/${params.firmware_id}/download/${params.file_type}`;
      } else if (params.firmware_version) {
        url = `${this.baseUrl}/firmware/download?firmware_version=${params.firmware_version}&file_type=${params.file_type}`;
      } else {
        throw new Error('Either firmware_id or firmware_version must be provided');
      }

      const response = await axios.get(url, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading firmware:', error);
      throw error;
    }
  }

  /**
   * Helper function to trigger file download in browser
   */
  triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) return 'N/A';
    
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  /**
   * Get firmware type badge color
   */
  getFirmwareTypeBadgeColor(type?: string | null): string {
    if (!type) return 'bg-gray-500';
    
    switch (type.toLowerCase()) {
      case 'stable':
        return 'bg-green-500';
      case 'beta':
        return 'bg-blue-500';
      case 'deprecated':
        return 'bg-orange-500';
      case 'legacy':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
}

// Export singleton instance
export const firmwareService = new FirmwareService();
export default firmwareService;
