import type { AnalysisIssue } from './analysis-types';
import type { CvApprovalMap, CvStructured } from './cv-structured-types';
import { EMAIL_RE } from './contact-patterns';

const PLACEHOLDER_NAME_RE =
  /^(tu nombre|your name|john\s+doe|jane\s+doe|nombre\s+apellido|nombre\s+y\s+apellido|full\s*name|fullname|xxx+|asdf+|test|prueba|sin nombre|no name)\b/i;

const PLACEHOLDER_ORG_RE =
  /^(empresa|company|organización|organization|test|xxx+|lorem|mi empresa|tu empresa)\b/i;

const LOREM_RE = /\blorem\s+ipsum\b/i;

function checkHeaderNameAnomalies(name: string): AnalysisIssue[] {
  const n = name.trim();
  if (!n) return [];
  const out: AnalysisIssue[] = [];

  if (/\d/.test(n)) {
    out.push({
      type: 'warning',
      text: 'El nombre incluye números; no es habitual en un CV profesional. Usa tu nombre completo real (evita usuarios tipo «Juan87»).',
    });
  }

  if (n.length > 0 && n.length < 3) {
    out.push({
      type: 'warning',
      text: 'El nombre es demasiado corto para ser reconocible; escribe nombre y apellido como en un documento oficial.',
    });
  }

  if (/[@/\\_]/.test(n) || /\s{3,}/.test(n)) {
    out.push({
      type: 'warning',
      text: 'El nombre contiene símbolos o espacios raros (como @, / o guiones bajos); usa solo letras y, si aplica, un guion en apellidos compuestos.',
    });
  }

  const letters = (n.match(/[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/g) ?? []).length;
  if (n.length >= 4 && letters / n.length < 0.35) {
    out.push({
      type: 'warning',
      text: 'El nombre tiene muy pocas letras respecto al resto de caracteres; revisa que sea legible y profesional para un ATS.',
    });
  }

  if (PLACEHOLDER_NAME_RE.test(n.trim())) {
    out.push({
      type: 'warning',
      text: 'El nombre parece un texto de relleno o plantilla; sustitúyelo por tu nombre y apellido reales.',
    });
  }

  const words = n.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && n === n.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(n) && n.length > 6) {
    out.push({
      type: 'warning',
      text: 'Evita escribir el nombre solo en MAYÚSCULAS; es más profesional usar mayúscula inicial en nombre y apellidos.',
    });
  }

  return out;
}

function checkEmailAnomalies(email: string): AnalysisIssue[] {
  const e = email.trim();
  if (!e) return [];
  if (!EMAIL_RE.test(e)) {
    return [
      {
        type: 'warning',
        text: 'El correo no tiene un formato reconocible (debe parecerse a nombre@dominio.com). Revisa faltas de @ o del dominio.',
      },
    ];
  }
  const local = e.split('@')[0]?.toLowerCase() ?? '';
  if (/^(test|prueba|asdf|xxx|admin|noreply|no-reply)/.test(local)) {
    return [
      {
        type: 'warning',
        text: 'La parte local del correo parece de prueba o genérica; usa una dirección profesional que revises habitualmente.',
      },
    ];
  }
  return [];
}

