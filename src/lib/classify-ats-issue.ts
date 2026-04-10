/** Clasificación visual para issues generados por la IA (ATS en vivo). */
export function classifyAtsIssueSeverity(text: string): 'error' | 'warning' {
  const t = text.toLowerCase();
  if (
    /falta|ausente|\bsin\b|missing|no incluye|vacío|vacía|debes agregar|debes añadir|placeholder|no hay nombre|no hay correo|sin nombre|sin correo|inválid|invalid|elimin|borr|incomplet|crític/i.test(
      t,
    )
  ) {
    return 'error';
  }
  return 'warning';
}
