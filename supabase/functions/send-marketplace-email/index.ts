import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MarketplaceEmailRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  country: string;
  companyType: string;
  productsInterest: string[];
  estimatedVolume?: string;
  message?: string;
  registrationId?: string;
  language?: string;
}

interface ResendEmailResponse {
  id?: string;
  error?: { message: string };
}

const productNames: Record<string, Record<string, string>> = {
  pt: {
    'rcb': 'Negro de Fumo Recuperado (rCB)',
    'pyrolytic-oil': 'Óleo Pirolítico',
    'steel-wire': 'Aço Verde Reciclado',
    'rubber-blocks': 'Blocos de Borracha Recuperada',
    'rubber-granules': 'Grânulos de Borracha',
    'reclaimed-rubber': 'Borracha Regenerada'
  },
  en: {
    'rcb': 'Recovered Carbon Black (rCB)',
    'pyrolytic-oil': 'Pyrolytic Oil',
    'steel-wire': 'Recycled Green Steel',
    'rubber-blocks': 'Recovered Rubber Blocks',
    'rubber-granules': 'Rubber Granules',
    'reclaimed-rubber': 'Reclaimed Rubber'
  },
  es: {
    'rcb': 'Negro de Carbón Recuperado (rCB)',
    'pyrolytic-oil': 'Aceite Pirolítico',
    'steel-wire': 'Acero Verde Reciclado',
    'rubber-blocks': 'Bloques de Caucho Recuperado',
    'rubber-granules': 'Gránulos de Caucho',
    'reclaimed-rubber': 'Caucho Regenerado'
  },
  zh: {
    'rcb': '回收炭黑 (rCB)',
    'pyrolytic-oil': '热解油',
    'steel-wire': '绿色再生钢',
    'rubber-blocks': '再生橡胶块',
    'rubber-granules': '橡胶颗粒',
    'reclaimed-rubber': '再生橡胶'
  }
};

const companyTypeNames: Record<string, Record<string, string>> = {
  pt: { buyer: 'Comprador', seller: 'Vendedor', both: 'Comprador e Vendedor' },
  en: { buyer: 'Buyer', seller: 'Seller', both: 'Buyer and Seller' },
  es: { buyer: 'Comprador', seller: 'Vendedor', both: 'Comprador y Vendedor' },
  zh: { buyer: '采购商', seller: '供应商', both: '采购商和供应商' }
};

