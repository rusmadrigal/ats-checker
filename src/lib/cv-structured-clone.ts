import type { CvStructured } from './cv-structured-types';

/** Clon profundo para guardar la respuesta original de la IA. */
export function cloneCvStructured(cv: CvStructured): CvStructured {
  return structuredClone(cv);
}
