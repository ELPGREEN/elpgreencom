import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

const colors = {
  primary: '#1a365d',
  green: '#1a5c3a',
  success: '#10b981',
  white: '#ffffff',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
};

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
    initialsType: 'Iniciais',
    uploadType: 'Upload de Imagem',
    legalNotice: 'Este documento possui validade jurídica conforme a Lei 14.063/2020 (Brasil) e regulação eIDAS (União Europeia).',
    accessDocument: 'Acessar Documento',
    downloadPdf: 'Você pode baixar uma cópia do documento assinado acessando o link acima.',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'Todos os direitos reservados',
    contactUs: 'Em caso de dúvidas, entre em contato:',
    nextSteps: 'Próximos Passos',
    nextStepsDesc: 'Nossa equipe analisará seu documento e entrará em contato em breve.',
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
    initialsType: 'Initials',
    uploadType: 'Image Upload',
    legalNotice: 'This document has legal validity according to Law 14.063/2020 (Brazil) and EU eIDAS regulation.',
    accessDocument: 'Access Document',
    downloadPdf: 'You can download a copy of the signed document by accessing the link above.',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'All rights reserved',
    contactUs: 'For questions, please contact:',
    nextSteps: 'Next Steps',
    nextStepsDesc: 'Our team will review your document and contact you shortly.',
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
    initialsType: 'Iniciales',
    uploadType: 'Carga de Imagen',
    legalNotice: 'Este documento tiene validez legal según la Ley 14.063/2020 (Brasil) y la regulación eIDAS (Unión Europea).',
    accessDocument: 'Acceder al Documento',
    downloadPdf: 'Puede descargar una copia del documento firmado accediendo al enlace anterior.',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'Todos los derechos reservados',
    contactUs: 'Para consultas, contáctenos:',
    nextSteps: 'Próximos Pasos',
    nextStepsDesc: 'Nuestro equipo analizará su documento y se pondrá en contacto pronto.',
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
    initialsType: 'Iniziali',
    uploadType: 'Caricamento Immagine',
    legalNotice: 'Questo documento ha validità legale secondo la Legge 14.063/2020 (Brasile) e il regolamento eIDAS (UE).',
    accessDocument: 'Accedi al Documento',
    downloadPdf: 'Puoi scaricare una copia del documento firmato accedendo al link sopra.',
    footer: 'ELP Alliance S/A - ELP Green Technology',
    copyright: 'Tutti i diritti riservati',
    contactUs: 'Per domande, contattaci:',
    nextSteps: 'Prossimi Passi',
    nextStepsDesc: 'Il nostro team esaminerà il tuo documento e ti contatterà a breve.',
  },
  zh: {
    subject: '数字签名确认 - ELP Alliance',
    greeting: '尊敬的',
    intro: '您的数字签名已成功记录！',
    documentLabel: '文件',
    dateLabel: '日期/时间',
    typeLabel: '签名类型',
    hashLabel: '验证哈希',
    drawnType: '手写数字',
    typedType: '输入',
    initialsType: '首字母',
    uploadType: '图片上传',
    legalNotice: '根据第14.063/2020号法律（巴西）和欧盟eIDAS法规，本文件具有法律效力。',
    accessDocument: '访问文件',
    downloadPdf: '您可以通过上面的链接下载已签署文件的副本。',
    footer: 'ELP Alliance S/A - ELP绿色技术',
    copyright: '版权所有',
    contactUs: '如有疑问，请联系：',
    nextSteps: '下一步',
    nextStepsDesc: '我们的团队将审核您的文件并尽快与您联系。',
  },
};

