import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TemplateSubmissionRequest {
  documentId: string;
  templateName: string;
  templateType: string;
  fieldValues: Record<string, string>;
  language: string;
  isSigned: boolean;
  signatureHash?: string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
}

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
    const body: TemplateSubmissionRequest = await req.json();
    const { documentId, templateName, templateType, fieldValues, language, isSigned, signatureHash, signedAt, signerName, signerEmail } = body;

    console.log("Template submission notification:", { documentId, templateName, templateType });

    // Extract key info from field values
    const companyName = fieldValues.razao_social || fieldValues.company_name || 'Não informado';
    const contactName = fieldValues.representante || fieldValues.contact_name || 'Não informado';
    const email = fieldValues.email || signerEmail || 'Não informado';
    const phone = fieldValues.telefone || fieldValues.phone || 'Não informado';
    const address = fieldValues.endereco || fieldValues.address || 'Não informado';
    const cnpjVat = fieldValues.cnpj_vat || fieldValues.cnpj || 'Não informado';

    const signatureBadge = isSigned 
      ? `<div style="background: linear-gradient(135deg, ${colors.success}, #059669); padding: 12px 20px; text-align: center;">
          <span style="color: white; font-weight: 700; font-size: 14px; letter-spacing: 1px;">✓ DOCUMENTO ASSINADO DIGITALMENTE</span>
        </div>`
      : '';

    const signatureDetails = isSigned 
      ? `<div style="background: ${colors.white}; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin: 20px 0; border-left: 4px solid ${colors.success};">
          <h3 style="color: ${colors.success}; margin: 0 0 15px 0; font-size: 16px;">🔐 Validação de Assinatura Digital</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 35%;"><strong style="color: ${colors.muted};">Assinante:</strong></td>
              <td style="padding: 8px 0; color: ${colors.text}; font-weight: 500;">${signerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong style="color: ${colors.muted};">Email:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${signerEmail}" style="color: ${colors.secondary};">${signerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong style="color: ${colors.muted};">Data/Hora:</strong></td>
              <td style="padding: 8px 0; color: ${colors.text};">${signedAt ? new Date(signedAt).toLocaleString('pt-BR') : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong style="color: ${colors.muted};">Hash SHA-256:</strong></td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 11px; color: ${colors.muted}; word-break: break-all;">${signatureHash || 'N/A'}</td>
            </tr>
          </table>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: ${colors.success};">
            ✓ Assinatura válida conforme Lei 14.063/2020 e Regulamento eIDAS (UE)
          </p>
        </div>`
      : '';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: ${colors.white};">
        ${signatureBadge}
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); padding: 30px; text-align: center; ${!isSigned ? 'border-radius: 12px 12px 0 0;' : ''}">
          <img src="https://elpgreencom.lovable.app/assets/logo-elp-new-Dup3XDQY.png" alt="ELP Green Technology" style="height: 50px; margin-bottom: 15px;" />
          <h1 style="color: ${colors.white}; margin: 0; font-size: 22px; font-weight: 600;">📄 Novo Template Preenchido</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">Um cliente/parceiro preencheu um documento</p>
        </div>
        
        <!-- Content -->
        <div style="background: ${colors.background}; padding: 30px; border: 1px solid ${colors.border}; border-top: none;">
          
          <!-- Template Info -->
          <div style="background: ${colors.white}; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <h2 style="color: ${colors.primary}; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid ${colors.accent}; padding-bottom: 10px;">📋 Informações do Documento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; width: 35%;"><strong style="color: ${colors.muted};">Template:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; color: ${colors.text}; font-weight: 500;">${templateName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong style="color: ${colors.muted};">Tipo:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><span style="background: ${colors.accent}; color: ${colors.white}; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${templateType.toUpperCase()}</span></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong style="color: ${colors.muted};">Idioma:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; color: ${colors.text};">${language.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0;"><strong style="color: ${colors.muted};">Status:</strong></td>
                <td style="padding: 12px 0;"><span style="background: ${isSigned ? colors.success : colors.accent}; color: ${colors.white}; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${isSigned ? '✓ Assinado' : '⏳ Pendente Assinatura'}</span></td>
              </tr>
            </table>
          </div>
          
          <!-- Partner Info -->
          <div style="background: ${colors.white}; border-radius: 10px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
            <h2 style="color: ${colors.primary}; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid ${colors.accent}; padding-bottom: 10px;">🏢 Dados do Parceiro/Cliente</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; width: 35%;"><strong style="color: ${colors.muted};">Empresa:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; color: ${colors.text}; font-weight: 500;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong style="color: ${colors.muted};">Representante:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; color: ${colors.text};">${contactName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong style="color: ${colors.muted};">E-mail:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><a href="mailto:${email}" style="color: ${colors.secondary};">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong style="color: ${colors.muted};">Telefone:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; color: ${colors.text};">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong style="color: ${colors.muted};">CNPJ/VAT:</strong></td>
                <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border}; color: ${colors.text};">${cnpjVat}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0;"><strong style="color: ${colors.muted};">Endereço:</strong></td>
                <td style="padding: 12px 0; color: ${colors.text};">${address}</td>
              </tr>
            </table>
          </div>
          
          ${signatureDetails}
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://elpgreencom.lovable.app/admin" style="background: ${colors.secondary}; color: ${colors.white}; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3); margin-right: 10px;">
              📂 Ver no Painel Admin
            </a>
            <a href="mailto:${email}?subject=Re: ${templateName} - ELP Green Technology" style="background: ${colors.white}; color: ${colors.secondary}; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; border: 2px solid ${colors.secondary};">
              ✉️ Responder
            </a>
          </div>
          
          <!-- SLA Reminder -->
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid ${colors.accent};">
            <p style="margin: 0; color: ${colors.primary}; font-size: 13px;">
              <strong>⏰ SLA: Entrar em contato em até 48 horas</strong>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: ${colors.primary}; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
            ELP Alliance S/A - ELP Green Technology<br>
            Notificação automática do Portal de Documentos
          </p>
        </div>
      </div>
    `;

    // Send notification to admin
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ELP Green Technology <info@elpgreen.com>",
        to: ["elpenergia@gmail.com"],
        cc: ["info@elpgreen.com"],
        subject: `📄 ${isSigned ? '✓ Assinado' : 'Novo'}: ${templateName} - ${companyName}`,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    console.log("Notification email sent:", data);

    return new Response(JSON.stringify({ success: true, emailId: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending template notification:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
