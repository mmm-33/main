import React, { useState, useEffect } from 'react';
import { useStorage } from '../hooks/useStorage';
import FileUploader from './FileUploader';
import { FileMetadata } from '../services/storage';
import { Folder, File, Download, Trash2, ExternalLink, Search, RefreshCw } from 'lucide-react';

interface FileManagerProps {
  bucket: string;
  path?: string;
  fileTypes?: string[];
  maxSize?: number;
  showUploader?: boolean;
  className?: string;
  onFileSelect?: (file: FileMetadata) => void;
  onFileDelete?: (file: FileMetadata) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  bucket,
  path = '',
  fileTypes,
  maxSize,
  showUploader = true,
  className = '',
  onFileSelect,
  onFileDelete
}) => {
  const [currentPath, setCurrentPath] = useState(path);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  
  const { 
    files,
    listFiles, 
    downloadFile, 
    deleteFile, 
    getPublicUrl,
    getSignedUrl
  } = useStorage({
    bucket,
    path: currentPath
  });

  // Load files on mount and when path changes
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    setIsLoading(true);
    await listFiles(currentPath);
    setIsLoading(false);
  };

  // Handle file selection
  const handleFileSelect = (file: FileMetadata) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  // Handle file download
  const handleFileDownload = async (file: FileMetadata) => {
    const blob = await downloadFile(file.path);
    
    if (blob) {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  // Handle file deletion
  const handleFileDelete = async (file: FileMetadata) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      const success = await deleteFile(file.path);
      
      if (success) {
        if (selectedFile?.path === file.path) {
          setSelectedFile(null);
        }
        
        onFileDelete?.(file);
      }
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  // Navigate up one level
  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  // Filter files by search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group files by type (folders first, then files)
  const folders = filteredFiles.filter(file => file.type === 'folder');
  const regularFiles = filteredFiles.filter(file => file.type !== 'folder');

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">File Manager</h3>
        <button
          onClick={loadFiles}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Refresh files"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      {/* Search and path navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={navigateUp}
            disabled={!currentPath}
            className={`px-2 py-1 rounded text-sm ${
              currentPath 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            Up
          </button>
          <div className="flex-1 text-sm text-gray-600 overflow-hidden overflow-ellipsis whitespace-nowrap">
            Path: {currentPath || '/'}
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* File list */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-600">Loading files...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No files found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {/* Folders */}
            {folders.map((folder) => (
              <li 
                key={folder.path}
                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => handleFolderClick(folder.path)}
              >
                <div className="flex items-center p-4">
                  <Folder className="h-5 w-5 text-yellow-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {folder.name}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            
            {/* Files */}
            {regularFiles.map((file) => (
              <li 
                key={file.path}
                className={`hover:bg-gray-50 transition-colors duration-200 ${
                  selectedFile?.path === file.path ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center p-4">
                  <File className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDownload(file);
                      }}
                      className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                      aria-label="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <a
                      href={getPublicUrl(file.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                      aria-label="Open file"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(file);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                      aria-label="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* File uploader */}
      {showUploader && (
        <div className="p-4 border-t border-gray-200">
          <FileUploader
            bucket={bucket}
            path={currentPath}
            fileTypes={fileTypes}
            maxSize={maxSize}
            onUploadComplete={(files) => {
              loadFiles();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileManager;