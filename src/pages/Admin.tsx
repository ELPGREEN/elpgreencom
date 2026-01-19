import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Users, 
  Mail, 
  Save,
  TrendingUp,
  MessageSquare,
  ShoppingCart,
  Download,
  Filter,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileDown,
  Send,
  Mail as MailIcon,
  FileText,
  Newspaper,
  Plus,
  Edit,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserManagement } from '@/components/admin/UserManagement';
import { OTRLeadManagement } from '@/components/admin/OTRLeadManagement';
import { CRMPipeline } from '@/components/admin/CRMPipeline';
import { EmailInbox } from '@/components/admin/EmailInbox';
import { DocumentGenerator } from '@/components/admin/DocumentGenerator';
import { PartnerDocumentFolders } from '@/components/admin/PartnerDocumentFolders';
import { GlobalLeadMap } from '@/components/admin/GlobalLeadMap';
import { PartnerLevels } from '@/components/admin/PartnerLevels';
import { FeasibilityStudyCalculator } from '@/components/admin/FeasibilityStudyCalculator';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { AdminStatusBadge } from '@/components/admin/AdminUIComponents';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';

interface ImpactStat {
  id: string;
  key: string;
  value: number;
  suffix: string;
  label_pt: string;
  label_en: string;
  label_es: string;
  label_zh: string;
  label_it: string;
  display_order: number;
  is_active: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string | null;
  message: string;
  channel: string;
  status: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  language: string;
  is_active: boolean;
  subscribed_at: string;
}

