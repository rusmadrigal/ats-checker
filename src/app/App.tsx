'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { PreviewLoadingOverlay } from './components/PreviewLoadingOverlay';
import { renderIssueTextWithUserHighlights } from './components/issue-user-action-highlight';
import { IssuesList, IssuesListFixWithAiButton } from './components/IssuesList';
import { HowItWorksStep } from './components/HowItWorksStep';
import {
  ResumeHarvardPreview,
  type ContactFieldHighlightFlags,
} from './components/ResumeHarvardPreview';
import { HeroAIAnalysis } from './components/HeroAIAnalysis';
import { ATSScoreCard } from './components/ATSScoreCard';
import { AISuggestionsPanel } from './components/AISuggestionsPanel';
import { ResumePreview } from './components/ResumePreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import { deriveAtsInsights, type AtsInsightMetrics } from '@/src/lib/ats-score-insights';
import { analyzeResumeText } from '@/src/lib/analyze-resume-heuristics';
import { hasSecondaryContactChannel } from '@/src/lib/contact-patterns';
import type { AnalysisIssue, AnalysisResult } from '@/src/lib/analysis-types';
import { buildPlaintextFromStructured } from '@/src/lib/build-plaintext-from-structured';
import { buildSectionsOutline } from '@/src/lib/build-sections-outline';
import { classifyAtsIssueSeverity } from '@/src/lib/classify-ats-issue';
import {
  getStructuredPreviewIntegrityIssues,
  mergeAnalysisIssuesDeduped,
} from '@/src/lib/structured-preview-integrity-issues';
import type { AiRescoreResult } from '@/src/lib/re-score-resume-ai';
import type { CvApprovalMap, CvStructured } from '@/src/lib/cv-structured-types';
import {
  coerceStructuredCv,
  createEmptyEducationEntry,
  createEmptyExperienceEntry,
  defaultApprovalsForCv,
  remapApprovalsAfterBulletDelete,
  remapApprovalsAfterExperienceDelete,
  remapApprovalsAfterSkillAddedDelete,
  remapApprovalsAfterSkillRowDelete,
} from '@/src/lib/cv-structured-types';
import { cloneCvStructured } from '@/src/lib/cv-structured-clone';
import { clientApiUrl } from '@/src/lib/client-api-url';
import { readJsonResponse } from '@/src/lib/read-json-response';
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
    footerVersion: 'Versión',
    authorName: 'Rus Madrigal',
    navCreditPrefix: 'Creado por',
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
    pdfFallbackLayout:
      'PDF en texto continuo. Para el mismo diseño que la vista previa, configura GOTENBERG_URL o LIBREOFFICE_PATH en el servidor (ver .env.example).',
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
    downloadNeedsFile:
      'Sube de nuevo el CV para descargar (necesitamos el archivo en el navegador).',
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
    previewEmptyHint:
      'La IA organizará tu CV en secciones claras. Luego podrás aprobar cada cambio.',
    applyAllToast: 'Cambios de IA aplicados en la vista previa.',
    beforeTab: 'Antes',
    afterTab: 'Después',
    fixIssuesWithAi: 'Corregir problemas con IA',
    fixIssuesLoading: 'Aplicando correcciones…',
    fixIssuesSuccess:
      'Listo: el CV se actualizó según los problemas detectados. Revísalo en la vista previa.',
    fixIssuesError:
      'No se pudo aplicar las correcciones. Revisa tu clave de OpenAI o inténtalo de nuevo.',
    fixIssuesConfirmTitle: 'Confirmar corrección con IA',
    fixIssuesConfirmIntro:
      'La IA ajustará el texto de tu vista previa solo para abordar los problemas de esta lista. No inventará datos de contacto (teléfono, correo, enlaces, LinkedIn): si faltan, tendrás que añadirlos tú en el editor.',
    fixIssuesConfirmListLabel: 'Se tendrán en cuenta estos puntos:',
    fixIssuesConfirmApply: 'Sí, aplicar correcciones',
    fixIssuesConfirmCancel: 'Cancelar',
  },
} as const;

