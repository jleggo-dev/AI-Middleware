/**
 * useFiles Hook
 * 
 * A custom React hook that manages file listing functionality with real-time updates.
 * Provides pagination, sorting, and filtering capabilities for the file list.
 * 
 * Features:
 * - Fetches and manages file list data
 * - Handles pagination, sorting, and filtering parameters
 * - Provides real-time updates through Supabase subscriptions
 * - Extracts unique file types for filtering
 * - Manages loading and error states
 * 
 * @dependencies
 * - Requires Supabase client for real-time subscriptions
 * - Uses types from @/types/files
 * - Interacts with /api/files endpoint for data fetching
 * 
 * @returns
 * - loading: boolean indicating fetch status
 * - error: string | null for error state
 * - data: FileListResponse containing file tree and pagination info
 * - params: current FileListParams
 * - updateParams: function to update listing parameters
 * - fileTypes: array of unique file extensions
 * - refresh: function to manually refresh the file list
 */

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileListParams, FileListResponse } from '@/types/files';

export const useFiles = (initialParams: Partial<FileListParams> = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FileListResponse | null>(null);
  const [params, setParams] = useState<FileListParams>({
    page: 1,
    pageSize: 50,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialParams
  });

  const supabase = createClientComponentClient();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      // Fetch files
      const response = await fetch(`/api/files?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('files-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files'
        },
        () => {
          // Refresh the file list when changes occur
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchFiles]);

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Update params
  const updateParams = useCallback((newParams: Partial<FileListParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Get unique file extensions for filter options
  const fileTypes = data?.files
    .flatMap(root => root.children || [])
    .flatMap(child => {
      if (child.type === 'file' && child.name) {
        const extension = child.name.split('.').pop()?.toLowerCase();
        return extension ? [extension] : [];
      }
      return [];
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  return {
    loading,
    error,
    data,
    params,
    updateParams,
    fileTypes,
    refresh: fetchFiles
  };
}; 