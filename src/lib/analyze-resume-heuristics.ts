import type { AnalysisIssue, AnalysisResult, AnalysisSuggestion } from './analysis-types';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i;
const URL_RE = /https?:\/\/[^\s]+/i;

const SECTION_PATTERNS = {
  experience:
    /experiencia( laboral)?|trabajo|empleos?|employment|work history|professional experience/i,
  education: /educaci[oó]n|formaci[oó]n|estudios|academic|education|universidad/i,
  skills: /habilidades|competencias|skills|tecnolog[ií]as|stack/i,
};

const BULLET_LINE =
  /^\s*(?:[•\-\*◦·]|\d{1,2}[\.)]|[a-z][\.)])\s+\S/m;

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function findWeakBulletLine(lines: string[]): string | null {
  for (const line of lines) {
    const t = line.trim();
    if (t.length < 25 || t.length > 220) continue;
    if (EMAIL_RE.test(t) || URL_RE.test(t)) continue;
    if (BULLET_LINE.test(line) || /^\s*[-•*]/.test(line)) {
      if (!/\d/.test(t)) return t;
    }
  }
  for (const line of lines) {
    const t = line.trim();
    if (t.length < 40 || t.length > 200) continue;
    if (EMAIL_RE.test(t)) continue;
    if (!/\d/.test(t) && /[a-záéíóúñ]{4,}/i.test(t)) return t;
  }
  return null;
}

export function analyzeResumeText(raw: string): AnalysisResult {
  const text = raw.trim();
  const lines = text.split('\n').map((l) => l.trim());

  const issues: AnalysisIssue[] = [];
  let penalty = 0;

  const add = (type: AnalysisIssue['type'], message: string, points: number) => {
    issues.push({ type, text: message });
    penalty += points;
  };

  if (text.length < 80) {
    add('error', 'El texto extraído es demasiado corto o vacío; el ATS no podrá evaluarte bien.', 35);
  }

  if (text.length > 80 && text.length < 400) {
    add('warning', 'El currículum parece muy breve; añade más detalle en experiencia y logros.', 12);
  }

  if (!EMAIL_RE.test(text)) {
    add('error', 'No se detectó un correo electrónico visible; muchos ATS y reclutadores lo exigen.', 18);
  }

  if (!PHONE_RE.test(text) && !LINKEDIN_RE.test(text) && !URL_RE.test(text)) {
    add(
      'warning',
      'No hay teléfono, LinkedIn ni web claramente identificables; añade al menos un canal de contacto directo.',
      8,
    );
  }

  if (!SECTION_PATTERNS.experience.test(text)) {
    add(
      'warning',
      'No se identifica claramente una sección de experiencia laboral (título explícito).',
      10,
    );
  }

  if (!SECTION_PATTERNS.education.test(text)) {
    add('warning', 'No se identifica una sección de formación o educación.', 6);
  }

  if (!SECTION_PATTERNS.skills.test(text)) {
    add(
      'warning',
      'No hay una sección de habilidades o tecnologías; los ATS suelen buscar palabras clave ahí.',
      8,
    );
  }

  const bulletish = lines.filter((l) => BULLET_LINE.test(l) || /^\s*[-•*]\s+\S/.test(l));
  if (bulletish.length < 3 && text.length > 200) {
    add(
      'warning',
      'Pocas viñetas o líneas de logros; usa listas con verbos de acción y cifras.',
      10,
    );
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const digitTokens = text.match(/\d+(?:[.,]\d+)?(?:\s?(?:%|€|\$|usd|mxn|eur|k|m|años|meses|año|mes))?/gi);
  const metricCount = digitTokens?.length ?? 0;
  if (wordCount > 120 && metricCount < 3) {
    add(
      'warning',
      'Pocas métricas o cifras (%, ahorro, tiempo, tamaño de equipo); cuantifica resultados cuando sea posible.',
      10,
    );
  }

  const upper = (text.match(/[A-ZÁÉÍÓÚÑ]/g) ?? []).length;
  const alpha = (text.match(/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/g) ?? []).length;
  if (alpha > 80 && upper / alpha > 0.45) {
    add(
      'warning',
      'Mucho texto en mayúsculas; puede dificultar la lectura y el parseo. Prioriza formato mixto.',
      6,
    );
  }

  const longLines = lines.filter((l) => l.length > 130);
  if (longLines.length > lines.length * 0.25 && lines.length > 8) {
    add(
      'warning',
      'Bloques de texto muy largos en una sola línea; puede ser síntoma de tablas o columnas que algunos ATS leen mal.',
      8,
    );
  }

  const score = clampScore(100 - penalty);

  const suggestions: AnalysisSuggestion[] = [];

  if (!EMAIL_RE.test(text)) {
    suggestions.push({
      original: '[Encabezado sin email]',
      improved:
        'Nombre Apellido\nCiudad, País · +34 600 000 000 · nombre.apellido@email.com · linkedin.com/in/tu-perfil',
    });
  }

  const weak = findWeakBulletLine(lines);
  if (weak) {
    suggestions.push({
      original: weak,
      improved: `${weak.replace(/\.$/, '')}, logrando un incremento del 18% en [métrica clave] en 12 meses y coordinando un equipo de 5 personas.`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      original: 'Responsable del área de ventas',
      improved:
        'Lideré el área comercial (8 personas), cerrando 1,2 M€ en nuevos contratos (+22% YoY) y reduciendo el ciclo de venta en 15 días.',
    });
  }

  return { score, issues, suggestions };
}
