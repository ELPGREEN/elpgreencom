import jsPDF from "jspdf";
import QRCode from "qrcode";
import logoElp from "@/assets/logo-elp-lion.png";
import { format } from "date-fns";
import { ptBR, enUS, es, it, zhCN } from "date-fns/locale";

export interface DocumentData {
  title: string;
  subtitle?: string;
  content: string;
  language: 'pt' | 'en' | 'es' | 'zh' | 'it';
  documentType: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  country?: string;
  fieldValues?: Record<string, string>;
  includeSignature?: boolean;
  signatureData?: SignatureData;
  includeQRCode?: boolean;
  qrCodeUrl?: string;
}

export interface SignatureData {
  dataUrl: string;
  timestamp: string;
  signerName: string;
  signerEmail: string;
  ipAddress?: string;
  type: 'drawn' | 'typed';
}

interface Translations {
  confidential: string;
  page: string;
  of: string;
  signaturePage: string;
  signaturePartnerInfo: string;
  signatureCompanyName: string;
  signatureRepName: string;
  signaturePosition: string;
  signatureEmail: string;
  signaturePhone: string;
  signatureDate: string;
  signatureDeclaration: string;
  signaturePartner: string;
  signatureElp: string;
  signatureWitness: string;
  qrCodeTitle: string;
  qrCodeDesc: string;
  qrCodeScan: string;
  digitalSignature: string;
  signedDocument: string;
  verifiedSignature: string;
  documentGenerated: string;
  globalPartnership: string;
  partnershipModel: string;
}

