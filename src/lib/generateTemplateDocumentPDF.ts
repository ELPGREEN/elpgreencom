import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR, enUS, es, it, zhCN } from "date-fns/locale";
import logoElp from "@/assets/logo-elp-lion.png";

export interface TemplateDocumentData {
  templateName: string;
  templateType: string;
  content: string;
  language: "pt" | "en" | "es" | "zh" | "it";
  fieldValues: Record<string, string>;
  checkboxValues?: Record<string, boolean>;
  uploadedFiles?: string[];
  signatureData?: {
    dataUrl: string;
    timestamp: string;
    signerName: string;
    signerEmail: string;
    type: "drawn" | "typed";
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
  filledInfo: string;
}

// Professional color palette
const colors = {
  primary: { r: 0, g: 51, b: 102 }, // Navy blue
  secondary: { r: 46, g: 125, b: 50 }, // Green
  accent: { r: 26, g: 43, b: 60 }, // Dark blue
  gold: { r: 181, g: 144, b: 66 }, // Gold accent
  text: { r: 50, g: 50, b: 50 }, // Dark gray text
  textLight: { r: 100, g: 100, b: 100 }, // Light gray text
  background: { r: 255, g: 255, b: 255 }, // White
  bgLight: { r: 248, g: 250, b: 252 }, // Light gray bg
  border: { r: 220, g: 220, b: 220 }, // Border color
  success: { r: 34, g: 139, b: 34 }, // Success green
  warning: { r: 255, g: 193, b: 7 }, // Warning yellow
};

const translations: Record<string, Translations> = {
  pt: {
    confidential: "CONFIDENCIAL",
    page: "Página",
    of: "de",
    digitalSignature: "ASSINATURA DIGITAL",
    signedDocument: "DOCUMENTO ASSINADO DIGITALMENTE",
    signedBy: "Assinado por",
    email: "Email",
    date: "Data",
    signatureType: "Tipo",
    drawnSignature: "Manuscrita Digital",
    typedSignature: "Digitada",
    verificationHash: "Hash de Verificação SHA-256",
    attachedFiles: "Documentos Anexados",
    documentGenerated: "Documento gerado em",
    legalNotice: "Documento gerado eletronicamente - válido conforme Lei 14.063/2020 | eIDAS (UE)",
    documentChecklist: "Checklist de Documentos",
    verified: "Verificado",
    pending: "Pendente",
    filledInfo: "INFORMAÇÕES DO DOCUMENTO",
  },
  en: {
    confidential: "CONFIDENTIAL",
    page: "Page",
    of: "of",
    digitalSignature: "DIGITAL SIGNATURE",
    signedDocument: "DIGITALLY SIGNED DOCUMENT",
    signedBy: "Signed by",
    email: "Email",
    date: "Date",
    signatureType: "Type",
    drawnSignature: "Digital Handwritten",
    typedSignature: "Typed",
    verificationHash: "SHA-256 Verification Hash",
    attachedFiles: "Attached Documents",
    documentGenerated: "Document generated on",
    legalNotice: "Electronically generated document - valid according to Law 14.063/2020 | eIDAS (EU)",
    documentChecklist: "Document Checklist",
    verified: "Verified",
    pending: "Pending",
    filledInfo: "DOCUMENT INFORMATION",
  },
  es: {
    confidential: "CONFIDENCIAL",
    page: "Página",
    of: "de",
    digitalSignature: "FIRMA DIGITAL",
    signedDocument: "DOCUMENTO FIRMADO DIGITALMENTE",
    signedBy: "Firmado por",
    email: "Correo",
    date: "Fecha",
    signatureType: "Tipo",
    drawnSignature: "Manuscrita Digital",
    typedSignature: "Digitada",
    verificationHash: "Hash de Verificación SHA-256",
    attachedFiles: "Documentos Adjuntos",
    documentGenerated: "Documento generado el",
    legalNotice: "Documento generado electrónicamente - válido conforme Ley 14.063/2020 | eIDAS (UE)",
    documentChecklist: "Lista de Documentos",
    verified: "Verificado",
    pending: "Pendiente",
    filledInfo: "INFORMACIÓN DEL DOCUMENTO",
  },
  zh: {
    confidential: "机密",
    page: "页",
    of: "/",
    digitalSignature: "数字签名",
    signedDocument: "数字签名文件",
    signedBy: "签署人",
    email: "电子邮件",
    date: "日期",
    signatureType: "类型",
    drawnSignature: "手写数字签名",
    typedSignature: "键入签名",
    verificationHash: "SHA-256验证哈希",
    attachedFiles: "附件文档",
    documentGenerated: "文件生成于",
    legalNotice: "电子生成文件 - 根据14.063/2020法律有效 | eIDAS (欧盟)",
    documentChecklist: "文件清单",
    verified: "已验证",
    pending: "待处理",
    filledInfo: "文件信息",
  },
  it: {
    confidential: "RISERVATO",
    page: "Pagina",
    of: "di",
    digitalSignature: "FIRMA DIGITALE",
    signedDocument: "DOCUMENTO FIRMATO DIGITALMENTE",
    signedBy: "Firmato da",
    email: "Email",
    date: "Data",
    signatureType: "Tipo",
    drawnSignature: "Manoscritta Digitale",
    typedSignature: "Digitata",
    verificationHash: "Hash di Verifica SHA-256",
    attachedFiles: "Documenti Allegati",
    documentGenerated: "Documento generato il",
    legalNotice: "Documento generato elettronicamente - valido ai sensi Legge 14.063/2020 | eIDAS (UE)",
    documentChecklist: "Checklist Documenti",
    verified: "Verificato",
    pending: "In attesa",
    filledInfo: "INFORMAZIONI DOCUMENTO",
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
    console.error("Error loading logo:", error);
    return null;
  }
}

export async function generateTemplateDocumentPDF(data: TemplateDocumentData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const t = translations[data.language] || translations.en;

  const logoBase64 = await loadLogoAsBase64();

  // ========== HELPER FUNCTIONS ==========

  // Professional header with gradient-like effect
  const addHeader = (showDocType: boolean = true) => {
    // Top accent bar
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(0, 0, pageWidth, 4, "F");

    // Header background
    doc.setFillColor(colors.background.r, colors.background.g, colors.background.b);
    doc.rect(0, 4, pageWidth, 28, "F");

    // Left: Logo and company name
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", margin, 8, 20, 18);
      } catch (e) {
        console.log("Could not add logo");
      }
    }

