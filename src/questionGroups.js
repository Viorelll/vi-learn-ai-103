// Ignore PDF line wrapping and bullet formatting, not substantive wording.
export function normalizeQuestionText(text = "") {
  return text
    .normalize("NFKC")
    .replace(/[\u2022\u25cf]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const sessionTypeLabels = {
  unique: "Unique questions",
  cases: "Case studies",
  variants: "Shared-question variants",
};

function scenarioText(q) {
  const scenario = q.prompt.split(/\bSolution\s*:/i)[0];
  return scenario.replace(/^Note:[\s\S]*?Review Screen\.\s*/i, "").trim();
}

function preview(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 190 ? `${clean.slice(0, 190)}…` : clean;
}

function formatsFor(questions) {
  return [
    ...new Set(
      questions.flatMap((q) => {
        const yesNo =
          q.options?.length === 2 &&
          q.options.every((option) =>
            /^(yes|no)\.?$/i.test(option.text.trim()),
          );
        return yesNo ? [q.type, "matrix"] : [q.type];
      }),
    ),
  ];
}

export function buildQuestionCatalog(bank) {
  const studies = new Map();
  const scenarios = new Map();
  const unavailable = [];
  for (const q of bank) {
    if (q.type === "unavailable") {
      unavailable.push(q.id);
      continue;
    }
    if (q.caseStudy) {
      const key = normalizeQuestionText(q.caseStudy);
      if (!studies.has(key)) studies.set(key, []);
      studies.get(key).push(q);
    } else {
      // Exhibits and code are part of the question, not just its prose.
      const key = JSON.stringify([
        normalizeQuestionText(scenarioText(q)),
        q.code || "",
        q.images || [],
      ]);
      if (!scenarios.has(key)) scenarios.set(key, []);
      scenarios.get(key).push(q);
    }
  }
  const cases = [...studies.values()].map((questions, i) => ({
    id: `case-${questions[0].id}`,
    title: `Case study ${i + 1} · ${questions[0].caseStudy.match(/Company Information\s*-\s*([^,\n]+)/i)?.[1] || "Shared study"}`,
    description:
      "One shared study, with different questions about its requirements.",
    ids: questions.map((q) => q.id),
    types: [...new Set(questions.map((q) => q.type))],
    formats: formatsFor(questions),
  }));
  const unique = [];
  const variants = [];
  const duplicates = [];
  for (const questions of scenarios.values()) {
    const distinct = new Map();
    for (const q of questions) {
      const signature = JSON.stringify([
        normalizeQuestionText(q.prompt),
        q.type,
        q.options,
        q.fields,
      ]);
      if (distinct.has(signature))
        duplicates.push({ id: q.id, keptId: distinct.get(signature).id });
      else distinct.set(signature, q);
    }
    const items = [...distinct.values()];
    if (items.length > 1) {
      variants.push({
        id: `variant-${items[0].id}`,
        title: `Shared scenario · Questions ${items.map((q) => q.id).join(", ")}`,
        description: preview(scenarioText(items[0])),
        ids: items.map((q) => q.id),
        types: [...new Set(items.map((q) => q.type))],
        formats: formatsFor(items),
      });
    } else {
      const q = items[0];
      unique.push({
        id: `question-${q.id}`,
        title: `Question ${q.id}`,
        description: preview(q.prompt),
        ids: [q.id],
        types: [q.type],
        formats: formatsFor([q]),
      });
    }
  }
  unique.sort((a, b) => a.ids[0] - b.ids[0]);
  const byQuestion = {};
  for (const [category, entries] of Object.entries({
    unique,
    cases,
    variants,
  })) {
    for (const entry of entries)
      for (const id of entry.ids)
        byQuestion[id] = {
          category,
          groupId: entry.id,
          title: entry.title,
          ids: entry.ids,
        };
  }
  for (const id of unavailable)
    byQuestion[id] = { category: "unavailable", ids: [id] };
  for (const duplicate of duplicates)
    byQuestion[duplicate.id] = {
      ...byQuestion[duplicate.keptId],
      duplicateOf: duplicate.keptId,
    };
  return { unique, cases, variants, unavailable, duplicates, byQuestion };
}

export function selectedEntries(config, catalog) {
  const entries = catalog[config.mode] || [];
  if (config.selectionIds == null) return entries;
  if (!Array.isArray(config.selectionIds))
    throw new Error("Choose valid questions or groups.");
  return entries.filter((entry) => config.selectionIds.includes(entry.id));
}
