import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('userId is required')
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

    console.log(`Attempting to delete user: ${userId}`)

    // Delete from user_credits first
    const { error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .delete()
      .eq('user_id', userId)

    if (creditsError) {
      console.error('Error deleting user credits:', creditsError)
      // Continue with deletion even if credits fail
    }

    // Delete from profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      // Continue with deletion even if profile fails
    }

    // Delete from ad_accounts
    const { error: adAccountsError } = await supabaseAdmin
      .from('ad_accounts')
      .delete()
      .eq('user_id', userId)

    if (adAccountsError) {
      console.error('Error deleting ad accounts:', adAccountsError)
      // Continue with deletion even if ad accounts fail
    }

    // Delete from team_members (as member)
    const { error: teamMemberError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('member_user_id', userId)

    if (teamMemberError) {
      console.error('Error deleting team memberships:', teamMemberError)
      // Continue with deletion even if team members fail
    }

    // Delete from team_members (as owner)
    const { error: teamOwnerError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_owner_id', userId)

    if (teamOwnerError) {
      console.error('Error deleting owned teams:', teamOwnerError)
      // Continue with deletion even if team ownership fails
    }

    // Finally, delete the auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      throw new Error(`Failed to delete auth user: ${deleteAuthError.message}`)
    }

    console.log(`Successfully deleted user: ${userId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})