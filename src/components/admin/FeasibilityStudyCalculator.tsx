// Feasibility Study Calculator Component
import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Percent,
  Info,
  Save,
  Plus,
  Trash2,
  FileDown,
  Edit,
  Factory,
  MapPin,
  Wrench,
  Zap,
  Users,
  Truck,
  Building,
  Loader2,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  Scale,
  FileText,
  LayoutTemplate,
  Image,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeasibilityCharts } from './FeasibilityCharts';
import { FeasibilityComparison } from './FeasibilityComparison';
import { FeasibilityTemplates } from './FeasibilityTemplates';
import { FeasibilityAIAnalysis } from './FeasibilityAIAnalysis';
import { FeasibilityPDFCharts, FeasibilityPDFChartsHandle } from './FeasibilityPDFCharts';
import { FeasibilityProfessionalReport } from './FeasibilityProfessionalReport';
import { OTRCompositionTable } from './OTRCompositionTable';
import { generateFeasibilityPDFWithCharts } from '@/lib/generateFeasibilityPDF';
import { generateProfessionalFeasibilityPDF, ChecklistNotes, WatermarkType } from '@/lib/generateProfessionalFeasibilityPDF';
import jsPDF from 'jspdf';
import i18n from '@/i18n';

interface FeasibilityStudy {
  id: string;
  study_name: string;
  location: string | null;
  country: string | null;
  plant_type: string;
  daily_capacity_tons: number;
  operating_days_per_year: number;
  utilization_rate: number;
  equipment_cost: number;
  installation_cost: number;
  infrastructure_cost: number;
  working_capital: number;
  other_capex: number;
  raw_material_cost: number;
  labor_cost: number;
  energy_cost: number;
  maintenance_cost: number;
  logistics_cost: number;
  administrative_cost: number;
  other_opex: number;
  rubber_granules_price: number;
  rubber_granules_yield: number;
  steel_wire_price: number;
  steel_wire_yield: number;
  textile_fiber_price: number;
  textile_fiber_yield: number;
  rcb_price: number; // Recovered Carbon Black - Jan 2026 market: $800-1200/ton
  rcb_yield: number; // rCB yield percentage - typically 10-15% of rubber content
  tax_rate: number;
  depreciation_years: number;
  discount_rate: number;
  inflation_rate: number;
  total_investment: number;
  annual_revenue: number;
  annual_opex: number;
  annual_ebitda: number;
  payback_months: number;
  roi_percentage: number;
  npv_10_years: number;
  irr_percentage: number;
  status: string;
  notes: string | null;
  lead_id: string | null;
  lead_type: string | null;
  created_at: string;
  updated_at: string;
  // New fields for government partnership model
  government_royalties_percent: number;
  environmental_bonus_per_ton: number;
  collection_model: string;
}

const defaultStudy: Omit<FeasibilityStudy, 'id' | 'created_at' | 'updated_at'> = {
  study_name: '',
  location: '',
  country: '',
  plant_type: 'otr_recycling',
  daily_capacity_tons: 85, // Based on ELP study: 85 tons/day
  operating_days_per_year: 300,
  utilization_rate: 85,
  equipment_cost: 2400000, // ~USD 2.4M equipment (from R$11.8M BRL)
  installation_cost: 400000,
  infrastructure_cost: 7000000, // ~USD 7M structure (from R$35M BRL)
  working_capital: 500000,
  other_capex: 1200000, // Solar + Pre-operational + Homologation
  raw_material_cost: 0, // Tires often free/negative cost
  labor_cost: 45000, // Monthly labor costs
  energy_cost: 25000, // With solar installation, reduced
  maintenance_cost: 20000,
  logistics_cost: 22000,
  administrative_cost: 15000,
  other_opex: 10000,
  rubber_granules_price: 240, // USD per ton - Jan 2026 market: $230-250/ton (recycled granules)
  rubber_granules_yield: 55, // Based on real OTR composition: 50-60% rubber content
  steel_wire_price: 620, // USD per ton - Jan 2026 market: $590-650/ton (recovered steel wire)
  steel_wire_yield: 25, // Based on real OTR radial composition: 20-30% steel (radials higher)
  textile_fiber_price: 75, // USD per ton - Jan 2026 market: $50-100/ton (textile fiber)
  textile_fiber_yield: 8, // Based on real OTR composition: 5-10% textiles
  rcb_price: 1000, // USD per ton - Jan 2026 market: $800-1200/ton (Recovered Carbon Black)
  rcb_yield: 12, // rCB yield: ~10-15% of rubber content processed via pyrolysis
  tax_rate: 25,
  depreciation_years: 10,
  discount_rate: 12,
  inflation_rate: 3,
  total_investment: 0,
  annual_revenue: 0,
  annual_opex: 0,
  annual_ebitda: 0,
  payback_months: 0,
  roi_percentage: 0,
  npv_10_years: 0,
  irr_percentage: 0,
  status: 'draft',
  notes: '',
  lead_id: null,
  lead_type: null,
  // Government partnership model fields
  government_royalties_percent: 0,
  environmental_bonus_per_ton: 0,
  collection_model: 'direct'
};

const countries = [
  'Brasil', 'Australia', 'Italy', 'Germany', 'China', 'USA', 'Chile', 
  'Peru', 'South Africa', 'Indonesia', 'India', 'Mexico', 'Canada'
];

