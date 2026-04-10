'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  CheckCircle,
  FileText,
  Zap,
  TrendingUp,
  Download,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Skeleton } from './components/ui/skeleton';
import { UploadDropzone } from './components/UploadDropzone';
import { ScoreCard } from './components/ScoreCard';
import { IssuesList } from './components/IssuesList';
import { SuggestionCard } from './components/SuggestionCard';
import { HowItWorksStep } from './components/HowItWorksStep';
import { ResumeHarvardPreview } from './components/ResumeHarvardPreview';
import type { AnalysisResult } from '@/src/lib/analysis-types';
import { buildPlaintextFromStructured } from '@/src/lib/build-plaintext-from-structured';
import type { CvApprovalMap, CvStructured } from '@/src/lib/cv-structured-types';
import { defaultApprovalsForCv } from '@/src/lib/cv-structured-types';
import { cloneCvStructured } from '@/src/lib/cv-structured-clone';
import {
  clearPreviewSessionStorage,
  fileKeyFromFile,
  loadPreviewSession,
  savePreviewSession,
} from '@/src/lib/preview-session-storage';

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
    headline: 'Tu CV, listo para que lo lean las empresas',
    subheadline:
      'Sube el archivo. Te decimos qué mejorar y puedes ver el resultado claro antes de descargarlo.',
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
    exportBlockTitle: 'Último paso: descargar',
    exportBlockHint:
      'Word y PDF usan el mismo contenido que tu vista previa (incluidas las ediciones y lo que aprobaste). Si aún no hay vista previa, puedes usar la casilla de IA abajo.',
    downloadDocx: 'Descargar Word',
    downloadPdf: 'Descargar PDF',
    exportLoading: 'Generando…',
    exportSuccess: 'Descarga lista',
    useAiLabel: 'Reescribir con IA al exportar',
    useAiHint:
      'Usa OpenAI en el servidor (OPENAI_API_KEY). Si está desactivado, solo se aplican sustituciones heurísticas.',
    previewTitle: 'Vista previa de tu currículum',
    previewDescription:
      'Tras subir el archivo, la vista previa con IA se genera sola. Si vuelves a subir el mismo fichero, se recupera la guardada (sin gastar tokens). Puedes quitar la vista previa con el botón o al subir otro CV.',
    previewButtonGenerate: 'Generar vista previa con IA',
    previewButtonRegenerate: 'Volver a generar vista previa',
    previewClear: 'Quitar vista previa',
    previewClearHint:
      'Borra la vista previa de esta pestaña. Volver a generarla gastará tokens de IA. También se pierde al limpiar datos del sitio en el navegador.',
    previewUpdating: 'Actualizando vista previa…',
    previewLoading: 'Preparando tu currículum en vista clara…',
    previewHint:
      'Requiere OpenAI en el servidor. La descarga usa el texto de la vista previa cuando existe.',
    previewRecoveredNoTokens: 'Vista previa recuperada sin llamar a la IA (mismo archivo).',
    sessionRestoredBanner:
      'Para descargar Word o PDF, sube de nuevo el mismo archivo en la zona de arriba: {name}',
    downloadNeedsFile: 'Sube de nuevo el CV para descargar (necesitamos el archivo en el navegador).',
    stepAnalysis: 'Análisis',
    stepSuggestions: 'Sugerencias',
    stepPreview: 'Vista previa',
    stepDownload: 'Descargar',
    resultsWelcome: 'Listo. Aquí tienes el resultado, en orden sencillo.',
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
  const [useExportAi, setUseExportAi] = useState(false);
  const [structuredPreview, setStructuredPreview] = useState<CvStructured | null>(null);
  const [structuredBaseline, setStructuredBaseline] = useState<CvStructured | null>(null);
  const [previewReadOnly, setPreviewReadOnly] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [approvals, setApprovals] = useState<CvApprovalMap>({});
  /** Clave del archivo asociado a la sesión guardada (sirve para persistir sin `File`). */
  const [persistFileKey, setPersistFileKey] = useState<string | null>(null);
  const [persistFileName, setPersistFileName] = useState<string | null>(null);
  const sessionHydratedRef = useRef(false);

  // const [language, setLanguage] = useState<Language>('en');
  // const t = translations[language];
  // const toggleLanguage = () => {
  //   setLanguage(language === 'en' ? 'es' : 'en');
  // };

  useEffect(() => {
    if (sessionHydratedRef.current) return;
    sessionHydratedRef.current = true;
    const p = loadPreviewSession();
    if (!p) return;
    setAnalysis(p.analysis);
    setStructuredPreview(p.structured);
    setStructuredBaseline(cloneCvStructured(p.baseline));
    setApprovals(p.approvals);
    setPreviewReadOnly(p.previewReadOnly);
    setPersistFileKey(p.fileKey);
    setPersistFileName(p.fileName);
    setShowResults(true);
    toast('Sesión recuperada en esta pestaña. Si quieres descargar, sube otra vez el mismo CV.', {
      duration: 4500,
    });
  }, []);

  useEffect(() => {
    if (!analysis || !structuredPreview || !structuredBaseline) return;
    const fk = uploadedFile ? fileKeyFromFile(uploadedFile) : persistFileKey;
    const fn = uploadedFile?.name ?? persistFileName ?? 'cv';
    if (!fk) return;
    savePreviewSession({
      v: 1,
      fileKey: fk,
      fileName: fn,
      analysis,
      structured: structuredPreview,
      baseline: structuredBaseline,
      approvals,
      previewReadOnly,
    });
  }, [
    analysis,
    structuredPreview,
    structuredBaseline,
    approvals,
    previewReadOnly,
    uploadedFile,
    persistFileKey,
    persistFileName,
  ]);

  const clearPreviewOnly = () => {
    clearPreviewSessionStorage();
    setStructuredPreview(null);
    setStructuredBaseline(null);
    setApprovals({});
    setPreviewReadOnly(false);
    setPersistFileKey(null);
    setPersistFileName(null);
    toast.success('Vista previa eliminada. Generar de nuevo usará la IA (tokens).');
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error('El archivo supera el límite de 10 MB.');
      return;
    }
    const nextKey = fileKeyFromFile(file);
    const storedBefore = loadPreviewSession();
    const reusePreview =
      storedBefore !== null && storedBefore.fileKey === nextKey && Boolean(storedBefore.structured);

    setUploadedFile(file);
    setShowResults(false);
    setAnalysis(null);

    if (!reusePreview) {
      clearPreviewSessionStorage();
      setStructuredPreview(null);
      setStructuredBaseline(null);
      setApprovals({});
      setPreviewReadOnly(false);
      setPersistFileKey(null);
      setPersistFileName(null);
    }

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
      setPersistFileKey(nextKey);
      setPersistFileName(file.name);
      if (reusePreview && storedBefore) {
        setStructuredPreview(storedBefore.structured);
        setStructuredBaseline(cloneCvStructured(storedBefore.baseline));
        setApprovals(storedBefore.approvals);
        setPreviewReadOnly(storedBefore.previewReadOnly);
        toast(t.previewRecoveredNoTokens, { duration: 3000 });
      } else {
        void runStructuredPreview(file, false);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al analizar el CV.';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function runStructuredPreview(file: File, replaceExisting: boolean) {
    setPreviewLoading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/improve-preview', { method: 'POST', body });
      const data: unknown = await res.json();
      if (!res.ok) {
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'No se pudo generar la vista previa.';
        throw new Error(msg);
      }
      if (
        typeof data !== 'object' ||
        data === null ||
        !('structured' in data) ||
        (data as { structured: unknown }).structured === null
      ) {
        throw new Error('Respuesta de vista previa no válida.');
      }
      const structured = (data as { structured: CvStructured }).structured;
      setStructuredPreview(structured);
      setStructuredBaseline(cloneCvStructured(structured));
      setPreviewReadOnly(true);
      setApprovals(defaultApprovalsForCv(structured));
      setPersistFileKey(fileKeyFromFile(file));
      setPersistFileName(file.name);
      toast.success(
        replaceExisting ? 'Vista previa actualizada.' : 'Vista previa lista.',
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al generar la vista previa.');
    } finally {
      setPreviewLoading(false);
    }
  }

  const handleGenerateOrRegeneratePreview = () => {
    if (!uploadedFile) {
      toast.error(t.downloadNeedsFile);
      return;
    }
    void runStructuredPreview(uploadedFile, structuredPreview !== null);
  };

  const handleClearPreview = () => {
    if (previewLoading) return;
    clearPreviewOnly();
  };

  const handleApprovalChange = (key: string, accepted: boolean) => {
    setApprovals((prev) => ({ ...prev, [key]: accepted }));
  };

  const handleStructuredChange = (next: CvStructured) => {
    setStructuredPreview(next);
  };

  const revertAllFromAi = () => {
    if (!structuredBaseline) return;
    setStructuredPreview(cloneCvStructured(structuredBaseline));
    setApprovals(defaultApprovalsForCv(structuredBaseline));
    toast.success('Todo el texto volvió al primer borrador de la IA.');
  };

  const revertSummaryFromAi = () => {
    if (!structuredBaseline || !structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      summary: { ...structuredBaseline.summary },
    });
    toast('Perfil restaurado al texto de la IA.', { duration: 2200 });
  };

  const revertHeaderFromAi = () => {
    if (!structuredBaseline || !structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      header: { ...structuredBaseline.header },
    });
    toast('Cabecera restaurada.', { duration: 2200 });
  };

  const revertExperienceFromAi = (index: number) => {
    if (!structuredBaseline || !structuredPreview) return;
    const b = structuredBaseline.experience[index];
    if (!b) return;
    const experience = structuredPreview.experience.map((e, i) =>
      i === index ? structuredClone(b) : e,
    );
    setStructuredPreview({ ...structuredPreview, experience });
    toast('Este trabajo restaurado.', { duration: 2200 });
  };

  const revertBulletFromAi = (expIndex: number, bulletIndex: number) => {
    if (!structuredBaseline || !structuredPreview) return;
    const b = structuredBaseline.experience[expIndex];
    const e = structuredPreview.experience[expIndex];
    if (!b || !e) return;
    const original = [...e.original];
    const improved = [...e.improved];
    if (bulletIndex < b.original.length) original[bulletIndex] = b.original[bulletIndex];
    if (bulletIndex < b.improved.length) improved[bulletIndex] = b.improved[bulletIndex];
    const experience = structuredPreview.experience.map((row, i) =>
      i === expIndex ? { ...e, original, improved } : row,
    );
    setStructuredPreview({ ...structuredPreview, experience });
    toast('Viñeta restaurada.', { duration: 2200 });
  };

  const revertSkillsFromAi = () => {
    if (!structuredBaseline || !structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      skills: {
        original: [...structuredBaseline.skills.original],
        improved: [...structuredBaseline.skills.improved],
        added: [...structuredBaseline.skills.added],
      },
    });
    toast('Habilidades restauradas.', { duration: 2200 });
  };

  const revertEducationFromAi = () => {
    if (!structuredBaseline || !structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      education: structuredBaseline.education.map((ed) => ({ ...ed })),
    });
    toast('Formación restaurada.', { duration: 2200 });
  };

  const downloadImproved = async (format: 'docx' | 'pdf') => {
    if (!uploadedFile) {
      toast.error(t.downloadNeedsFile);
      return;
    }
    setExportingFormat(format);
    try {
      const body = new FormData();
      body.append('file', uploadedFile);
      body.append('format', format);
      if (structuredPreview && Object.keys(approvals).length > 0) {
        body.append('improvedText', buildPlaintextFromStructured(structuredPreview, approvals));
        body.append('useAi', 'false');
      } else {
        body.append('useAi', useExportAi ? 'true' : 'false');
      }
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
        className="border-border/60 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[min(100%,1920px)] items-center justify-start px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm">
              <FileText className="text-primary-foreground h-[22px] w-[22px]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-foreground text-base font-semibold tracking-tight">
                {t.title}
              </span>
              <span className="text-muted-foreground hidden text-xs sm:inline">{t.tagline}</span>
            </div>
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
          <div className="from-primary/[0.06] via-background to-accent/40 absolute inset-0 bg-gradient-to-b" />
          <div className="relative mx-auto max-w-[min(100%,1200px)] px-5 pt-10 pb-14 sm:px-8 md:pt-16 md:pb-20">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-primary/8 border-primary/15 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              >
                <Zap className="size-4 shrink-0" aria-hidden />
                <span className="text-sm font-medium">{t.tagline}</span>
              </motion.div>

              <h1 className="font-display text-foreground mb-5 text-[1.75rem] leading-[1.15] font-bold tracking-tight sm:text-4xl md:text-[2.75rem]">
                {t.headline}
              </h1>

              <p className="text-muted-foreground mb-10 text-base leading-relaxed md:text-lg">
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

              {(uploadedFile || persistFileName) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground mt-6 flex flex-col items-center gap-1 text-sm"
                >
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden />
                    {uploadedFile?.name ?? persistFileName}
                  </p>
                  {!uploadedFile && persistFileName ? (
                    <p className="text-amber-900 max-w-md text-center text-xs leading-relaxed">
                      {t.sessionRestoredBanner.replace('{name}', persistFileName)}
                    </p>
                  ) : null}
                </motion.div>
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
              className="bg-muted/25 w-full px-4 py-10 sm:px-6 md:py-12 lg:px-10 xl:px-12"
              aria-live="polite"
            >
              <div className="mx-auto mb-10 max-w-[1920px]">
                <p className="text-foreground mb-4 text-lg font-semibold md:text-xl">
                  {t.resultsWelcome}
                </p>
                <ol className="text-muted-foreground flex flex-wrap gap-3 font-sans text-sm font-medium md:gap-4">
                  <li className="bg-background border-border/80 rounded-full border px-4 py-2">
                    1 · {t.stepAnalysis}
                  </li>
                  <li className="bg-background border-border/80 rounded-full border px-4 py-2">
                    2 · {t.stepSuggestions}
                  </li>
                  <li className="bg-background border-border/80 rounded-full border px-4 py-2">
                    3 · {t.stepPreview}
                  </li>
                  <li className="bg-background border-border/80 rounded-full border px-4 py-2">
                    4 · {t.stepDownload}
                  </li>
                </ol>
              </div>
              <div className="mx-auto flex max-w-[1920px] flex-col gap-10 xl:flex-row xl:items-start xl:gap-14">
                <aside className="flex w-full shrink-0 flex-col gap-5 xl:sticky xl:top-24 xl:w-[300px]">
                  <ScoreCard score={analysis.score} language={language} />
                  {analysis.issues.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-border/80 bg-card/50 rounded-xl border px-5 py-4"
                    >
                      <h3 className="text-foreground mb-1 text-sm font-semibold">{t.issuesTitle}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        No se detectaron incidencias con las comprobaciones automáticas. Sigue
                        afinando palabras clave según cada oferta.
                      </p>
                    </motion.div>
                  ) : (
                    <IssuesList issues={analysis.issues} title={t.issuesTitle} />
                  )}
                </aside>

                <div className="min-w-0 flex-1 space-y-10">
                  <SuggestionCard
                    suggestions={analysis.suggestions}
                    title={t.suggestionsTitle}
                    language={language}
                  />

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                        {t.previewTitle}
                      </h3>
                      <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-relaxed">
                        {t.previewDescription}
                      </p>
                      <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
                        {t.previewHint}
                      </p>
                      <p className="text-muted-foreground mt-2 max-w-3xl text-xs leading-relaxed">
                        {t.previewClearHint}
                      </p>
                      {!(previewLoading && !structuredPreview) ? (
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          {!structuredPreview ? (
                            <motion.button
                              type="button"
                              disabled={
                                previewLoading || exportingFormat !== null || !uploadedFile
                              }
                              whileHover={{ scale: previewLoading ? 1 : 1.01 }}
                              whileTap={{ scale: previewLoading ? 1 : 0.99 }}
                              onClick={handleGenerateOrRegeneratePreview}
                              className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                            >
                              {previewLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                              ) : (
                                <FileText className="h-5 w-5" aria-hidden />
                              )}
                              {previewLoading ? t.previewLoading : t.previewButtonGenerate}
                            </motion.button>
                          ) : (
                            <>
                              <motion.button
                                type="button"
                                disabled={previewLoading || exportingFormat !== null || !uploadedFile}
                                whileHover={{ scale: previewLoading ? 1 : 1.01 }}
                                whileTap={{ scale: previewLoading ? 1 : 0.99 }}
                                onClick={handleGenerateOrRegeneratePreview}
                                className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-7 py-3.5 text-base font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                              >
                                {previewLoading ? (
                                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                                ) : (
                                  <FileText className="h-5 w-5" aria-hidden />
                                )}
                                {previewLoading ? t.previewUpdating : t.previewButtonRegenerate}
                              </motion.button>
                              <motion.button
                                type="button"
                                disabled={previewLoading || exportingFormat !== null}
                                whileHover={{ scale: previewLoading ? 1 : 1.01 }}
                                whileTap={{ scale: previewLoading ? 1 : 0.99 }}
                                onClick={handleClearPreview}
                                className="text-foreground border-destructive/30 bg-background hover:bg-destructive/5 focus-visible:ring-destructive inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-7 py-3.5 text-base font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                              >
                                <Trash2 className="h-5 w-5" aria-hidden />
                                {t.previewClear}
                              </motion.button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {!uploadedFile && structuredPreview && persistFileName ? (
                      <div
                        role="status"
                        className="border-amber-200/90 bg-amber-50/95 text-amber-950 rounded-xl border px-4 py-3 text-sm leading-relaxed"
                      >
                        {t.sessionRestoredBanner.replace('{name}', persistFileName)}
                      </div>
                    ) : null}

                    {previewLoading && !structuredPreview ? (
                      <div
                        className="border-border/70 bg-card rounded-2xl border p-6 shadow-sm sm:p-8"
                        aria-busy="true"
                        aria-label={t.previewLoading}
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <Loader2 className="text-primary size-8 animate-spin shrink-0" aria-hidden />
                          <p className="text-foreground text-base font-medium">{t.previewLoading}</p>
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-8 w-2/3 max-w-md" />
                          <Skeleton className="h-4 w-full max-w-2xl" />
                          <Skeleton className="h-4 w-full max-w-xl" />
                          <Skeleton className="h-24 w-full max-w-2xl" />
                          <Skeleton className="h-4 w-5/6 max-w-lg" />
                        </div>
                      </div>
                    ) : null}

                    {structuredPreview ? (
                      <ResumeHarvardPreview
                        data={structuredPreview}
                        approvals={approvals}
                        onApprovalChange={handleApprovalChange}
                        onStructuredChange={handleStructuredChange}
                        language={language}
                        readOnly={previewReadOnly}
                        onReadOnlyChange={setPreviewReadOnly}
                        baseline={structuredBaseline}
                        onRevertAll={revertAllFromAi}
                        onRevertSummary={revertSummaryFromAi}
                        onRevertHeader={revertHeaderFromAi}
                        onRevertExperience={revertExperienceFromAi}
                        onRevertBullet={revertBulletFromAi}
                        onRevertSkills={revertSkillsFromAi}
                        onRevertEducation={revertEducationFromAi}
                      />
                    ) : null}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="border-border/70 bg-card rounded-2xl border px-5 py-7 shadow-sm sm:px-8 sm:py-9"
                  >
                    <h3 className="text-foreground mb-2 text-lg font-semibold md:text-xl">
                      {t.exportBlockTitle}
                    </h3>
                    <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                      {t.exportBlockHint}
                    </p>
                    <div className="mb-6">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={useExportAi}
                          onChange={(e) => setUseExportAi(e.target.checked)}
                          disabled={exportingFormat !== null}
                          className="border-border text-primary focus-visible:ring-primary mt-0.5 size-5 shrink-0 rounded focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60"
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
                        className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold shadow-sm transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
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
                        className="border-border bg-background hover:bg-muted focus-visible:ring-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-8 text-base font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
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
          className="mx-auto max-w-[min(100%,1200px)] px-5 py-10 sm:px-8 md:py-14"
        >
          <div className="border-border/60 bg-card rounded-2xl border px-6 py-10 text-center md:px-10 md:py-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-display text-foreground mb-3 text-2xl font-bold tracking-tight md:text-3xl">
                {t.upgradeTitle}
              </h2>
              <p className="text-muted-foreground mx-auto mb-6 max-w-xl text-base leading-relaxed">
                {t.upgradeDescription}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex min-h-12 items-center gap-2 rounded-xl px-7 text-base font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <TrendingUp className="h-5 w-5" aria-hidden />
                {t.upgradeButton}
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works */}
        <section className="mx-auto max-w-[min(100%,1200px)] px-5 py-12 sm:px-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-foreground mb-12 text-center text-2xl font-bold tracking-tight md:mb-14 md:text-3xl">
              {t.howItWorksTitle}
            </h2>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
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
        <div className="mx-auto max-w-[min(100%,1200px)] px-5 py-12 sm:px-8">
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
