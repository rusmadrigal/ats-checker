'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, CheckCircle, FileText, Zap, TrendingUp, Download, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { UploadDropzone } from './components/UploadDropzone';
import { ScoreCard } from './components/ScoreCard';
import { IssuesList } from './components/IssuesList';
import { SuggestionCard } from './components/SuggestionCard';
import { HowItWorksStep } from './components/HowItWorksStep';
import type { AnalysisResult } from '@/src/lib/analysis-types';

// type Language = 'en' | 'es';

const translations = {
  /*
  // English (disabled for now — keep for re-enabling i18n)
  en: {
    title: 'ATS Resume Checker',
    tagline: 'AI-Powered Resume Analysis',
    headline: 'Check if your resume passes ATS filters',
    subheadline:
      'Get instant AI-powered analysis of your resume compatibility with Applicant Tracking Systems',
    uploadButton: 'Upload Resume',
    supportedFormats: 'Supports PDF and DOCX',
    scoreTitle: 'ATS Compatibility Score',
    issuesTitle: 'Issues Found',
    suggestionsTitle: 'Suggested Improvements',
    upgradeTitle: 'Improve your resume with AI',
    upgradeDescription:
      'Get personalized recommendations and AI-powered optimization to land more interviews',
    upgradeButton: 'Optimize Resume',
    howItWorksTitle: 'How it works',
    step1Title: 'Upload your resume',
    step1Desc: 'Drop your PDF or DOCX file to start the analysis',
    step2Title: 'AI analyzes compatibility',
    step2Desc: 'Our AI checks formatting, keywords, and structure',
    step3Title: 'Get improvements',
    step3Desc: 'Receive actionable suggestions to boost your ATS score',
    footer: '© 2026 ATS Resume Checker. Built with AI.',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  */
  es: {
    title: 'ATS Resume Checker',
    tagline: 'Análisis de CV con IA',
    headline: 'Verifica si tu CV pasa los filtros ATS',
    subheadline:
      'Obtén análisis instantáneo con IA de la compatibilidad de tu currículum con sistemas ATS',
    uploadButton: 'Subir CV',
    supportedFormats: 'Soporta PDF y DOCX',
    scoreTitle: 'Puntuación de Compatibilidad ATS',
    issuesTitle: 'Problemas Encontrados',
    suggestionsTitle: 'Mejoras Sugeridas',
    upgradeTitle: 'Mejora tu CV con IA',
    upgradeDescription:
      'Obtén recomendaciones personalizadas y optimización con IA para conseguir más entrevistas',
    upgradeButton: 'Optimizar CV',
    howItWorksTitle: 'Cómo funciona',
    step1Title: 'Sube tu currículum',
    step1Desc: 'Arrastra tu archivo PDF o DOCX para iniciar el análisis',
    step2Title: 'IA analiza compatibilidad',
    step2Desc: 'Nuestra IA revisa formato, palabras clave y estructura',
    step3Title: 'Obtén mejoras',
    step3Desc: 'Recibe sugerencias accionables para mejorar tu puntuación ATS',
    footer: '© 2026 ATS Resume Checker. Creado con IA.',
    privacy: 'Privacidad',
    terms: 'Términos',
    exportBlockTitle: 'Descargar versión mejorada',
    exportBlockHint:
      'El DOCX usa una plantilla fija con tu texto mejorado (docxtemplater). Si el servidor tiene Gotenberg o LibreOffice, el PDF se genera a partir de ese DOCX y conserva la maquetación de la plantilla; si no, se usa un PDF de texto plano como respaldo.',
    downloadDocx: 'DOCX con plantilla',
    downloadPdf: 'PDF (vía DOCX si hay conversor)',
    exportLoading: 'Generando…',
    exportSuccess: 'Descarga lista',
    sectorLabel: 'Plantilla por sector',
    sectorGeneral: 'General',
    sectorTech: 'Tecnología',
    sectorHealth: 'Salud',
    useAiLabel: 'Reescribir con IA al exportar',
    useAiHint:
      'Usa OpenAI en el servidor (OPENAI_API_KEY). Si está desactivado, solo se aplican sustituciones heurísticas.',
  },
} as const;

