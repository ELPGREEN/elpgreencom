import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import SignaturePad from 'signature_pad';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SEO } from '@/components/SEO';
import {
  FileSignature,
  Shield,
  CheckCircle2,
  User,
  Mail,
  Building,
  FileText,
  Pencil,
  Type,
  Lock,
  Globe,
  ArrowRight,
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';

// Color palette matching ELP brand
const COLORS = {
  primary: '#1a5c3a',
  secondary: '#228b22',
  accent: '#34c759',
  dark: '#1a2b3c',
  light: '#f8fafc',
};

interface SignatureData {
  dataUrl: string;
  timestamp: string;
  signerName: string;
  signerEmail: string;
  type: 'drawn' | 'typed' | 'initials' | 'upload';
}

type SignatureMode = 'draw' | 'type' | 'initials' | 'upload';

interface DocumentData {
  id: string;
  document_name: string;
  document_type: string;
  field_values: Record<string, string>;
  template_id?: string;
  language?: string;
}

const translations = {
  pt: {
    title: 'Portal de Assinatura Digital',
    subtitle: 'Assine documentos com validade jurídica',
    step1: 'Identificação',
    step2: 'Documento',
    step3: 'Assinatura',
    step4: 'Confirmação',
    fullName: 'Nome Completo',
    email: 'E-mail',
    company: 'Empresa (opcional)',
    documentId: 'CPF/CNPJ',
    continue: 'Continuar',
    back: 'Voltar',
    sign: 'Assinar Documento',
    download: 'Baixar PDF',
    drawSignature: 'Desenhar',
    typeSignature: 'Digitar',
    initialsSignature: 'Iniciais',
    uploadSignature: 'Upload',
    clear: 'Limpar',
    uploadImage: 'Carregar imagem da assinatura',
    signHere: 'Assine aqui usando mouse ou toque',
    legalNotice: 'Declaro que li e concordo com os termos do documento. Esta assinatura eletrônica é legalmente válida conforme a Lei 14.063/2020 e regulação eIDAS (UE).',
    noDocument: 'Documento não encontrado',
    noDocumentDesc: 'O link pode estar expirado ou inválido.',
    success: 'Documento Assinado!',
    successDesc: 'Sua assinatura foi registrada com sucesso.',
    validSignature: 'Assinatura Válida',
    legalCompliance: 'Conforme Lei 14.063/2020 e eIDAS',
    auditTrail: 'Trilha de Auditoria',
    timestamp: 'Data/Hora',
    signatureType: 'Tipo',
    hash: 'Hash SHA-256',
    selectDocument: 'Selecione um documento ou acesse via link direto',
    enterDocId: 'ID do Documento',
    loadDocument: 'Carregar Documento',
    documentPreview: 'Visualização do Documento',
    requiredField: 'Campo obrigatório',
  },
  en: {
    title: 'Digital Signature Portal',
    subtitle: 'Sign documents with legal validity',
    step1: 'Identification',
    step2: 'Document',
    step3: 'Signature',
    step4: 'Confirmation',
    fullName: 'Full Name',
    email: 'Email',
    company: 'Company (optional)',
    documentId: 'ID Number',
    continue: 'Continue',
    back: 'Back',
    sign: 'Sign Document',
    download: 'Download PDF',
    drawSignature: 'Draw',
    typeSignature: 'Type',
    initialsSignature: 'Initials',
    uploadSignature: 'Upload',
    clear: 'Clear',
    uploadImage: 'Upload signature image',
    signHere: 'Sign here using mouse or touch',
    legalNotice: 'I declare that I have read and agree to the terms of the document. This electronic signature is legally valid under Law 14.063/2020 and EU eIDAS regulation.',
    noDocument: 'Document not found',
    noDocumentDesc: 'The link may be expired or invalid.',
    success: 'Document Signed!',
    successDesc: 'Your signature has been successfully recorded.',
    validSignature: 'Valid Signature',
    legalCompliance: 'Compliant with Law 14.063/2020 and eIDAS',
    auditTrail: 'Audit Trail',
    timestamp: 'Date/Time',
    signatureType: 'Type',
    hash: 'SHA-256 Hash',
    selectDocument: 'Select a document or access via direct link',
    enterDocId: 'Document ID',
    loadDocument: 'Load Document',
    documentPreview: 'Document Preview',
    requiredField: 'Required field',
  },
  es: {
    title: 'Portal de Firma Digital',
    subtitle: 'Firme documentos con validez legal',
    step1: 'Identificación',
    step2: 'Documento',
    step3: 'Firma',
    step4: 'Confirmación',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    company: 'Empresa (opcional)',
    documentId: 'Número de ID',
    continue: 'Continuar',
    back: 'Volver',
    sign: 'Firmar Documento',
    download: 'Descargar PDF',
    drawSignature: 'Dibujar',
    typeSignature: 'Escribir',
    initialsSignature: 'Iniciales',
    uploadSignature: 'Subir',
    clear: 'Limpiar',
    uploadImage: 'Subir imagen de firma',
    signHere: 'Firme aquí usando ratón o toque',
    legalNotice: 'Declaro que he leído y acepto los términos del documento. Esta firma electrónica es legalmente válida según la Ley 14.063/2020 y la regulación eIDAS (UE).',
    noDocument: 'Documento no encontrado',
    noDocumentDesc: 'El enlace puede estar expirado o ser inválido.',
    success: '¡Documento Firmado!',
    successDesc: 'Su firma ha sido registrada con éxito.',
    validSignature: 'Firma Válida',
    legalCompliance: 'Conforme a Ley 14.063/2020 y eIDAS',
    auditTrail: 'Pista de Auditoría',
    timestamp: 'Fecha/Hora',
    signatureType: 'Tipo',
    hash: 'Hash SHA-256',
    selectDocument: 'Seleccione un documento o acceda mediante enlace directo',
    enterDocId: 'ID del Documento',
    loadDocument: 'Cargar Documento',
    documentPreview: 'Vista Previa del Documento',
    requiredField: 'Campo obligatorio',
  },
  it: {
    title: 'Portale Firma Digitale',
    subtitle: 'Firma documenti con validità legale',
    step1: 'Identificazione',
    step2: 'Documento',
    step3: 'Firma',
    step4: 'Conferma',
    fullName: 'Nome Completo',
    email: 'Email',
    company: 'Azienda (opzionale)',
    documentId: 'Numero ID',
    continue: 'Continua',
    back: 'Indietro',
    sign: 'Firma Documento',
    download: 'Scarica PDF',
    drawSignature: 'Disegna',
    typeSignature: 'Digita',
    initialsSignature: 'Iniziali',
    uploadSignature: 'Carica',
    clear: 'Cancella',
    uploadImage: 'Carica immagine firma',
    signHere: 'Firma qui usando mouse o tocco',
    legalNotice: 'Dichiaro di aver letto e accettato i termini del documento. Questa firma elettronica è legalmente valida secondo la Legge 14.063/2020 e il regolamento eIDAS (UE).',
    noDocument: 'Documento non trovato',
    noDocumentDesc: 'Il link potrebbe essere scaduto o non valido.',
    success: 'Documento Firmato!',
    successDesc: 'La tua firma è stata registrata con successo.',
    validSignature: 'Firma Valida',
    legalCompliance: 'Conforme alla Legge 14.063/2020 e eIDAS',
    auditTrail: 'Registro di Audit',
    timestamp: 'Data/Ora',
    signatureType: 'Tipo',
    hash: 'Hash SHA-256',
    selectDocument: 'Seleziona un documento o accedi tramite link diretto',
    enterDocId: 'ID Documento',
    loadDocument: 'Carica Documento',
    documentPreview: 'Anteprima Documento',
    requiredField: 'Campo obbligatorio',
  },
  zh: {
    title: '数字签名门户',
    subtitle: '签署具有法律效力的文件',
    step1: '身份识别',
    step2: '文档',
    step3: '签名',
    step4: '确认',
    fullName: '全名',
    email: '电子邮件',
    company: '公司（可选）',
    documentId: '身份证号',
    continue: '继续',
    back: '返回',
    sign: '签署文件',
    download: '下载PDF',
    drawSignature: '绘制',
    typeSignature: '输入',
    initialsSignature: '首字母',
    uploadSignature: '上传',
    clear: '清除',
    uploadImage: '上传签名图片',
    signHere: '使用鼠标或触摸在此签名',
    legalNotice: '我声明已阅读并同意文件条款。此电子签名根据第14.063/2020号法律和欧盟eIDAS法规具有法律效力。',
    noDocument: '未找到文档',
    noDocumentDesc: '链接可能已过期或无效。',
    success: '文件已签署！',
    successDesc: '您的签名已成功记录。',
    validSignature: '有效签名',
    legalCompliance: '符合第14.063/2020号法律和eIDAS',
    auditTrail: '审计跟踪',
    timestamp: '日期/时间',
    signatureType: '类型',
    hash: 'SHA-256哈希',
    selectDocument: '选择文档或通过直接链接访问',
    enterDocId: '文档ID',
    loadDocument: '加载文档',
    documentPreview: '文档预览',
    requiredField: '必填字段',
  },
};

export default function PublicSignature() {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const lang = (searchParams.get('lang') || i18n.language?.split('-')[0] || 'pt') as keyof typeof translations;
  const t = translations[lang] || translations.pt;

  const documentIdParam = searchParams.get('doc');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [finalSignature, setFinalSignature] = useState<SignatureData | null>(null);
  const [signatureHash, setSignatureHash] = useState<string>('');
  const [uploadedSignature, setUploadedSignature] = useState<string>('');
  const [initials, setInitials] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    documentId: '',
    company: '',
  });

  const [documentIdInput, setDocumentIdInput] = useState(documentIdParam || '');
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [typedName, setTypedName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load document from URL param
  useEffect(() => {
    if (documentIdParam) {
      loadDocument(documentIdParam);
    }
  }, [documentIdParam]);

  // Initialize signature pad
  useEffect(() => {
    if (step === 3 && signatureMode === 'draw' && canvasRef.current && canvasContainerRef.current) {
      // Clean up previous instance
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }

      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      
      // Set fixed dimensions
      const width = container.offsetWidth || 500;
      const height = 160;
      
      // Set display size
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      // Set actual size in memory (scaled for retina)
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
        // Fill with white background
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, width, height);
      }

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 51, 102)',
        minWidth: 1.5,
        maxWidth: 3.5,
      });
    }

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
    };
  }, [step, signatureMode]);

  const loadDocument = async (docId: string) => {
    setDocumentLoading(true);
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (error || !data) {
        toast({
          title: t.noDocument,
          description: t.noDocumentDesc,
          variant: 'destructive',
        });
        return;
      }

      setDocument({
        id: data.id,
        document_name: data.document_name,
        document_type: data.document_type,
        field_values: (data.field_values as Record<string, string>) || {},
        template_id: data.template_id || undefined,
        language: data.language || 'pt',
      });

      // Pre-fill form if document has signer info
      if (data.signer_name) setFormData(prev => ({ ...prev, name: data.signer_name || '' }));
      if (data.signer_email) setFormData(prev => ({ ...prev, email: data.signer_email || '' }));

    } catch (err) {
      console.error('Error loading document:', err);
      toast({
        title: t.noDocument,
        description: t.noDocumentDesc,
        variant: 'destructive',
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleLoadDocument = () => {
    if (documentIdInput.trim()) {
      loadDocument(documentIdInput.trim());
    }
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      // Refill with white background
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          ctx.fillStyle = 'rgb(255, 255, 255)';
          ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
        }
      }
    }
    setTypedName('');
    setInitials('');
    setUploadedSignature('');
  };

  const generateTypedSignature = (name: string, isInitials = false): string => {
    const canvas = window.document.createElement('canvas');
    canvas.width = isInitials ? 150 : 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#003366';
    ctx.font = isInitials ? 'bold 48px serif' : 'italic 36px "Brush Script MT", cursive, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, envie uma imagem.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getSignatureType = (mode: SignatureMode): SignatureData['type'] => {
    switch (mode) {
      case 'draw': return 'drawn';
      case 'type': return 'typed';
      case 'initials': return 'initials';
      case 'upload': return 'upload';
    }
  };

  const handleSign = async () => {
    if (!document) return;

    let signatureDataUrl = '';

    if (signatureMode === 'draw') {
      if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
        toast({
          title: 'Assinatura necessária',
          description: 'Por favor, desenhe sua assinatura.',
          variant: 'destructive',
        });
        return;
      }
      signatureDataUrl = signaturePadRef.current.toDataURL('image/png');
    } else if (signatureMode === 'type') {
      if (!typedName.trim()) {
        toast({
          title: 'Nome necessário',
          description: 'Por favor, digite seu nome para assinar.',
          variant: 'destructive',
        });
        return;
      }
      signatureDataUrl = generateTypedSignature(typedName);
    } else if (signatureMode === 'initials') {
      if (!initials.trim()) {
        toast({
          title: 'Iniciais necessárias',
          description: 'Por favor, digite suas iniciais.',
          variant: 'destructive',
        });
        return;
      }
      signatureDataUrl = generateTypedSignature(initials.toUpperCase(), true);
    } else if (signatureMode === 'upload') {
      if (!uploadedSignature) {
        toast({
          title: 'Imagem necessária',
          description: 'Por favor, faça upload de uma imagem da sua assinatura.',
          variant: 'destructive',
        });
        return;
      }
      signatureDataUrl = uploadedSignature;
    }

    setLoading(true);

    try {
      const timestamp = new Date().toISOString();
      const signature: SignatureData = {
        dataUrl: signatureDataUrl,
        timestamp,
        signerName: formData.name,
        signerEmail: formData.email,
        type: getSignatureType(signatureMode),
      };

      // Generate hash
      const hashData = `${document.id}|${formData.name}|${formData.email}|${timestamp}|${signatureDataUrl.substring(0, 100)}`;
      const hash = await generateHash(hashData);

      // Update document
      const { error: docError } = await supabase
        .from('generated_documents')
        .update({
          is_signed: true,
          signed_at: timestamp,
          signer_name: formData.name,
          signer_email: formData.email,
          signature_type: signature.type,
          signature_hash: hash,
          signature_data: JSON.parse(JSON.stringify(signature)),
        })
        .eq('id', document.id);

      if (docError) throw docError;

      // Log signature
      const { error: logError } = await supabase.from('signature_log').insert({
        document_id: document.id,
        signer_name: formData.name,
        signer_email: formData.email,
        signature_type: signature.type,
        signature_hash: hash,
        user_agent: navigator.userAgent,
        metadata: {
          company: formData.company,
          documentId: formData.documentId,
          language: lang,
        },
      });

      if (logError) console.error('Error logging signature:', logError);

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-signature-confirmation', {
          body: {
            documentName: document.document_name,
            signerName: formData.name,
            signerEmail: formData.email,
            signedAt: timestamp,
            signatureType: signature.type,
            signatureHash: hash,
            documentId: document.id,
            language: lang,
          },
        });
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
      }

      setFinalSignature(signature);
      setSignatureHash(hash);
      setSignatureComplete(true);
      setStep(4);

      toast({
        title: t.success,
        description: t.successDesc,
      });
    } catch (err) {
      console.error('Error signing document:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar assinatura. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!document || !finalSignature) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Header
    doc.setFillColor(26, 43, 60);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ELP ALLIANCE S/A', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('ELP Green Technology | www.elpgreen.com', margin, 28);

    // Document info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(document.document_name, margin, 50);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo: ${document.document_type}`, margin, 60);
    doc.text(`ID: ${document.id}`, margin, 68);

    // Signature section
    let y = 90;
    doc.setDrawColor(34, 139, 34);
    doc.setFillColor(240, 255, 240);
    doc.roundedRect(margin, y, contentWidth, 70, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 92, 58);
    doc.text('✓ DOCUMENTO ASSINADO DIGITALMENTE', margin + 5, y + 10);

    try {
      doc.addImage(finalSignature.dataUrl, 'PNG', margin + 5, y + 15, 60, 25);
    } catch (e) {
      console.error('Error adding signature image:', e);
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Assinado por: ${finalSignature.signerName}`, margin + 75, y + 22);
    doc.text(`Email: ${finalSignature.signerEmail}`, margin + 75, y + 30);
    doc.text(`Data: ${format(new Date(finalSignature.timestamp), "dd/MM/yyyy 'às' HH:mm:ss")}`, margin + 75, y + 38);
    doc.text(`Tipo: ${finalSignature.type === 'drawn' ? 'Manuscrita Digital' : 'Digitada'}`, margin + 75, y + 46);

    doc.setFontSize(6);
    doc.text(`Hash SHA-256: ${signatureHash}`, margin + 5, y + 62);

    // Legal notice
    y += 80;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Documento válido conforme Lei 14.063/2020 (Brasil) e Regulação eIDAS (União Europeia)', margin, y);
    doc.text('Este documento possui assinatura eletrônica qualificada e trilha de auditoria completa.', margin, y + 6);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} | ELP Alliance S/A`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`${document.document_name.replace(/\s+/g, '_')}_ASSINADO.pdf`);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.email.trim();
      case 2:
        return document !== null;
      case 3:
        return legalAccepted && (signatureMode === 'type' ? typedName.trim() : true);
      default:
        return true;
    }
  };

  const steps = [
    { num: 1, label: t.step1, icon: User },
    { num: 2, label: t.step2, icon: FileText },
    { num: 3, label: t.step3, icon: Pencil },
    { num: 4, label: t.step4, icon: CheckCircle2 },
  ];

  return (
    <>
      <SEO
        title={t.title}
        description={t.subtitle}
        url="https://elpgreencom.lovable.app/sign"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-[#1a2b3c] text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1a5c3a] rounded-lg flex items-center justify-center">
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{t.title}</h1>
                  <p className="text-sm text-gray-300">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">{t.legalCompliance}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 md:gap-4">
                {steps.map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div className={`flex items-center gap-2 ${step >= s.num ? 'text-[#1a5c3a]' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${step > s.num ? 'bg-[#1a5c3a] text-white' : step === s.num ? 'bg-[#1a5c3a] text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                      </div>
                      <span className="hidden md:inline text-sm font-medium">{s.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-0.5 ${step > s.num ? 'bg-[#1a5c3a]' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Identification */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-lg mx-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-[#1a5c3a]" />
                      {t.step1}
                    </CardTitle>
                    <CardDescription>Informe seus dados para assinar o documento</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.fullName} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documentId">{t.documentId}</Label>
                      <Input
                        id="documentId"
                        value={formData.documentId}
                        onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                        placeholder="CPF ou CNPJ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">{t.company}</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Document */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1a5c3a]" />
                      {t.step2}
                    </CardTitle>
                    <CardDescription>{t.selectDocument}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!document && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder={t.enterDocId}
                            value={documentIdInput}
                            onChange={(e) => setDocumentIdInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={handleLoadDocument} disabled={documentLoading}>
                            {documentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.loadDocument}
                          </Button>
                        </div>
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>{t.noDocument}</p>
                          <p className="text-sm">{t.noDocumentDesc}</p>
                        </div>
                      </div>
                    )}

                    {document && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-[#1a5c3a]" />
                            <div>
                              <h3 className="font-medium">{document.document_name}</h3>
                              <p className="text-sm text-muted-foreground">{document.document_type}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Pronto para assinar
                          </Badge>
                        </div>

                        {Object.keys(document.field_values).length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">{t.documentPreview}</h4>
                            <ScrollArea className="h-48 rounded-lg border p-4 bg-gray-50">
                              <dl className="space-y-2 text-sm">
                                {Object.entries(document.field_values).map(([key, value]) => (
                                  <div key={key} className="flex">
                                    <dt className="font-medium w-1/3">{key}:</dt>
                                    <dd className="w-2/3 text-muted-foreground">{value}</dd>
                                  </div>
                                ))}
                              </dl>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Signature */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-[#1a5c3a]" />
                      {t.step3}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as SignatureMode)}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="draw" className="flex items-center gap-1 text-xs sm:text-sm">
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t.drawSignature}</span>
                          <span className="sm:hidden">Draw</span>
                        </TabsTrigger>
                        <TabsTrigger value="type" className="flex items-center gap-1 text-xs sm:text-sm">
                          <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t.typeSignature}</span>
                          <span className="sm:hidden">Type</span>
                        </TabsTrigger>
                        <TabsTrigger value="initials" className="flex items-center gap-1 text-xs sm:text-sm">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t.initialsSignature}</span>
                          <span className="sm:hidden">Init</span>
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-1 text-xs sm:text-sm">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t.uploadSignature}</span>
                          <span className="sm:hidden">File</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="draw" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{t.signHere}</p>
                          <div 
                            ref={canvasContainerRef}
                            className="border-2 border-dashed border-[#1a5c3a]/30 rounded-lg bg-white relative overflow-hidden"
                          >
                            <canvas
                              ref={canvasRef}
                              className="touch-none cursor-crosshair"
                              style={{ 
                                touchAction: 'none',
                                display: 'block',
                                width: '100%',
                                height: '160px',
                              }}
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={clearSignature}>
                            {t.clear}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="type" className="mt-4">
                        <div className="space-y-3">
                          <Input
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder={formData.name || 'Seu nome completo'}
                            className="text-2xl font-serif italic text-center h-16"
                          />
                          {typedName && (
                            <div className="p-4 bg-gray-50 rounded-lg text-center border">
                              <p className="text-3xl font-serif italic text-[#003366]">{typedName}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="initials" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Digite suas iniciais (ex: EP para Ericson Piccoli)
                          </p>
                          <Input
                            value={initials}
                            onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 4))}
                            placeholder="EP"
                            maxLength={4}
                            className="text-4xl font-bold text-center h-20 uppercase tracking-widest"
                          />
                          {initials && (
                            <div className="p-4 bg-gray-50 rounded-lg text-center border">
                              <p className="text-5xl font-bold text-[#003366] tracking-widest">{initials}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="upload" className="mt-4">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{t.uploadImage}</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            className="w-full h-24 border-dashed"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-8 h-8 text-muted-foreground" />
                              <span>Clique para selecionar imagem</span>
                            </div>
                          </Button>
                          {uploadedSignature && (
                            <div className="p-4 bg-gray-50 rounded-lg text-center border">
                              <img 
                                src={uploadedSignature} 
                                alt="Assinatura" 
                                className="max-h-20 mx-auto object-contain"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setUploadedSignature('')}
                                className="mt-2 text-xs"
                              >
                                Remover
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Separator />

                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <Checkbox
                        id="legal"
                        checked={legalAccepted}
                        onCheckedChange={(checked) => setLegalAccepted(checked as boolean)}
                      />
                      <label htmlFor="legal" className="text-sm leading-relaxed cursor-pointer">
                        {t.legalNotice}
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && signatureComplete && finalSignature && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-700">{t.success}</CardTitle>
                    <CardDescription>{t.successDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Signature Preview */}
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-green-600">{t.validSignature}</Badge>
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          {t.legalCompliance}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <img
                          src={finalSignature.dataUrl}
                          alt="Signature"
                          className="h-16 border rounded bg-white"
                        />
                        <div className="text-sm">
                          <p className="font-medium">{finalSignature.signerName}</p>
                          <p className="text-muted-foreground">{finalSignature.signerEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Audit Trail */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4" />
                        {t.auditTrail}
                      </h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">{t.timestamp}:</dt>
                          <dd className="font-mono">{format(new Date(finalSignature.timestamp), 'dd/MM/yyyy HH:mm:ss')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">{t.signatureType}:</dt>
                          <dd>{
                            finalSignature.type === 'drawn' ? 'Manuscrita Digital' : 
                            finalSignature.type === 'typed' ? 'Digitada' :
                            finalSignature.type === 'initials' ? 'Iniciais' :
                            'Upload de Imagem'
                          }</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                          <dt className="text-muted-foreground">{t.hash}:</dt>
                          <dd className="font-mono text-xs break-all bg-gray-100 p-2 rounded">{signatureHash}</dd>
                        </div>
                      </dl>
                    </div>

                    <Button onClick={generatePDF} className="w-full bg-[#1a5c3a] hover:bg-[#228b22]">
                      <Download className="w-4 h-4 mr-2" />
                      {t.download}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 4 && (
            <div className="max-w-2xl mx-auto mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="bg-[#1a5c3a] hover:bg-[#228b22]"
                >
                  {t.continue}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSign}
                  disabled={!canProceed() || loading}
                  className="bg-[#1a5c3a] hover:bg-[#228b22]"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}
                  {t.sign}
                </Button>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#1a2b3c] text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">ELP Alliance S/A - ELP Green Technology</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Todos os direitos reservados. Assinatura digital válida conforme Lei 14.063/2020 e eIDAS.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
