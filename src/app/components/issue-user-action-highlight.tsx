import type { ReactNode } from 'react';

/** Términos que suelen referirse a datos que el usuario debe añadir (no generados por IA). */
const USER_ACTION_PHRASE_RE =
  /(teléfono|teléfonos|telefono|LinkedIn|linkedin|correo electrónico|correo visible|correo|datos personales|canal de contacto|números telefónicos|número telefónico|números|sitio web|enlaces|enlace|\bURL\b|WhatsApp)/gi;

export function renderIssueTextWithUserHighlights(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(USER_ACTION_PHRASE_RE.source, USER_ACTION_PHRASE_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index));
    }
    parts.push(
      <mark
        key={`${m.index}-${m[0]}`}
        className="issue-user-action-mark text-foreground rounded-sm px-0.5 py-0 font-medium [.dark_&]:text-stone-900"
      >
        {m[0]}
      </mark>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length > 0 ? parts : text;
}
