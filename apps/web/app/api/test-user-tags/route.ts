import { NextResponse } from 'next/server';
import { createClientSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  const supabase = createClientSupabaseClient();
  
  const results = {
    userTagsExists: false,
    tagsExists: false,
    profilesExists: false,
    userTagsStructure: null,
    tagsCount: 0,
    profilesCount: 0,
    error: null
  };

  try {
    // 1. Test table user_tags
    const { data: userTagsTest, error: userTagsError } = await supabase
      .from('user_tags')
      .select('*')
      .limit(1);

    if (userTagsError) {
      results.error = `user_tags: ${userTagsError.message}`;
    } else {
      results.userTagsExists = true;
      results.userTagsStructure = userTagsTest;
    }

    // 2. Test table tags
    const { data: tagsTest, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      results.error = results.error ? `${results.error}; tags: ${tagsError.message}` : `tags: ${tagsError.message}`;
    } else {
      results.tagsExists = true;
      results.tagsCount = tagsTest?.length || 0;
    }

    // 3. Test table profiles
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(5);

    if (profilesError) {
      results.error = results.error ? `${results.error}; profiles: ${profilesError.message}` : `profiles: ${profilesError.message}`;
    } else {
      results.profilesExists = true;
      results.profilesCount = profilesTest?.length || 0;
    }

  } catch (error: any) {
    results.error = error.message;
  }

  return NextResponse.json(results);
}


