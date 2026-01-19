import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReplyEmailRequest {
  to: string;
  toName: string;
  subject: string;
  message?: string;
  replyType: 'contact' | 'marketplace' | 'document_received' | 'document_signed' | 'custom' | 'form_confirmation';
  documentName?: string;
  documentType?: string;
  formType?: string;
  submissionCount?: number;
}

// ELP Brand Colors
const colors = {
  primary: '#1a365d',
  secondary: '#2563eb',
  accent: '#3b82f6',
  background: '#f8fafc',
  text: '#1e293b',
  muted: '#64748b',
  white: '#ffffff',
  border: '#e2e8f0',
  success: '#10b981',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReplyEmailRequest = await req.json();
    const { to, toName, subject, message, replyType, documentName, documentType, formType, submissionCount } = data;

    console.log("Sending reply email to:", to, "Type:", replyType);

    let emailSubject = subject;
    let emailHtml = '';

    // Build email based on type
    switch (replyType) {
      case 'document_received':
        emailSubject = `📄 Documento recebido - ${documentType || 'Novo documento'} - ELP Green`;
        emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: ${colors.white};">
            <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://nexus-eco-spark.lovable.app/assets/logo-elp-new-Dup3XDQY.png" alt="ELP Green Technology" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: ${colors.white}; margin: 0; font-size: 24px;">📄 Documento Recebido</h1>
            </div>
            
            <div style="background: ${colors.background}; padding: 35px 30px; border: 1px solid ${colors.border}; border-top: none;">
              <h2 style="color: ${colors.primary}; margin: 0 0 20px 0;">Olá, ${toName}! 👋</h2>
              
              <p style="color: ${colors.text}; line-height: 1.8; margin-bottom: 25px;">
                Recebemos um novo documento em sua pasta de parceiro na ELP Green Technology.
              </p>
              
              <div style="background: ${colors.white}; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin: 25px 0;">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="width: 50px; height: 50px; background: ${colors.accent}20; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 24px;">📄</span>
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: 600; color: ${colors.primary};">${documentName || 'Documento'}</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: ${colors.muted};">Tipo: ${documentType || 'Geral'}</p>
                  </div>
                </div>
              </div>
              
              <div style="background: ${colors.success}10; border-left: 4px solid ${colors.success}; padding: 15px 20px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: ${colors.text}; font-size: 14px;">
                  <strong>✓ Documento adicionado à sua pasta</strong><br>
                  Nossa equipe analisará o documento e entrará em contato se necessário.
                </p>
              </div>
            </div>
            
            <div style="background: ${colors.primary}; padding: 25px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
                ELP Alliance S/A - ELP Green Technology<br>
                info@elpgreen.com | www.elpgreen.com
              </p>
            </div>
          </div>
        `;
        break;

      case 'document_signed':
        emailSubject = `✅ Documento assinado com sucesso - ELP Green`;
        emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: ${colors.white};">
            <div style="background: linear-gradient(135deg, ${colors.success}, #059669); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://nexus-eco-spark.lovable.app/assets/logo-elp-new-Dup3XDQY.png" alt="ELP Green Technology" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: ${colors.white}; margin: 0; font-size: 24px;">✅ Documento Assinado</h1>
            </div>
            
            <div style="background: ${colors.background}; padding: 35px 30px; border: 1px solid ${colors.border}; border-top: none;">
              <h2 style="color: ${colors.primary}; margin: 0 0 20px 0;">Olá, ${toName}!</h2>
              
              <p style="color: ${colors.text}; line-height: 1.8; margin-bottom: 25px;">
                Seu documento foi assinado digitalmente com sucesso e está armazenado de forma segura.
              </p>
              
              <div style="background: ${colors.white}; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin: 25px 0; text-align: center;">
                <span style="font-size: 48px;">✅</span>
                <p style="margin: 15px 0 0 0; font-weight: 600; color: ${colors.success};">Assinatura Digital Validada</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: ${colors.muted};">${documentName || 'Documento'}</p>
              </div>
            </div>
            
            <div style="background: ${colors.primary}; padding: 25px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
                ELP Alliance S/A - ELP Green Technology
              </p>
            </div>
          </div>
        `;
        break;

      case 'form_confirmation':
        emailSubject = `🔄 Novo envio recebido - ELP Green Technology`;
        emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: ${colors.white};">
            <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://nexus-eco-spark.lovable.app/assets/logo-elp-new-Dup3XDQY.png" alt="ELP Green Technology" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: ${colors.white}; margin: 0; font-size: 24px;">🔄 Novo Envio Recebido</h1>
            </div>
            
            <div style="background: ${colors.background}; padding: 35px 30px; border: 1px solid ${colors.border}; border-top: none;">
              <h2 style="color: ${colors.primary}; margin: 0 0 20px 0;">Olá, ${toName}! 👋</h2>
              
              <div style="background: ${colors.success}10; border: 1px solid ${colors.success}30; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                <p style="margin: 0; color: ${colors.primary}; font-weight: 600;">✓ Identificamos você em nosso sistema!</p>
                <p style="margin: 10px 0 0 0; color: ${colors.muted}; font-size: 14px;">
                  Esta é sua ${submissionCount || 'nova'}ª submissão. Todos os seus envios ficam organizados na mesma pasta.
                </p>
              </div>
              
              <p style="color: ${colors.text}; line-height: 1.8; margin-bottom: 25px;">
                Recebemos seu novo ${formType === 'marketplace' ? 'registro no Marketplace' : 'formulário de contato'} e ele foi automaticamente adicionado ao seu histórico de interações conosco.
              </p>
              
              <div style="background: linear-gradient(135deg, ${colors.secondary}10, ${colors.accent}10); border: 1px solid ${colors.accent}30; padding: 20px; border-radius: 10px;">
                <p style="margin: 0; color: ${colors.primary}; font-weight: 600;">⏱️ Próximos passos</p>
                <p style="margin: 10px 0 0 0; color: ${colors.muted};">Nossa equipe analisará sua solicitação e entrará em contato em breve com prioridade, já que você é um parceiro existente.</p>
              </div>
            </div>
            
            <div style="background: ${colors.primary}; padding: 25px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
                ELP Alliance S/A - ELP Green Technology<br>
                info@elpgreen.com | www.elpgreen.com
              </p>
            </div>
          </div>
        `;
        break;

      case 'custom':
      case 'contact':
      case 'marketplace':
      default:
        emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: ${colors.white};">
            <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <img src="https://nexus-eco-spark.lovable.app/assets/logo-elp-new-Dup3XDQY.png" alt="ELP Green Technology" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: ${colors.white}; margin: 0; font-size: 24px;">ELP Green Technology</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">
                ${replyType === 'marketplace' ? 'Marketplace B2B' : 'Mensagem da Equipe'}
              </p>
            </div>
            
            <div style="background: ${colors.background}; padding: 35px 30px; border: 1px solid ${colors.border}; border-top: none;">
              <h2 style="color: ${colors.primary}; margin: 0 0 20px 0;">Olá, ${toName}!</h2>
              
              <div style="background: ${colors.white}; padding: 25px; border-radius: 8px; border: 1px solid ${colors.border}; margin: 20px 0;">
                <div style="white-space: pre-wrap; line-height: 1.8; color: ${colors.text};">
                  ${(message || '').replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Precisa de mais informações?</strong><br>
                  Estamos à disposição para esclarecer qualquer dúvida.
                </p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://www.elpgreen.com" style="background: ${colors.secondary}; color: ${colors.white}; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  🌐 Visite nosso site
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid ${colors.border}; margin: 25px 0;">
              
              <p style="color: ${colors.text}; margin-bottom: 5px;"><strong>Atenciosamente,</strong></p>
              <p style="color: ${colors.text}; margin: 5px 0;">Equipe ELP Green Technology</p>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${colors.border};">
                <p style="color: ${colors.muted}; font-size: 13px; margin: 5px 0;">E-mail: info@elpgreen.com</p>
                <p style="color: ${colors.muted}; font-size: 13px; margin: 5px 0;">Website: www.elpgreen.com</p>
              </div>
            </div>
            
            <div style="background: ${colors.primary}; padding: 25px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
                ELP Alliance S/A - ELP Green Technology<br>
                Sedes: Itália 🇮🇹 | Brasil 🇧🇷 | Alemanha 🇩🇪 | China 🇨🇳 | Austrália 🇦🇺
              </p>
            </div>
          </div>
        `;
        break;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ELP Green Technology <info@elpgreen.com>",
        to: [to],
        cc: replyType === 'custom' ? ["elpenergia@gmail.com"] : undefined,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const responseData = await response.json();
    console.log("Email sent successfully:", responseData);

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending reply email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
