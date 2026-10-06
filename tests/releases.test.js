import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildQuestionCatalog } from "../src/questionGroups.js";
import { releases, releaseStats } from "../src/releases.js";

const bank = JSON.parse(
  readFileSync(new URL("../src/data/questions.json", import.meta.url)),
);
const catalog = buildQuestionCatalog(bank);

test("new questions are exactly the 30 September update", () => {
  assert.deepEqual(
    bank.filter((q) => q.isNew).map((q) => q.id),
    Array.from({ length: 26 }, (_, i) => 136 + i),
  );
  assert.ok(
    bank.filter((q) => q.isNew).every((q) => q.release === "2026-09-30"),
  );
});

test("release statistics partition each release", () => {
  const [original, update] = releases.map((release) =>
    releaseStats(release, bank, catalog),
  );
  assert.deepEqual(
    [
      original.total,
      original.caseStudies,
      original.caseStudyQuestions,
      original.variantGroups,
      original.variantQuestions,
      original.unique,
      original.unavailable,
    ],
    [135, 1, 8, 3, 10, 115, 2],
  );
  assert.deepEqual(
    [
      update.total,
      update.caseStudies,
      update.caseStudyQuestions,
      update.variantGroups,
      update.variantQuestions,
      update.unique,
      update.unavailable,
    ],
    [26, 1, 2, 2, 5, 19, 0],
  );
  assert.equal(update.caseStudiesExtended, 1);
  assert.equal(update.variantGroupsExtended, 1);
});
