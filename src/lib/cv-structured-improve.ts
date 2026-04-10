import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { AiImprovementError } from './improve-text-ai';
import { cvStructuredSchema, type CvStructured } from './cv-structured-types';
import { resolveOpenAiModelId } from './openai-model';

export async function improveCvStructuredWithAi(input: {
  extractedText: string;
}): Promise<CvStructured> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiImprovementError(
      'OPENAI_API_KEY no está configurada en el servidor. Añade la variable de entorno para la vista previa con IA.',
    );
  }

  const openai = createOpenAI({ apiKey });
  const modelId = resolveOpenAiModelId();

  const { object } = await generateObject({
    model: openai(modelId),
    schema: cvStructuredSchema,
    system: `Eres editor senior de CV, experto en ATS y en formato Harvard (claro, sobrio, sin adornos).
Extraes datos SOLO del texto del usuario. No inventes empresas, fechas, titulaciones ni logros.
Puedes reformular con verbos de acción y claridad; añade métricas solo si el texto original las sugiere o permite inferirlas sin inventar cifras nuevas.

ATENCIÓN AL DETALLE (obligatorio):
- header.name: transcribe el nombre como en el CV. Si está vacío, falta del todo o es un marcador (p. ej. "Tu nombre", "Nombre apellido"), deja name vacío o el texto literal y menciona el problema en ats.improvements (mismo idioma que el CV).
- Si detectas error ortográfico claro en un nombre propio (doble letra, letra faltante evidente) sin poder saber el nombre correcto real, conserva lo que dice el usuario; si el error es obvio y la corrección es única (p. ej. "Pedrro"→"Pedro"), puedes corregir en header.name e indicar en changes del resumen o ats.improvements.
- email: si es inválido, incompleto o placeholder, no inventes uno; refleja el estado y anótalo en ats.improvements.
- title y summary: detecta mayúsculas sostenidas innecesarias, titular vacío con experiencia larga, resumen demasiado corto o solo lugares comunes; mejora en improved y resume en changes/ats.
- experience: fechas incoherentes, viñetas vacías de impacto, verbos inconsistentes; mejora sin inventar cargos.
- Coherencia global: mismo apellido, fechas que no se contradicen entre secciones.

IDIOMA (obligatorio, sin excepciones): TODAS las cadenas que generes (improved, changes, skills, ats.improvements, etc.) deben estar en el mismo idioma que el CV de entrada. Si el CV está en inglés, todo en inglés; si en español, todo en español. Si es bilingüe con secciones claras, conserva el idioma de cada parte como en el original—nunca traduzcas el contenido a otro idioma.
meta: layout "two-column", style "harvard", font "Georgia", accentColor "#1e3a5f".
header: name, title, location, email tal como aparecen (email inferible si está explícito).
summary: original = texto de perfil/resumen del CV o cadena vacía; improved = versión mejorada; changes = lista breve de qué mejoraste.
experience: un objeto por puesto relevante, orden cronológico inverso si el texto lo permite.
  original e improved deben tener el MISMO número de viñetas (una cadena por viñeta, sin prefijo "•").
changes en cada experiencia: breves frases (wording, claridad, keywords ATS, métricas).
skills: original e improved alineados por índice (misma longitud); added = habilidades útiles solo si aparecen en el CV o son reformulaciones evidentes del mismo contenido (no inventes stack nuevo).
education y languages: según el CV.
ats: scoreBefore y scoreAfter enteros 0-100 (estimación conservadora coherente con el texto); improvements = lista breve de mejoras ATS aplicadas.`,
    prompt: `Texto extraído del CV:
---
${input.extractedText.slice(0, 24000)}
---

Devuelve el objeto completo siguiendo el esquema. Si falta una sección en el CV, usa arrays vacíos o cadenas vacías, sin rellenar con datos ficticios.`,
  });

  return object;
}
