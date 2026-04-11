'use client';

import { useMemo } from 'react';
import type { CvApprovalMap, CvStructured } from '@/src/lib/cv-structured-types';
import {
  buildHarvardPdfExportModel,
  type HarvardPdfBlock,
  type HarvardPdfHeader,
} from '@/src/lib/harvard-pdf-blocks';

export type HarvardPdfPagesProps = {
  data: CvStructured;
  approvals: CvApprovalMap;
};

function PdfHeader({ header }: { header: HarvardPdfHeader }) {
  return (
    <header className="resume-pdf-header">
      {header.name ? <h1 className="resume-pdf-name">{header.name}</h1> : null}
      {header.title ? <p className="resume-pdf-title-line">{header.title}</p> : null}
      {header.contactLine ? <p className="resume-pdf-contact">{header.contactLine}</p> : null}
      <hr className="resume-pdf-rule" />
    </header>
  );
}

function SummaryBlock({ text }: { text: string }) {
  return (
    <div className="resume-summary-block">
      <h2 className="resume-pdf-section-title">SUMMARY</h2>
      <p className="resume-pdf-body resume-pdf-body--prose">{text}</p>
    </div>
  );
}

function JobBlock({ block }: { block: Extract<HarvardPdfBlock, { kind: 'job' }> }) {
  return (
    <article className="resume-job">
      {block.headLine ? <p className="resume-pdf-job-head">{block.headLine}</p> : null}
      {block.title ? <p className="resume-pdf-job-role">{block.title}</p> : null}
      {block.location ? <p className="resume-pdf-job-location">{block.location}</p> : null}
      {block.bullets.length > 0 ? (
        <ul className="resume-pdf-list resume-pdf-bullets">
          {block.bullets.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function SkillsBlock({ lines }: { lines: string[] }) {
  return (
    <div className="resume-flow-section">
      <h2 className="resume-pdf-section-title">SKILLS</h2>
      <ul className="resume-pdf-list resume-pdf-bullets resume-pdf-bullets--skills">
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function EducationBlock({
  rows,
}: {
  rows: Extract<HarvardPdfBlock, { kind: 'education' }>['rows'];
}) {
  return (
    <div className="resume-flow-section">
      <h2 className="resume-pdf-section-title">EDUCATION</h2>
      <ul className="resume-pdf-edu-list">
        {rows.map((row, idx) => (
          <li key={idx} className="resume-pdf-edu-item">
            <span className="resume-pdf-edu-degree">{row.degree}</span>
            {row.institution ? <span>, {row.institution}</span> : null}
            {row.period ? <span className="resume-pdf-edu-period"> · {row.period}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LanguagesBlock({ text }: { text: string }) {
  return (
    <div className="resume-flow-section">
      <h2 className="resume-pdf-section-title">LANGUAGES</h2>
      <p className="resume-pdf-body resume-pdf-body--prose">{text}</p>
    </div>
  );
}

function ExtraSectionBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const heading = title.trim() || 'SECTION';
  return (
    <div className="resume-flow-section">
      <h2 className="resume-pdf-section-title">{heading.toUpperCase()}</h2>
      {content.trim() ? (
        <p className="resume-pdf-body resume-pdf-body--prose">{content}</p>
      ) : null}
    </div>
  );
}

/**
 * Un solo documento Harvard continuo para export PDF (html2canvas una vez).
 */
export function HarvardPdfPages({ data, approvals }: HarvardPdfPagesProps) {
  const { header, blocks } = useMemo(
    () => buildHarvardPdfExportModel(data, approvals),
    [data, approvals],
  );

  const summaryBlock = blocks.find(
    (b): b is Extract<HarvardPdfBlock, { kind: 'summary' }> => b.kind === 'summary',
  );
  const jobBlocks = blocks.filter(
    (b): b is Extract<HarvardPdfBlock, { kind: 'job' }> => b.kind === 'job',
  );
  const skillsBlock = blocks.find(
    (b): b is Extract<HarvardPdfBlock, { kind: 'skills' }> => b.kind === 'skills',
  );
  const educationBlock = blocks.find(
    (b): b is Extract<HarvardPdfBlock, { kind: 'education' }> => b.kind === 'education',
  );
  const languagesBlock = blocks.find(
    (b): b is Extract<HarvardPdfBlock, { kind: 'languages' }> => b.kind === 'languages',
  );
  const extraBlocks = blocks.filter(
    (b): b is Extract<HarvardPdfBlock, { kind: 'extra' }> => b.kind === 'extra',
  );

  return (
    <div className="resume resume-pdf-root">
      <PdfHeader header={header} />
      {summaryBlock ? <SummaryBlock text={summaryBlock.text} /> : null}
      {jobBlocks.length > 0 ? (
        <div className="resume-flow-section">
          <h2 className="resume-pdf-section-title">EXPERIENCE</h2>
          {jobBlocks.map((job) => (
            <JobBlock key={`job-${job.expIndex}`} block={job} />
          ))}
        </div>
      ) : null}
      {skillsBlock ? <SkillsBlock lines={skillsBlock.lines} /> : null}
      {educationBlock ? <EducationBlock rows={educationBlock.rows} /> : null}
      {languagesBlock ? <LanguagesBlock text={languagesBlock.text} /> : null}
      {extraBlocks.map((b, idx) => (
        <ExtraSectionBlock key={`extra-${idx}-${b.title}`} title={b.title} content={b.content} />
      ))}
    </div>
  );
}