function checkTitleAnomalies(title: string): AnalysisIssue[] {
  const t = title.trim();
  if (!t) return [];
  const out: AnalysisIssue[] = [];
  if (/^\d+$/.test(t)) {
    out.push({
      type: 'warning',
      text: 'El título profesional no debería ser solo números; indica tu rol o especialidad con palabras.',
    });
  }
  if (/\d{2,}/.test(t) && !/\b20\d{2}\b/.test(t) && /[a-záéíóúñ]/i.test(t) && /\d{3,}/.test(t)) {
    out.push({
      type: 'warning',
      text: 'El título contiene muchos dígitos; suele leerse mejor un encabezado tipo «Ingeniero de datos» sin códigos numéricos raros.',
    });
  }
  if (/[@#]{2,}|_{3,}/.test(t)) {
    out.push({
      type: 'warning',
      text: 'El título contiene símbolos poco habituales para un encabezado de CV; simplifica la redacción.',
    });
  }
  if (t.length > 0 && t.length < 4) {
    out.push({
      type: 'warning',
      text: 'El título profesional es muy corto; amplía con tu rol y, si aplica, ámbito o seniority.',
    });
  }
  if (PLACEHOLDER_NAME_RE.test(t)) {
    out.push({
      type: 'warning',
      text: 'El título parece texto de plantilla; sustitúyelo por tu rol real.',
    });
  }
  return out;
}

function checkLocationAnomalies(location: string): AnalysisIssue[] {
  const l = location.trim();
  if (!l) return [];
  const compact = l.replace(/\s/g, '');
  const emailMatch = compact.match(EMAIL_RE);
  if (emailMatch && emailMatch[0] === compact) {
    return [
      {
        type: 'warning',
        text: 'En «ubicación» parece haber solo un correo; el email debe ir en su campo. La ubicación suele ser ciudad y país.',
      },
    ];
  }
  if (/^\d+$/.test(l) || /^[,.\s-]+$/.test(l)) {
    return [
      {
        type: 'warning',
        text: 'La ubicación no parece una ciudad o región reconocible; revisa el formato (ej. Madrid, España).',
      },
    ];
  }
  return [];
}

function lettersRatio(s: string): number {
  const letters = (s.match(/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/g) ?? []).length;
  return letters / Math.max(s.length, 1);
}

function checkCompanyAnomalies(company: string, index: number): AnalysisIssue[] {
  const c = company.trim();
  if (!c) return [];
  const label = `Experiencia ${index + 1}`;
  const out: AnalysisIssue[] = [];
  if (/^\d+$/.test(c)) {
    out.push({
      type: 'warning',
      text: `${label}: el nombre de la empresa son solo números; no suele ser coherente con un CV real.`,
    });
  }
  if (PLACEHOLDER_ORG_RE.test(c)) {
    out.push({
      type: 'warning',
      text: `${label}: el nombre de la empresa parece genérico o de prueba; indica el nombre real de la organización.`,
    });
  }
  if (/\d{4,}/.test(c) && !/\b(S\.?A\.?|S\.?L\.?|LLC|Inc)\b/i.test(c) && lettersRatio(c) < 0.25) {
    out.push({
      type: 'warning',
      text: `${label}: el nombre de la empresa incluye muchos números y pocas letras; confirma que sea el nombre comercial correcto.`,
    });
  }
  return out;
}

function checkRoleTitleAnomalies(roleTitle: string, index: number): AnalysisIssue[] {
  const r = roleTitle.trim();
  if (!r) return [];
  const label = `Experiencia ${index + 1}`;
  const out: AnalysisIssue[] = [];
  if (/^\d+$/.test(r)) {
    out.push({
      type: 'warning',
      text: `${label}: el puesto no debería ser solo números; escribe el nombre del rol.`,
    });
  }
  if (r.length > 0 && r.length < 3) {
    out.push({
      type: 'warning',
      text: `${label}: el título del puesto es demasiado corto; detalla el rol (ej. «Analista financiero»).`,
    });
  }
  if (PLACEHOLDER_ORG_RE.test(r) || /^(puesto|cargo|role)$/i.test(r)) {
    out.push({
      type: 'warning',
      text: `${label}: el puesto parece un marcador; indica el título real del empleo.`,
    });
  }
  return out;
}

function checkBulletAnomalies(text: string, expIndex: number, bulletIndex: number): AnalysisIssue[] {
  const t = text.trim();
  if (t.length < 8) return [];
  const out: AnalysisIssue[] = [];
  if (LOREM_RE.test(t)) {
    out.push({
      type: 'warning',
      text: `Experiencia ${expIndex + 1}, viñeta ${bulletIndex + 1}: texto tipo «lorem ipsum»; sustitúyelo por un logro real.`,
    });
  }
  if (/^(.)\1{7,}$/i.test(t.replace(/\s/g, ''))) {
    out.push({
      type: 'warning',
      text: `Experiencia ${expIndex + 1}, viñeta ${bulletIndex + 1}: el contenido parece repetición sin sentido; escribe una frase concreta.`,
    });
  }
  if (lettersRatio(t) < 0.2 && t.length > 15) {
    out.push({
      type: 'warning',
      text: `Experiencia ${expIndex + 1}, viñeta ${bulletIndex + 1}: casi no hay letras (símbolos o números sueltos); redacta en prosa clara.`,
    });
  }
  return out;
}

function checkSkillLineAnomalies(line: string, index: number): AnalysisIssue[] {
  const s = line.trim();
  if (!s) return [];
  if (/^\d+$/.test(s) || /^[,;.\s-]+$/.test(s)) {
    return [
      {
        type: 'warning',
        text: `Competencia ${index + 1}: el texto no parece una habilidad (solo números o signos); indica la competencia con palabras.`,
      },
    ];
  }
  if (s.length === 1) {
    return [
      {
        type: 'warning',
        text: `Competencia ${index + 1}: demasiado breve; escribe el nombre completo de la herramienta o competencia.`,
      },
    ];
  }
  return [];
}

function checkEducationAnomalies(
  degree: string,
  institution: string,
  index: number,
): AnalysisIssue[] {
  const d = degree.trim();
  const ins = institution.trim();
  const label = `Formación ${index + 1}`;
  const out: AnalysisIssue[] = [];
  if (d && /^\d+$/.test(d)) {
    out.push({
      type: 'warning',
      text: `${label}: el título académico son solo números; indica el nombre del título (ej. Grado en Derecho).`,
    });
  }
  if (ins && /^\d+$/.test(ins)) {
    out.push({
      type: 'warning',
      text: `${label}: el centro son solo números; escribe el nombre de la institución.`,
    });
  }
  if (d && PLACEHOLDER_ORG_RE.test(d)) {
    out.push({
      type: 'warning',
      text: `${label}: el título parece genérico; especifica el nombre real del estudio o grado.`,
    });
  }
  return out;
}

/**
 * Advertencias por valores poco creíbles o incongruentes (números en nombre, emails raros, etc.).
 */
export function getResumeFieldAnomalyIssues(
  cv: CvStructured,
  approvals: CvApprovalMap,
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  issues.push(...checkHeaderNameAnomalies(cv.header.name));
  issues.push(...checkEmailAnomalies(cv.header.email));
  issues.push(...checkTitleAnomalies(cv.header.title));
  issues.push(...checkLocationAnomalies(cv.header.location));

  cv.experience.forEach((exp, i) => {
    issues.push(...checkCompanyAnomalies(exp.company, i));
    issues.push(...checkRoleTitleAnomalies(exp.title, i));
    const n = Math.max(exp.original.length, exp.improved.length);
    for (let j = 0; j < n; j++) {
      const key = `exp-${i}-bullet-${j}`;
      const useImp = approvals[key] !== false;
      const raw = useImp
        ? (exp.improved[j] ?? exp.original[j] ?? '')
        : (exp.original[j] ?? exp.improved[j] ?? '');
      if (raw.trim()) {
        issues.push(...checkBulletAnomalies(raw, i, j));
      }
    }
  });

  let skillIdx = 0;
  cv.skills.improved.forEach((s, idx) => {
    const useImp = approvals[`skill-${idx}`] !== false;
    const raw = useImp ? s : (cv.skills.original[idx] ?? s);
    if (raw.trim()) {
      skillIdx += 1;
      issues.push(...checkSkillLineAnomalies(raw, skillIdx));
    }
  });
  cv.skills.added.forEach((s, idx) => {
    if (approvals[`skill-added-${idx}`] !== false && s.trim()) {
      skillIdx += 1;
      issues.push(...checkSkillLineAnomalies(s, skillIdx));
    }
  });

  cv.education.forEach((ed, i) => {
    issues.push(...checkEducationAnomalies(ed.degree, ed.institution, i));
  });

  const summaryOn = approvals.summary !== false;
  const summaryBody = (summaryOn ? cv.summary.improved : cv.summary.original).trim();
  if (summaryBody.length > 40 && LOREM_RE.test(summaryBody)) {
    issues.push({
      type: 'warning',
      text: 'El resumen contiene texto tipo «lorem ipsum»; sustitúyelo por tu perfil profesional real.',
    });
  }

  cv.languages.forEach((lang, i) => {
    const l = lang.trim();
    if (!l) return;
    if (/^[,;.\d\s-]+$/.test(l) || l.length === 1) {
      issues.push({
        type: 'warning',
        text: `Idioma ${i + 1}: el texto no parece un idioma con nivel (ej. «Inglés — C1»); revísalo.`,
      });
    }
  });

  return issues;
}

/**
 * Incidencias derivadas solo del estado estructurado de la vista previa (sin IA).
 * Así, al borrar nombre, email, etc. en «Editar CV», el panel se actualiza al instante.
 */
export function getStructuredPreviewIntegrityIssues(
  cv: CvStructured,
  approvals: CvApprovalMap,
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  if (!cv.header.name.trim()) {
    issues.push({
      type: 'error',
      text: 'Falta el nombre en el encabezado. Los ATS y reclutadores lo necesitan para identificar tu candidatura.',
    });
  }

  if (!cv.header.email.trim()) {
    issues.push({
      type: 'error',
      text: 'Falta un correo electrónico en el encabezado. Añade uno real; no generamos datos personales por ti.',
    });
  }

  if (!cv.header.title.trim() && cv.experience.length > 0) {
    issues.push({
      type: 'warning',
      text: 'Falta un título o headline profesional bajo tu nombre (p. ej. el rol al que aspiras).',
    });
  }

  const summaryOn = approvals.summary !== false;
  const summaryBody = (summaryOn ? cv.summary.improved : cv.summary.original).trim();
  if (!summaryBody && (cv.experience.length > 0 || cv.header.title.trim())) {
    issues.push({
      type: 'warning',
      text: 'El resumen o perfil profesional está vacío; conviene una frase clara de propuesta de valor.',
    });
  }

  if (cv.experience.length === 0) {
    issues.push({
      type: 'error',
      text: 'No hay experiencia laboral en la vista previa. Añade al menos un puesto relevante.',
    });
  }

  cv.experience.forEach((exp, i) => {
    if (!exp.company.trim()) {
      issues.push({
        type: 'warning',
        text: `Experiencia ${i + 1}: falta el nombre de la empresa o organización.`,
      });
    }
    if (!exp.title.trim()) {
      issues.push({
        type: 'warning',
        text: `Experiencia ${i + 1}: falta el puesto o título del rol.`,
      });
    }
    const n = Math.max(exp.original.length, exp.improved.length);
    let anyBullet = false;
    for (let j = 0; j < n; j++) {
      const key = `exp-${i}-bullet-${j}`;
      const useImp = approvals[key] !== false;
      const raw = useImp
        ? (exp.improved[j] ?? exp.original[j] ?? '')
        : (exp.original[j] ?? exp.improved[j] ?? '');
      if (raw.trim()) {
        anyBullet = true;
        break;
      }
    }
    if (!anyBullet && (exp.company.trim() || exp.title.trim())) {
      issues.push({
        type: 'warning',
        text: `Experiencia ${i + 1}: no hay viñetas o logros con texto; añade al menos una línea con impacto.`,
      });
    }
  });

  const skillLines: string[] = [];
  cv.skills.improved.forEach((s, idx) => {
    const useImp = approvals[`skill-${idx}`] !== false;
    const raw = useImp ? s : (cv.skills.original[idx] ?? s);
    if (raw.trim()) skillLines.push(raw.trim());
  });
  cv.skills.added.forEach((s, idx) => {
    if (approvals[`skill-added-${idx}`] !== false && s.trim()) skillLines.push(s.trim());
  });
  if (skillLines.length === 0 && cv.experience.length > 0) {
    issues.push({
      type: 'warning',
      text: 'No hay competencias o habilidades listadas; los ATS suelen buscar palabras clave ahí.',
    });
  }

  if (cv.education.length === 0 && cv.experience.length >= 2) {
    issues.push({
      type: 'warning',
      text: 'No hay formación académica en la vista previa; añádela si aplica a tu perfil.',
    });
  }

  issues.push(...getResumeFieldAnomalyIssues(cv, approvals));

  return issues;
}

function issueTopicKey(text: string): string | null {
  const t = text.toLowerCase();
  if (/\bcorreo\b|e-mail|\bemail\b/.test(t) && /falta|ausente|sin /.test(t)) return 'topic:email-missing';
  if (/\bcorreo\b|formato.*@|@\s*dominio/.test(t) && /formato|reconoc|inválid/i.test(t))
    return 'topic:email-format';
  if (/\bparte local\b|dirección profesional/.test(t)) return 'topic:email-local';
  if (/\bnombre\b/.test(t) && /falta|ausente|sin el nombre/.test(t)) return 'topic:name-missing';
  if (/\bnombre\b/.test(t) && /números|juan87|incongruen|mayúsculas|relleno|marcador|símbolos/i.test(t))
    return 'topic:name-quality';
  return null;
}

/** Une listas de incidencias: primero gana el orden de entrada; evita duplicados exactos y temas repetidos (p. ej. dos avisos de correo). */
export function mergeAnalysisIssuesDeduped(...groups: AnalysisIssue[][]): AnalysisIssue[] {
  const seen = new Set<string>();
  const seenTopics = new Set<string>();
  const out: AnalysisIssue[] = [];
  for (const group of groups) {
    for (const issue of group) {
      const key = issue.text.replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 160);
      if (!key || seen.has(key)) continue;
      const topic = issueTopicKey(issue.text);
      if (topic && seenTopics.has(topic)) continue;
      if (topic) seenTopics.add(topic);
      seen.add(key);
      out.push(issue);
    }
  }
  return out;
}
