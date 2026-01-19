import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileSignature,
  Search,
  Filter,
  Eye,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Calendar,
  Shield,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedDocument {
  id: string;
  document_name: string;
  document_type: string;
  is_signed: boolean;
  signed_at: string | null;
  signer_name: string | null;
  signer_email: string | null;
  signature_type: string | null;
  signature_hash: string | null;
  signature_data: Record<string, unknown> | null;
  field_values: Record<string, string> | null;
  language: string | null;
  created_at: string;
  sent_to_email: string | null;
  template_id: string | null;
}

interface SignatureLog {
  id: string;
  document_id: string | null;
  signer_name: string;
  signer_email: string;
  signature_type: string;
  signature_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export function SignedDocumentsManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'pending'>('all');
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [signatureLogs, setSignatureLogs] = useState<SignatureLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch generated documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['signed-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GeneratedDocument[];
    },
  });

  // Filter documents
  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch =
      doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.signer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.signer_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'signed' && doc.is_signed) ||
      (statusFilter === 'pending' && !doc.is_signed);

    return matchesSearch && matchesStatus;
  });

  const signedCount = documents?.filter((d) => d.is_signed).length || 0;
  const pendingCount = documents?.filter((d) => !d.is_signed).length || 0;

  const viewDocumentDetails = async (doc: GeneratedDocument) => {
    setSelectedDocument(doc);
    setLoadingLogs(true);

    try {
      const { data, error } = await supabase
        .from('signature_log')
        .select('*')
        .eq('document_id', doc.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setSignatureLogs(data as SignatureLog[]);
    } catch (err) {
      console.error('Error fetching signature logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const copySignatureLink = (docId: string) => {
    const link = `https://elpgreencom.lovable.app/sign?doc=${docId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copiado!',
      description: 'O link de assinatura foi copiado para a área de transferência.',
    });
  };

  const sendSignatureReminder = async (doc: GeneratedDocument) => {
    if (!doc.signer_email) {
      toast({
        title: 'Email não disponível',
        description: 'Este documento não possui um email de destinatário.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-signature-reminder', {
        body: {
          documentId: doc.id,
          documentName: doc.document_name,
          recipientEmail: doc.signer_email,
          recipientName: doc.signer_name || 'Parceiro',
          signatureLink: `https://elpgreencom.lovable.app/sign?doc=${doc.id}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Lembrete enviado!',
        description: `Email enviado para ${doc.signer_email}`,
      });
    } catch (err) {
      console.error('Error sending reminder:', err);
      toast({
        title: 'Erro ao enviar lembrete',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{signedCount}</p>
                <p className="text-sm text-muted-foreground">Documentos Assinados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes de Assinatura</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Gerenciamento de Documentos Assinados
          </CardTitle>
          <CardDescription>
            Visualize e gerencie documentos enviados para assinatura digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="signed">Assinados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signatário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments?.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.is_signed ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Assinado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.signer_name ? (
                          <div>
                            <p className="text-sm font-medium">{doc.signer_name}</p>
                            <p className="text-xs text-muted-foreground">{doc.signer_email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {doc.is_signed && doc.signed_at ? (
                            <>
                              <p>{format(new Date(doc.signed_at), 'dd/MM/yyyy')}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(doc.signed_at), 'HH:mm')}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">
                              Criado em {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewDocumentDetails(doc)}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copySignatureLink(doc.id)}
                            title="Copiar link de assinatura"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {!doc.is_signed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => sendSignatureReminder(doc)}
                              title="Enviar lembrete"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedDocument?.document_name}
            </DialogTitle>
            <DialogDescription>
              Detalhes do documento e trilha de auditoria
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="audit">Trilha de Auditoria</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                {selectedDocument && (
                  <>
                    {/* Status */}
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      {selectedDocument.is_signed ? (
                        <>
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">
                              Documento Assinado
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Assinado em{' '}
                              {selectedDocument.signed_at &&
                                format(new Date(selectedDocument.signed_at), "dd/MM/yyyy 'às' HH:mm")}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <Clock className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-700 dark:text-amber-400">
                              Aguardando Assinatura
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Criado em {format(new Date(selectedDocument.created_at), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Signer Info */}
                    {selectedDocument.signer_name && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Informações do Signatário
                        </h4>
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border">
                          <div>
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-medium">{selectedDocument.signer_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{selectedDocument.signer_email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo de Assinatura</p>
                            <p className="font-medium">
                              {selectedDocument.signature_type === 'drawn'
                                ? 'Manuscrita Digital'
                                : 'Digitada'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Idioma</p>
                            <p className="font-medium uppercase">
                              {selectedDocument.language || 'pt'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Signature Hash */}
                    {selectedDocument.signature_hash && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Hash de Integridade (SHA-256)
                        </h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <code className="text-xs break-all">{selectedDocument.signature_hash}</code>
                        </div>
                      </div>
                    )}

                    {/* Signature Preview */}
                    {selectedDocument.signature_data &&
                      typeof selectedDocument.signature_data === 'object' &&
                      'dataUrl' in selectedDocument.signature_data && (
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <FileSignature className="w-4 h-4" />
                            Assinatura
                          </h4>
                          <div className="p-4 bg-white rounded-lg border">
                            <img
                              src={selectedDocument.signature_data.dataUrl as string}
                              alt="Assinatura"
                              className="h-20 object-contain"
                            />
                          </div>
                        </div>
                      )}

                    {/* Signature Link */}
                    {!selectedDocument.is_signed && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Link de Assinatura
                        </h4>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={`https://elpgreencom.lovable.app/sign?doc=${selectedDocument.id}`}
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            onClick={() => copySignatureLink(selectedDocument.id)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : signatureLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum registro de auditoria encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signatureLogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {log.signature_type === 'drawn' ? 'Manuscrita' : 'Digitada'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm:ss")}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Signatário:</span>{' '}
                            {log.signer_name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span> {log.signer_email}
                          </div>
                        </div>
                        {log.ip_address && (
                          <div className="text-xs text-muted-foreground">
                            IP: {log.ip_address}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground truncate">
                          Hash: {log.signature_hash.substring(0, 40)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
