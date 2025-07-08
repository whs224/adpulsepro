import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userIds } = await req.json()

    if (!userIds || !Array.isArray(userIds)) {
      throw new Error('userIds array is required')
    }

    // Create supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch user details for all provided user IDs
    const userDetails = await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId)
          
          if (error) {
            console.error(`Error fetching user ${userId}:`, error)
            return {
              user_id: userId,
              email: 'Error loading email',
              full_name: 'Error loading name'
            }
          }

          return {
            user_id: userId,
            email: authUser.user?.email || 'No email',
            full_name: authUser.user?.user_metadata?.full_name || 'No name'
          }
        } catch (error) {
          console.error(`Exception fetching user ${userId}:`, error)
          return {
            user_id: userId,
            email: 'Error loading email',
            full_name: 'Error loading name'
          }
        }
      })
    )

    return new Response(
      JSON.stringify({ userDetails }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in fetch-user-details function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})