const getSignatureTypeText = (type: string, t: Record<string, string>): string => {
  switch (type) {
    case 'drawn': return t.drawnType;
    case 'typed': return t.typedType;
    case 'initials': return t.initialsType;
    case 'upload': return t.uploadType;
    default: return type || 'N/A';
  }
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
    const formattedDate = signedDate.toLocaleString(
      lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : lang === 'zh' ? 'zh-CN' : 'en-US', 
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    );

    const signatureTypeText = getSignatureTypeText(data.signatureType, t);

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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${colors.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Signature Badge -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colors.success}, #059669); padding: 15px 20px; text-align: center;">
              <span style="color: white; font-weight: 700; font-size: 14px; letter-spacing: 1px;">✓ ${t.intro.toUpperCase()}</span>
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colors.green}, #228b22); padding: 35px; text-align: center;">
              <img src="https://elpgreencom.lovable.app/assets/logo-elp-new-Dup3XDQY.png" alt="ELP" style="height: 50px; margin-bottom: 15px;" />
              <h1 style="color: ${colors.white}; margin: 0; font-size: 24px; font-weight: 600;">ELP Alliance</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">ELP Green Technology</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 35px 35px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="color: ${colors.success}; margin: 0; font-size: 22px; font-weight: 600;">
                ${t.intro}
              </h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 35px 35px;">
              <p style="color: ${colors.text}; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                ${t.greeting} <strong>${data.signerName}</strong>,
              </p>
              
              <!-- Document Details Box -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid ${colors.border};">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border};">
                      <span style="color: ${colors.muted}; font-size: 14px;">${t.documentLabel}:</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border}; text-align: right;">
                      <strong style="color: ${colors.text}; font-size: 14px;">${data.documentName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border};">
                      <span style="color: ${colors.muted}; font-size: 14px;">${t.dateLabel}:</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border}; text-align: right;">
                      <strong style="color: ${colors.text}; font-size: 14px;">${formattedDate}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border};">
                      <span style="color: ${colors.muted}; font-size: 14px;">${t.typeLabel}:</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border}; text-align: right;">
                      <strong style="color: ${colors.text}; font-size: 14px;">${signatureTypeText}</strong>
                    </td>
                  </tr>
                </table>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid ${colors.border};">
                  <span style="color: ${colors.muted}; font-size: 12px;">${t.hashLabel}:</span>
                  <div style="background-color: #e4e4e7; padding: 10px; border-radius: 6px; margin-top: 6px; word-break: break-all;">
                    <code style="font-size: 10px; color: ${colors.muted}; font-family: monospace;">${data.signatureHash}</code>
                  </div>
                </div>
              </div>
              
              <!-- Legal Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 18px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                  🔐 ${t.legalNotice}
                </p>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #ecfdf5; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: ${colors.green}; margin: 0 0 10px 0; font-size: 16px;">📋 ${t.nextSteps}</h3>
                <p style="color: ${colors.text}; font-size: 14px; margin: 0; line-height: 1.5;">
                  ${t.nextStepsDesc}
                </p>
              </div>
              
              <!-- Download Info -->
              <div style="background-color: #eff6ff; border-radius: 10px; padding: 15px 20px; margin-bottom: 25px; text-align: center;">
                <p style="color: ${colors.primary}; font-size: 13px; margin: 0;">
                  📥 ${t.downloadPdf}
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://elpgreencom.lovable.app/sign?doc=${data.documentId}" 
                   style="display: inline-block; background: linear-gradient(135deg, ${colors.green}, #228b22); color: ${colors.white}; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(26, 92, 58, 0.3);">
                  ${t.accessDocument}
                </a>
              </div>
              
              <!-- Contact Info -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid ${colors.border};">
                <p style="color: ${colors.muted}; font-size: 13px; margin: 0 0 10px 0;">
                  ${t.contactUs}
                </p>
                <p style="margin: 0;">
                  <a href="mailto:info@elpgreen.com" style="color: #2563eb; text-decoration: none; font-size: 14px;">info@elpgreen.com</a>
                  <span style="color: ${colors.muted}; margin: 0 10px;">|</span>
                  <a href="https://www.elpgreen.com" style="color: #2563eb; text-decoration: none; font-size: 14px;">www.elpgreen.com</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a2b3c; padding: 25px; text-align: center;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 5px 0;">
                ${t.footer}
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0;">
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

    // Send to user
    const emailResponse = await resend.emails.send({
      from: "ELP Alliance <onboarding@resend.dev>",
      to: [data.signerEmail],
      subject: t.subject,
      html: htmlContent,
    });

    console.log("Signature confirmation email sent to user:", emailResponse);

    // Also send notification to admin
    const adminHtml = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: ${colors.white};">
        <div style="background: linear-gradient(135deg, ${colors.success}, #059669); padding: 12px 20px; text-align: center;">
          <span style="color: white; font-weight: 700; font-size: 14px; letter-spacing: 1px;">✓ NOVO DOCUMENTO ASSINADO</span>
        </div>
        <div style="background: linear-gradient(135deg, ${colors.primary}, #2563eb); padding: 30px; text-align: center;">
          <h1 style="color: ${colors.white}; margin: 0; font-size: 22px;">Assinatura Recebida</h1>
        </div>
        <div style="padding: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong>Documento:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};">${data.documentName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong>Assinante:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};">${data.signerName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong>Email:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><a href="mailto:${data.signerEmail}">${data.signerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong>Data/Hora:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};"><strong>Tipo:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid ${colors.border};">${signatureTypeText}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><strong>Hash:</strong></td>
              <td style="padding: 12px 0; font-family: monospace; font-size: 10px; word-break: break-all;">${data.signatureHash}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://elpgreencom.lovable.app/admin" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Ver no Painel Admin
            </a>
          </div>
        </div>
        <div style="background: ${colors.primary}; padding: 20px; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">ELP Alliance S/A - Notificação Automática</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "ELP Green Technology <onboarding@resend.dev>",
      to: ["elpenergia@gmail.com"],
      cc: ["info@elpgreen.com"],
      subject: `✓ Assinado: ${data.documentName} - ${data.signerName}`,
      html: adminHtml,
    });

    console.log("Admin notification sent");

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
