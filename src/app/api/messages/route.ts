import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all folders for the current user
    const { data: folders, error: foldersError } = await supabase
      .from('template_folders')
      .select('id, name')
      .eq('user_id', session.user.id);

    if (foldersError) throw foldersError;

    // Fetch all messages for the current user
    const { data: messages, error: messagesError } = await supabase
      .from('message_templates')
      .select('id, name, created_at, updated_at, folder_id')
      .eq('user_id', session.user.id);

    if (messagesError) throw messagesError;

    // Group messages by folder
    const foldersWithMessages = folders.map(folder => ({
      ...folder,
      messages: messages
        .filter(message => message.folder_id === folder.id)
        .map(message => ({
          id: message.id,
          name: message.name,
          createdAt: message.created_at,
          updatedAt: message.updated_at,
          folderId: message.folder_id
        }))
    }));

    return NextResponse.json(foldersWithMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 