export type SectorId = 'default' | 'tech' | 'health';

const SECTOR_IDS = new Set<SectorId>(['default', 'tech', 'health']);

export function parseSector(raw: FormDataEntryValue | null): SectorId {
  if (typeof raw !== 'string') return 'default';
  return SECTOR_IDS.has(raw as SectorId) ? (raw as SectorId) : 'default';
}

export function getSectorPresentation(sector: SectorId): {
  docTitle: string;
  docNote: string;
  sectorHint: string;
} {
  switch (sector) {
    case 'tech':
      return {
        docTitle: 'Currículum optimizado ATS — Perfil tecnológico',
        docNote:
          'Versión generada con plantilla sector tecnología. Revisa stack, impacto medible y claridad antes de enviarla.',
        sectorHint:
          'Prioriza herramientas, dominios de producto, métricas de entrega y escalabilidad cuando apliquen.',
      };
    case 'health':
      return {
        docTitle: 'Currículum optimizado ATS — Salud y ciencias de la vida',
        docNote:
          'Versión generada con plantilla sector salud. Ajusta terminología regulatoria y siglas según el puesto.',
        sectorHint:
          'Refuerza entornos clínicos, normativa aplicable, protocolos y resultados orientados al paciente o la calidad.',
      };
    default:
      return {
        docTitle: 'Currículum optimizado ATS',
        docNote:
          'Texto mejorado a partir de tu archivo. Comprueba datos de contacto, fechas y cifras antes de usarlo.',
        sectorHint: '\u00a0',
      };
  }
}