const emailTranslations = {
  pt: {
    subject: 'Pré-Registro Confirmado - ELP Marketplace B2B',
    greeting: 'Olá',
    successMsg: 'Seu pré-registro no ELP Marketplace B2B foi realizado com sucesso!',
    thankYou: 'Agradecemos o interesse da',
    inPlatform: 'em participar da nossa plataforma de comercialização de commodities sustentáveis.',
    nextSteps: 'Próximos Passos',
    nextStepsText: 'Nossa equipe comercial entrará em contato com você no prazo máximo de 7 dias úteis para dar continuidade ao seu cadastro e apresentar as condições exclusivas de lançamento.',
    viewLoi: 'Visualizar sua Carta de Intenções (LOI)',
    viewLoiDesc: 'Você pode acessar e baixar sua LOI a qualquer momento através do link abaixo:',
    accessLoi: 'Acessar LOI Online',
    summary: 'Resumo do seu registro',
    company: 'Empresa',
    countryLabel: 'País',
    type: 'Tipo',
    products: 'Produtos de Interesse',
    whyChoose: 'Por que escolher o ELP Marketplace?',
    blockchain: 'Rastreabilidade Blockchain',
    blockchainDesc: 'Garantia de origem e qualidade dos materiais',
    esg: 'Certificação ESG',
    esgDesc: 'Todos os produtos com certificação de sustentabilidade',
    global: 'Alcance Global',
    globalDesc: 'Conexão com compradores e vendedores em todo o mundo',
    prices: 'Preços Competitivos',
    pricesDesc: 'Acesso direto a produtores sem intermediários',
    visitSite: 'Visite nosso site',
    questions: 'Dúvidas?',
    locations: 'Sedes: Itália | Brasil | Alemanha | China',
    autoEmail: 'Este é um email automático. Por favor, não responda diretamente a esta mensagem.'
  },
  en: {
    subject: 'Pre-Registration Confirmed - ELP B2B Marketplace',
    greeting: 'Hello',
    successMsg: 'Your pre-registration at ELP B2B Marketplace was successful!',
    thankYou: 'We appreciate the interest from',
    inPlatform: 'in participating in our sustainable commodities trading platform.',
    nextSteps: 'Next Steps',
    nextStepsText: 'Our commercial team will contact you within 7 business days to continue your registration and present exclusive launch conditions.',
    viewLoi: 'View your Letter of Intent (LOI)',
    viewLoiDesc: 'You can access and download your LOI at any time through the link below:',
    accessLoi: 'Access LOI Online',
    summary: 'Your registration summary',
    company: 'Company',
    countryLabel: 'Country',
    type: 'Type',
    products: 'Products of Interest',
    whyChoose: 'Why choose ELP Marketplace?',
    blockchain: 'Blockchain Traceability',
    blockchainDesc: 'Guaranteed origin and quality of materials',
    esg: 'ESG Certification',
    esgDesc: 'All products with sustainability certification',
    global: 'Global Reach',
    globalDesc: 'Connection with buyers and sellers worldwide',
    prices: 'Competitive Prices',
    pricesDesc: 'Direct access to producers without intermediaries',
    visitSite: 'Visit our website',
    questions: 'Questions?',
    locations: 'Headquarters: Italy | Brazil | Germany | China',
    autoEmail: 'This is an automated email. Please do not reply directly to this message.'
  },
  es: {
    subject: 'Pre-Registro Confirmado - ELP Marketplace B2B',
    greeting: 'Hola',
    successMsg: '¡Su pre-registro en ELP Marketplace B2B fue exitoso!',
    thankYou: 'Agradecemos el interés de',
    inPlatform: 'en participar en nuestra plataforma de comercialización de commodities sostenibles.',
    nextSteps: 'Próximos Pasos',
    nextStepsText: 'Nuestro equipo comercial se pondrá en contacto con usted en un plazo máximo de 7 días hábiles para continuar su registro y presentar las condiciones exclusivas de lanzamiento.',
    viewLoi: 'Ver su Carta de Intenciones (LOI)',
    viewLoiDesc: 'Puede acceder y descargar su LOI en cualquier momento a través del enlace a continuación:',
    accessLoi: 'Acceder a LOI Online',
    summary: 'Resumen de su registro',
    company: 'Empresa',
    countryLabel: 'País',
    type: 'Tipo',
    products: 'Productos de Interés',
    whyChoose: '¿Por qué elegir ELP Marketplace?',
    blockchain: 'Trazabilidad Blockchain',
    blockchainDesc: 'Garantía de origen y calidad de los materiales',
    esg: 'Certificación ESG',
    esgDesc: 'Todos los productos con certificación de sostenibilidad',
    global: 'Alcance Global',
    globalDesc: 'Conexión con compradores y vendedores en todo el mundo',
    prices: 'Precios Competitivos',
    pricesDesc: 'Acceso directo a productores sin intermediarios',
    visitSite: 'Visite nuestro sitio',
    questions: '¿Preguntas?',
    locations: 'Sedes: Italia | Brasil | Alemania | China',
    autoEmail: 'Este es un email automático. Por favor, no responda directamente a este mensaje.'
  },
  zh: {
    subject: '预注册确认 - ELP B2B市场',
    greeting: '您好',
    successMsg: '您在ELP B2B市场的预注册已成功！',
    thankYou: '我们感谢',
    inPlatform: '对参与我们可持续商品交易平台的兴趣。',
    nextSteps: '后续步骤',
    nextStepsText: '我们的商务团队将在7个工作日内与您联系，继续您的注册并介绍独家发布条件。',
    viewLoi: '查看您的意向书 (LOI)',
    viewLoiDesc: '您可以随时通过以下链接访问和下载您的意向书：',
    accessLoi: '在线访问LOI',
    summary: '您的注册摘要',
    company: '公司',
    countryLabel: '国家',
    type: '类型',
    products: '感兴趣的产品',
    whyChoose: '为什么选择ELP市场？',
    blockchain: '区块链追溯',
    blockchainDesc: '材料来源和质量保证',
    esg: 'ESG认证',
    esgDesc: '所有产品均获得可持续性认证',
    global: '全球覆盖',
    globalDesc: '与全球买家和卖家建立联系',
    prices: '有竞争力的价格',
    pricesDesc: '直接接触生产商，无中间商',
    visitSite: '访问我们的网站',
    questions: '有疑问？',
    locations: '总部：意大利 | 巴西 | 德国 | 中国',
    autoEmail: '这是一封自动邮件。请勿直接回复此邮件。'
  }
};

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function sendEmail(to: string[], cc: string[] | null, subject: string, html: string): Promise<ResendEmailResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "ELP Green Technology <info@elpgreen.com>",
      to,
      cc: cc || undefined,
      subject,
      html,
    }),
  });

  const data = await response.json();
  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: MarketplaceEmailRequest = await req.json();
    const lang = (data.language || 'pt') as keyof typeof emailTranslations;
    const t = emailTranslations[lang] || emailTranslations.pt;
    const products = productNames[lang] || productNames.pt;
    const companyTypes = companyTypeNames[lang] || companyTypeNames.pt;

    console.log("Received marketplace registration:", { 
      companyName: data.companyName, 
      email: data.email, 
      products: data.productsInterest,
      language: lang
    });

    // Create LOI document with unique token
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const loiToken = generateToken();
    
    const { data: loiDoc, error: loiError } = await supabase
      .from('loi_documents')
      .insert({
        token: loiToken,
        registration_id: data.registrationId || null,
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        country: data.country,
        company_type: data.companyType,
        products_interest: data.productsInterest,
        estimated_volume: data.estimatedVolume || null,
        message: data.message || null,
        language: lang
      })
      .select()
      .single();

    if (loiError) {
      console.error("Error creating LOI document:", loiError);
    }

    // Generate LOI URL
    const baseUrl = "https://elpgreen.com"; // Production URL
    const loiUrl = `${baseUrl}/loi/${loiToken}`;

    const productsList = data.productsInterest
      .map(p => products[p] || p)
      .join(', ');

    // Send notification to ELP team
    const notificationEmail = await sendEmail(
      ["elpenergia@gmail.com"],
      ["info@elpgreen.com"],
      `Novo Pré-Registro Marketplace B2B: ${data.companyName}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a87); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">ELP Marketplace B2B</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Novo pré-registro recebido</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Dados da Empresa</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Empresa:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Contato:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-mail:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.email}</td>
              </tr>
              ${data.phone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Telefone:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.phone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>País:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.country}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Tipo:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${companyTypes[data.companyType] || data.companyType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Produtos de Interesse:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${productsList}</td>
              </tr>
              ${data.estimatedVolume ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Volume Estimado:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.estimatedVolume} ton/mês</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>LOI Link:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="${loiUrl}">${loiUrl}</a></td>
              </tr>
            </table>
            
            ${data.message ? `
            <h3 style="color: #1e3a5f; margin-top: 25px;">Mensagem Adicional:</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; line-height: 1.6;">${data.message.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 25px; padding: 15px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #0d9488;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>Ação Recomendada:</strong> Entre em contato com o interessado em até 48 horas para qualificação.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 25px; text-align: center;">
              Este email foi enviado automaticamente pelo sistema de pré-registro do Marketplace B2B
            </p>
          </div>
        </div>
      `
    );

    console.log("Notification email sent:", notificationEmail);

    // Send auto-response to the customer with LOI link
    const autoResponseEmail = await sendEmail(
      [data.email],
      null,
      t.subject,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a87); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">ELP Marketplace B2B</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${t.subject}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e3a5f; margin-top: 0;">${t.greeting}, ${data.contactName}!</h2>
            
            <p style="color: #374151; line-height: 1.8;">
              ${t.successMsg} 
              ${t.thankYou} <strong>${data.companyName}</strong> ${t.inPlatform}
            </p>
            
            <div style="background: #ecfdf5; border-left: 4px solid #0d9488; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #065f46;">
                <strong>${t.nextSteps}:</strong><br>
                ${t.nextStepsText}
              </p>
            </div>
            
            <!-- LOI Link Section -->
            <div style="background: #1e3a5f; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: white; margin: 0 0 10px 0;">${t.viewLoi}</h3>
              <p style="color: rgba(255,255,255,0.8); margin: 0 0 15px 0; font-size: 14px;">
                ${t.viewLoiDesc}
              </p>
              <a href="${loiUrl}" style="background: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ${t.accessLoi}
              </a>
            </div>
            
            <h3 style="color: #1e3a5f;">${t.summary}:</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0;"><strong>${t.company}:</strong> ${data.companyName}</p>
              <p style="margin: 0 0 10px 0;"><strong>${t.countryLabel}:</strong> ${data.country}</p>
              <p style="margin: 0 0 10px 0;"><strong>${t.type}:</strong> ${companyTypes[data.companyType] || data.companyType}</p>
              <p style="margin: 0;"><strong>${t.products}:</strong> ${productsList}</p>
            </div>
            
            <h3 style="color: #1e3a5f;">${t.whyChoose}</h3>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li><strong>${t.blockchain}:</strong> ${t.blockchainDesc}</li>
              <li><strong>${t.esg}:</strong> ${t.esgDesc}</li>
              <li><strong>${t.global}:</strong> ${t.globalDesc}</li>
              <li><strong>${t.prices}:</strong> ${t.pricesDesc}</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://www.elpgreen.com" style="background: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ${t.visitSite}
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            
            <p style="color: #374151; margin-bottom: 5px;"><strong>${t.questions}</strong></p>
            <p style="color: #6b7280; margin: 5px 0;">E-mail: info@elpgreen.com</p>
            <p style="color: #6b7280; margin: 5px 0;">Website: www.elpgreen.com</p>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 25px; text-align: center;">
              ${t.locations}<br>
              ${t.autoEmail}
            </p>
          </div>
        </div>
      `
    );

    console.log("Auto-response email sent:", autoResponseEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notificationEmail, 
        autoResponse: autoResponseEmail,
        loiToken: loiToken,
        loiUrl: loiUrl
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
    console.error("Error in send-marketplace-email function:", error);
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