const t = translations.es;
/** Idioma fijo: español. Reactivar `en` arriba y estado `language` para volver al toggle. */
const language = 'es' as const;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function safeExportBasename(name: string | null | undefined): string {
  const raw = (name ?? 'cv').replace(/\.[^/.]+$/, '');
  const ascii = raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return ascii.slice(0, 80) || 'cv';
}

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
  const [aiLive, setAiLive] = useState<AiRescoreResult | null>(null);
  const [aiLivePending, setAiLivePending] = useState(false);
  const [fixIssuesLoading, setFixIssuesLoading] = useState(false);
  const [fixIssuesConfirmOpen, setFixIssuesConfirmOpen] = useState(false);
  const aiRescoreRequestId = useRef(0);
  const lastAiScoreRef = useRef<number | null>(null);
  const aiFetchAbortRef = useRef<AbortController | null>(null);
  /** Huella estable del CV en vista previa para re-evaluar ATS solo cuando cambia el contenido. */
  const atsResumeStateKey = useMemo(
    () => (structuredPreview ? JSON.stringify({ cv: structuredPreview, approvals }) : ''),
    [structuredPreview, approvals],
  );

  /** Puntuación e incidencias alineadas con el texto que exportarías (vista previa + aprobaciones). */
  const effectiveAnalysis = useMemo((): AnalysisResult | null => {
    if (!analysis) return null;
    if (!structuredPreview) return analysis;
    const text = buildPlaintextFromStructured(structuredPreview, approvals);
    return analyzeResumeText(text);
  }, [analysis, structuredPreview, approvals]);

  const displayIssues = useMemo((): AnalysisIssue[] => {
    if (!effectiveAnalysis) return [];
    const structural =
      structuredPreview !== null
        ? getStructuredPreviewIntegrityIssues(structuredPreview, approvals)
        : [];
    const fromText = effectiveAnalysis.issues;
    const fromAi: AnalysisIssue[] = [];
    if (structuredPreview && aiLive) {
      for (const raw of aiLive.issues) {
        const text = raw.trim();
        if (!text) continue;
        fromAi.push({ type: classifyAtsIssueSeverity(text), text });
      }
      for (const raw of aiLive.warnings ?? []) {
        const text = raw.trim();
        if (!text) continue;
        fromAi.push({ type: 'warning', text });
      }
    }
    if (structuredPreview !== null) {
      return mergeAnalysisIssuesDeduped(structural, fromText, fromAi);
    }
    return fromText;
  }, [structuredPreview, approvals, aiLive, effectiveAnalysis]);

  const displayScore = aiLive && structuredPreview ? aiLive.score : (effectiveAnalysis?.score ?? 0);

  const displayMetrics = useMemo((): AtsInsightMetrics => {
    if (!effectiveAnalysis) {
      return { readability: 0, keywords: 0, formatting: 0, experienceClarity: 0 };
    }
    if (structuredPreview && aiLive) {
      return {
        readability: aiLive.readability,
        keywords: aiLive.keywords,
        formatting: aiLive.formatting,
        experienceClarity: aiLive.experience,
      };
    }
    return deriveAtsInsights(effectiveAnalysis.score, effectiveAnalysis.issues);
  }, [effectiveAnalysis, structuredPreview, aiLive]);

  const contactFieldHighlight = useMemo((): ContactFieldHighlightFlags | undefined => {
    if (previewReadOnly || !structuredPreview) return undefined;
    const blob = displayIssues.map((i) => i.text).join('\n');
    const lower = blob.toLowerCase();
    const mentionsGap =
      /\b(missing|no\s|not\s|falta|sin\s|agrega|añade|incluye|add|provide|include)\b/i.test(lower);
    const gapEmail =
      mentionsGap && /email|correo|e-mail|\bmail\b|contact info|datos de contacto/i.test(blob);
    const gapPhoneLink =
      mentionsGap &&
      /phone|teléfono|telefono|linkedin|link|enlace|url|website|sitio|contact channel|canal de contacto|whatsapp|número telef|numero telef/i.test(
        blob,
      );
    const gapName =
      mentionsGap &&
      /\bname\b|nombre/i.test(blob) &&
      /name|nombre|full name|nombre completo/i.test(blob);

    const emailStr = (structuredPreview.header?.email ?? '').trim();
    const locationStr = (structuredPreview.header?.location ?? '').trim();
    const nameStr = (structuredPreview.header?.name ?? '').trim();
    const hasChannel = hasSecondaryContactChannel(`${locationStr} ${emailStr}`);

    const flags: ContactFieldHighlightFlags = {};
    if (gapEmail && !emailStr) flags.email = true;
    if (gapPhoneLink && !hasChannel) {
      flags.location = true;
      flags.email = true;
    }
    if (gapName && !nameStr) flags.name = true;

    return Object.keys(flags).length ? flags : undefined;
  }, [displayIssues, structuredPreview, previewReadOnly]);

  useEffect(() => {
    if (!structuredPreview || !analysis) {
      aiFetchAbortRef.current?.abort();
      aiFetchAbortRef.current = null;
      setAiLive(null);
      lastAiScoreRef.current = null;
      setAiLivePending(false);
      return;
    }

    const textRaw = buildPlaintextFromStructured(structuredPreview, approvals).trim();
    const outline = buildSectionsOutline(structuredPreview);
    const resumeText =
      textRaw.length >= 8
        ? textRaw
        : `[Evaluación ATS — contenido mínimo o casi vacío]\n${textRaw || '(sin texto exportable)'}\n\nEstructura (JSON):\n${outline}`;

    const debounce = window.setTimeout(() => {
      aiFetchAbortRef.current?.abort();
      const ac = new AbortController();
      aiFetchAbortRef.current = ac;
      const requestId = ++aiRescoreRequestId.current;
      setAiLivePending(true);

      const previousScore =
        lastAiScoreRef.current !== null ? lastAiScoreRef.current : analysis.score;

      void (async () => {
        try {
          const res = await fetch(clientApiUrl('/api/re-score-resume'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeText: resumeText.slice(0, 28000),
              previousScore: Math.round(previousScore),
              sectionsOutline: outline,
            }),
            signal: ac.signal,
          });
          const data: unknown = await readJsonResponse(res);
          if (requestId !== aiRescoreRequestId.current) return;
          if (!res.ok) {
            setAiLive(null);
            return;
          }
          const r = data as Partial<AiRescoreResult>;
          if (typeof r.score !== 'number') {
            setAiLive(null);
            return;
          }
          setAiLive({
            score: r.score,
            delta: typeof r.delta === 'number' ? r.delta : 0,
            readability: typeof r.readability === 'number' ? r.readability : r.score,
            keywords: typeof r.keywords === 'number' ? r.keywords : r.score,
            formatting: typeof r.formatting === 'number' ? r.formatting : r.score,
            experience: typeof r.experience === 'number' ? r.experience : r.score,
            issues: Array.isArray(r.issues) ? r.issues : [],
            warnings: Array.isArray(r.warnings) ? r.warnings : [],
            strengths: Array.isArray(r.strengths) ? r.strengths : [],
            improvements: Array.isArray(r.improvements) ? r.improvements : [],
          });
          lastAiScoreRef.current = r.score;
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return;
          if (requestId !== aiRescoreRequestId.current) return;
          setAiLive(null);
        } finally {
          if (requestId === aiRescoreRequestId.current) {
            setAiLivePending(false);
          }
        }
      })();
    }, 400);

    return () => {
      window.clearTimeout(debounce);
      aiFetchAbortRef.current?.abort();
      aiFetchAbortRef.current = null;
      setAiLivePending(false);
    };
  }, [atsResumeStateKey, analysis]);

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
    setStructuredPreview(coerceStructuredCv(p.structured));
    setStructuredBaseline(cloneCvStructured(coerceStructuredCv(p.baseline)));
    setApprovals(p.approvals);
    setAiLive(null);
    lastAiScoreRef.current = null;
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
    setAiLive(null);
    lastAiScoreRef.current = null;
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
      const res = await fetch(clientApiUrl('/api/analyze'), { method: 'POST', body });
      const data: unknown = await readJsonResponse(res);
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
      setAiLive(null);
      lastAiScoreRef.current = null;
      setShowResults(true);
      setResultsScrollToken((n) => n + 1);
      setPersistFileKey(nextKey);
      setPersistFileName(file.name);
      if (reusePreview && storedBefore) {
        setStructuredPreview(coerceStructuredCv(storedBefore.structured));
        setStructuredBaseline(cloneCvStructured(coerceStructuredCv(storedBefore.baseline)));
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
      const res = await fetch(clientApiUrl('/api/improve-preview'), { method: 'POST', body });
      const data: unknown = await readJsonResponse(res);
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
      const structured = coerceStructuredCv((data as { structured: CvStructured }).structured);
      const appr = defaultApprovalsForCv(structured);
      setStructuredPreview(structured);
      setStructuredBaseline(cloneCvStructured(structured));
      setPreviewReadOnly(true);
      setApprovals(appr);
      setPersistFileKey(fileKeyFromFile(file));
      setPersistFileName(file.name);
      toast.success(replaceExisting ? 'Vista previa actualizada.' : 'Vista previa lista.');
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

  const runFixIssuesWithAi = async () => {
    if (!structuredPreview || displayIssues.length === 0) return;
    setFixIssuesLoading(true);
    setAiLive(null);
    setAiLivePending(false);
    aiRescoreRequestId.current += 1;
    aiFetchAbortRef.current?.abort();
    aiFetchAbortRef.current = null;
    try {
      const res = await fetch(clientApiUrl('/api/fix-cv-issues'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structured: structuredPreview,
          issues: displayIssues.map((i) => i.text),
        }),
      });
      const data: unknown = await readJsonResponse(res);
      if (!res.ok) {
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : t.fixIssuesError;
        throw new Error(msg);
      }
      if (
        typeof data !== 'object' ||
        data === null ||
        !('structured' in data) ||
        (data as { structured: unknown }).structured === null
      ) {
        throw new Error(t.fixIssuesError);
      }
      const next = coerceStructuredCv((data as { structured: CvStructured }).structured);
      const appr = defaultApprovalsForCv(next);
      setStructuredPreview(next);
      setApprovals(appr);
      setAiLive(null);
      aiRescoreRequestId.current += 1;
      toast.success(t.fixIssuesSuccess);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.fixIssuesError);
    } finally {
      setFixIssuesLoading(false);
    }
  };

  const handleApprovalChange = (key: string, accepted: boolean) => {
    setApprovals((prev) => ({ ...prev, [key]: accepted }));
  };

  const handleStructuredChange = (next: CvStructured) => {
    setStructuredPreview(coerceStructuredCv(next));
  };

  const handleDeleteExperience = (index: number) => {
    if (!structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      experience: structuredPreview.experience.filter((_, i) => i !== index),
    });
    setApprovals((prev) => remapApprovalsAfterExperienceDelete(prev, index));
  };

  const handleDeleteExpBullet = (expIndex: number, bulletIndex: number) => {
    if (!structuredPreview) return;
    const experience = structuredPreview.experience.map((e, i) => {
      if (i !== expIndex) return e;
      return {
        ...e,
        original: e.original.filter((_, j) => j !== bulletIndex),
        improved: e.improved.filter((_, j) => j !== bulletIndex),
        changes: e.changes.filter((_, j) => j !== bulletIndex),
      };
    });
    setStructuredPreview({ ...structuredPreview, experience });
    setApprovals((prev) => remapApprovalsAfterBulletDelete(prev, expIndex, bulletIndex));
  };

  const handleDeleteSkillRow = (skillIndex: number) => {
    if (!structuredPreview) return;
    const original = [...structuredPreview.skills.original];
    const improved = [...structuredPreview.skills.improved];
    const maxLen = Math.max(original.length, improved.length);
    if (skillIndex < 0 || skillIndex >= maxLen) return;
    if (skillIndex < original.length) original.splice(skillIndex, 1);
    if (skillIndex < improved.length) improved.splice(skillIndex, 1);
    setStructuredPreview({
      ...structuredPreview,
      skills: { ...structuredPreview.skills, original, improved },
    });
    setApprovals((prev) => remapApprovalsAfterSkillRowDelete(prev, skillIndex));
  };

  const handleDeleteSkillAdded = (addedIndex: number) => {
    if (!structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      skills: {
        ...structuredPreview.skills,
        added: structuredPreview.skills.added.filter((_, i) => i !== addedIndex),
      },
    });
    setApprovals((prev) => remapApprovalsAfterSkillAddedDelete(prev, addedIndex));
  };

  const handleDeleteEducation = (index: number) => {
    if (!structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      education: structuredPreview.education.filter((_, i) => i !== index),
    });
  };

  const handleAddExperience = () => {
    if (!structuredPreview) return;
    const i = structuredPreview.experience.length;
    setStructuredPreview({
      ...structuredPreview,
      experience: [...structuredPreview.experience, createEmptyExperienceEntry()],
    });
    setApprovals((prev) => ({ ...prev, [`exp-${i}-bullet-0`]: true }));
  };

  const handleAddExpBullet = (expIndex: number) => {
    if (!structuredPreview) return;
    const e = structuredPreview.experience[expIndex];
    if (!e) return;
    const j = Math.max(e.original.length, e.improved.length);
    const experience = structuredPreview.experience.map((row, i) =>
      i === expIndex
        ? { ...row, original: [...row.original, ''], improved: [...row.improved, ''] }
        : row,
    );
    setStructuredPreview({ ...structuredPreview, experience });
    setApprovals((prev) => ({ ...prev, [`exp-${expIndex}-bullet-${j}`]: true }));
  };

  const handleAddEducation = () => {
    if (!structuredPreview) return;
    setStructuredPreview({
      ...structuredPreview,
      education: [...structuredPreview.education, createEmptyEducationEntry()],
    });
  };

  const handleAddSkillRow = () => {
    if (!structuredPreview) return;
    const o = [...structuredPreview.skills.original];
    const im = [...structuredPreview.skills.improved];
    const maxL = Math.max(o.length, im.length);
    while (o.length < maxL) o.push('');
    while (im.length < maxL) im.push('');
    o.push('');
    im.push('');
    const i = o.length - 1;
    setStructuredPreview({
      ...structuredPreview,
      skills: { ...structuredPreview.skills, original: o, improved: im },
    });
    setApprovals((prev) => ({ ...prev, [`skill-${i}`]: true }));
  };

  const handleAddSkillAdded = () => {
    if (!structuredPreview) return;
    const added = [...structuredPreview.skills.added, ''];
    const i = added.length - 1;
    setStructuredPreview({
      ...structuredPreview,
      skills: { ...structuredPreview.skills, added },
    });
    setApprovals((prev) => ({ ...prev, [`skill-added-${i}`]: true }));
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

  const canDownloadExport = uploadedFile !== null || structuredPreview !== null;

  const downloadImproved = async (format: 'docx' | 'pdf') => {
    if (!uploadedFile && !structuredPreview) {
      toast.error(t.downloadNeedsFile);
      return;
    }
    setExportingFormat(format);
    try {
      if (format === 'pdf' && structuredPreview) {
        const { exportStructuredHarvardPdfToBlob } = await import(
          '@/src/lib/export-harvard-pdf-client'
        );
        const blob = await exportStructuredHarvardPdfToBlob(structuredPreview, approvals);
        const base =
          (persistFileName ?? uploadedFile?.name ?? 'cv').replace(/\.[^/.]+$/, '') || 'cv';
        const filename = `${base.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'cv'}_mejorado.pdf`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t.exportSuccess);
        return;
      }

      const body = new FormData();
      if (uploadedFile) {
        body.append('file', uploadedFile);
      }
      body.append('format', format);
      if (structuredPreview) {
        body.append('improvedText', buildPlaintextFromStructured(structuredPreview, approvals));
        body.append(
          'structuredExport',
          JSON.stringify({ structured: structuredPreview, approvals }),
        );
      }
      if (!uploadedFile && persistFileName) {
        body.append('filenameHint', persistFileName);
      }
      body.append('useAi', 'false');
      const res = await fetch(clientApiUrl('/api/export-improved'), { method: 'POST', body });
      if (!res.ok) {
        let data: unknown = {};
        try {
          data = await readJsonResponse<unknown>(res);
        } catch {
          data = {};
        }
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
      if (format === 'pdf' && res.headers.get('X-Ats-Pdf-Source') === 'plaintext-fallback') {
        toast.message(t.pdfFallbackLayout, { duration: 7000 });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al exportar.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="bg-background min-h-screen overflow-x-clip">
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
        <div className="mx-auto flex max-w-[min(100%,1920px)] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-3.5">
          <Link
            href="/"
            scroll={false}
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="focus-visible:ring-primary flex min-w-0 flex-1 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
          <a
            href="https://www.linkedin.com/in/rusmadrigal/"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border/70 from-muted/30 to-muted/5 text-foreground hover:border-primary/35 hover:from-primary/8 hover:to-muted/20 group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full border bg-gradient-to-br px-3 py-2 shadow-sm transition-all duration-300 sm:gap-2.5 sm:px-4 sm:py-2.5"
            aria-label={`${t.navCreditPrefix} ${t.authorName} — LinkedIn (se abre en pestaña nueva)`}
          >
            <span
              aria-hidden
              className="from-primary/12 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative flex flex-col items-end leading-none sm:items-start">
              <span className="text-muted-foreground mb-0.5 text-[9px] font-semibold tracking-[0.22em] uppercase sm:text-[10px]">
                {t.navCreditPrefix}
              </span>
              <span className="text-foreground group-hover:text-primary text-[13px] font-semibold tracking-tight transition-colors sm:text-sm">
                {t.authorName}
              </span>
            </span>
            <ExternalLink className="text-muted-foreground group-hover:text-primary relative size-3.5 shrink-0 opacity-70 transition-all group-hover:opacity-100 sm:size-4" />
          </a>
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
              className="from-muted/15 to-background w-full bg-gradient-to-b px-3 py-8 sm:px-5 sm:py-10 md:py-12 lg:px-8"
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

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:items-stretch">
                  <div className="order-2 col-span-12 flex min-h-0 flex-col gap-4 lg:order-1 lg:col-span-5 lg:h-full">
                    <div className="space-y-4 pr-2 transition-all duration-200 [-ms-overflow-style:none] [scrollbar-width:thin] lg:sticky lg:top-6 lg:max-h-[calc(100vh-32px)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-thumb]:bg-stone-600">
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
                        liveAiTips={
                          structuredPreview && aiLive
                            ? [...aiLive.strengths, ...aiLive.improvements].filter(Boolean)
                            : undefined
                        }
                      />
                      {effectiveAnalysis && displayIssues.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-border/60 bg-card/40 rounded-xl border px-4 py-3"
                        >
                          <h3 className="text-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                            {t.issuesTitle}
                          </h3>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Sin incidencias automáticas. Ajusta palabras clave según cada oferta.
                          </p>
                        </motion.div>
                      ) : effectiveAnalysis ? (
                        <>
                          <IssuesList
                            key={displayIssues
                              .map((i) => i.text)
                              .join('|')
                              .slice(0, 120)}
                            issues={displayIssues}
                            title={t.issuesTitle}
                            footer={
                              structuredPreview ? (
                                <IssuesListFixWithAiButton
                                  label={t.fixIssuesWithAi}
                                  loadingLabel={t.fixIssuesLoading}
                                  onClick={() => setFixIssuesConfirmOpen(true)}
                                  disabled={
                                    previewLoading || fixIssuesLoading || exportingFormat !== null
                                  }
                                  loading={false}
                                />
                              ) : null
                            }
                          />
                          <AlertDialog
                            open={fixIssuesConfirmOpen}
                            onOpenChange={(open) => {
                              if (!fixIssuesLoading) setFixIssuesConfirmOpen(open);
                            }}
                          >
                            <AlertDialogContent className="max-w-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.fixIssuesConfirmTitle}</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="space-y-3">
                                    <p>{t.fixIssuesConfirmIntro}</p>
                                    <p className="text-foreground text-sm font-medium">
                                      {t.fixIssuesConfirmListLabel}
                                    </p>
                                    <ul className="border-border/60 bg-muted/30 max-h-[min(50vh,16rem)] list-none space-y-2 overflow-y-auto rounded-lg border p-3 text-sm">
                                      {displayIssues.map((issue, idx) => (
                                        <li
                                          key={`${idx}-${issue.text.slice(0, 48)}`}
                                          className="text-foreground flex gap-2 leading-relaxed"
                                        >
                                          <span
                                            className="text-muted-foreground w-6 shrink-0 font-medium"
                                            aria-hidden
                                          >
                                            {idx + 1}.
                                          </span>
                                          <span className="min-w-0 flex-1">
                                            {renderIssueTextWithUserHighlights(issue.text)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={fixIssuesLoading}>
                                  {t.fixIssuesConfirmCancel}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={
                                    fixIssuesLoading ||
                                    !structuredPreview ||
                                    displayIssues.length === 0
                                  }
                                  onClick={(e) => {
                                    e.preventDefault();
                                    void (async () => {
                                      await runFixIssuesWithAi();
                                      setFixIssuesConfirmOpen(false);
                                    })();
                                  }}
                                >
                                  {fixIssuesLoading ? (
                                    <>
                                      <Loader2
                                        className="mr-2 inline size-4 animate-spin"
                                        aria-hidden
                                      />
                                      {t.fixIssuesLoading}
                                    </>
                                  ) : (
                                    t.fixIssuesConfirmApply
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : null}
                      {effectiveAnalysis ? (
                        <div className="border-border/60 from-background/95 to-background/80 w-full rounded-2xl border bg-gradient-to-b shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md dark:ring-white/[0.06]">
                          <ATSScoreCard
                            score={displayScore}
                            metrics={displayMetrics}
                            scoreDelta={structuredPreview && aiLive ? aiLive.delta : null}
                            isUpdating={Boolean(structuredPreview && aiLivePending)}
                            improvementHints={(() => {
                              if (!structuredPreview || !aiLive) return undefined;
                              const h = [...aiLive.strengths, ...aiLive.improvements]
                                .map((s) => s.trim())
                                .filter(Boolean)
                                .slice(0, 8);
                              return h.length > 0 ? h : undefined;
                            })()}
                            labels={{
                              title: t.insightsTitle,
                              readability: t.insightsReadability,
                              keywords: t.insightsKeywords,
                              formatting: t.insightsFormatting,
                              experience: t.insightsExperience,
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="order-1 col-span-12 min-h-0 min-w-0 lg:order-2 lg:col-span-7 lg:h-full">
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
                            disabled={exportingFormat !== null || !canDownloadExport}
                            whileHover={{
                              scale: exportingFormat || !canDownloadExport ? 1 : 1.02,
                            }}
                            whileTap={{
                              scale: exportingFormat || !canDownloadExport ? 1 : 0.98,
                            }}
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
                            disabled={exportingFormat !== null || !canDownloadExport}
                            whileHover={{
                              scale: exportingFormat || !canDownloadExport ? 1 : 1.02,
                            }}
                            whileTap={{
                              scale: exportingFormat || !canDownloadExport ? 1 : 0.98,
                            }}
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
                              className="rounded-lg border border-amber-200/90 bg-amber-50/95 px-3 py-2 text-xs leading-relaxed text-amber-950"
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
                          key={persistFileKey ?? 'resume-preview'}
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
                            contactHighlight={contactFieldHighlight}
                            onReadOnlyChange={setPreviewReadOnly}
                            baseline={structuredBaseline}
                            onRevertAll={revertAllFromAi}
                            onRevertSummary={revertSummaryFromAi}
                            onRevertHeader={revertHeaderFromAi}
                            onRevertExperience={revertExperienceFromAi}
                            onRevertBullet={revertBulletFromAi}
                            onRevertSkills={revertSkillsFromAi}
                            onRevertEducation={revertEducationFromAi}
                            onDeleteExperience={handleDeleteExperience}
                            onDeleteExpBullet={handleDeleteExpBullet}
                            onDeleteSkillRow={handleDeleteSkillRow}
                            onDeleteSkillAdded={handleDeleteSkillAdded}
                            onDeleteEducation={handleDeleteEducation}
                            onAddExperience={handleAddExperience}
                            onAddExpBullet={handleAddExpBullet}
                            onAddEducation={handleAddEducation}
                            onAddSkillRow={handleAddSkillRow}
                            onAddSkillAdded={handleAddSkillAdded}
                          />
                        </motion.div>
                      ) : null}
                    </ResumePreview>
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
          <div className="border-border/60 from-primary/[0.05] to-card relative overflow-hidden rounded-2xl border bg-gradient-to-b px-5 py-10 sm:px-8 md:py-14">
            <div
              className="bg-primary/[0.07] pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl"
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
              <details className="group border-border/50 text-muted-foreground bg-background/40 mx-auto mt-8 max-w-3xl rounded-xl border px-4 py-3 text-left sm:px-5 sm:py-4">
                <summary className="text-primary hover:text-primary/90 flex cursor-pointer list-none items-center justify-start gap-1.5 text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden">
                  {t.atsReadMore}
                  <ChevronDown
                    className="size-4 shrink-0 opacity-70 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="border-border/40 mt-5 space-y-4 border-t pt-5 text-base leading-relaxed md:text-[1.05rem]">
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
              <p className="text-muted-foreground font-mono text-xs tracking-wide">
                <span className="text-muted-foreground font-sans">{t.footerVersion}</span>{' '}
                <span className="text-foreground/90 font-semibold">
                  {process.env.NEXT_PUBLIC_APP_VERSION ?? 'V.local'}
                </span>
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
