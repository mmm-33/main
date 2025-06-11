import React, { useState, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { FileUploadOptions, FileMetadata } from '../services/storage';
import { Upload, X, File, Check, AlertTriangle } from 'lucide-react';

interface FileUploaderProps {
  bucket: string;
  path?: string;
  fileTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onUploadComplete?: (files: FileMetadata[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  label?: string;
  description?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  bucket,
  path,
  fileTypes,
  maxSize,
  maxFiles = 5,
  multiple = false,
  onUploadComplete,
  onUploadError,
  className = '',
  label = 'Upload Files',
  description = 'Drag and drop files here, or click to select files'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  
  const { 
    uploadFile, 
    deleteFile, 
    isUploading, 
    uploadProgress, 
    uploadError 
  } = useStorage({
    bucket,
    path,
    fileTypes,
    maxSize
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the max files limit
    if (uploadedFiles.length + files.length > maxFiles) {
      onUploadError?.(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Add files to queue
    const newFiles = Array.from(files);
    setFileQueue(prev => [...prev, ...newFiles]);
    
    // Start upload process if not already in progress
    if (currentFileIndex === -1) {
      setCurrentFileIndex(0);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the max files limit
    if (uploadedFiles.length + files.length > maxFiles) {
      onUploadError?.(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Add files to queue
    const newFiles = Array.from(files);
    setFileQueue(prev => [...prev, ...newFiles]);
    
    // Start upload process if not already in progress
    if (currentFileIndex === -1) {
      setCurrentFileIndex(0);
    }
  };

  // Process file queue
  React.useEffect(() => {
    const processQueue = async () => {
      // If no files in queue or already uploading, do nothing
      if (fileQueue.length === 0 || currentFileIndex === -1 || currentFileIndex >= fileQueue.length) {
        return;
      }
      
      const file = fileQueue[currentFileIndex];
      
      try {
        // Upload the file
        const uploadOptions: Partial<FileUploadOptions> = {
          path: `${path || ''}${path ? '/' : ''}${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          metadata: {
            originalName: file.name,
            size: file.size.toString(),
            type: file.type
          }
        };
        
        const result = await uploadFile(file, uploadOptions);
        
        if (result) {
          setUploadedFiles(prev => [...prev, result]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        onUploadError?.(error instanceof Error ? error.message : 'Unknown error occurred during upload');
      }
      
      // Move to next file or finish
      if (currentFileIndex < fileQueue.length - 1) {
        setCurrentFileIndex(currentFileIndex + 1);
      } else {
        // All files processed
        setCurrentFileIndex(-1);
        setFileQueue([]);
        onUploadComplete?.(uploadedFiles);
      }
    };
    
    processQueue();
  }, [currentFileIndex, fileQueue, path, uploadFile, onUploadComplete, onUploadError, uploadedFiles]);

  // Handle file removal
  const handleRemoveFile = async (file: FileMetadata) => {
    const success = await deleteFile(file.path);
    
    if (success) {
      setUploadedFiles(prev => prev.filter(f => f.path !== file.path));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* File input area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple={multiple}
          accept={fileTypes?.join(',')}
        />
        
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 mb-1">{label}</p>
          <p className="text-sm text-gray-500 mb-2">{description}</p>
          <p className="text-xs text-gray-400">
            {fileTypes 
              ? `Allowed file types: ${fileTypes.map(type => type.split('/')[1]).join(', ')}` 
              : 'All file types accepted'}
          </p>
          <p className="text-xs text-gray-400">
            Max size: {maxSize ? formatFileSize(maxSize) : '10 MB'}
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              Uploading {currentFileIndex + 1} of {fileQueue.length}
            </span>
            <span className="text-sm text-blue-700">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload failed</p>
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h3>
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li 
                key={file.path} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <File className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;