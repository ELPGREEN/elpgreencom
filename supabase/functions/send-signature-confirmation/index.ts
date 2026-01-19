import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignatureConfirmationRequest {
  documentName: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  signatureType: string;
  signatureHash: string;
  documentId: string;
  language?: string;
}

const translations: Record<string, Record<string, string>> = {
  pt: {
    subject: 'Confirmação de Assinatura Digital - ELP Alliance',
    greeting: 'Prezado(a)',
    intro: 'Sua assinatura digital foi registrada com sucesso!',
    documentLabel: 'Documento',
    dateLabel: 'Data/Hora',
    typeLabel: 'Tipo de Assinatura',
    hashLabel: 'Hash de Verificação',
    drawnType: 'Manuscrita Digital',
    typedType: 'Digitada',
    legalNotice: 'Este documento possui validade jurídica conforme a Lei 14.063/2020 (Brasil) e regulação eIDAS (União Europeia).',
    accessDocument: 'Acessar Documento',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'Todos os direitos reservados',
  },
  en: {
    subject: 'Digital Signature Confirmation - ELP Alliance',
    greeting: 'Dear',
    intro: 'Your digital signature has been successfully recorded!',
    documentLabel: 'Document',
    dateLabel: 'Date/Time',
    typeLabel: 'Signature Type',
    hashLabel: 'Verification Hash',
    drawnType: 'Handwritten Digital',
    typedType: 'Typed',
    legalNotice: 'This document has legal validity according to Law 14.063/2020 (Brazil) and EU eIDAS regulation.',
    accessDocument: 'Access Document',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'All rights reserved',
  },
  es: {
    subject: 'Confirmación de Firma Digital - ELP Alliance',
    greeting: 'Estimado(a)',
    intro: '¡Su firma digital ha sido registrada con éxito!',
    documentLabel: 'Documento',
    dateLabel: 'Fecha/Hora',
    typeLabel: 'Tipo de Firma',
    hashLabel: 'Hash de Verificación',
    drawnType: 'Manuscrita Digital',
    typedType: 'Digitada',
    legalNotice: 'Este documento tiene validez legal según la Ley 14.063/2020 (Brasil) y la regulación eIDAS (Unión Europea).',
    accessDocument: 'Acceder al Documento',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'Todos los derechos reservados',
  },
  it: {
    subject: 'Conferma Firma Digitale - ELP Alliance',
    greeting: 'Gentile',
    intro: 'La tua firma digitale è stata registrata con successo!',
    documentLabel: 'Documento',
    dateLabel: 'Data/Ora',
    typeLabel: 'Tipo di Firma',
    hashLabel: 'Hash di Verifica',
    drawnType: 'Manoscritta Digitale',
    typedType: 'Digitata',
    legalNotice: 'Questo documento ha validità legale secondo la Legge 14.063/2020 (Brasile) e il regolamento eIDAS (UE).',
    accessDocument: 'Accedi al Documento',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'Tutti i diritti riservati',
  },
  zh: {
    subject: '数字签名确认 - ELP Alliance',
    greeting: '尊敬的',
    intro: '您的数字签名已成功记录！',
    documentLabel: '文档',
    dateLabel: '日期/时间',
    typeLabel: '签名类型',
    hashLabel: '验证哈希',
    drawnType: '手写数字',
    typedType: '输入',
    legalNotice: '根据第14.063/2020号法律（巴西）和欧盟eIDAS法规，本文件具有法律效力。',
    accessDocument: '访问文档',
    footer: 'ELP Alliance S/A - ELP绿色技术',
    copyright: '版权所有',
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SignatureConfirmationRequest = await req.json();
    const lang = data.language || 'pt';
    const t = translations[lang] || translations.pt;

    const signedDate = new Date(data.signedAt);
    const formattedDate = signedDate.toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : lang === 'zh' ? 'zh-CN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const signatureTypeText = data.signatureType === 'drawn' ? t.drawnType : t.typedType;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a2b3c; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ELP Alliance</h1>
              <p style="color: #a1a1aa; margin: 8px 0 0; font-size: 14px;">ELP Green Technology</p>
            </td>
          </tr>
          
          <!-- Success Badge -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h2 style="color: #166534; margin: 0; font-size: 20px;">${t.intro}</h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                ${t.greeting} ${data.signerName},
              </p>
              
              <!-- Document Details -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">${t.documentLabel}:</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                      <strong style="color: #18181b; font-size: 14px;">${data.documentName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">${t.dateLabel}:</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                      <strong style="color: #18181b; font-size: 14px;">${formattedDate}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">${t.typeLabel}:</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                      <strong style="color: #18181b; font-size: 14px;">${signatureTypeText}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 12px 0 0;">
                      <span style="color: #71717a; font-size: 12px;">${t.hashLabel}:</span>
                      <div style="background-color: #e4e4e7; padding: 8px; border-radius: 4px; margin-top: 4px; word-break: break-all;">
                        <code style="font-size: 10px; color: #52525b;">${data.signatureHash}</code>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Legal Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                  ${t.legalNotice}
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://elpgreencom.lovable.app/sign?doc=${data.documentId}" 
                   style="display: inline-block; background-color: #1a5c3a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  ${t.accessDocument}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 20px 30px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #71717a; font-size: 12px; margin: 0;">
                ${t.footer}<br>
                © ${new Date().getFullYear()} ${t.copyright}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ELP Alliance <onboarding@resend.dev>",
      to: [data.signerEmail],
      subject: t.subject,
      html: htmlContent,
    });

    console.log("Signature confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending signature confirmation email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
