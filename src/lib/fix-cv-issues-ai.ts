import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { AiImprovementError } from './improve-text-ai';
import { cvStructuredSchema, type CvStructured } from './cv-structured-types';
import { resolveOpenAiModelId } from './openai-model';

/**
 * Ajusta el CV estructurado para abordar los problemas listados (sin inventar hechos).
 */
export async function fixCvIssuesWithAi(input: {
  structured: CvStructured;
  issues: string[];
}): Promise<CvStructured> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiImprovementError(
      'OPENAI_API_KEY no está configurada en el servidor. No se puede corregir con IA.',
    );
  }

  if (input.issues.length === 0) {
    return input.structured;
  }

  const openai = createOpenAI({ apiKey });
  const modelId = resolveOpenAiModelId();

  const compact = JSON.stringify(input.structured);

  const { object } = await generateObject({
    model: openai(modelId),
    schema: cvStructuredSchema,
    system: `Eres editor senior de CV, experto en ATS y formato Harvard.
Recibes el CV del usuario ya estructurado (JSON) y una lista de problemas detectados por un analizador.

Tarea: devuelve el MISMO esquema (objeto CvStructured completo) aplicando correcciones que aborden esos problemas siempre que sea posible sin inventar datos.

Reglas estrictas:
- No inventes empresas, fechas, titulaciones, idiomas ni cifras que no puedan inferirse del contenido actual.
- Puedes corregir ortografía evidente en nombres propios, titulares y viñetas; mejorar redacción y claridad; unificar formato de fechas o correo si el problema lo sugiere.
- Si el problema indica "falta email" y no hay ninguno en el texto, no inventes un correo: deja email vacío o el placeholder actual y mejora otras partes.
- Si piden más métricas: refuerza viñetas solo con cuantificación que ya exista o que se pueda expresar sin números nuevos (p. ej. "equipo grande" → no pongas "50 personas" si no está).
- Mantén meta (layout, style, font, accentColor) salvo que un problema sea explícitamente de diseño textual.
- experience: conserva el número de puestos; cada puesto debe tener el mismo número de viñetas en original e improved (empareja índices).
- skills: alinea longitudes original e improved por índice; added solo si es reformulación de contenido existente.
- summary: actualiza improved y changes para reflejar arreglos; original puede quedar si es el texto fuente.
- ats: actualiza scoreBefore/scoreAfter (0-100) de forma conservadora y improvements con breves notas en el MISMO idioma que el CV.

IDIOMA: todas las cadenas que generes o modifiques (improved, changes, ats.improvements, etc.) en el mismo idioma que el CV actual en el JSON.`,
    prompt: `CV estructurado actual:
${compact.slice(0, 120000)}

Problemas detectados (abórdalos en la medida de lo posible):
${input.issues.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Devuelve el objeto completo corregido siguiendo el esquema.`,
  });

  return object;
}