const translations: Record<string, Translations> = {
  en: {
    confidential: "Confidential",
    page: "Page",
    of: "of",
    signaturePage: "Document Acceptance & Signature",
    signaturePartnerInfo: "Signatory Information",
    signatureCompanyName: "Company Name",
    signatureRepName: "Representative Name",
    signaturePosition: "Position/Title",
    signatureEmail: "Email",
    signaturePhone: "Phone",
    signatureDate: "Date",
    signatureDeclaration: "I hereby confirm that I have reviewed and understood the document presented above. I express my agreement with the terms and conditions stated herein.",
    signaturePartner: "Partner Signature",
    signatureElp: "ELP Green Technology",
    signatureWitness: "Witness (Optional)",
    qrCodeTitle: "Complete Online",
    qrCodeDesc: "Scan this QR Code to access the online form and submit your information directly.",
    qrCodeScan: "Scan to Access",
    digitalSignature: "DIGITAL SIGNATURE",
    signedDocument: "SIGNED DOCUMENT",
    verifiedSignature: "Verified Signature",
    documentGenerated: "Document generated on",
    globalPartnership: "Global Partnership Opportunity",
    partnershipModel: "Joint Venture Model - We bring technology, you bring resources",
  },
  pt: {
    confidential: "Confidencial",
    page: "Página",
    of: "de",
    signaturePage: "Aceite e Assinatura do Documento",
    signaturePartnerInfo: "Informações do Signatário",
    signatureCompanyName: "Nome da Empresa",
    signatureRepName: "Nome do Representante",
    signaturePosition: "Cargo/Função",
    signatureEmail: "E-mail",
    signaturePhone: "Telefone",
    signatureDate: "Data",
    signatureDeclaration: "Declaro que revisei e compreendi o documento apresentado acima. Manifesto minha concordância com os termos e condições aqui estabelecidos.",
    signaturePartner: "Assinatura do Parceiro",
    signatureElp: "ELP Green Technology",
    signatureWitness: "Testemunha (Opcional)",
    qrCodeTitle: "Complete Online",
    qrCodeDesc: "Escaneie este QR Code para acessar o formulário online e enviar suas informações diretamente.",
    qrCodeScan: "Escaneie para Acessar",
    digitalSignature: "ASSINATURA DIGITAL",
    signedDocument: "DOCUMENTO ASSINADO",
    verifiedSignature: "Assinatura Verificada",
    documentGenerated: "Documento gerado em",
    globalPartnership: "Oportunidade de Parceria Global",
    partnershipModel: "Modelo Joint Venture - Nós trazemos tecnologia, você traz recursos",
  },
  es: {
    confidential: "Confidencial",
    page: "Página",
    of: "de",
    signaturePage: "Aceptación y Firma del Documento",
    signaturePartnerInfo: "Información del Firmante",
    signatureCompanyName: "Nombre de la Empresa",
    signatureRepName: "Nombre del Representante",
    signaturePosition: "Cargo/Título",
    signatureEmail: "Correo Electrónico",
    signaturePhone: "Teléfono",
    signatureDate: "Fecha",
    signatureDeclaration: "Por la presente confirmo que he revisado y comprendido el documento presentado. Expreso mi acuerdo con los términos y condiciones establecidos.",
    signaturePartner: "Firma del Socio",
    signatureElp: "ELP Green Technology",
    signatureWitness: "Testigo (Opcional)",
    qrCodeTitle: "Complete en Línea",
    qrCodeDesc: "Escanee este código QR para acceder al formulario en línea y enviar su información directamente.",
    qrCodeScan: "Escanear para Acceder",
    digitalSignature: "FIRMA DIGITAL",
    signedDocument: "DOCUMENTO FIRMADO",
    verifiedSignature: "Firma Verificada",
    documentGenerated: "Documento generado el",
    globalPartnership: "Oportunidad de Asociación Global",
    partnershipModel: "Modelo Joint Venture - Nosotros aportamos tecnología, usted aporta recursos",
  },
  zh: {
    confidential: "机密",
    page: "页",
    of: "/",
    signaturePage: "文件接受与签名",
    signaturePartnerInfo: "签署人信息",
    signatureCompanyName: "公司名称",
    signatureRepName: "代表姓名",
    signaturePosition: "职位/头衔",
    signatureEmail: "电子邮件",
    signaturePhone: "电话",
    signatureDate: "日期",
    signatureDeclaration: "本人确认已审阅并理解上述文件。我同意此处规定的条款和条件。",
    signaturePartner: "合作伙伴签名",
    signatureElp: "ELP Green Technology",
    signatureWitness: "证人（可选）",
    qrCodeTitle: "在线完成",
    qrCodeDesc: "扫描此二维码访问在线表格并直接提交您的信息。",
    qrCodeScan: "扫描访问",
    digitalSignature: "数字签名",
    signedDocument: "已签署文件",
    verifiedSignature: "已验证签名",
    documentGenerated: "文件生成于",
    globalPartnership: "全球合作机会",
    partnershipModel: "合资模式 - 我们提供技术，您提供资源",
  },
  it: {
    confidential: "Riservato",
    page: "Pagina",
    of: "di",
    signaturePage: "Accettazione e Firma del Documento",
    signaturePartnerInfo: "Informazioni del Firmatario",
    signatureCompanyName: "Nome Azienda",
    signatureRepName: "Nome Rappresentante",
    signaturePosition: "Posizione/Titolo",
    signatureEmail: "Email",
    signaturePhone: "Telefono",
    signatureDate: "Data",
    signatureDeclaration: "Con la presente confermo di aver esaminato e compreso il documento sopra presentato. Esprimo il mio accordo con i termini e le condizioni qui stabiliti.",
    signaturePartner: "Firma del Partner",
    signatureElp: "ELP Green Technology",
    signatureWitness: "Testimone (Opzionale)",
    qrCodeTitle: "Completa Online",
    qrCodeDesc: "Scansiona questo codice QR per accedere al modulo online e inviare le tue informazioni direttamente.",
    qrCodeScan: "Scansiona per Accedere",
    digitalSignature: "FIRMA DIGITALE",
    signedDocument: "DOCUMENTO FIRMATO",
    verifiedSignature: "Firma Verificata",
    documentGenerated: "Documento generato il",
    globalPartnership: "Opportunità di Partnership Globale",
    partnershipModel: "Modello Joint Venture - Noi portiamo la tecnologia, voi le risorse",
  },
};

async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch(logoElp);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    return null;
  }
}

async function generateQRCode(url: string): Promise<string | null> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#003366',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
}

const getDateLocale = (lang: string) => {
  const locales: Record<string, any> = { pt: ptBR, en: enUS, es: es, it: it, zh: zhCN };
  return locales[lang] || enUS;
};

