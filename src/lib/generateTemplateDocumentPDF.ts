import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR, enUS, es, it, zhCN } from 'date-fns/locale';
import logoElp from '@/assets/logo-elp-lion.png';

export interface TemplateDocumentData {
  templateName: string;
  templateType: string;
  content: string;
  language: 'pt' | 'en' | 'es' | 'zh' | 'it';
  fieldValues: Record<string, string>;
  checkboxValues?: Record<string, boolean>;
  uploadedFiles?: string[];
  signatureData?: {
    dataUrl: string;
    timestamp: string;
    signerName: string;
    signerEmail: string;
    type: 'drawn' | 'typed';
  } | null;
  signatureHash?: string;
}

interface Translations {
  confidential: string;
  page: string;
  of: string;
  digitalSignature: string;
  signedDocument: string;
  signedBy: string;
  email: string;
  date: string;
  signatureType: string;
  drawnSignature: string;
  typedSignature: string;
  verificationHash: string;
  attachedFiles: string;
  documentGenerated: string;
  legalNotice: string;
  documentChecklist: string;
  verified: string;
  pending: string;
}

const translations: Record<string, Translations> = {
  pt: {
    confidential: 'CONFIDENCIAL',
    page: 'Página',
    of: 'de',
    digitalSignature: 'ASSINATURA DIGITAL',
    signedDocument: 'DOCUMENTO ASSINADO',
    signedBy: 'Assinado por',
    email: 'Email',
    date: 'Data',
    signatureType: 'Tipo',
    drawnSignature: 'Manuscrita Digital',
    typedSignature: 'Digitada',
    verificationHash: 'Hash de Verificação SHA-256',
    attachedFiles: 'Arquivos Anexados',
    documentGenerated: 'Documento gerado em',
    legalNotice: 'Válido conforme Lei 14.063/2020 | eIDAS (UE)',
    documentChecklist: 'Checklist de Documentos',
    verified: 'Verificado',
    pending: 'Pendente',
  },
  en: {
    confidential: 'CONFIDENTIAL',
    page: 'Page',
    of: 'of',
    digitalSignature: 'DIGITAL SIGNATURE',
    signedDocument: 'SIGNED DOCUMENT',
    signedBy: 'Signed by',
    email: 'Email',
    date: 'Date',
    signatureType: 'Type',
    drawnSignature: 'Digital Handwritten',
    typedSignature: 'Typed',
    verificationHash: 'SHA-256 Verification Hash',
    attachedFiles: 'Attached Files',
    documentGenerated: 'Document generated on',
    legalNotice: 'Valid according to Law 14.063/2020 | eIDAS (EU)',
    documentChecklist: 'Document Checklist',
    verified: 'Verified',
    pending: 'Pending',
  },
  es: {
    confidential: 'CONFIDENCIAL',
    page: 'Página',
    of: 'de',
    digitalSignature: 'FIRMA DIGITAL',
    signedDocument: 'DOCUMENTO FIRMADO',
    signedBy: 'Firmado por',
    email: 'Correo',
    date: 'Fecha',
    signatureType: 'Tipo',
    drawnSignature: 'Manuscrita Digital',
    typedSignature: 'Digitada',
    verificationHash: 'Hash de Verificación SHA-256',
    attachedFiles: 'Archivos Adjuntos',
    documentGenerated: 'Documento generado el',
    legalNotice: 'Válido conforme Ley 14.063/2020 | eIDAS (UE)',
    documentChecklist: 'Lista de Documentos',
    verified: 'Verificado',
    pending: 'Pendiente',
  },
  zh: {
    confidential: '机密',
    page: '页',
    of: '/',
    digitalSignature: '数字签名',
    signedDocument: '已签署文件',
    signedBy: '签署人',
    email: '电子邮件',
    date: '日期',
    signatureType: '类型',
    drawnSignature: '手写数字签名',
    typedSignature: '键入签名',
    verificationHash: 'SHA-256验证哈希',
    attachedFiles: '附件',
    documentGenerated: '文件生成于',
    legalNotice: '根据14.063/2020法律有效 | eIDAS (欧盟)',
    documentChecklist: '文件清单',
    verified: '已验证',
    pending: '待处理',
  },
  it: {
    confidential: 'RISERVATO',
    page: 'Pagina',
    of: 'di',
    digitalSignature: 'FIRMA DIGITALE',
    signedDocument: 'DOCUMENTO FIRMATO',
    signedBy: 'Firmato da',
    email: 'Email',
    date: 'Data',
    signatureType: 'Tipo',
    drawnSignature: 'Manoscritta Digitale',
    typedSignature: 'Digitata',
    verificationHash: 'Hash di Verifica SHA-256',
    attachedFiles: 'File Allegati',
    documentGenerated: 'Documento generato il',
    legalNotice: 'Valido ai sensi Legge 14.063/2020 | eIDAS (UE)',
    documentChecklist: 'Checklist Documenti',
    verified: 'Verificato',
    pending: 'In attesa',
  },
};

