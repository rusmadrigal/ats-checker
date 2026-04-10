export type IssueSeverity = 'error' | 'warning';

export interface AnalysisIssue {
  type: IssueSeverity;
  text: string;
}

export interface AnalysisSuggestion {
  original: string;
  improved: string;
}

export interface AnalysisResult {
  score: number;
  issues: AnalysisIssue[];
  suggestions: AnalysisSuggestion[];
}
