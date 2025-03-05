/**
 * Files API Route
 * 
 * Handles file listing requests with support for pagination, sorting, and filtering.
 * Provides a hierarchical view of files in the user's storage space.
 * 
 * Features:
 * - Authentication required
 * - Pagination support
 * - Sorting by name, creation date, or processing date
 * - Status filtering
 * - File type filtering
 * - Tree structure generation for hierarchical display
 * 
 * @dependencies
 * - Requires Supabase authentication
 * - Uses types and utilities from @/types/files
 * - Interacts with Supabase 'files' table
 * 
 * @queryParameters
 * - page: Current page number (default: 1)
 * - pageSize: Items per page (default: 50)
 * - sortBy: Field to sort by (name, created_at, last_processing_date)
 * - sortOrder: Sort direction (asc, desc)
 * - filterStatus: Filter by file status
 * - filterType: Filter by file extension
 * 
 * @returns
 * - files: Array of file nodes in tree structure
 * - totalCount: Total number of matching files
 * - currentPage: Current page number
 * - totalPages: Total number of pages
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { FileRecord, buildFileTree, getFileExtension } from '@/types/files';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get pagination, sorting, and filtering parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const filterStatus = searchParams.get('filterStatus') || undefined;
    const filterType = searchParams.get('filterType') || undefined;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build the query
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    // Get total count before pagination
    const { count } = await query;
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Apply sorting
    if (sortBy === 'name') {
      query = query.order('original_name', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query
      .range((page - 1) * pageSize, page * pageSize - 1);

    // Execute query
    const { data: files, error } = await query;

    if (error) {
      console.error('Error fetching files:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }

    // Apply file type filtering in memory (since it's not in the database)
    let filteredFiles = files as FileRecord[];
    if (filterType) {
      filteredFiles = filteredFiles.filter(file => 
        getFileExtension(file.original_name).toLowerCase() === filterType.toLowerCase()
      );
    }

    // Build tree structure
    const fileTree = buildFileTree(filteredFiles);

    // Set up real-time subscription for status updates
    // Note: This will be handled on the client side

    return NextResponse.json({
      files: fileTree,
      totalCount: filteredFiles.length,
      currentPage: page,
      totalPages,
    });

  } catch (error) {
    console.error('Error in files API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 