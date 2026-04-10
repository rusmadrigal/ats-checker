# ATS Checker · Spanish UI

**The product interface is Spanish-only right now** (this README is in English for contributors and visitors). English strings exist in the codebase for a future language toggle but are not exposed in the current build.

A modern web application that helps job seekers understand how their resume might perform against **Applicant Tracking Systems (ATS)**. Users upload a resume (PDF or DOCX) and receive a structured view of compatibility feedback, issues, and improvement suggestions.

> **Status:** The product experience is fully implemented in the browser. Analysis results are currently **demonstration data** to showcase the UI and flow. Wiring a real parser and AI or rules-based scoring layer is the natural next step for production use.

---

## Why this exists

Most large employers use ATS software to filter resumes before a human reads them. Small formatting choices, missing keywords, or weak structure can cause qualified candidates to be screened out. This tool is designed to surface that kind of feedback in a clear, actionable layout.

---

## Features

- **Resume upload** — Drag-and-drop or file picker; validates **PDF** and **DOCX** (up to 10 MB as indicated in the UI).
- **ATS-style report** — Compatibility score, categorized issues (errors vs. warnings), and side-by-side “before / after” style suggestions.
- **Guided narrative** — “How it works” steps and a dedicated upgrade call-to-action section for future monetization or premium flows.
- **Polished UX** — Responsive layout, motion transitions (Motion), accessible patterns via Radix-based UI primitives, and toast notifications (Sonner).
- **Localization** — All visible UI copy is **Spanish** today. English translations are prepared in code for a future EN/ES toggle.

---

## Tech stack

| Area      | Choice                                                 |
| --------- | ------------------------------------------------------ |
| Framework | [Next.js](https://nextjs.org/) 16 (App Router)         |
| Language  | TypeScript                                             |
| UI        | React 19, Tailwind CSS 4, Radix UI patterns            |
| Motion    | [Motion](https://motion.dev/) (formerly Framer Motion) |
| Tooling   | ESLint, Prettier, pnpm                                 |

---

## Requirements

- **Node.js** 20 or newer
- **pnpm** 10 or newer

---

## Getting started

```bash
git clone https://github.com/rusmadrigal/ats-checker.git
cd ats-checker
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
pnpm build
pnpm start
```

---

## Scripts

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `pnpm dev`    | Start the development server         |
| `pnpm build`  | Create an optimized production build |
| `pnpm start`  | Run the production server            |
| `pnpm lint`   | Run ESLint                           |
| `pnpm format` | Format the codebase with Prettier    |

---

## Project structure (high level)

```
app/           # Next.js App Router entry (layout, page)
src/app/       # Main client application and feature components
src/styles/    # Global styles and Tailwind-related CSS
```

Business UI lives under `src/app/`; the App Router wires the home page to the main `App` component.

---

## Roadmap ideas

- Integrate a document pipeline (PDF/DOCX text extraction) and persist uploads securely.
- Replace mock scores and issues with deterministic rules and/or an LLM-backed analyzer.
- Ship an EN/ES language toggle (English strings are already stubbed in code) and optional routing or cookie-based locale.
- Add authentication if resumes must be stored per user.

---

## Contributing

Issues and pull requests are welcome. Please run `pnpm lint` and `pnpm format` before submitting changes.

---

## License

This project is **private** (`private: true` in `package.json`). All rights reserved unless you add an explicit license file.
