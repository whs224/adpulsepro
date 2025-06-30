import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, teamOwner, teamName, inviteLink, memberEmail } = await req.json();
    let subject = "";
    let html = "";

    if (type === "invite") {
      subject = `You've been invited to join ${teamName} on AdPulse`;
      html = `<p>Hello,</p><p>${teamOwner} has invited you to join their team on AdPulse.</p><p><a href='${inviteLink}'>Click here to join the team</a></p>`;
    } else if (type === "accepted") {
      subject = `A new member joined your team on AdPulse`;
      html = `<p>${memberEmail} has accepted your invitation and joined your team (${teamName}) on AdPulse.</p>`;
    } else if (type === "removed") {
      subject = `You have been removed from a team on AdPulse`;
      html = `<p>You have been removed from the team (${teamName}) on AdPulse by ${teamOwner}.</p>`;
    } else {
      throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "AdPulse Team <team@resend.dev>",
      to: [to],
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}); 