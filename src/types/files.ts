export type FileStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface FileRecord {
  id: string;
  user_id: string;
  s3_key: string;
  original_name: string;
  status: FileStatus;
  error_message: string | null;
  created_at: string;
  last_processing_date: string;
  processed_s3_key: string | null;
}

export interface FileNode {
  id?: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  fileData?: FileRecord;
}

export interface FileListResponse {
  files: FileNode[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface FileListParams {
  page: number;
  pageSize: number;
  sortBy?: 'name' | 'created_at' | 'last_processing_date';
  sortOrder?: 'asc' | 'desc';
  filterStatus?: FileStatus;
  filterType?: string;
}

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

// Helper function to build tree structure
export const buildFileTree = (files: FileRecord[]): FileNode[] => {
  const root: { [key: string]: FileNode } = {
    'uploads': { name: 'uploads', type: 'folder', path: 'uploads', children: [] },
    'processed': { name: 'processed', type: 'folder', path: 'processed', children: [] }
  };

  files.forEach(file => {
    // Remove user-specific part from path
    const s3Key = file.s3_key.replace(/^(uploads|processed)\/[^/]+\//, '$1/');
    const parts = s3Key.split('/');
    let currentPath = '';
    let currentNode = root[parts[0]];

    // Create folder structure
    for (let i = 1; i < parts.length; i++) {
      currentPath = `${currentPath}${currentPath ? '/' : ''}${parts[i-1]}`;
      
      if (i === parts.length - 1) {
        // This is a file
        const fileNode: FileNode = {
          id: file.id,
          name: file.original_name,
          type: 'file',
          path: s3Key,
          fileData: file
        };
        currentNode.children = currentNode.children || [];
        currentNode.children.push(fileNode);
      } else {
        // This is a folder
        const folderName = parts[i];
        const folderPath = `${currentPath}/${folderName}`;
        let folder = currentNode.children?.find(child => 
          child.type === 'folder' && child.name === folderName
        );

        if (!folder) {
          folder = {
            name: folderName,
            type: 'folder',
            path: folderPath,
            children: []
          };
          currentNode.children = currentNode.children || [];
          currentNode.children.push(folder);
        }
        currentNode = folder;
      }
    }
  });

  return Object.values(root);
}; 