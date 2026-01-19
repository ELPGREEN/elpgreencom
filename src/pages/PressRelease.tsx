import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, Building2, MapPin, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PressReleaseData {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string;
  title_es: string;
  title_zh: string;
  content_pt: string;
  content_en: string;
  content_es: string;
  content_zh: string;
  location: string | null;
  is_published: boolean;
  published_at: string | null;
}

export default function PressRelease() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'pt' | 'en' | 'es' | 'zh';

  const { data: pressRelease, isLoading, error } = useQuery({
    queryKey: ['press-release', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('press_releases')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data as PressReleaseData;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pressRelease) {
    return <Navigate to="/media" replace />;
  }

  const getLocalizedField = (field: 'title' | 'content') => {
    const key = `${field}_${lang}` as keyof PressReleaseData;
    const value = pressRelease[key] as string;
    if (value) return value;
    return pressRelease[`${field}_pt` as keyof PressReleaseData] as string;
  };

  const title = getLocalizedField('title');
  const content = getLocalizedField('content');

  const shareUrl = window.location.href;

  const parseContent = (text: string) => {
    return text.split('\n').filter(line => line.trim());
  };

  const backLabel = lang === 'pt' ? 'Voltar para Mídia' : 
                    lang === 'en' ? 'Back to Media' : 
                    lang === 'es' ? 'Volver a Medios' : '返回媒体中心';

  const shareLabel = lang === 'pt' ? 'Compartilhar' : 
                     lang === 'en' ? 'Share' : 
                     lang === 'es' ? 'Compartir' : '分享';

  const pressContactTitle = lang === 'pt' ? 'Contato para Imprensa' : 
                            lang === 'en' ? 'Press Contact' : 
                            lang === 'es' ? 'Contacto de Prensa' : '媒体联系';

  const pressContactText = lang === 'pt' ? 'Para mais informações, entrevistas ou materiais de imprensa, entre em contato.' : 
                           lang === 'en' ? 'For more information, interviews or press materials, please contact us.' : 
                           lang === 'es' ? 'Para más información, entrevistas o materiales de prensa, contáctenos.' : 
                           '如需更多信息、采访或新闻材料，请联系我们。';

  const contactUsLabel = lang === 'pt' ? 'Fale Conosco' : 
                         lang === 'en' ? 'Contact Us' : 
                         lang === 'es' ? 'Contáctenos' : '联系我们';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-12 bg-muted/30">
        <div className="container-wide relative z-10">
          <Link
            to="/media"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-4">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Press Release</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {pressRelease.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(pressRelease.published_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {pressRelease.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {pressRelease.location}
                </span>
              )}
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title, url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {shareLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-wide">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            {parseContent(content).map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-2xl font-bold mt-10 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph === '---') {
                return <hr key={idx} className="my-8 border-border" />;
              }
              if (paragraph.startsWith('• ')) {
                return (
                  <p
                    key={idx}
                    className="pl-4 border-l-2 border-primary/30 my-2"
                    dangerouslySetInnerHTML={{
                      __html: paragraph
                        .replace('• ', '')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                );
              }
              return (
                <p
                  key={idx}
                  className="mb-4 leading-relaxed text-foreground/90"
                  dangerouslySetInnerHTML={{
                    __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              );
            })}
          </motion.article>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mt-16 p-8 bg-card border border-border rounded-2xl text-center"
          >
            <h3 className="text-xl font-bold mb-4">{pressContactTitle}</h3>
            <p className="text-muted-foreground mb-6">{pressContactText}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link to="/contact">{contactUsLabel}</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:info@elpgreen.com">info@elpgreen.com</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