export async function generateProfessionalDocument(data: DocumentData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const maxY = 270;
  let yPos = margin;

  const logoBase64 = await loadLogoAsBase64();
  const qrCodeBase64 = data.includeQRCode && data.qrCodeUrl ? await generateQRCode(data.qrCodeUrl) : null;
  const t = translations[data.language] || translations.en;

  // === COVER PAGE ===
  // Background
  doc.setFillColor(250, 251, 253);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  // Top accent bar - Navy blue
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageWidth, 10, "F");
  
  // Bottom accent bar - Green
  doc.setFillColor(46, 125, 50);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");

  // Logo centered and larger
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", pageWidth / 2 - 25, 25, 50, 25);
    } catch (e) {
      console.log("Could not add logo to cover");
    }
  }

  // Company name with decorative line
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ELP Green Technology", pageWidth / 2, 60, { align: "center" });
  
  // Decorative line under company name
  doc.setDrawColor(46, 125, 50);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 30, 64, pageWidth / 2 + 30, 64);

  // Main title
  yPos = 85;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102);
  const titleLines = doc.splitTextToSize(data.title, contentWidth - 20);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
  });

  // Subtitle
  if (data.subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(data.subtitle, pageWidth / 2, yPos + 5, { align: "center" });
    yPos += 15;
  }

  // Document type badge
  yPos += 10;
  const badgeWidth = 70;
  doc.setFillColor(46, 125, 50);
  doc.roundedRect(pageWidth / 2 - badgeWidth / 2, yPos, badgeWidth, 10, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(data.documentType.toUpperCase(), pageWidth / 2, yPos + 6.5, { align: "center" });

  // Info cards section
  yPos += 30;
  const cardWidth = (contentWidth - 10) / 2;
  const cardHeight = 30;

  // Company card
  if (data.companyName) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, "FD");
    
    doc.setFillColor(0, 51, 102);
    doc.rect(margin, yPos, 4, cardHeight, "F");
    
    doc.setTextColor(100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(t.signatureCompanyName.toUpperCase(), margin + 10, yPos + 8);
    
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(10);
    doc.text(data.companyName, margin + 10, yPos + 18);
  }

  // Contact card
  if (data.contactName) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(46, 125, 50);
    doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 2, 2, "FD");
    
    doc.setFillColor(46, 125, 50);
    doc.rect(margin + cardWidth + 10, yPos, 4, cardHeight, "F");
    
    doc.setTextColor(100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(t.signatureRepName.toUpperCase(), margin + cardWidth + 20, yPos + 8);
    
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(10);
    doc.text(data.contactName, margin + cardWidth + 20, yPos + 18);
  }

  // Date card
  yPos += cardHeight + 10;
  if (data.country) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, "FD");
    
    doc.setTextColor(100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("PAÍS / COUNTRY", margin + 10, yPos + 8);
    
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(10);
    doc.text(data.country, margin + 10, yPos + 18);
  }

  // Date
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 2, 2, "FD");
  
  doc.setTextColor(100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(t.signatureDate.toUpperCase(), margin + cardWidth + 20, yPos + 8);
  
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(10);
  doc.text(format(new Date(), "dd/MM/yyyy", { locale: getDateLocale(data.language) }), margin + cardWidth + 20, yPos + 18);

  // Footer on cover
  doc.setTextColor(255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("www.elpgreen.com | info@elpgreen.com | +39 350 102 1359", pageWidth / 2, pageHeight - 8, { align: "center" });

  // === CONTENT PAGES ===
  doc.addPage();
  yPos = 20;

  // Add header to content page
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", margin, 5, 16, 8);
    } catch (e) {
      console.log("Could not add logo to header");
    }
  }
  
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.3);
  doc.line(margin + 18, 9, pageWidth - margin, 9);
  
  doc.setFontSize(6);
  doc.setTextColor(100);
  doc.text(data.title.substring(0, 50), pageWidth - margin, 8, { align: "right" });

  yPos = 20;

  // Content section header
  doc.setFillColor(0, 51, 102);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, "F");
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`📄 ${data.title}`, margin + 4, yPos + 7);
  yPos += 18;

  // Content text
  doc.setTextColor(50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const contentLines = doc.splitTextToSize(data.content, contentWidth - 4);
  
  const addPage = () => {
    doc.addPage();
    yPos = 20;
    
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", margin, 5, 16, 8);
      } catch (e) {}
    }
    
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.3);
    doc.line(margin + 18, 9, pageWidth - margin, 9);
    doc.setFontSize(6);
    doc.setTextColor(100);
    doc.text(data.title.substring(0, 50), pageWidth - margin, 8, { align: "right" });
  };

  contentLines.forEach((line: string) => {
    if (yPos > maxY) {
      addPage();
    }
    doc.setTextColor(50);
    doc.setFontSize(9);
    doc.text(line, margin + 2, yPos);
    yPos += 5;
  });

  // === SIGNATURE PAGE ===
  if (data.includeSignature || data.signatureData) {
    addPage();
    
    // Page header
    doc.setFillColor(0, 51, 102);
    doc.roundedRect(margin, yPos - 2, contentWidth, 12, 2, 2, "F");
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`✍️ ${t.signaturePage}`, margin + 4, yPos + 6);
    yPos += 18;

    // Partnership reminder
    doc.setFillColor(46, 125, 50);
    doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(t.globalPartnership, pageWidth / 2, yPos + 5, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(t.partnershipModel, pageWidth / 2, yPos + 10, { align: "center" });
    yPos += 20;

    // Signatory information section
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, 55, 2, 2, "FD");
    
    // Header
    doc.setFillColor(0, 51, 102);
    doc.roundedRect(margin, yPos, contentWidth, 8, 2, 0, "F");
    doc.rect(margin, yPos + 4, contentWidth, 4, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(t.signaturePartnerInfo, margin + 4, yPos + 5.5);
    
    // Form fields
    const fieldY = yPos + 14;
    const fieldColW = (contentWidth - 12) / 2;
    
    const fields = [
      { label: t.signatureCompanyName, x: margin + 4, y: fieldY },
      { label: t.signatureRepName, x: margin + 4 + fieldColW + 4, y: fieldY },
      { label: t.signaturePosition, x: margin + 4, y: fieldY + 14 },
      { label: t.signatureEmail, x: margin + 4 + fieldColW + 4, y: fieldY + 14 },
      { label: t.signaturePhone, x: margin + 4, y: fieldY + 28 },
      { label: t.signatureDate, x: margin + 4 + fieldColW + 4, y: fieldY + 28 }
    ];
    
    fields.forEach(field => {
      doc.setTextColor(80);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(field.label + ":", field.x, field.y);
      
      // Input line
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(field.x, field.y + 7, field.x + fieldColW - 4, field.y + 7);
    });
    
    yPos += 62;

    // Declaration section
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "FD");
    
    doc.setTextColor(50);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const declLines = doc.splitTextToSize(t.signatureDeclaration, contentWidth - 8);
    let declY = yPos + 7;
    declLines.forEach((line: string) => {
      doc.text(line, margin + 4, declY);
      declY += 5;
    });
    yPos += 32;

    // Signature boxes
    const sigBoxW = (contentWidth - 8) / 2;
    const sigBoxH = 45;
    
    // Partner signature box
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, sigBoxW, sigBoxH, 2, 2, "FD");
    
    doc.setFillColor(0, 51, 102);
    doc.roundedRect(margin, yPos, sigBoxW, 7, 2, 0, "F");
    doc.rect(margin, yPos + 3, sigBoxW, 4, "F");
    doc.setTextColor(255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(t.signaturePartner, margin + sigBoxW / 2, yPos + 5, { align: "center" });
    
    // Add existing signature if provided
    if (data.signatureData) {
      try {
        doc.addImage(data.signatureData.dataUrl, "PNG", margin + 8, yPos + 12, 50, 20);
        
        // Verified badge
        doc.setFillColor(34, 139, 34);
        doc.roundedRect(margin + 5, yPos + sigBoxH - 10, 45, 7, 2, 2, "F");
        doc.setTextColor(255);
        doc.setFontSize(5);
        doc.text(`✓ ${t.verifiedSignature}`, margin + 27.5, yPos + sigBoxH - 6, { align: "center" });
      } catch (e) {
        console.log("Could not add signature image");
      }
    } else {
      // Signature line
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(margin + 10, yPos + 32, margin + sigBoxW - 10, yPos + 32);
    }
    
    doc.setTextColor(120);
    doc.setFontSize(5);
    doc.setFont("helvetica", "italic");
    doc.text(t.signatureDate, margin + 10, yPos + 40);
    doc.line(margin + 10, yPos + 41, margin + 40, yPos + 41);
    
    // ELP signature box
    doc.setFillColor(240, 255, 240);
    doc.setDrawColor(46, 125, 50);
    doc.roundedRect(margin + sigBoxW + 8, yPos, sigBoxW, sigBoxH, 2, 2, "FD");
    
    doc.setFillColor(46, 125, 50);
    doc.roundedRect(margin + sigBoxW + 8, yPos, sigBoxW, 7, 2, 0, "F");
    doc.rect(margin + sigBoxW + 8, yPos + 3, sigBoxW, 4, "F");
    doc.setTextColor(255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(t.signatureElp, margin + sigBoxW + 8 + sigBoxW / 2, yPos + 5, { align: "center" });
    
    // Signature line
    doc.setDrawColor(180, 180, 180);
    doc.line(margin + sigBoxW + 18, yPos + 32, margin + sigBoxW * 2 - 2, yPos + 32);
    
    doc.setTextColor(120);
    doc.setFontSize(5);
    doc.setFont("helvetica", "italic");
    doc.text(t.signatureDate, margin + sigBoxW + 18, yPos + 40);
    doc.line(margin + sigBoxW + 18, yPos + 41, margin + sigBoxW + 48, yPos + 41);
    
    yPos += sigBoxH + 8;

    // QR Code section
    if (qrCodeBase64) {
      const qrSectionHeight = 50;
      
      doc.setFillColor(248, 250, 255);
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin, yPos, contentWidth, qrSectionHeight, 3, 3, "FD");
      
      // QR Code
      const qrSize = 35;
      const qrX = margin + 8;
      const qrY = yPos + (qrSectionHeight - qrSize) / 2;
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, "F");
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.3);
      doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, "S");
      
      try {
        doc.addImage(qrCodeBase64, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (e) {
        console.log("Could not add QR code to PDF");
      }
      
      // Instructions
      const textStartX = margin + qrSize + 20;
      const textMaxWidth = contentWidth - qrSize - 30;
      
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`📱 ${t.qrCodeTitle}`, textStartX, yPos + 12);
      
      doc.setTextColor(60);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const qrDescLines = doc.splitTextToSize(t.qrCodeDesc, textMaxWidth);
      let qrTextY = yPos + 20;
      qrDescLines.forEach((line: string) => {
        doc.text(line, textStartX, qrTextY);
        qrTextY += 5;
      });
      
      // URL
      doc.setTextColor(46, 125, 50);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(`🌐 ${data.qrCodeUrl}`, textStartX, qrTextY + 3);
      
      // Scan badge
      doc.setFillColor(46, 125, 50);
      doc.roundedRect(textStartX, qrTextY + 7, 45, 7, 2, 2, "F");
      doc.setTextColor(255);
      doc.setFontSize(6);
      doc.text(t.qrCodeScan, textStartX + 22.5, qrTextY + 11.5, { align: "center" });
      
      yPos += qrSectionHeight + 6;
    }

    // Witness section
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "FD");
    
    doc.setTextColor(100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(t.signatureWitness, margin + 4, yPos + 6);
    
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text("Name:", margin + 4, yPos + 12);
    doc.line(margin + 20, yPos + 12, margin + 80, yPos + 12);
    
    doc.text("Signature:", margin + 4, yPos + 18);
    doc.line(margin + 25, yPos + 18, margin + 80, yPos + 18);
    
    doc.text(t.signatureDate + ":", margin + 90, yPos + 12);
    doc.line(margin + 105, yPos + 12, margin + contentWidth - 4, yPos + 12);
  }

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.3);
    doc.line(margin, 282, pageWidth - margin, 282);
    
    doc.setFontSize(5);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text("ELP Green Technology", margin, 286);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("www.elpgreen.com | info@elpgreen.com | +39 350 102 1359", margin, 290);
    
    doc.setTextColor(120);
    doc.text(t.confidential, pageWidth / 2, 290, { align: "center" });
    
    doc.setFontSize(6);
    doc.setTextColor(0, 51, 102);
    doc.text(`${t.page} ${i} ${t.of} ${totalPages}`, pageWidth - margin, 286, { align: "right" });
  }

  // Save the PDF
  const fileName = `ELP_${data.documentType.toUpperCase()}_${(data.companyName || "Document").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

// Export for use in DocumentGenerator component
export { generateQRCode, loadLogoAsBase64 };