const t = translations.es;
/** Idioma fijo: español. Reactivar `en` arriba y estado `language` para volver al toggle. */
const language = 'es' as const;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [exportingFormat, setExportingFormat] = useState<'docx' | 'pdf' | null>(null);
  const [exportSector, setExportSector] = useState<'default' | 'tech' | 'health'>('default');
  const [useExportAi, setUseExportAi] = useState(false);

  // const [language, setLanguage] = useState<Language>('en');
  // const t = translations[language];
  // const toggleLanguage = () => {
  //   setLanguage(language === 'en' ? 'es' : 'en');
  // };

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error('El archivo supera el límite de 10 MB.');
      return;
    }
    setUploadedFile(file);
    setShowResults(false);
    setAnalysis(null);
    setIsAnalyzing(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/analyze', { method: 'POST', body });
      const data: unknown = await res.json();
      if (!res.ok) {
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'No se pudo analizar el CV.';
        throw new Error(msg);
      }
      const result = data as AnalysisResult;
      if (
        typeof result.score !== 'number' ||
        !Array.isArray(result.issues) ||
        !Array.isArray(result.suggestions)
      ) {
        throw new Error('Respuesta del servidor no válida.');
      }
      setAnalysis(result);
      setShowResults(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al analizar el CV.';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadImproved = async (format: 'docx' | 'pdf') => {
    if (!uploadedFile) {
      toast.error('Primero sube un CV.');
      return;
    }
    setExportingFormat(format);
    try {
      const body = new FormData();
      body.append('file', uploadedFile);
      body.append('format', format);
      body.append('sector', exportSector);
      body.append('useAi', useExportAi ? 'true' : 'false');
      const res = await fetch('/api/export-improved', { method: 'POST', body });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'No se pudo generar el archivo.';
        throw new Error(msg);
      }
      const blob = await res.blob();
      const dispo = res.headers.get('Content-Disposition');
      let filename = format === 'pdf' ? 'cv_mejorado.pdf' : 'cv_mejorado.docx';
      const m = dispo?.match(/filename="([^"]+)"/);
      if (m?.[1]) filename = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t.exportSuccess);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al exportar.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Toaster position="bottom-right" />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-card/80 border-border sticky top-0 z-50 border-b backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-[1100px] items-center justify-start px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <FileText className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-foreground text-lg font-semibold">{t.title}</span>
          </div>
          {/*
          <button
            onClick={toggleLanguage}
            className="bg-secondary hover:bg-muted focus-visible:ring-primary flex items-center gap-2 rounded-lg px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={
              language === 'en' ? 'Switch language to Spanish' : 'Cambiar idioma a inglés'
            }
          >
            <Globe className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-medium">{language === 'en' ? 'EN' : 'ES'}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground text-sm">{language === 'en' ? 'ES' : 'EN'}</span>
          </button>
          */}
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="from-accent/30 via-background to-background absolute inset-0 bg-gradient-to-br" />
          <div className="relative mx-auto max-w-[1100px] px-6 pt-12 pb-16 md:pt-20 md:pb-24">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-accent/60 border-primary/20 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              >
                <Zap className="text-primary h-4 w-4" />
                <span className="text-foreground text-sm font-medium">{t.tagline}</span>
              </motion.div>

              <h1 className="text-foreground mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-[56px]">
                {t.headline}
              </h1>

              <p className="text-muted-foreground mb-12 text-base leading-relaxed md:text-lg lg:text-xl">
                {t.subheadline}
              </p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <UploadDropzone
                  onFileSelect={handleFileSelect}
                  isAnalyzing={isAnalyzing}
                  language={language}
                />
              </motion.div>

              {uploadedFile && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {uploadedFile.name}
                </motion.p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && analysis && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-[1100px] px-6 py-12 md:py-16"
              aria-live="polite"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Score Card */}
                <div className="lg:col-span-1">
                  <ScoreCard score={analysis.score} language={language} />
                </div>

                {/* Issues and Suggestions */}
                <div className="space-y-6 lg:col-span-2">
                  {analysis.issues.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border-border rounded-2xl border p-8 shadow-sm"
                    >
                      <h3 className="text-foreground mb-2 text-lg font-semibold md:text-xl">
                        {t.issuesTitle}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                        No se detectaron incidencias con las comprobaciones automáticas. Sigue
                        afinando palabras clave según cada oferta.
                      </p>
                    </motion.div>
                  ) : (
                    <IssuesList issues={analysis.issues} title={t.issuesTitle} />
                  )}
                  <SuggestionCard
                    suggestions={analysis.suggestions}
                    title={t.suggestionsTitle}
                    language={language}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="bg-card border-border rounded-2xl border p-8 shadow-sm"
                  >
                    <h3 className="text-foreground mb-3 text-lg font-semibold md:text-xl">
                      {t.exportBlockTitle}
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed md:text-base">
                      {t.exportBlockHint}
                    </p>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label
                          htmlFor="export-sector"
                          className="text-foreground mb-2 block text-sm font-medium"
                        >
                          {t.sectorLabel}
                        </label>
                        <select
                          id="export-sector"
                          value={exportSector}
                          onChange={(e) =>
                            setExportSector(e.target.value as 'default' | 'tech' | 'health')
                          }
                          disabled={exportingFormat !== null}
                          className="border-border bg-background text-foreground focus-visible:ring-primary w-full rounded-xl border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                        >
                          <option value="default">{t.sectorGeneral}</option>
                          <option value="tech">{t.sectorTech}</option>
                          <option value="health">{t.sectorHealth}</option>
                        </select>
                      </div>
                      <label className="flex cursor-pointer items-start gap-3 sm:pb-2">
                        <input
                          type="checkbox"
                          checked={useExportAi}
                          onChange={(e) => setUseExportAi(e.target.checked)}
                          disabled={exportingFormat !== null}
                          className="border-border text-primary focus-visible:ring-primary mt-1 h-4 w-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60"
                        />
                        <span>
                          <span className="text-foreground block text-sm font-medium">
                            {t.useAiLabel}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                            {t.useAiHint}
                          </span>
                        </span>
                      </label>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <motion.button
                        type="button"
                        disabled={exportingFormat !== null}
                        whileHover={{ scale: exportingFormat ? 1 : 1.02 }}
                        whileTap={{ scale: exportingFormat ? 1 : 0.98 }}
                        onClick={() => downloadImproved('docx')}
                        className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                      >
                        {exportingFormat === 'docx' ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        ) : (
                          <Download className="h-5 w-5" aria-hidden />
                        )}
                        {exportingFormat === 'docx' ? t.exportLoading : t.downloadDocx}
                      </motion.button>
                      <motion.button
                        type="button"
                        disabled={exportingFormat !== null}
                        whileHover={{ scale: exportingFormat ? 1 : 1.02 }}
                        whileTap={{ scale: exportingFormat ? 1 : 0.98 }}
                        onClick={() => downloadImproved('pdf')}
                        className="border-border bg-background hover:bg-muted focus-visible:ring-primary inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                      >
                        {exportingFormat === 'pdf' ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        ) : (
                          <Download className="h-5 w-5" aria-hidden />
                        )}
                        {exportingFormat === 'pdf' ? t.exportLoading : t.downloadPdf}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CTA Upgrade Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[1100px] px-6 py-12 md:py-16"
        >
          <div className="border-primary/10 from-primary/5 via-accent/30 to-primary/5 rounded-3xl border bg-gradient-to-br p-8 text-center md:p-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl">
                {t.upgradeTitle}
              </h2>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-base md:text-lg">
                {t.upgradeDescription}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 focus-visible:ring-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 font-semibold shadow-lg transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <TrendingUp className="h-5 w-5" />
                {t.upgradeButton}
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works */}
        <section className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-foreground mb-16 text-center text-3xl font-bold md:text-4xl">
              {t.howItWorksTitle}
            </h2>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <HowItWorksStep
                icon={<Upload className="h-8 w-8" />}
                step="01"
                title={t.step1Title}
                description={t.step1Desc}
                delay={0}
              />
              <HowItWorksStep
                icon={<Zap className="h-8 w-8" />}
                step="02"
                title={t.step2Title}
                description={t.step2Desc}
                delay={0.1}
              />
              <HowItWorksStep
                icon={<TrendingUp className="h-8 w-8" />}
                step="03"
                title={t.step3Title}
                description={t.step3Desc}
                delay={0.2}
              />
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-border mt-24 border-t">
        <div className="mx-auto max-w-[1100px] px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-muted-foreground text-sm">{t.footer}</p>
            <div className="flex items-center gap-8">
              {/*
              <button
                onClick={toggleLanguage}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary flex items-center gap-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'Español' : 'English'}
              </button>
              */}
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t.privacy}
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t.terms}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
