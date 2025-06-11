import { supabase } from './supabase';

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export type FileUploadOptions = {
  bucket: string;
  path?: string;
  fileTypes?: string[];
  maxSize?: number;
  metadata?: Record<string, string>;
  upsert?: boolean;
  onProgress?: (progress: number) => void;
};

export type FileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
};

export const storageService = {
  /**
   * Initialize storage service and create default buckets if they don't exist
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing storage service');
      
      // Create default buckets if they don't exist
      const defaultBuckets = ['profile-photos', 'booking-documents', 'yacht-images', 'client-uploads'];
      
      for (const bucket of defaultBuckets) {
        const { data, error } = await supabase.storage.getBucket(bucket);
        
        if (error && error.message.includes('The resource was not found')) {
          console.log(`Creating bucket: ${bucket}`);
          
          const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: bucket === 'yacht-images', // Only yacht images are public by default
            fileSizeLimit: MAX_FILE_SIZE,
            allowedMimeTypes: bucket.includes('photo') || bucket.includes('image') 
              ? ALLOWED_IMAGE_TYPES 
              : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
          });
          
          if (createError) {
            console.error(`Error creating bucket ${bucket}:`, createError);
          }
        } else if (error) {
          console.error(`Error checking bucket ${bucket}:`, error);
        } else {
          console.log(`Bucket exists: ${bucket}`);
        }
      }
    } catch (error) {
      console.error('Error initializing storage service:', error);
    }
  },

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions
  ): Promise<FileMetadata | null> {
    try {
      // Validate file size
      const maxSize = options.maxSize || MAX_FILE_SIZE;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds the maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
      }
      
      // Validate file type
      const allowedTypes = options.fileTypes || 
        (options.bucket.includes('photo') || options.bucket.includes('image') 
          ? ALLOWED_IMAGE_TYPES 
          : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]);
          
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      // Generate a unique file path if not provided
      const filePath = options.path || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: options.upsert || false,
          contentType: file.type,
          duplex: 'half',
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get public URL if the bucket is public
      const { data: publicUrlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);
      
      // Add metadata if provided
      if (options.metadata && Object.keys(options.metadata).length > 0) {
        const { error: metadataError } = await supabase.storage
          .from(options.bucket)
          .updateBucketObject(data.path, {
            metadata: options.metadata
          });
          
        if (metadataError) {
          console.error('Error adding metadata:', metadataError);
        }
      }
      
      return {
        id: data.id || '',
        name: file.name,
        size: file.size,
        type: file.type,
        path: data.path,
        url: publicUrlData.publicUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: options.metadata
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return null;
    }
  },

  /**
   * Download a file from storage
   */
  async downloadFile(bucket: string, path: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      
      if (error) {
        console.error('Error downloading file:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in downloadFile:', error);
      return null;
    }
  },

  /**
   * Get a public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Get a signed URL for temporary access to a file
   */
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 60): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error in getSignedUrl:', error);
      return null;
    }
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteFile:', error);
      return false;
    }
  },

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string, path?: string): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || '', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error('Error listing files:', error);
        throw error;
      }
      
      // Convert to FileMetadata format
      return data.map(item => ({
        id: item.id,
        name: item.name,
        size: item.metadata?.size || 0,
        type: item.metadata?.mimetype || '',
        path: path ? `${path}/${item.name}` : item.name,
        url: this.getPublicUrl(bucket, path ? `${path}/${item.name}` : item.name),
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        metadata: item.metadata
      }));
    } catch (error) {
      console.error('Error in listFiles:', error);
      return [];
    }
  },

  /**
   * Check if a file exists
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop()
        });
      
      if (error) {
        console.error('Error checking if file exists:', error);
        throw error;
      }
      
      return data.length > 0;
    } catch (error) {
      console.error('Error in fileExists:', error);
      return false;
    }
  },

  /**
   * Create a folder in a bucket
   */
  async createFolder(bucket: string, path: string): Promise<boolean> {
    try {
      // Supabase doesn't have a direct "create folder" API, so we create an empty file
      const emptyFile = new Blob([''], { type: 'text/plain' });
      const folderPath = path.endsWith('/') ? `${path}.folder` : `${path}/.folder`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(folderPath, emptyFile, {
          cacheControl: '0',
          upsert: false
        });
      
      if (error) {
        console.error('Error creating folder:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in createFolder:', error);
      return false;
    }
  },

  /**
   * Get file metadata
   */
  async getFileMetadata(bucket: string, path: string): Promise<Record<string, any> | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop()
        });
      
      if (error) {
        console.error('Error getting file metadata:', error);
        throw error;
      }
      
      if (data.length === 0) {
        return null;
      }
      
      return data[0].metadata;
    } catch (error) {
      console.error('Error in getFileMetadata:', error);
      return null;
    }
  },

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  },

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
    return file.size <= maxSize;
  }
};