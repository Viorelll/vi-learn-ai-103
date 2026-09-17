function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function matchingIds(bank, property, value) {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return [];
  return bank
    .filter((question) => normalize(question[property]) === normalizedValue)
    .map((question) => question.id);
}

const similarTaskGroups = [
  [6, 92],
  [14, 30],
  [34, 70],
  [2, 49, 51],
  [45, 46, 88],
  [63, 81],
  [69, 71],
];

function similarTaskIds(questionId) {
  return similarTaskGroups
    .filter((group) => group.includes(questionId))
    .flat()
    .filter((id) => id !== questionId);
}

export function relatedQuestions(question, bank) {
  const related = [];
  const caseStudyIds = matchingIds(
    bank,
    "caseStudy",
    question.caseStudy,
  ).filter((id) => id !== question.id);
  const taskIds = matchingIds(bank, "prompt", question.prompt).filter(
    (id) => id !== question.id,
  );
  const similarIds = similarTaskIds(question.id);

  if (caseStudyIds.length) {
    related.push({
      label: "Same case-study specification",
      questionIds: caseStudyIds,
    });
  }
  if (taskIds.length) {
    related.push({
      label: "Duplicate task",
      questionIds: taskIds,
    });
  }
  if (similarIds.length) {
    related.push({
      label: "Similar task",
      questionIds: similarIds,
    });
  }
  return related;
}
