'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileText,
  Zap,
  TrendingUp,
  Download,
  Loader2,
  Trash2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { PreviewLoadingOverlay } from './components/PreviewLoadingOverlay';
import { IssuesList } from './components/IssuesList';
import { HowItWorksStep } from './components/HowItWorksStep';
import { ResumeHarvardPreview } from './components/ResumeHarvardPreview';
import { HeroAIAnalysis } from './components/HeroAIAnalysis';
import { ATSScoreCard } from './components/ATSScoreCard';
import { AISuggestionsPanel } from './components/AISuggestionsPanel';
import { ResumePreview } from './components/ResumePreview';
import { Skeleton } from './components/ui/skeleton';
import { deriveAtsInsights } from '@/src/lib/ats-score-insights';
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
    atsExplainTitle: 'Qué son los ATS y por qué importa optimizar tu CV',
    atsExplainP1:
      'Un ATS (Applicant Tracking System) es el software que usan muchas empresas para recibir, filtrar y ordenar currículos. Suele extraer el texto de tu CV, buscar coincidencias con la oferta y priorizar candidaturas según criterios automáticos.',
    atsExplainP2:
      'Por eso no se trata solo de diseño: importa que el documento se lea bien como texto, con secciones claras, fechas reconocibles y palabras alineadas con el puesto. Estructuras rígidas o ilegibles para el sistema pueden hacer que pierdas información en el proceso.',
    atsExplainP3:
      'Optimizar para ATS no garantiza el trabajo, pero reduce fricciones: tu información llega ordenada al reclutador y ganas opciones de pasar el primer filtro, sobre todo cuando hay muchas candidaturas.',
    atsReadMore: 'Leer más',
    atsExplainP4:
      'En la práctica, el ATS suele «leer» tu CV como texto: convierte PDF o Word en cadenas de caracteres, identifica bloques (experiencia, formación, habilidades) y compara lo que encuentra con la ficha del puesto. Si el archivo tiene columnas complejas, tablas muy anidadas o texto incrustado en imágenes, partes importantes pueden quedar vacías o en el orden equivocado.',
    atsExplainP5:
      'Muchos sistemas asignan puntuaciones o etiquetas automáticas (por ejemplo, años de experiencia en una tecnología o cercanía léxica con la descripción del rol). No todos los ATS funcionan igual: unos son más estrictos con el parseo, otros permiten más revisión humana. Aun así, el primer filtro suele ser automático cuando el volumen de candidaturas es alto.',
    atsExplainP6:
      'Por eso conviene alinear el lenguaje de tu CV con el de la oferta sin caer en relleno artificial: usar títulos de puesto reconocibles, fechas coherentes, métricas cuando las tengas y sinónimos razonables de las competencias que pide la empresa. El objetivo es que tanto el software como la persona que revisa después entiendan rápido tu impacto.',
    atsExplainP7:
      'Un CV «amigable para ATS» no sustituye una buena trayectoria: solo evita que se pierda información técnica en el camino. Después del filtro automático, suele haber revisión humana; el documento debe seguir siendo honesto, legible y fácil de escanear en pantalla o en impreso.',
    footerCopyright: '© 2026 ATS Resume Checker.',
    footerNonProfit: 'Proyecto sin ánimo de lucro, creado por',
    authorName: 'Rus Madrigal',
    howItWorksTitle: 'Cómo funciona',
    step1Title: 'Sube tu currículum',
    step1Desc: 'Arrastra tu archivo PDF o DOCX para iniciar el análisis',
    step2Title: 'IA analiza compatibilidad',
    step2Desc: 'Nuestra IA revisa formato, palabras clave y estructura',
    step3Title: 'Obtén mejoras',
    step3Desc: 'Recibe sugerencias accionables para mejorar tu puntuación ATS',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    legalNotice: 'Aviso legal',
    exportBlockTitle: 'Descargar',
    downloadDocx: 'Descargar Word',
    downloadPdf: 'Descargar PDF',
    exportLoading: 'Generando…',
    exportSuccess: 'Descarga lista',
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
    heroAiBadge: 'Impulsado por IA',
    heroAiTitle: 'Optimización de CV con IA',
    heroAiSubtitle:
      'Tu currículum analizado y preparado para sistemas ATS, con sugerencias claras y vista previa lista para reclutadores.',
    insightsTitle: 'Puntuación ATS',
    insightsReadability: 'Legibilidad',
    insightsKeywords: 'Términos clave',
    insightsFormatting: 'Formato',
    insightsExperience: 'Experiencia',
    aiSuggestionsTitle: 'Sugerencias inteligentes',
    improvementApply: 'Copiar propuesta',
    improvementApplied: 'Copiado al portapapeles',
    applyAllImprovements: 'Aplicar todas',
    livePreviewTitle: 'Vista previa del CV',
    livePreviewSubtitle: 'Versión optimizada con mejoras de IA',
    previewEmptyTitle: 'Genera la vista previa estructurada',
    previewEmptyHint: 'La IA organizará tu CV en secciones claras. Luego podrás aprobar cada cambio.',
    applyAllToast: 'Cambios de IA aplicados en la vista previa.',
    beforeTab: 'Antes',
    afterTab: 'Después',
  },
} as const;

