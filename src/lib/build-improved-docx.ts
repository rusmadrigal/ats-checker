import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

export async function buildImprovedDocxBuffer(fullText: string): Promise<Buffer> {
  const lines = fullText.split('\n');
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: 'Currículum (versión sugerida ATS)', bold: true })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generado a partir de tu archivo con mejoras automáticas sobre el texto extraído. Revisa el contenido antes de enviarlo.',
          italics: true,
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun(' ')] }),
    ...lines.map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line.length > 0 ? line : ' ' })],
        }),
    ),
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  const buf = await Packer.toBuffer(doc);
  return Buffer.from(buf);
}
