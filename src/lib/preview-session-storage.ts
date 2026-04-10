import type { AnalysisResult } from './analysis-types';
import type { CvApprovalMap, CvStructured } from './cv-structured-types';

const STORAGE_KEY = 'ats_preview_session_v1';

export type PersistedPreviewSession = {
  v: 1;
  fileKey: string;
  fileName: string;
  analysis: AnalysisResult;
  structured: CvStructured;
  baseline: CvStructured;
  approvals: CvApprovalMap;
  previewReadOnly: boolean;
};

export function fileKeyFromFile(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

export function loadPreviewSession(): PersistedPreviewSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.v !== 1) return null;
    if (
      typeof data.fileKey !== 'string' ||
      typeof data.fileName !== 'string' ||
      !isRecord(data.analysis) ||
      !isRecord(data.structured) ||
      !isRecord(data.baseline) ||
      !isRecord(data.approvals) ||
      typeof data.previewReadOnly !== 'boolean'
    ) {
      return null;
    }
    return data as unknown as PersistedPreviewSession;
  } catch {
    return null;
  }
}

export function savePreviewSession(session: PersistedPreviewSession): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* quota / private mode */
  }
}

export function clearPreviewSessionStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