const t = translations.es;
/** Idioma fijo: español. Reactivar `en` arriba y estado `language` para volver al toggle. */
const language = 'es' as const;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function App() {
  const pathname = usePathname();
  const resultsAnchorRef = useRef<HTMLDivElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [exportingFormat, setExportingFormat] = useState<'docx' | 'pdf' | null>(null);
  const [structuredPreview, setStructuredPreview] = useState<CvStructured | null>(null);
  const [structuredBaseline, setStructuredBaseline] = useState<CvStructured | null>(null);
  const [previewReadOnly, setPreviewReadOnly] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [approvals, setApprovals] = useState<CvApprovalMap>({});
  /** Clave del archivo asociado a la sesión guardada (sirve para persistir sin `File`). */
  const [persistFileKey, setPersistFileKey] = useState<string | null>(null);
  const [persistFileName, setPersistFileName] = useState<string | null>(null);
  const sessionHydratedRef = useRef(false);
  /** Incrementa tras un análisis OK por subida de archivo (no al hidratar sesión). */
  const [resultsScrollToken, setResultsScrollToken] = useState(0);
  /** Remonta el overlay de tips cada vez que arranca una nueva generación de vista previa. */
  const [previewOverlayKey, setPreviewOverlayKey] = useState(0);
  const [previewPulse, setPreviewPulse] = useState(false);

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

  useEffect(() => {
    if (!showResults || !analysis || resultsScrollToken === 0) return;
    const timer = window.setTimeout(() => {
      resultsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [showResults, analysis, resultsScrollToken]);

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
      setResultsScrollToken((n) => n + 1);
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
    setPreviewOverlayKey((k) => k + 1);
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

  const copySuggestionText = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(t.improvementApplied);
  };

  const handleApplyAllImprovements = () => {
    if (!structuredPreview) return;
    setApprovals(defaultApprovalsForCv(structuredPreview));
    setPreviewPulse(true);
    toast.success(t.applyAllToast);
    window.setTimeout(() => setPreviewPulse(false), 1800);
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
      if (structuredPreview) {
        body.append('improvedText', buildPlaintextFromStructured(structuredPreview, approvals));
      }
      body.append('useAi', 'false');
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
    <div className="bg-background min-h-screen overflow-x-hidden">
      <Toaster position="bottom-right" richColors />
      <PreviewLoadingOverlay
        key={previewOverlayKey}
        open={previewLoading && !structuredPreview}
        title={t.previewLoading}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-border/60 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[min(100%,1920px)] items-center justify-start px-4 py-3 sm:px-8 sm:py-3.5">
          <Link
            href="/"
            scroll={false}
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="focus-visible:ring-primary flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm">
              <FileText className="text-primary-foreground h-[22px] w-[22px]" />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-foreground truncate text-base font-semibold tracking-tight">
                {t.title}
              </span>
              <span className="text-muted-foreground hidden text-xs sm:inline">{t.tagline}</span>
            </div>
          </Link>
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
        <HeroAIAnalysis
          badge={t.heroAiBadge}
          title={t.heroAiTitle}
          subtitle={t.heroAiSubtitle}
          onFileSelect={handleFileSelect}
          isAnalyzing={isAnalyzing}
          language={language}
          fileLabel={uploadedFile?.name ?? persistFileName ?? null}
          sessionHint={
            !uploadedFile && persistFileName
              ? t.sessionRestoredBanner.replace('{name}', persistFileName)
              : null
          }
        />

        <AnimatePresence>
          {showResults && analysis && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
              className="from-muted/15 w-full bg-gradient-to-b to-background px-3 py-8 sm:px-5 sm:py-10 md:py-12 lg:px-8"
              aria-live="polite"
            >
              <div
                ref={resultsAnchorRef}
                className="scroll-mt-[4.5rem] sm:scroll-mt-[5rem]"
                aria-hidden
              />
              <div className="mx-auto max-w-[min(100%,1440px)] space-y-6">
                <p className="text-muted-foreground text-center text-sm font-medium tracking-wide">
                  {t.resultsWelcome}
                </p>

                <ATSScoreCard
                  score={analysis.score}
                  metrics={deriveAtsInsights(analysis.score, analysis.issues)}
                  labels={{
                    title: t.insightsTitle,
                    readability: t.insightsReadability,
                    keywords: t.insightsKeywords,
                    formatting: t.insightsFormatting,
                    experience: t.insightsExperience,
                  }}
                />

                {analysis.issues.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-border/60 bg-card/40 rounded-xl border px-4 py-3"
                  >
                    <h3 className="text-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
                      {t.issuesTitle}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Sin incidencias automáticas. Ajusta palabras clave según cada oferta.
                    </p>
                  </motion.div>
                ) : (
                  <IssuesList issues={analysis.issues} title={t.issuesTitle} />
                )}

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                  <div className="order-2 col-span-12 max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto pr-1 lg:order-1 lg:col-span-5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5">
                    <AISuggestionsPanel
                      suggestions={analysis.suggestions}
                      title={t.aiSuggestionsTitle}
                      labels={{
                        before: t.beforeTab,
                        after: t.afterTab,
                        apply: t.improvementApply,
                        applied: t.improvementApplied,
                      }}
                      onApplyCopy={copySuggestionText}
                    />
                  </div>

                  <div className="order-1 col-span-12 min-h-0 min-w-0 lg:order-2 lg:col-span-7">
                    <div className="lg:sticky lg:top-6">
                      <ResumePreview
                        title={t.livePreviewTitle}
                        subtitle={t.livePreviewSubtitle}
                        highlightPulse={previewPulse}
                        headerActions={
                          <>
                            {structuredPreview ? (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleApplyAllImprovements}
                                disabled={previewLoading}
                                className="border-border/60 bg-background text-foreground hover:bg-muted/80 focus-visible:ring-primary inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                              >
                                <Sparkles className="size-3.5" aria-hidden />
                                {t.applyAllImprovements}
                              </motion.button>
                            ) : null}
                            <motion.button
                              type="button"
                              disabled={exportingFormat !== null || !uploadedFile}
                              whileHover={{ scale: exportingFormat || !uploadedFile ? 1 : 1.02 }}
                              whileTap={{ scale: exportingFormat || !uploadedFile ? 1 : 0.98 }}
                              onClick={() => downloadImproved('pdf')}
                              className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                            >
                              {exportingFormat === 'pdf' ? (
                                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              ) : (
                                <Download className="size-3.5" aria-hidden />
                              )}
                              PDF
                            </motion.button>
                            <motion.button
                              type="button"
                              disabled={exportingFormat !== null || !uploadedFile}
                              whileHover={{ scale: exportingFormat || !uploadedFile ? 1 : 1.02 }}
                              whileTap={{ scale: exportingFormat || !uploadedFile ? 1 : 0.98 }}
                              onClick={() => downloadImproved('docx')}
                              className="border-border bg-background hover:bg-muted focus-visible:ring-primary inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                            >
                              {exportingFormat === 'docx' ? (
                                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              ) : (
                                <Download className="size-3.5" aria-hidden />
                              )}
                              DOCX
                            </motion.button>
                          </>
                        }
                        meta={
                          <>
                            {!uploadedFile && structuredPreview && persistFileName ? (
                              <div
                                role="status"
                                className="border-amber-200/90 bg-amber-50/95 text-amber-950 rounded-lg border px-3 py-2 text-xs leading-relaxed"
                              >
                                {t.sessionRestoredBanner.replace('{name}', persistFileName)}
                              </div>
                            ) : null}
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {t.previewDescription}
                            </p>
                            {!(previewLoading && !structuredPreview) ? (
                              <div className="flex flex-wrap gap-2">
                                {!structuredPreview ? (
                                  <motion.button
                                    type="button"
                                    disabled={
                                      previewLoading || exportingFormat !== null || !uploadedFile
                                    }
                                    whileHover={{ scale: previewLoading ? 1 : 1.01 }}
                                    whileTap={{ scale: previewLoading ? 1 : 0.99 }}
                                    onClick={handleGenerateOrRegeneratePreview}
                                    className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex min-h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                                  >
                                    {previewLoading ? (
                                      <Loader2 className="size-4 animate-spin" aria-hidden />
                                    ) : (
                                      <FileText className="size-4" aria-hidden />
                                    )}
                                    {previewLoading ? t.previewLoading : t.previewButtonGenerate}
                                  </motion.button>
                                ) : (
                                  <>
                                    <motion.button
                                      type="button"
                                      disabled={
                                        previewLoading || exportingFormat !== null || !uploadedFile
                                      }
                                      whileHover={{ scale: previewLoading ? 1 : 1.01 }}
                                      whileTap={{ scale: previewLoading ? 1 : 0.99 }}
                                      onClick={handleGenerateOrRegeneratePreview}
                                      className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary inline-flex min-h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                                    >
                                      {previewLoading ? (
                                        <Loader2 className="size-4 animate-spin" aria-hidden />
                                      ) : (
                                        <FileText className="size-4" aria-hidden />
                                      )}
                                      {previewLoading ? t.previewUpdating : t.previewButtonRegenerate}
                                    </motion.button>
                                    <motion.button
                                      type="button"
                                      disabled={previewLoading || exportingFormat !== null}
                                      whileHover={{ scale: previewLoading ? 1 : 1.01 }}
                                      whileTap={{ scale: previewLoading ? 1 : 0.99 }}
                                      onClick={handleClearPreview}
                                      className="text-foreground border-destructive/30 bg-background hover:bg-destructive/5 focus-visible:ring-destructive inline-flex min-h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                                    >
                                      <Trash2 className="size-4" aria-hidden />
                                      {t.previewClear}
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            ) : null}
                          </>
                        }
                      >
                        {previewLoading && !structuredPreview ? (
                          <div className="space-y-4 py-4" aria-busy="true">
                            <Skeleton className="h-10 w-2/3 max-w-md" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-40 w-full max-w-xl" />
                            <Skeleton className="h-4 w-4/5" />
                          </div>
                        ) : null}

                        {!structuredPreview && !previewLoading ? (
                          <div className="flex min-h-[50vh] flex-col items-center justify-center border border-dashed border-stone-200 bg-stone-50/50 px-6 py-16 text-center">
                            <p className="text-foreground text-base font-semibold">
                              {t.previewEmptyTitle}
                            </p>
                            <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
                              {t.previewEmptyHint}
                            </p>
                          </div>
                        ) : null}

                        {structuredPreview ? (
                          <motion.div
                            key={`${previewPulse ? 'p' : 'n'}-${structuredPreview.header.name ?? 'cv'}`}
                            className="transition-all duration-300"
                            initial={{ opacity: 0.94 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.35 }}
                          >
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
                          </motion.div>
                        ) : null}
                      </ResumePreview>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ATS explainer — teaser visible; texto ampliado en <details> para indexación */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[min(100%,1200px)] px-5 py-10 pb-24 sm:px-8 sm:pb-28 md:py-14 md:pb-32"
          aria-labelledby="ats-explainer-heading"
        >
          <div className="border-border/60 from-primary/[0.05] relative overflow-hidden rounded-2xl border bg-gradient-to-b to-card px-5 py-10 sm:px-8 md:py-14">
            <div
              className="bg-primary/[0.07] pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-3xl"
              aria-hidden
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mx-auto max-w-3xl text-left"
            >
              <h2
                id="ats-explainer-heading"
                className="font-display text-foreground mb-6 text-center text-2xl font-bold tracking-tight md:mb-8 md:text-3xl"
              >
                {t.atsExplainTitle}
              </h2>
              <div className="text-muted-foreground space-y-4 text-base leading-relaxed md:text-[1.05rem]">
                <p>{t.atsExplainP1}</p>
                <p>{t.atsExplainP2}</p>
                <p>{t.atsExplainP3}</p>
              </div>
              <details className="group border-border/50 text-muted-foreground mx-auto mt-8 max-w-3xl rounded-xl border bg-background/40 px-4 py-3 text-left sm:px-5 sm:py-4">
                <summary className="text-primary hover:text-primary/90 [&::-webkit-details-marker]:hidden flex cursor-pointer list-none items-center justify-start gap-1.5 text-sm font-semibold transition-colors">
                  {t.atsReadMore}
                  <ChevronDown
                    className="size-4 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="mt-5 space-y-4 border-t border-border/40 pt-5 text-base leading-relaxed md:text-[1.05rem]">
                  <p>{t.atsExplainP4}</p>
                  <p>{t.atsExplainP5}</p>
                  <p>{t.atsExplainP6}</p>
                  <p>{t.atsExplainP7}</p>
                </div>
              </details>
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
      <footer className="border-border mt-16 border-t sm:mt-24">
        <div className="mx-auto max-w-[min(100%,1200px)] px-4 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
            <div className="text-muted-foreground flex max-w-xl flex-col gap-1.5 text-center text-sm md:text-left">
              <p>{t.footerCopyright}</p>
              <p>
                {t.footerNonProfit}{' '}
                <Link
                  href="https://www.rusmadrigal.com/es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
                >
                  {t.authorName}
                </Link>
                .
              </p>
            </div>
            <nav
              aria-label="Legal"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              <Link
                href="/privacidad"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t.privacy}
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t.cookies}
              </Link>
              <Link
                href="/aviso-legal"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {t.legalNotice}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
