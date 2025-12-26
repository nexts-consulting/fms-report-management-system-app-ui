/**
 * Cloud Upload Service
 * 
 * This service handles file uploads to various cloud storage providers:
 * - Firebase Storage
 * - Google Cloud Platform (GCP) Storage
 * - AWS S3
 * - Custom upload functions
 */

import { nanoid } from "nanoid";
import {
  CloudConfig,
  FirebaseConfig,
  GCPConfig,
  S3Config,
  CustomConfig,
  UploadResult,
  UploadProgressCallback,
} from "../../../kits/components/image-capture-input-upload/types";

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
};

/**
 * Generate a unique filename for the uploaded file
 */
function generateFileName(file: File, config: CloudConfig): string {
  if (config.generateFileName) {
    return config.generateFileName(file);
  }

  const timestamp = Date.now();
  const randomId = nanoid(8);
  const extension = file.name.split(".").pop() || "jpg";
  return `${timestamp}_${randomId}.${extension}`;
}

/**
 * Validate file before upload
 */
function validateFile(file: File, config: CloudConfig): void {
  const maxSize = config.maxFileSize || DEFAULT_CONFIG.maxFileSize;
  const allowedTypes = config.allowedMimeTypes || DEFAULT_CONFIG.allowedMimeTypes;

  if (file.size > maxSize) {
    throw new Error(
      `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    );
  }
}

/**
 * Get full path for the file in storage
 */
function getStoragePath(fileName: string, config: CloudConfig): string {
  const basePath = config.path || "uploads";
  // Remove leading/trailing slashes and normalize
  const normalizedPath = basePath.replace(/^\/+|\/+$/g, "");
  return normalizedPath ? `${normalizedPath}/${fileName}` : fileName;
}

/**
 * Upload file to Firebase Storage
 */
async function uploadToFirebase(
  file: File,
  config: FirebaseConfig,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  try {
    // Dynamic import to avoid bundling Firebase if not used
    const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");

    // Get Firebase storage instance
    let storage = config.storage;
    if (!storage) {
      // Try to use the default Firebase service
      const { firebaseService } = await import("@/services/firebase");
      storage = firebaseService.storage;
    }

    if (!storage) {
      throw new Error("Firebase Storage is not initialized. Please provide a storage instance.");
    }

    const fileName = generateFileName(file, config);
    const storagePath = getStoragePath(fileName, config);
    const storageRef = ref(storage, storagePath);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Track upload progress
    if (onProgress) {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          throw error;
        },
      );
    }

    // Wait for upload to complete
    await uploadTask;

    // Get download URL
    const url = await getDownloadURL(storageRef);

    return {
      url,
      fileName,
      size: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    throw new Error(`Firebase upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload file to GCP Storage
 */
async function uploadToGCP(
  file: File,
  config: GCPConfig,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  try {
    // Note: This is a simplified implementation
    // For production, you may want to use @google-cloud/storage package
    // or implement a server-side endpoint to handle GCP uploads securely

    const fileName = generateFileName(file, config);
    const storagePath = getStoragePath(fileName, config);

    // For client-side GCP upload, you typically need:
    // 1. A signed URL from your backend, or
    // 2. A server endpoint that handles the upload

    // This is a placeholder - implement based on your backend setup
    throw new Error(
      "GCP upload requires backend implementation. Please use a custom upload function or implement a server endpoint.",
    );
  } catch (error) {
    throw new Error(`GCP upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload file to AWS S3
 */
async function uploadToS3(
  file: File,
  config: S3Config,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  try {
    // Note: For production, you should use AWS SDK v3
    // This is a simplified implementation using fetch API
    // For better security, consider using presigned URLs from your backend

    const fileName = generateFileName(file, config);
    const storagePath = getStoragePath(fileName, config);

    // For client-side S3 upload, you typically need:
    // 1. A presigned URL from your backend, or
    // 2. AWS SDK with proper credentials (not recommended for client-side)

    // This is a placeholder - implement based on your backend setup
    throw new Error(
      "S3 upload requires backend implementation. Please use a custom upload function or implement a server endpoint.",
    );
  } catch (error) {
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload file using custom function
 */
async function uploadCustom(
  file: File,
  config: CustomConfig,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  try {
    const url = await config.uploadFunction(file, config);

    // If custom function supports progress, it should handle it internally
    if (onProgress) {
      // Simulate progress for custom uploads
      onProgress(100);
    }

    const fileName = generateFileName(file, config);

    return {
      url,
      fileName,
      size: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    throw new Error(`Custom upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Main upload function that routes to the appropriate provider
 */
export async function uploadFileToCloud(
  file: File,
  config: CloudConfig,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> {
  // Validate file
  validateFile(file, config);

  // Route to appropriate upload handler
  switch (config.provider) {
    case "firebase":
      return uploadToFirebase(file, config as FirebaseConfig, onProgress);
    case "gcp":
      return uploadToGCP(file, config as GCPConfig, onProgress);
    case "s3":
      return uploadToS3(file, config as S3Config, onProgress);
    case "custom":
      return uploadCustom(file, config as CustomConfig, onProgress);
    default:
      throw new Error(`Unsupported cloud provider: ${(config as any).provider}`);
  }
}
