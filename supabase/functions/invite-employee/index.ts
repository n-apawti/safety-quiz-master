import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, role, company_id } = await req.json();

    if (!email || !role || !company_id) {
      return new Response(JSON.stringify({ error: 'email, role, and company_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check caller is a company_admin or super_admin for this company
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('company_id', company_id)
      .single();

    const { data: superAdmin } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (!superAdmin && callerRole?.role !== 'company_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: must be company admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get company info for the invite email
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name, slug')
      .eq('id', company_id)
      .single();

    const siteUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || '';

    // Invite the user via Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          company_id,
          invited_role: role,
          company_name: company?.name,
        },
        redirectTo: `${Deno.env.get('SITE_URL') || 'https://quiz-guide-hero.lovable.app'}/${company?.slug}/accept-invite`,
      }
    );

    if (inviteError) {
      // If user already exists, just assign the role
      if (inviteError.message?.includes('already been registered')) {
        // Find user by email
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === email);

        if (existingUser) {
          // Upsert role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({ user_id: existingUser.id, company_id, role }, { onConflict: 'user_id,company_id' });

          // Also update profile's company_id
          await supabaseAdmin
            .from('profiles')
            .update({ company_id })
            .eq('id', existingUser.id);

          if (roleError) throw roleError;
          return new Response(JSON.stringify({ message: 'Existing user added to company' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      throw inviteError;
    }

    // Pre-create the role row — it will be finalized when the user accepts
    if (inviteData?.user) {
      await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: inviteData.user.id, company_id, role }, { onConflict: 'user_id,company_id' });

      await supabaseAdmin
        .from('profiles')
        .update({ company_id })
        .eq('id', inviteData.user.id);
    }

    return new Response(JSON.stringify({ message: `Invite sent to ${email}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('invite-employee error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
