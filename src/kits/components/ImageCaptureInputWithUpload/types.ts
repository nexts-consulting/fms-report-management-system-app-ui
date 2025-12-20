/**
 * Cloud Provider Configuration Types
 * 
 * This file defines the types for different cloud storage providers
 * that can be used with ImageCaptureInputWithUpload component.
 */

export type CloudProvider = "firebase" | "gcp" | "s3" | "custom";

/**
 * Base configuration for all cloud providers
 */
export interface BaseCloudConfig {
  provider: CloudProvider;
  /**
   * Base path/folder in the storage bucket where images will be uploaded
   * @example "images/uploads" or "users/{userId}/photos"
   */
  path?: string;
  /**
   * Function to generate unique filename for uploaded image
   * If not provided, a default UUID-based filename will be used
   */
  generateFileName?: (file: File) => string;
  /**
   * Maximum file size in bytes (default: 10MB)
   */
  maxFileSize?: number;
  /**
   * Allowed MIME types (default: ["image/jpeg", "image/png", "image/webp"])
   */
  allowedMimeTypes?: string[];
}

/**
 * Firebase Storage Configuration
 */
export interface FirebaseConfig extends BaseCloudConfig {
  provider: "firebase";
  /**
   * Firebase Storage instance (from firebase/storage)
   * If not provided, will use the default Firebase service instance
   */
  storage?: any;
  /**
   * Storage bucket name (optional, uses default if not provided)
   */
  bucket?: string;
}

/**
 * Google Cloud Platform (GCP) Storage Configuration
 */
export interface GCPConfig extends BaseCloudConfig {
  provider: "gcp";
  /**
   * GCP Storage bucket name
   */
  bucket: string;
  /**
   * GCP project ID
   */
  projectId: string;
  /**
   * Service account credentials or access token
   * Can be a JSON object or a function that returns credentials
   */
  credentials?: any | (() => Promise<any>);
  /**
   * GCP Storage API endpoint (optional, uses default)
   */
  apiEndpoint?: string;
}

/**
 * AWS S3 Configuration
 */
export interface S3Config extends BaseCloudConfig {
  provider: "s3";
  /**
   * S3 bucket name
   */
  bucket: string;
  /**
   * AWS region (e.g., "us-east-1")
   */
  region: string;
  /**
   * AWS access key ID
   */
  accessKeyId: string;
  /**
   * AWS secret access key
   */
  secretAccessKey: string;
  /**
   * Optional: S3 endpoint URL (for S3-compatible services like MinIO)
   */
  endpoint?: string;
  /**
   * Optional: Enable public read access (default: false)
   */
  publicRead?: boolean;
}

/**
 * Custom upload function configuration
 * Allows you to provide your own upload implementation
 */
export interface CustomConfig extends BaseCloudConfig {
  provider: "custom";
  /**
   * Custom upload function that takes a File and returns a Promise<string> (URL)
   */
  uploadFunction: (file: File, config: CustomConfig) => Promise<string>;
}

/**
 * Union type for all cloud configurations
 */
export type CloudConfig = FirebaseConfig | GCPConfig | S3Config | CustomConfig;

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}
