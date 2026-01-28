import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InviteRequest {
  invitationId: string;
  email: string;
  teamName: string;
  inviterName: string;
  role: string;
  token: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  seller: "Vendedor",
  viewer: "Visualizador",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId, email, teamName, inviterName, role, token }: InviteRequest = await req.json();

    console.log(`[send-team-invite] Sending invite to ${email} for team ${teamName}`);

    // Validate required fields
    if (!email || !teamName || !token) {
      throw new Error("Missing required fields: email, teamName, token");
    }

    // Get the app URL from environment or use a default
    const appUrl = Deno.env.get("APP_URL") || "https://fedcom.lovable.app";
    const inviteLink = `${appUrl}/convite?token=${token}`;
    const roleLabel = roleLabels[role] || role;

    const emailResponse = await resend.emails.send({
      from: "FEDCOM <noreply@fedcom.lovable.app>",
      to: [email],
      subject: `Convite para entrar na equipe ${teamName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite para equipe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 700;">
                  🎉 Você foi convidado!
                </h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Olá!
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  <strong>${inviterName || "Um administrador"}</strong> convidou você para fazer parte da equipe <strong>${teamName}</strong> no FEDCOM.
                </p>
                
                <!-- Role Badge -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                  <tr>
                    <td>
                      <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #0369a1; font-size: 14px;">
                          <strong>Cargo atribuído:</strong> ${roleLabel}
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                  Clique no botão abaixo para aceitar o convite e começar a colaborar:
                </p>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <a href="${inviteLink}" 
                         style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%); color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);">
                        Aceitar Convite
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <p style="color: #0ea5e9; font-size: 14px; word-break: break-all; margin: 8px 0 20px;">
                  ${inviteLink}
                </p>
                
                <!-- Expiration Notice -->
                <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 30px;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    ⏰ <strong>Atenção:</strong> Este convite expira em 7 dias.
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">
                  Este email foi enviado pelo FEDCOM - Sistema de Gestão de Custos
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Se você não solicitou este convite, pode ignorar este email.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("[send-team-invite] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("[send-team-invite] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
