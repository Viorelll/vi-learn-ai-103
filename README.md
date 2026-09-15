# Foundry — AI-103 Study Studio

A React + Vite training app built from `AI-103_135_Questions_Answers_OpenAI_Reviewed_2026-09-15.pdf`.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the URL Vite prints (normally http://127.0.0.1:5173).

```sh
npm run build       # production files in dist/
npm run preview     # serve the production build
npm test            # scoring, ranges, answer-key and timer checks
npm run test:browser # end-to-end checks; start the dev server first
```

The browser test uses installed Microsoft Edge. Change `channel: 'msedge'` in `scripts/browser-test.mjs` if using a different Playwright browser.

## Features

- All 135 source question numbers, searchable by text and format.
- Sequential questions 1–135, random samples of 10/15/20/30, automatically grouped blocks, or any custom inclusive range.
- Optional shuffle for ranges and the full collection; random tests contain no duplicates.
- Radio buttons, checkboxes, dropdowns, yes/no matrices, drag-and-drop matching and ordering.
- Matching and ordering also support click/tap-to-place and keyboard-accessible dropdowns.
- Case studies and original question images are preserved, with readable code transcriptions where appropriate.
- A timer, pause/resume, question navigator, flags and answer clearing.
- Automatic browser-local saving of settings, current answers and the last 100 completed sessions.
- Scores, time spent, per-question review, original explanations, reviewed explanations and retry missed questions.
- Every reviewed question shows answer evidence in three clear states: green for a clear community consensus that matches the selected key, yellow for a warning or split/unclear source answer, and blue for an independent OpenAI study answer.
- Responsive sage theme with bundled fonts and no API keys, backend, tracking or external font requests.

Pause the timer before taking a break. It otherwise measures wall-clock time, including navigation away from the test or closing the tab. Browser data stays in that browser/profile and does not synchronize to other devices. Clearing site data removes saved progress.

## Scoring and source fidelity

`src/data/questions.json` is the complete imported question bank. The PDF is the source of answer keys; this project does not independently endorse or update its technical answers.

Choose **PDF reviewed key** (default) or **Original PDF key** before starting. Where no separate review exists, the PDF's original structured answer is retained in the reviewed mode. Where an original key is absent or unusable, original-key mode does not silently substitute the reviewed key.

- Single-choice and multiple-choice questions earn one point for an exact answer. Checkbox questions require the complete correct set, with no extra choices.
- Each keyed dropdown, matching/ordering slot and yes/no statement earns one point, so multi-part items allow partial credit.
- Unanswered keyed parts receive zero. Missing keys are excluded from the denominator; a session with no keyed parts has no percentage score.
- This is a study percentage, not Microsoft's scaled certification score or a pass/fail prediction.

### Known issues in the supplied PDF

- **Q66 and Q68:** Captured question cards stop at the case-study introduction. They are retained as study-only items with the PDF's review guidance; original question controls are not fabricated.
- **Q101 and Q124:** Three statements are visible, but both answer sections cover only the first two. The third statement is interactive but excluded from scoring.
- **Q4:** Original community guidance belongs to another question. Reviewed mode scores the three visible statements; original mode excludes this item.
- **Q8:** The original and reviewed explanations disagree on Reader versus Contributor. Each mode faithfully uses its respective PDF answer.
- **Q2, Q25, Q97, Q132:** Original and reviewed choice keys differ. The selected mode governs scoring.
- **Q107, Q114, Q128:** Only the reviewed key supplies usable structured guidance.
- Image-based questions use OCR cleaned against the original cards and manually transcribed controls. The original images remain accessible for verification. The PDF's source typos and legacy API wording may remain.

Formats: 83 single-choice, 7 multiple-choice, 25 dropdown, 7 yes/no matrix, 8 matching, 3 ordering, and 2 incomplete study-only cards.

## Project layout

- `src/App.jsx`: navigation, session lifecycle, history, library and results.
- `src/Dashboard.jsx`: overview, session builder and shared visual components.
- `src/Question.jsx`: interactive question formats, source exhibits and answer review.
- `src/engine.js`: randomization, ranges, scoring and timer helpers.
- `src/data/questions.json`: all 135 questions and both answer keys.
- `public/questions/`: 49 original embedded question images extracted from the PDF.
- `scripts/`: extraction, Windows OCR, data generation and browser verification.
- `tests/engine.test.js`: data invariants and core behavior tests.

The extraction scripts use the original PDF path under Downloads and a Python environment with `pdfplumber`, `pypdf`, and Pillow. Windows OCR runs through `scripts/ocr.ps1`. Extraction intermediates are stored in `tmp/pdfs/` and are not needed to run or build the app.