    // Company name with professional typography
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ELP Green Technology", margin + 24, 16);

    // Tagline
    doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Innovative Solutions for Sustainable Future", margin + 24, 22);

    // Document type badge on right
    if (showDocType) {
      const typeText = data.templateType.toUpperCase().replace(/_/g, " ");
      const typeWidth = Math.max(doc.getTextWidth(typeText) + 16, 40);

      doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
      doc.roundedRect(pageWidth - margin - typeWidth, 10, typeWidth, 12, 3, 3, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(typeText, pageWidth - margin - typeWidth / 2, 17.5, { align: "center" });
    }

    // Bottom border line
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);
  };

  // Professional footer
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 18;

    // Top line
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Left: Website
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("www.elpgreen.com", margin, footerY + 6);

    // Left below: Email
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
    doc.text("info@elpgreen.com", margin, footerY + 11);

    // Center: Page number
    doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    doc.setFontSize(9);
    doc.text(`${t.page} ${pageNum} ${t.of} ${totalPages}`, pageWidth / 2, footerY + 8, { align: "center" });

    // Right: Date/Time
    doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
    doc.setFontSize(8);
    doc.text(format(new Date(), "dd/MM/yyyy HH:mm"), pageWidth - margin, footerY + 8, { align: "right" });
  };

  // Section header helper
  const addSectionHeader = (title: string, yPos: number, iconColor?: typeof colors.primary): number => {
    const color = iconColor || colors.primary;

    // Left accent bar
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(margin, yPos, 4, 10, "F");

    // Title
    doc.setTextColor(color.r, color.g, color.b);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 8, yPos + 7);

    // Underline
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 12, pageWidth - margin, yPos + 12);

    return yPos + 18;
  };

  // Info row helper
  const addInfoRow = (label: string, value: string, yPos: number, maxWidth: number = contentWidth - 20): number => {
    doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin + 5, yPos);

    doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    doc.setFont("helvetica", "normal");

    const labelWidth = doc.getTextWidth(label + ": ");
    const availableWidth = maxWidth - labelWidth - 10;
    const valueText = value.length > 80 ? value.substring(0, 77) + "..." : value;

    doc.text(valueText, margin + 5 + labelWidth, yPos);

    return yPos + 7;
  };

  let currentPage = 1;
  let yPos = 40;

  // ========== PAGE 1: COVER PAGE ==========
  addHeader();

  // Document Title Section
  yPos = 50;

  // Title container with subtle background
  doc.setFillColor(colors.bgLight.r, colors.bgLight.g, colors.bgLight.b);
  doc.roundedRect(margin, yPos, contentWidth, 35, 4, 4, "F");

  // Document title
  doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  const titleLines = doc.splitTextToSize(data.templateName, contentWidth - 20);
  let titleY = yPos + 15;
  titleLines.forEach((line: string, index: number) => {
    if (index < 2) {
      // Max 2 lines
      doc.text(line, pageWidth / 2, titleY, { align: "center" });
      titleY += 10;
    }
  });

  // Decorative accent line under title
  doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  doc.rect(pageWidth / 2 - 25, yPos + 28, 50, 2, "F");

  yPos = 95;

  // Filled Information Section
  const fieldEntries = Object.entries(data.fieldValues).filter(
    ([key, value]) => value && !key.startsWith("file_") && value.toString().trim() !== "",
  );

  if (fieldEntries.length > 0) {
    yPos = addSectionHeader(t.filledInfo, yPos);

    // Info container
    const infoBoxHeight = Math.min(fieldEntries.length * 9 + 10, 90);
    doc.setFillColor(colors.bgLight.r, colors.bgLight.g, colors.bgLight.b);
    doc.roundedRect(margin, yPos, contentWidth, infoBoxHeight, 3, 3, "F");

    // Subtle left border
    doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.rect(margin, yPos, 3, infoBoxHeight, "F");

    yPos += 8;

    fieldEntries.slice(0, 10).forEach(([key, value]) => {
      const label = key
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())
        .replace(/([a-z])([A-Z])/g, "$1 $2");

      yPos = addInfoRow(label, String(value), yPos);
    });

    yPos += 10;
  }

  // Document Checklist Section
  if (data.checkboxValues && Object.keys(data.checkboxValues).length > 0) {
    const checkboxEntries = Object.entries(data.checkboxValues);
    const checkedCount = checkboxEntries.filter(([_, v]) => v).length;

    yPos = addSectionHeader(
      `${t.documentChecklist} (${checkedCount}/${checkboxEntries.length})`,
      yPos,
      colors.secondary,
    );

    // Grid layout for checkboxes (2 columns)
    const colWidth = (contentWidth - 10) / 2;
    let col = 0;
    let rowY = yPos;

    checkboxEntries.forEach(([key, checked], index) => {
      const label = key
        .replace(/^doc_/, "")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());

      const xPos = margin + 5 + col * colWidth;

      // Checkbox
      if (checked) {
        doc.setFillColor(colors.success.r, colors.success.g, colors.success.b);
        doc.roundedRect(xPos, rowY - 3, 6, 6, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("✓", xPos + 1.5, rowY + 1.5);
      } else {
        doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
        doc.setLineWidth(0.5);
        doc.roundedRect(xPos, rowY - 3, 6, 6, 1, 1, "S");
      }

      // Label
      doc.setTextColor(
        checked ? colors.text.r : colors.textLight.r,
        checked ? colors.text.g : colors.textLight.g,
        checked ? colors.text.b : colors.textLight.b,
      );
      doc.setFontSize(8);
      doc.setFont("helvetica", checked ? "bold" : "normal");
      doc.text(label.substring(0, 30), xPos + 9, rowY + 1);

      col++;
      if (col >= 2) {
        col = 0;
        rowY += 10;
      }
    });

    yPos = rowY + 15;
  }

  // Attached Files Section
  if (data.uploadedFiles && data.uploadedFiles.length > 0) {
    yPos = addSectionHeader(t.attachedFiles, yPos, colors.gold);

    doc.setFillColor(255, 252, 240);
    const filesBoxHeight = data.uploadedFiles.length * 8 + 10;
    doc.roundedRect(margin, yPos, contentWidth, filesBoxHeight, 3, 3, "F");

    doc.setFillColor(colors.gold.r, colors.gold.g, colors.gold.b);
    doc.rect(margin, yPos, 3, filesBoxHeight, "F");

    yPos += 8;

    doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    data.uploadedFiles.forEach((fileName) => {
      doc.text("📄 " + fileName, margin + 8, yPos);
      yPos += 7;
    });

    yPos += 10;
  }

  // ========== CONTENT PAGES ==========
  doc.addPage();
  currentPage++;
  addHeader(false);

  yPos = 40;

  // Process content with markdown-aware styling
  doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const lines = data.content.split("\n");
  const maxY = pageHeight - 30;

  lines.forEach((line) => {
    if (yPos > maxY) {
      doc.addPage();
      currentPage++;
      addHeader(false);
      yPos = 40;
    }

    const trimmedLine = line.trim();

    // Handle markdown headers
    if (trimmedLine.startsWith("# ")) {
      yPos += 5;
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(trimmedLine.replace("# ", ""), margin, yPos);
      yPos += 8;

      // Underline for H1
      doc.setDrawColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 2, margin + doc.getTextWidth(trimmedLine.replace("# ", "")), yPos - 2);
      yPos += 4;
    } else if (trimmedLine.startsWith("## ")) {
      yPos += 4;
      doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(trimmedLine.replace("## ", ""), margin, yPos);
      yPos += 7;
    } else if (trimmedLine.startsWith("### ")) {
      yPos += 3;
      doc.setTextColor(colors.accent.r, colors.accent.g, colors.accent.b);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(trimmedLine.replace("### ", ""), margin, yPos);
      yPos += 6;
    } else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const text = trimmedLine.replace(/\*\*/g, "");
      const wrappedLines = doc.splitTextToSize(text, contentWidth);
      wrappedLines.forEach((wl: string) => {
        if (yPos > maxY) {
          doc.addPage();
          currentPage++;
          addHeader(false);
          yPos = 40;
        }
        doc.text(wl, margin, yPos);
        yPos += 5;
      });
    } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ")) {
      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Bullet point
      doc.setFillColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
      doc.circle(margin + 2, yPos - 1.5, 1.2, "F");

      const text = trimmedLine.replace(/^[-•]\s*/, "");
      const wrappedLines = doc.splitTextToSize(text, contentWidth - 10);
      wrappedLines.forEach((wl: string, idx: number) => {
        if (yPos > maxY) {
          doc.addPage();
          currentPage++;
          addHeader(false);
          yPos = 40;
        }
        doc.text(wl, margin + (idx === 0 ? 6 : 6), yPos);
        yPos += 5;
      });
    } else if (trimmedLine.startsWith("---") || trimmedLine.startsWith("___")) {
      yPos += 3;
      doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
    } else if (trimmedLine === "") {
      yPos += 3;
    } else {
      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Handle inline bold
      let processedLine = trimmedLine.replace(/\*\*(.+?)\*\*/g, "$1");

      const wrappedLines = doc.splitTextToSize(processedLine, contentWidth);
      wrappedLines.forEach((wl: string) => {
        if (yPos > maxY) {
          doc.addPage();
          currentPage++;
          addHeader(false);
          yPos = 40;
        }
        doc.text(wl, margin, yPos);
        yPos += 5;
      });
    }
  });

  // ========== SIGNATURE PAGE ==========
  if (data.signatureData) {
    doc.addPage();
    currentPage++;
    addHeader(false);

    yPos = 50;

    // Signature section header
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`✍ ${t.digitalSignature}`, margin + 10, yPos + 9);

    yPos += 25;

    // Signature container
    doc.setFillColor(colors.bgLight.r, colors.bgLight.g, colors.bgLight.b);
    doc.setDrawColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, contentWidth, 90, 5, 5, "FD");

    // Verified badge
    doc.setFillColor(colors.success.r, colors.success.g, colors.success.b);
    doc.roundedRect(margin + 10, yPos + 8, 70, 10, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`✓ ${t.signedDocument}`, margin + 45, yPos + 14, { align: "center" });

    // Signature image
    try {
      doc.addImage(data.signatureData.dataUrl, "PNG", margin + 15, yPos + 25, 70, 30);
    } catch (e) {
      console.error("Could not add signature image:", e);
    }

    // Signature details (right side)
    const detailsX = margin + 100;
    let detailsY = yPos + 25;

    const addSignatureDetail = (label: string, value: string) => {
      doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(label, detailsX, detailsY);

      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.setFont("helvetica", "normal");
      doc.text(value, detailsX, detailsY + 5);

      detailsY += 15;
    };

    addSignatureDetail(t.signedBy + ":", data.signatureData.signerName);
    addSignatureDetail(t.email + ":", data.signatureData.signerEmail);
    addSignatureDetail(
      t.date + ":",
      format(new Date(data.signatureData.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", {
        locale: getDateLocale(data.language),
      }),
    );
    addSignatureDetail(
      t.signatureType + ":",
      data.signatureData.type === "drawn" ? t.drawnSignature : t.typedSignature,
    );

    yPos += 100;

    // Verification hash
    if (data.signatureHash) {
      doc.setFillColor(240, 240, 245);
      doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, "F");

      doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(t.verificationHash + ":", margin + 5, yPos + 7);

      doc.setFont("courier", "normal");
      doc.setFontSize(6);
      doc.text(data.signatureHash, margin + 5, yPos + 14);

      yPos += 30;
    }

    // Legal notice
    doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(t.legalNotice, pageWidth / 2, yPos, { align: "center" });
  }

  // ========== ADD FOOTERS TO ALL PAGES ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Generate filename
  const companyName = data.fieldValues.razao_social || data.fieldValues.company_name || "documento";
  const signedSuffix = data.signatureData ? "_ASSINADO" : "";
  const fileName = `${data.templateType.toUpperCase()}_${companyName.replace(/\s/g, "_").substring(0, 30)}_${format(new Date(), "yyyy-MM-dd")}${signedSuffix}.pdf`;

  doc.save(fileName);

  return doc.output("blob");
}
