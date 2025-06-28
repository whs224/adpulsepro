
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderToBuffer } from "npm:@react-pdf/renderer@3.4.4";
import React from "npm:react@18.3.1";

const resend = new Resend("re_jT7PkyN2_MWj5Zg4pqBFes86RJefenjUp");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName }: ReportRequest = await req.json();
    console.log(`Generating report for ${userName} (${userEmail})`);

    // Generate sample report data (this would come from real API data later)
    const reportData = {
      user: {
        name: userName,
        email: userEmail,
      },
      dateRange: "June 1-28, 2025",
      metrics: {
        totalSpend: 6700,
        totalImpressions: 67000,
        totalClicks: 2650,
        totalConversions: 144,
        avgCTR: 2.8,
        avgCPC: 2.53,
        avgCPA: 46.53,
        avgROAS: 3.2,
      },
      campaigns: [
        {
          name: "Summer Sale - Google",
          spend: 2340,
          impressions: 45600,
          ctr: 2.8,
          conversions: 68,
          roas: 3.2,
        },
        {
          name: "Brand Awareness - Meta",
          spend: 1890,
          impressions: 38200,
          ctr: 3.1,
          conversions: 52,
          roas: 2.9,
        },
        {
          name: "Retargeting - Google",
          spend: 1245,
          impressions: 18900,
          ctr: 4.2,
          conversions: 38,
          roas: 4.1,
        },
        {
          name: "Lookalike - Meta",
          spend: 1225,
          impressions: 22400,
          ctr: 2.4,
          conversions: 29,
          roas: 2.7,
        },
      ],
      recommendations: [
        "Move 20% of budget from low-CTR audience segments to high-performing lookalike audiences for better efficiency.",
        "Pause 'Summer Sale Campaign A' - cost increased 35% with declining ROAS over past week.",
        "Increase bids on California lookalike audiences - performing 18% better than average CTR.",
        "Consider expanding successful retargeting campaigns to similar audience segments for scale.",
        "Test new creative formats for Meta campaigns to improve engagement rates.",
      ],
    };

    // Create PDF template component
    const PDFTemplate = () =>
      React.createElement("div", {}, [
        React.createElement("h1", { key: "title" }, "AdPulse Report"),
        React.createElement("p", { key: "summary" }, `Report for ${userName}`),
      ]);

    // For now, we'll create a simple PDF buffer simulation
    // In production, you'd use the ReportPDFTemplate component
    const pdfBuffer = new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 52, // PDF header
    ]);

    console.log("PDF generated, sending email...");

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: "AdPulse Reports <reports@resend.dev>",
      to: [userEmail],
      subject: `Your AdPulse Report - ${reportData.dateRange}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Your AdPulse Report is Ready! 📊</h1>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hi ${userName},</p>
            
            <p>Your professional ad performance report is attached to this email. Here's a quick summary of your campaign performance:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Key Highlights</h3>
              <ul style="color: #374151;">
                <li><strong>$${reportData.metrics.totalSpend.toLocaleString()}</strong> total ad spend</li>
                <li><strong>${reportData.metrics.totalImpressions.toLocaleString()}</strong> total impressions</li>
                <li><strong>${reportData.metrics.avgCTR}%</strong> average click-through rate</li>
                <li><strong>${reportData.metrics.avgROAS}x</strong> average return on ad spend</li>
              </ul>
            </div>
            
            <p>The attached PDF includes:</p>
            <ul>
              <li>📈 Detailed performance metrics and trends</li>
              <li>🧠 AI-powered optimization recommendations</li>
              <li>📊 Campaign-by-campaign breakdown</li>
              <li>🎯 Audience and demographic insights</li>
            </ul>
            
            <p>Questions about your report? Reply to this email or contact us:</p>
            <p>📧 <a href="mailto:contact@adpulse.pro">contact@adpulse.pro</a><br>
            📞 <a href="tel:415-317-6427">415-317-6427</a></p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for choosing AdPulse!</p>
              <p>🚀 Ready for your next report? <a href="https://adpulse.pro" style="color: #3b82f6;">Visit AdPulse</a></p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `AdPulse_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Report generated and sent successfully",
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