export function FeasibilityStudyCalculator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<Partial<FeasibilityStudy> | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedStudy, setSelectedStudy] = useState<FeasibilityStudy | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    capex: true,
    opex: true,
    revenue: true,
    financial: false
  });
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfLanguage, setPdfLanguage] = useState<string>(i18n.language);
  const pdfChartsRef = useRef<FeasibilityPDFChartsHandle>(null);
  
  // Checklist notes for due diligence
  const [checklistNotes, setChecklistNotes] = useState<ChecklistNotes>({
    companyInfo: '',
    financial: '',
    legal: '',
    operational: '',
    otrSources: '',
    partnership: ''
  });
  
  // PDF Watermark option
  const [pdfWatermark, setPdfWatermark] = useState<WatermarkType>('none');
  
  // QR Code link configuration
  const [qrCodeLinkType, setQrCodeLinkType] = useState<string>('otr-sources');
  const [customQrCodeUrl, setCustomQrCodeUrl] = useState<string>('');
  
  // Base URL for the site
  const siteBaseUrl = 'https://elpgreencom.lovable.app';
  
  // Available form links for QR Code - with PDF source tracking
  const qrCodeFormOptions = [
    { value: 'otr-sources', label: t('admin.feasibility.qrForms.otrSources', 'OTR Source Indication'), url: `${siteBaseUrl}/otr-sources?source=pdf_feasibility` },
    { value: 'marketplace', label: t('admin.feasibility.qrForms.marketplace', 'Marketplace Registration'), url: `${siteBaseUrl}/marketplace?source=pdf_feasibility` },
    { value: 'quote', label: t('admin.feasibility.qrForms.quote', 'Request Quote'), url: `${siteBaseUrl}/request-quote?source=pdf_feasibility` },
    { value: 'contact', label: t('admin.feasibility.qrForms.contact', 'Contact Form'), url: `${siteBaseUrl}/contact?source=pdf_feasibility` },
    { value: 'template-kyc', label: t('admin.feasibility.qrForms.dueDiligenceChecklist', 'Due Diligence Checklist (KYC)'), url: `${siteBaseUrl}/documents/template/03d41162-dd8f-415f-baba-cf7e99f5a666?source=pdf_feasibility` },
    { value: 'template-nda', label: t('admin.feasibility.qrForms.nda', 'NDA - Confidentiality Agreement'), url: `${siteBaseUrl}/documents/template/f9fa8388-e8ed-4c68-97ac-f3317a25b8e9?source=pdf_feasibility` },
    { value: 'template-jv', label: t('admin.feasibility.qrForms.jointVenture', 'Joint Venture Agreement'), url: `${siteBaseUrl}/documents/template/8154040b-954c-4591-b432-d206ca04d9a2?source=pdf_feasibility` },
    { value: 'template-lgpd', label: t('admin.feasibility.qrForms.lgpdConsent', 'LGPD/GDPR Consent'), url: `${siteBaseUrl}/documents/template/99bda306-c4b4-414a-b031-dee532152ecd?source=pdf_feasibility` },
    { value: 'digital-signature', label: t('admin.feasibility.qrForms.digitalSignature', 'Digital Signature Portal'), url: `${siteBaseUrl}/sign` },
    { value: 'custom', label: t('admin.feasibility.qrForms.customLink', 'Custom Link'), url: '' }
  ];
  
  // Get the actual QR Code URL to use (with tracking parameter)
  const getQrCodeUrl = (): string => {
    if (qrCodeLinkType === 'custom') {
      // Add tracking to custom URL if not already present
      const customUrl = customQrCodeUrl || `${siteBaseUrl}/otr-sources`;
      if (!customUrl.includes('source=')) {
        const separator = customUrl.includes('?') ? '&' : '?';
        return `${customUrl}${separator}source=pdf_feasibility`;
      }
      return customUrl;
    }
    const option = qrCodeFormOptions.find(o => o.value === qrCodeLinkType);
    return option?.url || `${siteBaseUrl}/otr-sources?source=pdf_feasibility`;
  };

  // Fetch studies
  const { data: studies, isLoading } = useQuery({
    queryKey: ['feasibility-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feasibility_studies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FeasibilityStudy[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (study: Partial<FeasibilityStudy>) => {
      const calculations = calculateFinancials(study);
      const payload = {
        study_name: study.study_name || 'Untitled Study',
        location: study.location,
        country: study.country,
        plant_type: study.plant_type || 'otr_recycling',
        daily_capacity_tons: study.daily_capacity_tons,
        operating_days_per_year: study.operating_days_per_year,
        utilization_rate: study.utilization_rate,
        equipment_cost: study.equipment_cost,
        installation_cost: study.installation_cost,
        infrastructure_cost: study.infrastructure_cost,
        working_capital: study.working_capital,
        other_capex: study.other_capex,
        raw_material_cost: study.raw_material_cost,
        labor_cost: study.labor_cost,
        energy_cost: study.energy_cost,
        maintenance_cost: study.maintenance_cost,
        logistics_cost: study.logistics_cost,
        administrative_cost: study.administrative_cost,
        other_opex: study.other_opex,
        rubber_granules_price: study.rubber_granules_price,
        rubber_granules_yield: study.rubber_granules_yield,
        steel_wire_price: study.steel_wire_price,
        steel_wire_yield: study.steel_wire_yield,
        textile_fiber_price: study.textile_fiber_price,
        textile_fiber_yield: study.textile_fiber_yield,
        tax_rate: study.tax_rate,
        depreciation_years: study.depreciation_years,
        discount_rate: study.discount_rate,
        inflation_rate: study.inflation_rate,
        status: study.status,
        notes: study.notes,
        ...calculations
      };

      if (study.id) {
        const { error } = await supabase
          .from('feasibility_studies')
          .update(payload)
          .eq('id', study.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feasibility_studies')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feasibility-studies'] });
      toast({ title: t('admin.feasibility.savedSuccess') });
      setDialogOpen(false);
      setEditingStudy(null);
    },
    onError: () => {
      toast({ title: t('admin.feasibility.saveError'), variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feasibility_studies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feasibility-studies'] });
      toast({ title: t('admin.feasibility.deletedSuccess') });
    }
  });

  // Calculate financials
  const calculateFinancials = (study: Partial<FeasibilityStudy>) => {
    const dailyCapacity = study.daily_capacity_tons || 50;
    const operatingDays = study.operating_days_per_year || 300;
    const utilization = (study.utilization_rate || 85) / 100;

    // Annual tonnage
    const annualTonnage = dailyCapacity * operatingDays * utilization;

    // Total Investment (CAPEX)
    const totalInvestment = 
      (study.equipment_cost || 0) +
      (study.installation_cost || 0) +
      (study.infrastructure_cost || 0) +
      (study.working_capital || 0) +
      (study.other_capex || 0);

    // Annual Revenue
    const revenueGranules = annualTonnage * ((study.rubber_granules_yield || 55) / 100) * (study.rubber_granules_price || 240);
    const revenueSteel = annualTonnage * ((study.steel_wire_yield || 25) / 100) * (study.steel_wire_price || 620);
    const revenueFiber = annualTonnage * ((study.textile_fiber_yield || 8) / 100) * (study.textile_fiber_price || 75);
    const revenueRCB = annualTonnage * ((study.rcb_yield || 12) / 100) * (study.rcb_price || 1000);
    const annualRevenue = revenueGranules + revenueSteel + revenueFiber + revenueRCB;

    // Annual OPEX
    const monthlyOpex = 
      (study.raw_material_cost || 0) +
      (study.labor_cost || 0) +
      (study.energy_cost || 0) +
      (study.maintenance_cost || 0) +
      (study.logistics_cost || 0) +
      (study.administrative_cost || 0) +
      (study.other_opex || 0);
    const annualOpex = monthlyOpex * 12;

    // EBITDA
    const annualEbitda = annualRevenue - annualOpex;

    // Depreciation
    const annualDepreciation = totalInvestment / (study.depreciation_years || 10);

    // Taxable Income
    const taxableIncome = annualEbitda - annualDepreciation;
    const taxes = Math.max(0, taxableIncome * ((study.tax_rate || 25) / 100));

    // Net Profit
    const netProfit = annualEbitda - taxes;

    // Payback (months)
    const paybackMonths = netProfit > 0 ? Math.ceil((totalInvestment / netProfit) * 12) : 999;

    // ROI
    const roiPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    // NPV (10 years)
    const discountRate = (study.discount_rate || 12) / 100;
    let npv = -totalInvestment;
    for (let year = 1; year <= 10; year++) {
      npv += netProfit / Math.pow(1 + discountRate, year);
    }

    // IRR (approximation using Newton-Raphson)
    let irr = 0.15; // Initial guess
    for (let i = 0; i < 100; i++) {
      let npvAtIrr = -totalInvestment;
      let derivative = 0;
      for (let year = 1; year <= 10; year++) {
        npvAtIrr += netProfit / Math.pow(1 + irr, year);
        derivative -= (year * netProfit) / Math.pow(1 + irr, year + 1);
      }
      if (Math.abs(derivative) < 0.0001) break;
      irr = irr - npvAtIrr / derivative;
      if (Math.abs(npvAtIrr) < 100) break;
    }

    return {
      total_investment: totalInvestment,
      annual_revenue: annualRevenue,
      annual_opex: annualOpex,
      annual_ebitda: annualEbitda,
      payback_months: paybackMonths,
      roi_percentage: roiPercentage,
      npv_10_years: npv,
      irr_percentage: irr * 100
    };
  };

  // Live calculations for editor
  const liveCalculations = useMemo(() => {
    if (!editingStudy) return null;
    return calculateFinancials(editingStudy);
  }, [editingStudy]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `USD ${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `USD ${(value / 1000).toFixed(0)}K`;
    }
    return `USD ${value.toFixed(0)}`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const handleFieldChange = (field: keyof FeasibilityStudy, value: string | number) => {
    setEditingStudy(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const generatePDF = (study: FeasibilityStudy) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELP Green Technology', 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Feasibility Study Report', 20, 32);

    doc.setTextColor(0, 0, 0);
    let y = 55;

    // Study Info
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(study.study_name, 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (study.location) {
      doc.text(`Location: ${study.location}, ${study.country}`, 20, y);
      y += 6;
    }
    doc.text(`Status: ${study.status}`, 20, y);
    y += 6;
    doc.text(`Created: ${new Date(study.created_at).toLocaleDateString()}`, 20, y);
    y += 15;

    // Plant Configuration
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Plant Configuration', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Daily Capacity: ${study.daily_capacity_tons} tons/day`, 25, y); y += 5;
    doc.text(`Operating Days: ${study.operating_days_per_year} days/year`, 25, y); y += 5;
    doc.text(`Utilization Rate: ${study.utilization_rate}%`, 25, y); y += 5;
    const annualTonnage = study.daily_capacity_tons * study.operating_days_per_year * (study.utilization_rate / 100);
    doc.text(`Annual Production: ${formatNumber(annualTonnage)} tons`, 25, y);
    y += 12;

    // Investment Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment (CAPEX)', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Equipment: ${formatCurrency(study.equipment_cost)}`, 25, y); y += 5;
    doc.text(`Installation: ${formatCurrency(study.installation_cost)}`, 25, y); y += 5;
    doc.text(`Infrastructure: ${formatCurrency(study.infrastructure_cost)}`, 25, y); y += 5;
    doc.text(`Working Capital: ${formatCurrency(study.working_capital)}`, 25, y); y += 5;
    doc.text(`Other CAPEX: ${formatCurrency(study.other_capex)}`, 25, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL INVESTMENT: ${formatCurrency(study.total_investment)}`, 25, y);
    y += 12;

    // Financial Results
    doc.setFontSize(14);
    doc.text('Financial Results', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Annual Revenue: ${formatCurrency(study.annual_revenue)}`, 25, y); y += 5;
    doc.text(`Annual OPEX: ${formatCurrency(study.annual_opex)}`, 25, y); y += 5;
    doc.text(`Annual EBITDA: ${formatCurrency(study.annual_ebitda)}`, 25, y); y += 5;
    doc.text(`Payback Period: ${study.payback_months} months`, 25, y); y += 5;
    doc.text(`ROI: ${study.roi_percentage.toFixed(1)}%`, 25, y); y += 5;
    doc.text(`NPV (10 years): ${formatCurrency(study.npv_10_years)}`, 25, y); y += 5;
    doc.text(`IRR: ${study.irr_percentage.toFixed(1)}%`, 25, y);
    y += 15;

    // Notes
    if (study.notes) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(study.notes, pageWidth - 40);
      doc.text(splitNotes, 20, y);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is an estimated feasibility study. Actual results may vary.', 20, footerY);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 60, footerY);

    doc.save(`feasibility-study-${study.study_name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    toast({ title: t('admin.feasibility.pdfGenerated') });
  };

  const duplicateStudy = (study: FeasibilityStudy) => {
    const newStudy = {
      ...study,
      id: undefined,
      study_name: `${study.study_name} (Copy)`,
      status: 'draft',
      created_at: undefined,
      updated_at: undefined
    };
    setEditingStudy(newStudy);
    setDialogOpen(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'in_review': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Tabs defaultValue="studies" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-6">
            <TabsTrigger value="studies" className="gap-1">
              <FileText className="h-4 w-4" />
              {t('admin.feasibility.tabs.studies')}
            </TabsTrigger>
            <TabsTrigger value="otr-data" className="gap-1">
              <Circle className="h-4 w-4" />
              {t('admin.feasibility.tabs.otrData', 'OTR Data')}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1">
              <LayoutTemplate className="h-4 w-4" />
              {t('admin.feasibility.tabs.templates')}
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-1">
              <Scale className="h-4 w-4" />
              {t('admin.feasibility.tabs.compare')}
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-1" disabled={!studies?.length}>
              <BarChart3 className="h-4 w-4" />
              {t('admin.feasibility.tabs.charts')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studies">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setEditingStudy({ ...defaultStudy }); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.feasibility.newStudy')}
              </Button>
            </div>

        {/* Studies List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : studies?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('admin.feasibility.noStudies')}</h3>
              <p className="text-muted-foreground mb-4">{t('admin.feasibility.noStudiesDesc')}</p>
              <Button onClick={() => { setEditingStudy({ ...defaultStudy }); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.feasibility.createFirst')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {studies?.map((study) => (
              <Card key={study.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Study Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{study.study_name}</h3>
                        <Badge variant="outline" className={getStatusColor(study.status)}>
                          {t(`admin.feasibility.status.${study.status}`)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {study.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {study.location}, {study.country}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Factory className="h-3 w-3" />
                          {study.daily_capacity_tons} {t('admin.feasibility.tonsDay')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(study.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <span className="text-xs text-muted-foreground block">{t('admin.feasibility.investment')}</span>
                        <span className="font-bold text-sm">{formatCurrency(study.total_investment)}</span>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2 text-center">
                        <span className="text-xs text-muted-foreground block">{t('admin.feasibility.roi')}</span>
                        <span className="font-bold text-sm text-green-600">{study.roi_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                        <span className="text-xs text-muted-foreground block">{t('admin.feasibility.payback')}</span>
                        <span className="font-bold text-sm text-blue-600">{study.payback_months} {t('admin.feasibility.months')}</span>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-2 text-center">
                        <span className="text-xs text-muted-foreground block">{t('admin.feasibility.irr')}</span>
                        <span className="font-bold text-sm text-primary">{study.irr_percentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingStudy(study); setDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('admin.feasibility.edit')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => duplicateStudy(study)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('admin.feasibility.duplicate')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => generatePDF(study)}>
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('admin.feasibility.exportPdf')}</TooltipContent>
                      </Tooltip>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('admin.feasibility.deleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('admin.feasibility.deleteDescription')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('admin.actions.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(study.id)}>{t('admin.actions.delete')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

        {/* Editor Dialog - moved outside TabsContent to be accessible from any tab */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                {editingStudy?.id ? t('admin.feasibility.editStudy') : t('admin.feasibility.newStudy')}
              </DialogTitle>
              <DialogDescription>{t('admin.feasibility.editorDescription')}</DialogDescription>
            </DialogHeader>

            {editingStudy && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label>{t('admin.feasibility.studyName')}</Label>
                    <Input
                      value={editingStudy.study_name || ''}
                      onChange={(e) => handleFieldChange('study_name', e.target.value)}
                      placeholder={t('admin.feasibility.studyNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.feasibility.location')}</Label>
                    <Input
                      value={editingStudy.location || ''}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder={t('admin.feasibility.locationPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.feasibility.country')}</Label>
                    <Select
                      value={editingStudy.country || ''}
                      onValueChange={(value) => handleFieldChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.feasibility.selectCountry')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Plant Configuration */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      {t('admin.feasibility.plantConfig')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm">{t('admin.feasibility.dailyCapacity')}</Label>
                          <span className="font-bold text-primary">{editingStudy.daily_capacity_tons} t/day</span>
                        </div>
                        <Slider
                          value={[editingStudy.daily_capacity_tons || 50]}
                          onValueChange={(value) => handleFieldChange('daily_capacity_tons', value[0])}
                          min={10}
                          max={200}
                          step={5}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm">{t('admin.feasibility.operatingDays')}</Label>
                          <span className="font-bold text-primary">{editingStudy.operating_days_per_year} days</span>
                        </div>
                        <Slider
                          value={[editingStudy.operating_days_per_year || 300]}
                          onValueChange={(value) => handleFieldChange('operating_days_per_year', value[0])}
                          min={200}
                          max={360}
                          step={5}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm">{t('admin.feasibility.utilizationRate')}</Label>
                          <span className="font-bold text-primary">{editingStudy.utilization_rate}%</span>
                        </div>
                        <Slider
                          value={[editingStudy.utilization_rate || 85]}
                          onValueChange={(value) => handleFieldChange('utilization_rate', value[0])}
                          min={50}
                          max={95}
                          step={5}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CAPEX Section */}
                <Collapsible open={expandedSections.capex} onOpenChange={() => toggleSection('capex')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {t('admin.feasibility.capex')} - {formatCurrency(liveCalculations?.total_investment || 0)}
                          </span>
                          {expandedSections.capex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {[
                            { key: 'equipment_cost', icon: Wrench, label: t('admin.feasibility.equipmentCost') },
                            { key: 'installation_cost', icon: Factory, label: t('admin.feasibility.installationCost') },
                            { key: 'infrastructure_cost', icon: Building, label: t('admin.feasibility.infrastructureCost') },
                            { key: 'working_capital', icon: DollarSign, label: t('admin.feasibility.workingCapital') },
                            { key: 'other_capex', icon: Plus, label: t('admin.feasibility.otherCapex') },
                          ].map(({ key, icon: Icon, label }) => (
                            <div key={key}>
                              <Label className="text-xs flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                {label}
                              </Label>
                              <Input
                                type="number"
                                value={(editingStudy as any)[key] || 0}
                                onChange={(e) => handleFieldChange(key as keyof FeasibilityStudy, Number(e.target.value))}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* OPEX Section */}
                <Collapsible open={expandedSections.opex} onOpenChange={() => toggleSection('opex')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {t('admin.feasibility.opex')} - {formatCurrency((liveCalculations?.annual_opex || 0) / 12)}/month
                          </span>
                          {expandedSections.opex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {[
                            { key: 'raw_material_cost', icon: Factory, label: t('admin.feasibility.rawMaterialCost') },
                            { key: 'labor_cost', icon: Users, label: t('admin.feasibility.laborCost') },
                            { key: 'energy_cost', icon: Zap, label: t('admin.feasibility.energyCost') },
                            { key: 'maintenance_cost', icon: Wrench, label: t('admin.feasibility.maintenanceCost') },
                            { key: 'logistics_cost', icon: Truck, label: t('admin.feasibility.logisticsCost') },
                            { key: 'administrative_cost', icon: Building, label: t('admin.feasibility.administrativeCost') },
                            { key: 'other_opex', icon: Plus, label: t('admin.feasibility.otherOpex') },
                          ].map(({ key, icon: Icon, label }) => (
                            <div key={key}>
                              <Label className="text-xs flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                {label} (USD/month)
                              </Label>
                              <Input
                                type="number"
                                value={(editingStudy as any)[key] || 0}
                                onChange={(e) => handleFieldChange(key as keyof FeasibilityStudy, Number(e.target.value))}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Revenue Section */}
                <Collapsible open={expandedSections.revenue} onOpenChange={() => toggleSection('revenue')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            {t('admin.feasibility.revenue')} - {formatCurrency(liveCalculations?.annual_revenue || 0)}/year
                          </span>
                          {expandedSections.revenue ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Rubber Granules */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{t('admin.feasibility.rubberGranules')}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.pricePerTon')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.rubber_granules_price || 0}
                                  onChange={(e) => handleFieldChange('rubber_granules_price', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.yieldPercent')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.rubber_granules_yield || 0}
                                  onChange={(e) => handleFieldChange('rubber_granules_yield', Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                          {/* Steel Wire */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{t('admin.feasibility.steelWire')}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.pricePerTon')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.steel_wire_price || 0}
                                  onChange={(e) => handleFieldChange('steel_wire_price', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.yieldPercent')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.steel_wire_yield || 0}
                                  onChange={(e) => handleFieldChange('steel_wire_yield', Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                          {/* Textile Fiber */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{t('admin.feasibility.textileFiber')}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.pricePerTon')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.textile_fiber_price || 0}
                                  onChange={(e) => handleFieldChange('textile_fiber_price', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.yieldPercent')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.textile_fiber_yield || 0}
                                  onChange={(e) => handleFieldChange('textile_fiber_yield', Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                          {/* Recovered Carbon Black (rCB) */}
                          <div className="space-y-2 bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                            <h4 className="font-medium text-sm flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              ⚫ {t('admin.feasibility.rcb', 'rCB (Recovered Carbon Black)')}
                              <Badge variant="secondary" className="text-[10px]">Premium</Badge>
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.pricePerTon')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.rcb_price || 1000}
                                  onChange={(e) => handleFieldChange('rcb_price', Number(e.target.value))}
                                  className="border-purple-300"
                                />
                                <span className="text-[10px] text-muted-foreground">Market: $800-1,200/ton</span>
                              </div>
                              <div>
                                <Label className="text-xs">{t('admin.feasibility.yieldPercent')}</Label>
                                <Input
                                  type="number"
                                  value={editingStudy.rcb_yield || 12}
                                  onChange={(e) => handleFieldChange('rcb_yield', Number(e.target.value))}
                                  className="border-purple-300"
                                />
                                <span className="text-[10px] text-muted-foreground">Pyrolysis: 10-15%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Financial Parameters */}
                <Collapsible open={expandedSections.financial} onOpenChange={() => toggleSection('financial')}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            {t('admin.feasibility.financialParams')}
                          </span>
                          {expandedSections.financial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs">{t('admin.feasibility.taxRate')} (%)</Label>
                            <Input
                              type="number"
                              value={editingStudy.tax_rate || 0}
                              onChange={(e) => handleFieldChange('tax_rate', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{t('admin.feasibility.depreciationYears')}</Label>
                            <Input
                              type="number"
                              value={editingStudy.depreciation_years || 0}
                              onChange={(e) => handleFieldChange('depreciation_years', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{t('admin.feasibility.discountRate')} (%)</Label>
                            <Input
                              type="number"
                              value={editingStudy.discount_rate || 0}
                              onChange={(e) => handleFieldChange('discount_rate', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{t('admin.feasibility.inflationRate')} (%)</Label>
                            <Input
                              type="number"
                              value={editingStudy.inflation_rate || 0}
                              onChange={(e) => handleFieldChange('inflation_rate', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Government Partnership Model Section */}
                <Card className="border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Scale className="h-4 w-4" />
                      {t('admin.feasibility.govPartnership.title')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t('admin.feasibility.govPartnership.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">{t('admin.feasibility.govPartnership.collectionModel')}</Label>
                        <Select
                          value={editingStudy.collection_model || 'direct'}
                          onValueChange={(value) => handleFieldChange('collection_model', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="direct">{t('admin.feasibility.govPartnership.modelDirect')}</SelectItem>
                            <SelectItem value="government">{t('admin.feasibility.govPartnership.modelGovernment')}</SelectItem>
                            <SelectItem value="mining">{t('admin.feasibility.govPartnership.modelMining')}</SelectItem>
                            <SelectItem value="hybrid">{t('admin.feasibility.govPartnership.modelHybrid')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t('admin.feasibility.govPartnership.royalties')} (%)</Label>
                        <Input
                          type="number"
                          value={editingStudy.government_royalties_percent || 0}
                          onChange={(e) => handleFieldChange('government_royalties_percent', Number(e.target.value))}
                          placeholder="20"
                        />
                        <span className="text-xs text-muted-foreground">
                          {t('admin.feasibility.govPartnership.royaltiesHint')}
                        </span>
                      </div>
                      <div>
                        <Label className="text-xs">{t('admin.feasibility.govPartnership.envBonus')} (USD/ton)</Label>
                        <Input
                          type="number"
                          value={editingStudy.environmental_bonus_per_ton || 0}
                          onChange={(e) => handleFieldChange('environmental_bonus_per_ton', Number(e.target.value))}
                          placeholder="5"
                        />
                        <span className="text-xs text-muted-foreground">
                          {t('admin.feasibility.govPartnership.envBonusHint')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Impact calculation display */}
                    {(editingStudy.government_royalties_percent > 0 || editingStudy.environmental_bonus_per_ton > 0) && (
                      <div className="p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg">
                        <h5 className="font-medium text-sm text-amber-800 dark:text-amber-300 mb-2">
                          {t('admin.feasibility.govPartnership.impactTitle')}
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">{t('admin.feasibility.govPartnership.annualRoyalties')}:</span>
                            <span className="font-bold ml-1 text-amber-700">
                              {formatCurrency((liveCalculations?.annual_revenue || 0) * ((editingStudy.government_royalties_percent || 0) / 100))}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.feasibility.govPartnership.annualEnvBonus')}:</span>
                            <span className="font-bold ml-1 text-green-700">
                              {formatCurrency((editingStudy.daily_capacity_tons || 0) * (editingStudy.operating_days_per_year || 0) * ((editingStudy.utilization_rate || 0) / 100) * (editingStudy.environmental_bonus_per_ton || 0))}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.feasibility.govPartnership.netRevenue')}:</span>
                            <span className="font-bold ml-1">
                              {formatCurrency((liveCalculations?.annual_revenue || 0) * (1 - ((editingStudy.government_royalties_percent || 0) / 100)))}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('admin.feasibility.govPartnership.adjustedRoi')}:</span>
                            <span className="font-bold ml-1">
                              {(((liveCalculations?.annual_ebitda || 0) * (1 - ((editingStudy.government_royalties_percent || 0) / 100))) / (liveCalculations?.total_investment || 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Live Results */}
                {liveCalculations && (
                  <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{t('admin.feasibility.results')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-background/50 rounded-xl p-3 text-center">
                          <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">{t('admin.feasibility.totalInvestment')}</span>
                          <span className="font-bold text-lg">{formatCurrency(liveCalculations.total_investment)}</span>
                        </div>
                        <div className="bg-background/50 rounded-xl p-3 text-center">
                          <BarChart3 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">{t('admin.feasibility.annualEbitda')}</span>
                          <span className="font-bold text-lg text-green-600">{formatCurrency(liveCalculations.annual_ebitda)}</span>
                        </div>
                        <div className="bg-background/50 rounded-xl p-3 text-center">
                          <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">{t('admin.feasibility.paybackPeriod')}</span>
                          <span className="font-bold text-lg text-orange-600">
                            {liveCalculations.payback_months > 120 ? '> 10 years' : `${liveCalculations.payback_months} ${t('admin.feasibility.months')}`}
                          </span>
                        </div>
                        <div className="bg-background/50 rounded-xl p-3 text-center">
                          <Percent className="h-5 w-5 text-primary mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">{t('admin.feasibility.roi')}</span>
                          <span className="font-bold text-lg text-primary">{liveCalculations.roi_percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-xl p-3 text-center border border-primary/20">
                          <span className="text-xs text-muted-foreground block">{t('admin.feasibility.npv10Years')}</span>
                          <span className={`font-bold text-xl ${liveCalculations.npv_10_years >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(liveCalculations.npv_10_years)}
                          </span>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                          <span className="text-xs text-muted-foreground block">{t('admin.feasibility.irr')}</span>
                          <span className={`font-bold text-xl ${liveCalculations.irr_percentage >= (editingStudy.discount_rate || 12) ? 'text-green-600' : 'text-orange-600'}`}>
                            {liveCalculations.irr_percentage > 0 ? `${liveCalculations.irr_percentage.toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Analysis Section */}
                {liveCalculations && (
                  <FeasibilityAIAnalysis 
                    study={{
                      ...editingStudy,
                      ...liveCalculations,
                      study_name: editingStudy.study_name || 'Untitled',
                      daily_capacity_tons: editingStudy.daily_capacity_tons || 85,
                      operating_days_per_year: editingStudy.operating_days_per_year || 300,
                      utilization_rate: editingStudy.utilization_rate || 85,
                      rubber_granules_price: editingStudy.rubber_granules_price || 280,
                      rubber_granules_yield: editingStudy.rubber_granules_yield || 74.7,
                      steel_wire_price: editingStudy.steel_wire_price || 244,
                      steel_wire_yield: editingStudy.steel_wire_yield || 15.7,
                      textile_fiber_price: editingStudy.textile_fiber_price || 266,
                      textile_fiber_yield: editingStudy.textile_fiber_yield || 9.7,
                      tax_rate: editingStudy.tax_rate || 25,
                      discount_rate: editingStudy.discount_rate || 12,
                      equipment_cost: editingStudy.equipment_cost || 0,
                      installation_cost: editingStudy.installation_cost || 0,
                      infrastructure_cost: editingStudy.infrastructure_cost || 0,
                      working_capital: editingStudy.working_capital || 0,
                      labor_cost: editingStudy.labor_cost || 0,
                      energy_cost: editingStudy.energy_cost || 0,
                      maintenance_cost: editingStudy.maintenance_cost || 0,
                      logistics_cost: editingStudy.logistics_cost || 0
                    }} 
                    onAnalysisComplete={setAiAnalysis}
                  />
                )}

                {/* Due Diligence Checklist Notes */}
                <Collapsible open={expandedSections.financial} onOpenChange={() => toggleSection('financial')}>
                  <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-amber-600" />
                            {t('admin.feasibility.checklistNotes', 'Due Diligence Notes for PDF')}
                          </span>
                          {expandedSections.financial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        <p className="text-xs text-muted-foreground">
                          {t('admin.feasibility.checklistNotesDesc', 'These notes will appear in the PDF checklist. Fill in observations for each category.')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-blue-600">{t('admin.feasibility.ddCompanyInfo', 'Company Info')}</Label>
                            <Input
                              value={checklistNotes.companyInfo || ''}
                              onChange={(e) => setChecklistNotes(prev => ({ ...prev, companyInfo: e.target.value }))}
                              placeholder={t('admin.feasibility.ddNotesPlaceholder', 'Add observations...')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-green-600">{t('admin.feasibility.ddFinancial', 'Financial Verification')}</Label>
                            <Input
                              value={checklistNotes.financial || ''}
                              onChange={(e) => setChecklistNotes(prev => ({ ...prev, financial: e.target.value }))}
                              placeholder={t('admin.feasibility.ddNotesPlaceholder', 'Add observations...')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-purple-600">{t('admin.feasibility.ddLegal', 'Legal & Compliance')}</Label>
                            <Input
                              value={checklistNotes.legal || ''}
                              onChange={(e) => setChecklistNotes(prev => ({ ...prev, legal: e.target.value }))}
                              placeholder={t('admin.feasibility.ddNotesPlaceholder', 'Add observations...')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-orange-600">{t('admin.feasibility.ddOperational', 'Operational Capacity')}</Label>
                            <Input
                              value={checklistNotes.operational || ''}
                              onChange={(e) => setChecklistNotes(prev => ({ ...prev, operational: e.target.value }))}
                              placeholder={t('admin.feasibility.ddNotesPlaceholder', 'Add observations...')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-red-600">{t('admin.feasibility.ddOtrSources', 'OTR Tire Sources')}</Label>
                            <Input
                              value={checklistNotes.otrSources || ''}
                              onChange={(e) => setChecklistNotes(prev => ({ ...prev, otrSources: e.target.value }))}
                              placeholder={t('admin.feasibility.ddNotesPlaceholder', 'Add observations...')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-indigo-600">{t('admin.feasibility.ddPartnership', 'Partnership Readiness')}</Label>
                            <Input
                              value={checklistNotes.partnership || ''}
                              onChange={(e) => setChecklistNotes(prev => ({ ...prev, partnership: e.target.value }))}
                              placeholder={t('admin.feasibility.ddNotesPlaceholder', 'Add observations...')}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* QR Code Link Configuration */}
                <Card className="border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-950/20">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Image className="h-4 w-4 text-indigo-600" />
                      {t('admin.feasibility.qrCodeConfig', 'QR Code Link Configuration')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      {t('admin.feasibility.qrCodeConfigDesc', 'Select which form the QR Code in the PDF will link to. The partner can scan and fill the form directly.')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">{t('admin.feasibility.qrFormSelect', 'Form/Link for QR Code')}</Label>
                        <Select value={qrCodeLinkType} onValueChange={setQrCodeLinkType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {qrCodeFormOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {qrCodeLinkType === 'custom' && (
                        <div>
                          <Label className="text-xs">{t('admin.feasibility.customUrl', 'Custom URL')}</Label>
                          <Input
                            value={customQrCodeUrl}
                            onChange={(e) => setCustomQrCodeUrl(e.target.value)}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground bg-background/50 rounded p-2">
                      <strong>{t('admin.feasibility.qrPreview', 'Selected form')}:</strong>{' '}
                      <span className="text-indigo-600 font-medium">
                        {qrCodeLinkType === 'custom' 
                          ? t('admin.feasibility.qrForms.customLink', 'Custom Link')
                          : qrCodeFormOptions.find(o => o.value === qrCodeLinkType)?.label || 'OTR Source Indication'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>{t('admin.feasibility.notes')}</Label>
                    <Textarea
                      value={editingStudy.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      placeholder={t('admin.feasibility.notesPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.feasibility.studyStatus')}</Label>
                    <Select
                      value={editingStudy.status || 'draft'}
                      onValueChange={(value) => handleFieldChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('admin.feasibility.status.draft')}</SelectItem>
                        <SelectItem value="in_review">{t('admin.feasibility.status.in_review')}</SelectItem>
                        <SelectItem value="approved">{t('admin.feasibility.status.approved')}</SelectItem>
                        <SelectItem value="rejected">{t('admin.feasibility.status.rejected')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 mr-auto flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">{t('admin.feasibility.pdfLanguage')}:</Label>
                  <Select value={pdfLanguage} onValueChange={setPdfLanguage}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">{t('admin.feasibility.watermark', 'Watermark')}:</Label>
                  <Select value={pdfWatermark} onValueChange={(v) => setPdfWatermark(v as WatermarkType)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('admin.feasibility.noWatermark', 'None')}</SelectItem>
                      <SelectItem value="confidential">{t('admin.feasibility.confidentialWatermark', 'Confidential')}</SelectItem>
                      <SelectItem value="draft">{t('admin.feasibility.draftWatermark', 'Draft')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('admin.actions.cancel')}
              </Button>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (editingStudy && liveCalculations) {
                      const studyWithCalcs = {
                        ...editingStudy,
                        ...liveCalculations,
                        id: editingStudy.id || 'temp',
                        created_at: editingStudy.created_at || new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      } as FeasibilityStudy;
                      generatePDF(studyWithCalcs);
                    }
                  }}
                  disabled={!editingStudy?.study_name || !liveCalculations}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {t('admin.feasibility.exportPdf')}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={async () => {
                    if (editingStudy && liveCalculations && pdfChartsRef.current) {
                      setIsGeneratingPDF(true);
                      try {
                        const studyWithCalcs = {
                          ...editingStudy,
                          ...liveCalculations,
                          id: editingStudy.id || 'temp',
                          created_at: editingStudy.created_at || new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        } as FeasibilityStudy;
                        await generateFeasibilityPDFWithCharts(studyWithCalcs, pdfChartsRef.current, aiAnalysis);
                        toast({ title: t('admin.feasibility.pdfWithChartsGenerated') });
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        toast({ title: t('admin.feasibility.pdfError'), variant: 'destructive' });
                      } finally {
                        setIsGeneratingPDF(false);
                      }
                    }
                  }}
                  disabled={!editingStudy?.study_name || !liveCalculations || isGeneratingPDF}
                >
                  {isGeneratingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Image className="h-4 w-4 mr-2" />}
                  {t('admin.feasibility.savePdfWithCharts')}
                </Button>
                <Button 
                  variant="default"
                  className="bg-gradient-to-r from-primary to-emerald-600"
                  onClick={async () => {
                    if (editingStudy && liveCalculations) {
                      setIsGeneratingPDF(true);
                      try {
                        const studyWithCalcs = {
                          study_name: editingStudy.study_name || 'Feasibility Study',
                          location: editingStudy.location,
                          country: editingStudy.country,
                          daily_capacity_tons: editingStudy.daily_capacity_tons || 10,
                          operating_days_per_year: editingStudy.operating_days_per_year || 300,
                          utilization_rate: editingStudy.utilization_rate || 85,
                          total_investment: liveCalculations.total_investment,
                          annual_revenue: liveCalculations.annual_revenue,
                          annual_opex: liveCalculations.annual_opex,
                          annual_ebitda: liveCalculations.annual_ebitda,
                          payback_months: liveCalculations.payback_months,
                          roi_percentage: liveCalculations.roi_percentage,
                          npv_10_years: liveCalculations.npv_10_years,
                          irr_percentage: liveCalculations.irr_percentage,
                          rubber_granules_price: editingStudy.rubber_granules_price || 455,
                          rubber_granules_yield: editingStudy.rubber_granules_yield || 74.7,
                          steel_wire_price: editingStudy.steel_wire_price || 260,
                          steel_wire_yield: editingStudy.steel_wire_yield || 15.7,
                          textile_fiber_price: editingStudy.textile_fiber_price || 266,
                          textile_fiber_yield: editingStudy.textile_fiber_yield || 9.7,
                          tax_rate: editingStudy.tax_rate || 25,
                          discount_rate: editingStudy.discount_rate,
                          equipment_cost: editingStudy.equipment_cost,
                          installation_cost: editingStudy.installation_cost,
                          infrastructure_cost: editingStudy.infrastructure_cost,
                          working_capital: editingStudy.working_capital,
                          labor_cost: editingStudy.labor_cost,
                          energy_cost: editingStudy.energy_cost,
                          maintenance_cost: editingStudy.maintenance_cost,
                          logistics_cost: editingStudy.logistics_cost,
                          administrative_cost: editingStudy.administrative_cost,
                          other_opex: editingStudy.other_opex,
                          depreciation_years: editingStudy.depreciation_years
                        };
                        await generateProfessionalFeasibilityPDF(studyWithCalcs, aiAnalysis, pdfLanguage, pdfChartsRef.current, checklistNotes, getQrCodeUrl(), pdfWatermark);
                        toast({ title: t('admin.feasibility.pdfWithChartsGenerated') });
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        toast({ title: t('admin.feasibility.pdfError'), variant: 'destructive' });
                      } finally {
                        setIsGeneratingPDF(false);
                      }
                    }
                  }}
                  disabled={!editingStudy?.study_name || !liveCalculations || isGeneratingPDF}
                >
                  {isGeneratingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  {t('admin.feasibility.generateProfessionalPdf')}
                </Button>
                <Button 
                  onClick={() => saveMutation.mutate(editingStudy!)} 
                  disabled={saveMutation.isPending || !editingStudy?.study_name}
                >
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {t('admin.feasibility.saveStudy')}
                </Button>
              </div>
             </DialogFooter>
          </DialogContent>
        </Dialog>

          <TabsContent value="otr-data">
            <OTRCompositionTable />
          </TabsContent>

          <TabsContent value="templates">
            <FeasibilityTemplates
              onSelectTemplate={(template) => {
                setEditingStudy({
                  ...defaultStudy,
                  study_name: template.name,
                  country: template.country,
                  daily_capacity_tons: template.daily_capacity_tons,
                  equipment_cost: template.equipment_cost,
                  installation_cost: template.installation_cost,
                  infrastructure_cost: template.infrastructure_cost,
                  working_capital: template.working_capital,
                  other_capex: template.other_capex,
                  raw_material_cost: template.raw_material_cost,
                  labor_cost: template.labor_cost,
                  energy_cost: template.energy_cost,
                  maintenance_cost: template.maintenance_cost,
                  logistics_cost: template.logistics_cost,
                  administrative_cost: template.administrative_cost,
                  other_opex: template.other_opex,
                  rubber_granules_price: template.rubber_granules_price,
                  rubber_granules_yield: template.rubber_granules_yield,
                  steel_wire_price: template.steel_wire_price,
                  steel_wire_yield: template.steel_wire_yield,
                  textile_fiber_price: template.textile_fiber_price,
                  textile_fiber_yield: template.textile_fiber_yield,
                  rcb_price: 1000,
                  rcb_yield: 12,
                  tax_rate: template.tax_rate
                });
                setDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="compare">
            <FeasibilityComparison studies={studies || []} />
          </TabsContent>

          <TabsContent value="charts">
            {studies && studies.length > 0 ? (
              <FeasibilityCharts study={studies[0]} studies={studies} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('admin.feasibility.noStudies')}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Hidden PDF Charts for rendering */}
        {editingStudy && liveCalculations && (
          <FeasibilityPDFCharts 
            ref={pdfChartsRef}
            study={{ ...editingStudy, ...liveCalculations }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
