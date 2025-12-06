// Firmware Management Types

export enum FirmwareType {
  STABLE = "stable",
  BETA = "beta",
  DEPRECATED = "deprecated",
  LEGACY = "legacy"
}

export interface FirmwareVersion {
  id: string; // UUID
  firmware_version: string;
  firmware_string: string;
  firmware_string_hex?: string | null;
  firmware_string_bootloader?: string | null;
  firmware_type?: FirmwareType | null;
  description?: string | null;
  crc32?: string | null;
  firmware_bin_size?: number | null;
  change1?: string | null;
  change2?: string | null;
  change3?: string | null;
  change4?: string | null;
  change5?: string | null;
  change6?: string | null;
  change7?: string | null;
  change8?: string | null;
  change9?: string | null;
  change10?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface FirmwareUploadData {
  firmware_version: string;
  firmware_type: FirmwareType;
  description: string;
  firmware_file: File;
  firmware_bootloader?: File | null;
  change1?: string;
  change2?: string;
  change3?: string;
  change4?: string;
  change5?: string;
  change6?: string;
  change7?: string;
  change8?: string;
  change9?: string;
  change10?: string;
}

export interface FirmwareUpdateData {
  firmware_type?: FirmwareType;
  description?: string;
}

export interface FirmwareListParams {
  skip?: number;
  limit?: number;
  firmware_type?: FirmwareType;
}

export interface FirmwareDownloadParams {
  firmware_id?: string;
  firmware_version?: string;
  file_type: 'bin' | 'hex' | 'bootloader';
}