interface MarketplaceRegistration {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  country: string;
  company_type: string;
  products_interest: string[];
  estimated_volume: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface Article {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string;
  title_es: string;
  title_zh: string;
  title_it: string;
  excerpt_pt: string;
  excerpt_en: string;
  excerpt_es: string;
  excerpt_zh: string;
  excerpt_it: string;
  content_pt: string;
  content_en: string;
  content_es: string;
  content_zh: string;
  content_it: string;
  category: string;
  image_url: string | null;
  read_time: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface PressRelease {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string;
  title_es: string;
  title_zh: string;
  title_it: string;
  content_pt: string;
  content_en: string;
  content_es: string;
  content_zh: string;
  content_it: string;
  location: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const emptyArticle: Omit<Article, 'id' | 'created_at'> = {
  slug: '',
  title_pt: '',
  title_en: '',
  title_es: '',
  title_zh: '',
  title_it: '',
  excerpt_pt: '',
  excerpt_en: '',
  excerpt_es: '',
  excerpt_zh: '',
  excerpt_it: '',
  content_pt: '',
  content_en: '',
  content_es: '',
  content_zh: '',
  content_it: '',
  category: 'Tecnologia',
  image_url: '',
  read_time: '5 min',
  is_published: false,
  published_at: null,
};

const emptyPressRelease: Omit<PressRelease, 'id' | 'created_at'> = {
  slug: '',
  title_pt: '',
  title_en: '',
  title_es: '',
  title_zh: '',
  title_it: '',
  content_pt: '',
  content_en: '',
  content_es: '',
  content_zh: '',
  content_it: '',
  location: '',
  is_published: false,
  published_at: null,
};

const productNames: Record<string, string> = {
  'rcb': 'rCB',
  'pyrolytic-oil': 'Óleo Pirolítico',
  'steel-wire': 'Aço Verde',
  'rubber-blocks': 'Blocos de Borracha',
  'rubber-granules': 'Grânulos de Borracha',
  'reclaimed-rubber': 'Borracha Regenerada'
};

const companyTypeNames: Record<string, string> = {
  'buyer': 'Comprador',
  'seller': 'Vendedor',
  'both': 'Ambos'
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [editingStats, setEditingStats] = useState<ImpactStat[]>([]);
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('crm-pipeline');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Email reply state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<{ email: string; name: string; type: 'contact' | 'marketplace' } | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Article/Press Release editor state
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [pressDialogOpen, setPressDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [editingPress, setEditingPress] = useState<Partial<PressRelease> | null>(null);

  // Real-time subscription for cache invalidation
  useEffect(() => {
    const marketplaceChannel = supabase
      .channel('marketplace-cache-invalidation')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marketplace_registrations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-marketplace'] });
        queryClient.invalidateQueries({ queryKey: ['crm-marketplace'] });
      })
      .subscribe();

    const contactsChannel = supabase
      .channel('contacts-cache-invalidation')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
        queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(marketplaceChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, [queryClient]);

  // Fetch all data
  const { data: impactStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-impact-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('impact_stats').select('*').order('display_order');
      if (error) throw error;
      return data as ImpactStat[];
    },
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data as Contact[];
    },
  });

  const { data: subscribers } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const { data: marketplaceRegistrations } = useQuery({
    queryKey: ['admin-marketplace'],
    queryFn: async () => {
      const { data, error } = await supabase.from('marketplace_registrations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as MarketplaceRegistration[];
    },
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
  });

  const { data: pressReleases, isLoading: pressLoading } = useQuery({
    queryKey: ['admin-press-releases'],
    queryFn: async () => {
      const { data, error } = await supabase.from('press_releases').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as PressRelease[];
    },
  });

  // Mutations
  const updateStatsMutation = useMutation({
    mutationFn: async (stats: ImpactStat[]) => {
      for (const stat of stats) {
        const { error } = await supabase.from('impact_stats').update({
          value: stat.value, suffix: stat.suffix, label_pt: stat.label_pt, label_en: stat.label_en, label_es: stat.label_es, label_zh: stat.label_zh, label_it: stat.label_it,
        }).eq('id', stat.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-impact-stats'] });
      queryClient.invalidateQueries({ queryKey: ['impact-stats'] });
      toast({ title: 'Contadores atualizados com sucesso!' });
    },
    onError: () => toast({ title: 'Erro ao atualizar contadores', variant: 'destructive' }),
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      toast({ title: 'Status atualizado!' });
    },
  });

  const updateMarketplaceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('marketplace_registrations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketplace'] });
      toast({ title: 'Status atualizado!' });
    },
  });

  const deleteMarketplaceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('marketplace_registrations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-marketplace'] });
      toast({ title: 'Registro excluído com sucesso!' });
    },
    onError: () => toast({ title: 'Erro ao excluir registro', variant: 'destructive' }),
  });

  const saveArticleMutation = useMutation({
    mutationFn: async (article: Partial<Article>) => {
      const payload = {
        slug: article.slug, title_pt: article.title_pt, title_en: article.title_en, title_es: article.title_es, title_zh: article.title_zh, title_it: article.title_it,
        excerpt_pt: article.excerpt_pt, excerpt_en: article.excerpt_en, excerpt_es: article.excerpt_es, excerpt_zh: article.excerpt_zh, excerpt_it: article.excerpt_it,
        content_pt: article.content_pt, content_en: article.content_en, content_es: article.content_es, content_zh: article.content_zh, content_it: article.content_it,
        category: article.category, image_url: article.image_url, read_time: article.read_time, is_published: article.is_published, published_at: article.is_published ? new Date().toISOString() : null,
      };
      if (article.id) {
        const { error } = await supabase.from('articles').update(payload).eq('id', article.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: 'Artigo salvo com sucesso!' });
      setArticleDialogOpen(false);
      setEditingArticle(null);
    },
    onError: () => toast({ title: 'Erro ao salvar artigo', variant: 'destructive' }),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: 'Artigo excluído!' });
    },
  });

  const savePressMutation = useMutation({
    mutationFn: async (press: Partial<PressRelease>) => {
      const payload = {
        slug: press.slug, title_pt: press.title_pt, title_en: press.title_en, title_es: press.title_es, title_zh: press.title_zh, title_it: press.title_it,
        content_pt: press.content_pt, content_en: press.content_en, content_es: press.content_es, content_zh: press.content_zh, content_it: press.content_it,
        location: press.location, is_published: press.is_published, published_at: press.is_published ? new Date().toISOString() : null,
      };
      if (press.id) {
        const { error } = await supabase.from('press_releases').update(payload).eq('id', press.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('press_releases').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-press-releases'] });
      toast({ title: 'Press Release salvo com sucesso!' });
      setPressDialogOpen(false);
      setEditingPress(null);
    },
    onError: () => toast({ title: 'Erro ao salvar press release', variant: 'destructive' }),
  });

  const deletePressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('press_releases').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-press-releases'] });
      toast({ title: 'Press Release excluído!' });
    },
  });

  useEffect(() => {
    if (impactStats) setEditingStats(impactStats);
  }, [impactStats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const openEmailDialog = (email: string, name: string, type: 'contact' | 'marketplace') => {
    setEmailRecipient({ email, name, type });
    setEmailSubject(type === 'marketplace' ? 'Sobre seu pré-registro no Marketplace B2B - ELP Green' : 'Resposta ao seu contato - ELP Green Technology');
    setEmailMessage('');
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailRecipient || !emailSubject || !emailMessage) return;
    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-reply-email', {
        body: { to: emailRecipient.email, toName: emailRecipient.name, subject: emailSubject, message: emailMessage, replyType: emailRecipient.type }
      });
      if (error) throw error;
      toast({ title: 'Email enviado com sucesso!' });
      setEmailDialogOpen(false);
      setEmailRecipient(null);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({ title: 'Erro ao enviar email', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleStatChange = (id: string, field: keyof ImpactStat, value: string | number) => {
    setEditingStats(prev => prev.map(stat => stat.id === id ? { ...stat, [field]: value } : stat));
  };

  const generateMarketplacePDF = (reg: MarketplaceRegistration) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELP Green Technology', 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Marketplace B2B - Pré-Registro', 20, 35);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${reg.id.substring(0, 8).toUpperCase()}`, 20, 55);
    doc.text(`Data: ${new Date(reg.created_at).toLocaleDateString('pt-BR')}`, pageWidth - 60, 55);
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 65, pageWidth - 30, 50, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações da Empresa', 20, 78);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Empresa: ${reg.company_name}`, 20, 90);
    doc.text(`Contato: ${reg.contact_name}`, 20, 100);
    doc.text(`Email: ${reg.email}`, 20, 110);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('ELP Green Technology - info@elpgreen.com - www.elpgreen.com', pageWidth / 2, 290, { align: 'center' });
    doc.save(`marketplace-${reg.company_name.replace(/\s+/g, '-').toLowerCase()}-${reg.id.substring(0, 8)}.pdf`);
  };

  const generateContactPDF = (contact: Contact) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELP Green Technology', 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Formulário de Contato', 20, 35);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${contact.name}`, 20, 55);
    doc.text(`Email: ${contact.email}`, 20, 65);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('ELP Green Technology - info@elpgreen.com - www.elpgreen.com', pageWidth / 2, 290, { align: 'center' });
    doc.save(`contato-${contact.name.replace(/\s+/g, '-').toLowerCase()}-${contact.id.substring(0, 8)}.pdf`);
  };

  // Stats calculations
  const totalContacts = contacts?.length || 0;
  const newContacts = contacts?.filter(c => c.status === 'new').length || 0;
  const totalSubscribers = subscribers?.length || 0;
  const totalMarketplace = marketplaceRegistrations?.length || 0;
  const pendingMarketplace = marketplaceRegistrations?.filter(m => m.status === 'pending').length || 0;
  const otrPendingCount = contacts?.filter(c => c.channel === 'otr-source-indication' && c.status === 'pending').length || 0;

  const filteredMarketplace = marketplaceRegistrations?.filter(reg => {
    if (marketplaceFilter !== 'all' && reg.status !== marketplaceFilter) return false;
    if (marketplaceSearch.trim()) {
      const searchTerm = marketplaceSearch.toLowerCase().trim();
      if (!reg.company_name.toLowerCase().includes(searchTerm) && !reg.email.toLowerCase().includes(searchTerm) && !reg.contact_name.toLowerCase().includes(searchTerm)) return false;
    }
    return true;
  }) || [];

  const totalPages = Math.ceil(filteredMarketplace.length / itemsPerPage);
  const paginatedMarketplace = filteredMarketplace.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [marketplaceFilter, marketplaceSearch]);

  const exportMarketplaceCSV = () => {
    if (!marketplaceRegistrations?.length) return;
    const headers = ['Empresa', 'Contato', 'Email', 'Telefone', 'País', 'Tipo', 'Produtos', 'Volume', 'Status', 'Data'];
    const rows = marketplaceRegistrations.map(reg => [
      reg.company_name, reg.contact_name, reg.email, reg.phone || '', reg.country, companyTypeNames[reg.company_type] || reg.company_type,
      reg.products_interest.map(p => productNames[p] || p).join('; '), reg.estimated_volume || '', reg.status, new Date(reg.created_at).toLocaleDateString('pt-BR')
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `marketplace-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Analytics data
  const filteredByDateRegistrations = marketplaceRegistrations?.filter(reg => {
    if (!dateFilter.start && !dateFilter.end) return true;
    const regDate = new Date(reg.created_at);
    if (dateFilter.start && regDate < new Date(dateFilter.start)) return false;
    if (dateFilter.end && regDate > new Date(dateFilter.end + 'T23:59:59')) return false;
    return true;
  }) || [];

  const countryData = filteredByDateRegistrations.reduce((acc, reg) => { acc[reg.country] = (acc[reg.country] || 0) + 1; return acc; }, {} as Record<string, number>);
  const countryChartData = Object.entries(countryData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  const companyTypeData = filteredByDateRegistrations.reduce((acc, reg) => { const type = companyTypeNames[reg.company_type] || reg.company_type; acc[type] = (acc[type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const companyTypeChartData = Object.entries(companyTypeData).map(([name, value]) => ({ name, value }));
  const productData = filteredByDateRegistrations.reduce((acc, reg) => { reg.products_interest.forEach(p => { const name = productNames[p] || p; acc[name] = (acc[name] || 0) + 1; }); return acc; }, {} as Record<string, number>);
  const productChartData = Object.entries(productData).map(([name, value]) => ({ name, value }));

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AdminHeader onLogout={handleLogout} onNavigateTab={setActiveTab} />
      
      <div className="flex">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          isAdmin={isAdmin} 
          otrPendingCount={otrPendingCount} 
        />
        
        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <AdminStatsGrid
            totalContacts={totalContacts}
            newContacts={newContacts}
            totalMarketplace={totalMarketplace}
            pendingMarketplace={pendingMarketplace}
            totalSubscribers={totalSubscribers}
            totalArticles={articles?.filter(a => a.is_published).length || 0}
            totalPress={pressReleases?.filter(p => p.is_published).length || 0}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'crm-pipeline' && <CRMPipeline />}
              {activeTab === 'email-inbox' && <EmailInbox />}
              {activeTab === 'partner-folders' && <PartnerDocumentFolders />}
              {activeTab === 'documents' && <DocumentGenerator />}
              {activeTab === 'global-map' && <GlobalLeadMap />}
              {activeTab === 'partner-levels' && <PartnerLevels />}
              {activeTab === 'feasibility' && <FeasibilityStudyCalculator />}
              {activeTab === 'otr-leads' && <OTRLeadManagement />}
              
              {activeTab === 'counters' && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{t('admin.counters.title')}</CardTitle>
                        <CardDescription>{t('admin.counters.description')}</CardDescription>
                      </div>
                      <Button onClick={() => updateStatsMutation.mutate(editingStats)} disabled={updateStatsMutation.isPending} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {t('admin.counters.save')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {statsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : (
                      editingStats.map((stat) => (
                        <div key={stat.id} className="p-4 border rounded-lg space-y-4">
                          <Badge variant="outline" className="text-xs">{stat.key}</Badge>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Valor</Label>
                              <Input type="number" value={stat.value} onChange={(e) => handleStatChange(stat.id, 'value', Number(e.target.value))} />
                            </div>
                            <div>
                              <Label className="text-xs">Sufixo</Label>
                              <Input value={stat.suffix} onChange={(e) => handleStatChange(stat.id, 'suffix', e.target.value)} placeholder="t, +, %" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {['pt', 'en', 'es', 'zh', 'it'].map(lang => (
                              <div key={lang}>
                                <Label className="text-xs uppercase">{lang}</Label>
                                <Input value={(stat as any)[`label_${lang}`] || ''} onChange={(e) => handleStatChange(stat.id, `label_${lang}` as keyof ImpactStat, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'articles' && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{t('admin.articlesSection.title')}</CardTitle>
                        <CardDescription>{t('admin.articlesSection.description')}</CardDescription>
                      </div>
                      <Button onClick={() => { setEditingArticle({ ...emptyArticle }); setArticleDialogOpen(true); }} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('admin.articlesSection.newArticle')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {articlesLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : articles?.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('admin.articlesSection.noArticles')}</p>
                    ) : (
                      <div className="space-y-3">
                        {articles?.map((article) => (
                          <div key={article.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{article.title_pt}</h4>
                                <Badge variant={article.is_published ? 'default' : 'secondary'} className="text-xs">{article.is_published ? 'Publicado' : 'Rascunho'}</Badge>
                                <Badge variant="outline" className="text-xs">{article.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{article.excerpt_pt}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingArticle(article); setArticleDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Excluir artigo?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteArticleMutation.mutate(article.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'press' && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{t('admin.pressSection.title')}</CardTitle>
                        <CardDescription>{t('admin.pressSection.description')}</CardDescription>
                      </div>
                      <Button onClick={() => { setEditingPress({ ...emptyPressRelease }); setPressDialogOpen(true); }} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('admin.pressSection.newPress')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pressLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : pressReleases?.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('admin.pressSection.noPress')}</p>
                    ) : (
                      <div className="space-y-3">
                        {pressReleases?.map((press) => (
                          <div key={press.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{press.title_pt}</h4>
                                <Badge variant={press.is_published ? 'default' : 'secondary'} className="text-xs">{press.is_published ? 'Publicado' : 'Rascunho'}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{press.location}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingPress(press); setPressDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Excluir press release?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deletePressMutation.mutate(press.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'contacts' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{t('admin.contacts.title')}</CardTitle>
                    <CardDescription>{t('admin.contacts.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contactsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : contacts?.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('admin.contacts.noMessages')}</p>
                    ) : (
                      <div className="space-y-3">
                        {contacts?.map((contact) => (
                          <div key={contact.id} className="p-4 border rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{contact.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                                {contact.company && <p className="text-sm text-muted-foreground truncate">{contact.company}</p>}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <AdminStatusBadge status={contact.status} />
                                <Select value={contact.status} onValueChange={(v) => updateContactMutation.mutate({ id: contact.id, status: v })}>
                                  <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">Novo</SelectItem>
                                    <SelectItem value="read">Lido</SelectItem>
                                    <SelectItem value="replied">Respondido</SelectItem>
                                    <SelectItem value="archived">Arquivado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateContactPDF(contact)}><FileDown className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEmailDialog(contact.email, contact.name, 'contact')}><Send className="h-4 w-4" /></Button>
                              </div>
                            </div>
                            {contact.subject && <p className="text-sm font-medium mb-2">{contact.subject}</p>}
                            <p className="text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(contact.created_at).toLocaleString('pt-BR')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'newsletter' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{t('admin.newsletter.title')}</CardTitle>
                    <CardDescription>{t('admin.newsletter.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscribers?.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('admin.newsletter.noSubscribers')}</p>
                    ) : (
                      <div className="space-y-3">
                        {subscribers?.map((sub) => (
                          <div key={sub.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{sub.email}</p>
                              {sub.name && <p className="text-sm text-muted-foreground truncate">{sub.name}</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={sub.is_active ? 'default' : 'secondary'} className="text-xs">{sub.is_active ? t('admin.newsletter.active') : t('admin.newsletter.inactive')}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(sub.subscribed_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'marketplace' && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl">{t('admin.marketplace.title')}</CardTitle>
                          <CardDescription>{t('admin.marketplace.description')}</CardDescription>
                        </div>
                        <Button variant="outline" onClick={exportMarketplaceCSV} className="w-full sm:w-auto">
                          <Download className="h-4 w-4 mr-2" />
                          {t('admin.marketplace.exportCsv')}
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Buscar..." value={marketplaceSearch} onChange={(e) => setMarketplaceSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('admin.marketplace.all')}</SelectItem>
                            <SelectItem value="pending">{t('admin.marketplace.statusPending')}</SelectItem>
                            <SelectItem value="contacted">{t('admin.marketplace.statusContacted')}</SelectItem>
                            <SelectItem value="qualified">{t('admin.marketplace.statusQualified')}</SelectItem>
                            <SelectItem value="converted">{t('admin.marketplace.statusConverted')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredMarketplace.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('admin.marketplace.noRecordFound')}</p>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {paginatedMarketplace.map((reg) => (
                            <div key={reg.id} className="p-4 border rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{reg.company_name}</p>
                                  <p className="text-sm text-muted-foreground truncate">{reg.contact_name} · {reg.email}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <AdminStatusBadge status={reg.status} />
                                  <Select value={reg.status} onValueChange={(v) => updateMarketplaceMutation.mutate({ id: reg.id, status: v })}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pendente</SelectItem>
                                      <SelectItem value="contacted">Contatado</SelectItem>
                                      <SelectItem value="qualified">Qualificado</SelectItem>
                                      <SelectItem value="converted">Convertido</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateMarketplacePDF(reg)}><FileDown className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEmailDialog(reg.email, reg.contact_name, 'marketplace')}><Send className="h-4 w-4" /></Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader><AlertDialogTitle>Excluir registro?</AlertDialogTitle><AlertDialogDescription>O registro de {reg.company_name} será excluído.</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteMarketplaceMutation.mutate(reg.id)} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                                <span>País: {reg.country}</span>
                                <span>Tipo: {companyTypeNames[reg.company_type]}</span>
                                <span>Volume: {reg.estimated_volume || 'N/A'}</span>
                                <span>{new Date(reg.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMarketplace.length)} de {filteredMarketplace.length}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                              <span className="text-sm">Página {currentPage} de {totalPages}</span>
                              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl">{t('admin.analytics.filterPeriod')}</CardTitle>
                          <CardDescription>{t('admin.analytics.selectPeriod')}</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">{t('admin.analytics.from')}</Label>
                            <Input type="date" value={dateFilter.start} onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))} className="w-auto h-8" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">{t('admin.analytics.to')}</Label>
                            <Input type="date" value={dateFilter.end} onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))} className="w-auto h-8" />
                          </div>
                          {(dateFilter.start || dateFilter.end) && (
                            <Button variant="outline" size="sm" onClick={() => setDateFilter({ start: '', end: '' })}>{t('admin.analytics.clear')}</Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />{t('admin.analytics.countries')}</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold">{Object.keys(countryData).length}</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{t('admin.analytics.conversion')}</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold">{totalMarketplace > 0 ? Math.round((marketplaceRegistrations?.filter(r => r.status === 'converted').length || 0) / totalMarketplace * 100) : 0}%</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{t('admin.analytics.qualified')}</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold">{marketplaceRegistrations?.filter(r => r.status === 'qualified' || r.status === 'converted').length || 0}</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Filter className="h-4 w-4 text-primary" />{t('admin.analytics.total')}</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold">{filteredByDateRegistrations.length}</div></CardContent>
                    </Card>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t('admin.analytics.registrationsByCountry')}</CardTitle></CardHeader>
                      <CardContent>
                        {countryChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={countryChartData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                              <Tooltip />
                              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground text-center py-10">{t('admin.analytics.noData')}</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t('admin.analytics.companyType')}</CardTitle></CardHeader>
                      <CardContent>
                        {companyTypeChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                              <Pie data={companyTypeChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={100} fill="#8884d8" dataKey="value">
                                {companyTypeChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </RechartsPie>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground text-center py-10">{t('admin.analytics.noData')}</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                      <CardHeader><CardTitle className="text-lg">{t('admin.analytics.mostWantedProducts')}</CardTitle></CardHeader>
                      <CardContent>
                        {productChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={productChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                                {productChartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground text-center py-10">{t('admin.analytics.noData')}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'users' && isAdmin && user && <UserManagement currentUserId={user.id} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MailIcon className="h-5 w-5" />Enviar Email</DialogTitle>
            <DialogDescription>Para: {emailRecipient?.name} ({emailRecipient?.email})</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Assunto</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Assunto do email" />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Digite sua mensagem..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail || !emailMessage}>
              {sendingEmail ? 'Enviando...' : 'Enviar'}
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Article Editor Dialog */}
      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingArticle?.id ? 'Editar Artigo' : 'Novo Artigo'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Slug (URL)</Label><Input value={editingArticle?.slug || ''} onChange={(e) => setEditingArticle(prev => ({ ...prev, slug: e.target.value }))} /></div>
              <div>
                <Label>Categoria</Label>
                <Select value={editingArticle?.category || 'Tecnologia'} onValueChange={(v) => setEditingArticle(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Thought Leadership">Thought Leadership</SelectItem>
                    <SelectItem value="Case Study">Case Study</SelectItem>
                    <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Tempo de Leitura</Label><Input value={editingArticle?.read_time || ''} onChange={(e) => setEditingArticle(prev => ({ ...prev, read_time: e.target.value }))} placeholder="5 min" /></div>
              <div><Label>URL da Imagem</Label><Input value={editingArticle?.image_url || ''} onChange={(e) => setEditingArticle(prev => ({ ...prev, image_url: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingArticle?.is_published || false} onCheckedChange={(v) => setEditingArticle(prev => ({ ...prev, is_published: v }))} />
              <Label>Publicado</Label>
            </div>
            <Tabs defaultValue="pt" className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="pt">PT</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
                <TabsTrigger value="zh">ZH</TabsTrigger>
                <TabsTrigger value="it">IT</TabsTrigger>
              </TabsList>
              {['pt', 'en', 'es', 'zh', 'it'].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div><Label>Título ({lang.toUpperCase()})</Label><Input value={(editingArticle as any)?.[`title_${lang}`] || ''} onChange={(e) => setEditingArticle(prev => ({ ...prev, [`title_${lang}`]: e.target.value }))} /></div>
                  <div><Label>Resumo ({lang.toUpperCase()})</Label><Textarea value={(editingArticle as any)?.[`excerpt_${lang}`] || ''} onChange={(e) => setEditingArticle(prev => ({ ...prev, [`excerpt_${lang}`]: e.target.value }))} rows={2} /></div>
                  <div><Label>Conteúdo ({lang.toUpperCase()})</Label><Textarea value={(editingArticle as any)?.[`content_${lang}`] || ''} onChange={(e) => setEditingArticle(prev => ({ ...prev, [`content_${lang}`]: e.target.value }))} rows={8} /></div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => editingArticle && saveArticleMutation.mutate(editingArticle)} disabled={saveArticleMutation.isPending}>{saveArticleMutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Press Release Editor Dialog */}
      <Dialog open={pressDialogOpen} onOpenChange={setPressDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPress?.id ? 'Editar Press Release' : 'Novo Press Release'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Slug (URL)</Label><Input value={editingPress?.slug || ''} onChange={(e) => setEditingPress(prev => ({ ...prev, slug: e.target.value }))} /></div>
              <div><Label>Localização</Label><Input value={editingPress?.location || ''} onChange={(e) => setEditingPress(prev => ({ ...prev, location: e.target.value }))} placeholder="São Paulo, Brasil" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingPress?.is_published || false} onCheckedChange={(v) => setEditingPress(prev => ({ ...prev, is_published: v }))} />
              <Label>Publicado</Label>
            </div>
            <Tabs defaultValue="pt" className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="pt">PT</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
                <TabsTrigger value="zh">ZH</TabsTrigger>
                <TabsTrigger value="it">IT</TabsTrigger>
              </TabsList>
              {['pt', 'en', 'es', 'zh', 'it'].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div><Label>Título ({lang.toUpperCase()})</Label><Input value={(editingPress as any)?.[`title_${lang}`] || ''} onChange={(e) => setEditingPress(prev => ({ ...prev, [`title_${lang}`]: e.target.value }))} /></div>
                  <div><Label>Conteúdo ({lang.toUpperCase()})</Label><Textarea value={(editingPress as any)?.[`content_${lang}`] || ''} onChange={(e) => setEditingPress(prev => ({ ...prev, [`content_${lang}`]: e.target.value }))} rows={10} /></div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPressDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => editingPress && savePressMutation.mutate(editingPress)} disabled={savePressMutation.isPending}>{savePressMutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
