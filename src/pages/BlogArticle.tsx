import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, Clock, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Article {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string;
  title_es: string;
  title_zh: string;
  excerpt_pt: string;
  excerpt_en: string;
  excerpt_es: string;
  excerpt_zh: string;
  content_pt: string;
  content_en: string;
  content_es: string;
  content_zh: string;
  category: string;
  image_url: string | null;
  read_time: string | null;
  is_published: boolean;
  published_at: string | null;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'pt' | 'en' | 'es' | 'zh';

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data as Article;
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

  if (error || !article) {
    return <Navigate to="/media" replace />;
  }

  const getLocalizedField = (field: 'title' | 'excerpt' | 'content') => {
    const key = `${field}_${lang}` as keyof Article;
    const value = article[key] as string;
    if (value) return value;
    // Fallback to Portuguese
    return article[`${field}_pt` as keyof Article] as string;
  };

  const title = getLocalizedField('title');
  const excerpt = getLocalizedField('excerpt');
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

  const ctaTitle = lang === 'pt' ? 'Quer saber mais?' : 
                   lang === 'en' ? 'Want to know more?' : 
                   lang === 'es' ? '¿Quieres saber más?' : '想了解更多？';

  const ctaText = lang === 'pt' ? 'Entre em contato com nossa equipe para discutir como podemos ajudar sua empresa.' : 
                  lang === 'en' ? 'Contact our team to discuss how we can help your company.' : 
                  lang === 'es' ? 'Contacte a nuestro equipo para discutir cómo podemos ayudar a su empresa.' : 
                  '联系我们的团队，讨论我们如何帮助您的公司。';

  const ctaButton = lang === 'pt' ? 'Fale Conosco' : 
                    lang === 'en' ? 'Contact Us' : 
                    lang === 'es' ? 'Contáctenos' : '联系我们';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {article.category}
              </span>
              {article.published_at && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.published_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {article.read_time && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.read_time}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8">{excerpt}</p>

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
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {article.image_url && (
        <section className="pb-12">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={article.image_url}
                alt={title}
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="pb-24">
        <div className="container-wide">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto prose prose-lg dark:prose-invert"
          >
            {parseContent(content).map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-2xl font-bold mt-10 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
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
                  className="mb-4 leading-relaxed"
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
            transition={{ delay: 0.5 }}
            className="max-w-3xl mx-auto mt-16 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl text-center"
          >
            <h3 className="text-2xl font-bold mb-4">{ctaTitle}</h3>
            <p className="text-muted-foreground mb-6">{ctaText}</p>
            <Button asChild size="lg">
              <Link to="/contact">{ctaButton}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