const getDateLocale = (lang: string) => {
  const locales: Record<string, typeof ptBR> = { pt: ptBR, en: enUS, es: es, it: it, zh: zhCN };
  return locales[lang] || enUS;
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
    console.error('Error loading logo:', error);
    return null;
  }
}

export async function generateTemplateDocumentPDF(data: TemplateDocumentData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const t = translations[data.language] || translations.en;
  
  const logoBase64 = await loadLogoAsBase64();
  
  // Helper function to add watermark
  const addWatermark = () => {
    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: 0.08 }));
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');
    
    // Diagonal watermarks
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        doc.text(t.confidential, 30 + j * 60, 50 + i * 60, { angle: 45 });
      }
    }
    doc.restoreGraphicsState();
  };
  
  // Helper function to add header
  const addHeader = () => {
    // White header background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    // Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, 4, 16, 12);
      } catch (e) {
        console.log('Could not add logo');
      }
    }
    
    // Company name
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ELP Green Technology', margin + 20, 10);
    
    // Separator line
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(margin, 18, pageWidth - margin, 18);
    
    // Document type badge on right
    const typeText = data.templateType.toUpperCase();
    const typeWidth = doc.getTextWidth(typeText) + 10;
    doc.setFillColor(46, 125, 50);
    doc.roundedRect(pageWidth - margin - typeWidth, 6, typeWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(typeText, pageWidth - margin - typeWidth / 2, 11, { align: 'center' });
  };
  
  // Helper function to add footer
  const addFooter = (pageNum: number, totalPages: number) => {
    // Footer background
    doc.setFillColor(0, 51, 102);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    // Footer text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    // Left: Company info
    doc.text('www.elpgreen.com | info@elpgreen.com', margin, pageHeight - 8);
    
    // Center: Page number
    doc.text(`${t.page} ${pageNum} ${t.of} ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Right: Date
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), pageWidth - margin, pageHeight - 8, { align: 'right' });
  };
  
  let currentPage = 1;
  let yPos = 25;
  
  // === PAGE 1: COVER ===
  addWatermark();
  
  // White content area
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 20, contentWidth, pageHeight - 45, 3, 3, 'F');
  
  addHeader();
  
  // Document title
  yPos = 40;
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.templateName, contentWidth - 10);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  });
  
  // Decorative line
  yPos += 5;
  doc.setDrawColor(46, 125, 50);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 30, yPos, pageWidth / 2 + 30, yPos);
  yPos += 10;
  
  // Document type
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.templateType.replace(/_/g, ' ').toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Filled fields section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.3);
  
  const fieldEntries = Object.entries(data.fieldValues).filter(([key, value]) => value && !key.startsWith('file_'));
  
  if (fieldEntries.length > 0) {
    const boxHeight = Math.min(fieldEntries.length * 12 + 15, 100);
    doc.roundedRect(margin + 5, yPos, contentWidth - 10, boxHeight, 2, 2, 'FD');
    
    yPos += 8;
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES PREENCHIDAS / FILLED INFORMATION', margin + 10, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.setFontSize(8);
    
    fieldEntries.slice(0, 8).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin + 10, yPos);
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.text(String(value).substring(0, 60), margin + 10 + labelWidth, yPos);
      yPos += 7;
    });
    
    yPos += 10;
  }
  
  // Checkbox section
  if (data.checkboxValues && Object.keys(data.checkboxValues).length > 0) {
    const checkboxEntries = Object.entries(data.checkboxValues);
    const checkedCount = checkboxEntries.filter(([_, v]) => v).length;
    
    doc.setFillColor(248, 250, 252);
    const checkboxBoxHeight = checkboxEntries.length * 10 + 20;
    doc.roundedRect(margin + 5, yPos, contentWidth - 10, checkboxBoxHeight, 2, 2, 'FD');
    
    yPos += 8;
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.documentChecklist} (${checkedCount}/${checkboxEntries.length})`, margin + 10, yPos);
    yPos += 10;
    
    doc.setFontSize(8);
    checkboxEntries.forEach(([key, checked]) => {
      const label = key.replace(/^doc_/, '').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      
      // Checkbox
      if (checked) {
        doc.setFillColor(46, 125, 50);
        doc.rect(margin + 10, yPos - 4, 5, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text('✓', margin + 11.5, yPos - 0.5);
        doc.setTextColor(46, 125, 50);
      } else {
        doc.setDrawColor(200);
        doc.rect(margin + 10, yPos - 4, 5, 5, 'S');
        doc.setTextColor(150);
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 18, yPos);
      
      // Status badge
      const statusText = checked ? t.verified : t.pending;
      const statusX = pageWidth - margin - 30;
      if (checked) {
        doc.setFillColor(46, 125, 50);
      } else {
        doc.setFillColor(200, 200, 200);
      }
      doc.roundedRect(statusX, yPos - 4, 20, 5, 1, 1, 'F');
      doc.setTextColor(255);
      doc.setFontSize(5);
      doc.text(statusText, statusX + 10, yPos - 0.5, { align: 'center' });
      
      yPos += 8;
    });
    
    yPos += 10;
  }
  
  // Attached files section
  if (data.uploadedFiles && data.uploadedFiles.length > 0) {
    doc.setFillColor(255, 250, 230);
    doc.setDrawColor(200, 150, 50);
    doc.roundedRect(margin + 5, yPos, contentWidth - 10, data.uploadedFiles.length * 8 + 15, 2, 2, 'FD');
    
    yPos += 8;
    doc.setTextColor(150, 100, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`📎 ${t.attachedFiles}`, margin + 10, yPos);
    yPos += 8;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    data.uploadedFiles.forEach((fileName) => {
      doc.text(`• ${fileName}`, margin + 15, yPos);
      yPos += 6;
    });
  }
  
  // === CONTENT PAGES ===
  doc.addPage();
  currentPage++;
  
  addWatermark();
  addHeader();
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 22, contentWidth, pageHeight - 42, 2, 2, 'F');
  
  yPos = 30;
  
  // Content
  doc.setTextColor(50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const contentLines = doc.splitTextToSize(data.content, contentWidth - 10);
  const maxY = pageHeight - 25;
  
  contentLines.forEach((line: string) => {
    if (yPos > maxY) {
      doc.addPage();
      currentPage++;
      addWatermark();
      addHeader();
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 22, contentWidth, pageHeight - 42, 2, 2, 'F');
      yPos = 30;
      doc.setTextColor(50);
      doc.setFontSize(9);
    }
    doc.text(line, margin + 5, yPos);
    yPos += 5;
  });
  
  // === SIGNATURE PAGE ===
  if (data.signatureData) {
    doc.addPage();
    currentPage++;
    
    addWatermark();
    addHeader();
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 22, contentWidth, pageHeight - 42, 2, 2, 'F');
    
    yPos = 35;
    
    // Signature section header
    doc.setFillColor(0, 51, 102);
    doc.roundedRect(margin + 5, yPos, contentWidth - 10, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`✍️ ${t.digitalSignature}`, margin + 10, yPos + 8);
    yPos += 20;
    
    // Signature box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 5, yPos, contentWidth - 10, 80, 3, 3, 'FD');
    
    // Signed badge
    doc.setFillColor(46, 125, 50);
    doc.roundedRect(margin + 10, yPos + 5, 50, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`✓ ${t.signedDocument}`, margin + 35, yPos + 10, { align: 'center' });
    
    // Signature image
    try {
      doc.addImage(data.signatureData.dataUrl, 'PNG', margin + 15, yPos + 18, 60, 25);
    } catch (e) {
      console.error('Could not add signature image:', e);
    }
    
    // Signature details
    const detailsX = margin + 85;
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    doc.text(`${t.signedBy}:`, detailsX, yPos + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(data.signatureData.signerName, detailsX + 30, yPos + 22);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.email}:`, detailsX, yPos + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(data.signatureData.signerEmail, detailsX + 30, yPos + 30);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.date}:`, detailsX, yPos + 38);
    doc.setFont('helvetica', 'normal');
    doc.text(
      format(new Date(data.signatureData.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: getDateLocale(data.language) }),
      detailsX + 30,
      yPos + 38
    );
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.signatureType}:`, detailsX, yPos + 46);
    doc.setFont('helvetica', 'normal');
    doc.text(
      data.signatureData.type === 'drawn' ? t.drawnSignature : t.typedSignature,
      detailsX + 30,
      yPos + 46
    );
    
    // Verification hash
    if (data.signatureHash) {
      yPos += 60;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin + 5, yPos, contentWidth - 10, 15, 2, 2, 'F');
      
      doc.setTextColor(100);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(t.verificationHash, margin + 10, yPos + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(data.signatureHash, margin + 10, yPos + 11);
    }
    
    // Legal notice
    yPos += 25;
    doc.setTextColor(100);
    doc.setFontSize(7);
    doc.text(t.legalNotice, pageWidth / 2, yPos, { align: 'center' });
  }
  
  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }
  
  // Generate filename
  const companyName = data.fieldValues.razao_social || data.fieldValues.company_name || 'documento';
  const signedSuffix = data.signatureData ? '_ASSINADO' : '';
  const fileName = `${data.templateType.toUpperCase()}_${companyName.replace(/\s/g, '_').substring(0, 30)}_${format(new Date(), 'yyyy-MM-dd')}${signedSuffix}.pdf`;
  
  doc.save(fileName);
  
  return doc.output('blob');
}
