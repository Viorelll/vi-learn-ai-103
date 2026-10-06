export const releases = [
  {
    id: "original",
    label: "Original collection",
    title: "Questions 1–135",
    date: "September 15, 2026",
    start: 1,
    end: 135,
  },
  {
    id: "2026-09-30",
    label: "30 September Update",
    title: "New questions 136–161",
    date: "September 30, 2026",
    start: 136,
    end: 161,
    isNew: true,
  },
];

export const latestRelease = releases.at(-1);

export const isNewQuestion = (q) => Boolean(q?.isNew);

export function releaseStats(release, bank, catalog) {
  const questions = bank.filter(
    (q) => q.id >= release.start && q.id <= release.end,
  );
  const ids = new Set(questions.map((q) => q.id));
  const inCategory = (category) =>
    questions.filter((q) => catalog.byQuestion[q.id]?.category === category);
  const touchedGroups = (entries) =>
    entries.filter((entry) => entry.ids.some((id) => ids.has(id)));
  const extendsExisting = (entries) =>
    entries.filter((entry) => entry.ids.some((id) => id < release.start))
      .length;
  const caseGroups = touchedGroups(catalog.cases);
  const variantGroups = touchedGroups(catalog.variants);
  const formats = {};
  for (const q of questions) formats[q.type] = (formats[q.type] || 0) + 1;
  return {
    total: questions.length,
    caseStudyQuestions: inCategory("cases").length,
    caseStudies: caseGroups.length,
    caseStudiesExtended: extendsExisting(caseGroups),
    variantQuestions: inCategory("variants").length,
    variantGroups: variantGroups.length,
    variantGroupsExtended: extendsExisting(variantGroups),
    unique: inCategory("unique").filter(
      (q) => !catalog.byQuestion[q.id].duplicateOf,
    ).length,
    duplicates: questions.filter((q) => catalog.byQuestion[q.id]?.duplicateOf)
      .length,
    unavailable: inCategory("unavailable").length,
    keyDifferences: questions.filter((q) => q.keyDifference).length,
    formats,
  };
}
