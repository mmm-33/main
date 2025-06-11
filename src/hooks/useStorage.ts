import { useState, useCallback } from 'react';
import { storageService, FileUploadOptions, FileMetadata } from '../services/storage';

type UseStorageOptions = {
  bucket: string;
  path?: string;
  fileTypes?: string[];
  maxSize?: number;
};

export const useStorage = (options: UseStorageOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileMetadata[]>([]);

  // Upload a file
  const uploadFile = useCallback(async (
    file: File,
    customOptions?: Partial<FileUploadOptions>
  ): Promise<FileMetadata | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Validate file size
      if (!storageService.validateFileSize(file, options.maxSize)) {
        throw new Error(`File size exceeds the maximum allowed size of ${options.maxSize ? options.maxSize / (1024 * 1024) : 10}MB`);
      }
      
      // Validate file type
      if (options.fileTypes && !storageService.validateFileType(file, options.fileTypes)) {
        throw new Error(`File type ${file.type} is not allowed. Allowed types: ${options.fileTypes.join(', ')}`);
      }
      
      // Upload file
      const uploadOptions: FileUploadOptions = {
        bucket: options.bucket,
        path: customOptions?.path || options.path,
        fileTypes: customOptions?.fileTypes || options.fileTypes,
        maxSize: customOptions?.maxSize || options.maxSize,
        metadata: customOptions?.metadata,
        upsert: customOptions?.upsert,
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      };
      
      const result = await storageService.uploadFile(file, uploadOptions);
      
      if (result) {
        setFiles(prev => [...prev, result]);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during upload';
      setUploadError(errorMessage);
      console.error('Upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [options.bucket, options.path, options.fileTypes, options.maxSize]);

  // Download a file
  const downloadFile = useCallback(async (
    path: string,
    bucket?: string
  ): Promise<Blob | null> => {
    try {
      return await storageService.downloadFile(bucket || options.bucket, path);
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }, [options.bucket]);

  // Delete a file
  const deleteFile = useCallback(async (
    path: string,
    bucket?: string
  ): Promise<boolean> => {
    try {
      const success = await storageService.deleteFile(bucket || options.bucket, path);
      
      if (success) {
        setFiles(prev => prev.filter(file => file.path !== path));
      }
      
      return success;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }, [options.bucket]);

  // List files
  const listFiles = useCallback(async (
    path?: string,
    bucket?: string
  ): Promise<FileMetadata[]> => {
    try {
      const files = await storageService.listFiles(bucket || options.bucket, path || options.path);
      setFiles(files);
      return files;
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }, [options.bucket, options.path]);

  // Get public URL
  const getPublicUrl = useCallback((
    path: string,
    bucket?: string
  ): string => {
    return storageService.getPublicUrl(bucket || options.bucket, path);
  }, [options.bucket]);

  // Get signed URL
  const getSignedUrl = useCallback(async (
    path: string,
    expiresIn: number = 60,
    bucket?: string
  ): Promise<string | null> => {
    return await storageService.getSignedUrl(bucket || options.bucket, path, expiresIn);
  }, [options.bucket]);

  return {
    uploadFile,
    downloadFile,
    deleteFile,
    listFiles,
    getPublicUrl,
    getSignedUrl,
    isUploading,
    uploadProgress,
    uploadError,
    files
  };
};