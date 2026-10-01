import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildQuestionCatalog,
  normalizeQuestionText,
  selectedEntries,
} from "../src/questionGroups.js";
import { selectQuestions } from "../src/engine.js";

const bank = JSON.parse(
  readFileSync(new URL("../src/data/questions.json", import.meta.url)),
);
const catalog = buildQuestionCatalog(bank);

test("audit partitions every source question with no overlaps or lost questions", () => {
  assert.equal(catalog.unique.length, 115);
  assert.equal(catalog.cases.length, 1);
  assert.equal(catalog.variants.length, 3);
  assert.deepEqual(catalog.unavailable, [66, 68]);
  const ids = ["unique", "cases", "variants"].flatMap((mode) =>
    catalog[mode].flatMap((entry) => entry.ids),
  );
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    [...ids, ...catalog.unavailable].sort((a, b) => a - b),
    bank.map((q) => q.id),
  );
  assert.equal(Object.keys(catalog.byQuestion).length, 135);
});

test("bullet and line-wrap differences do not split the Contoso study", () => {
  assert.equal(
    normalizeQuestionText(bank[0].caseStudy),
    normalizeQuestionText(bank[66].caseStudy),
  );
  assert.deepEqual(catalog.cases[0].ids, [1, 2, 27, 28, 56, 61, 62, 67]);
});

test("same-scenario solutions and changed answer choices are grouped, never discarded", () => {
  assert.deepEqual(
    catalog.variants.map((entry) => entry.ids),
    [
      [23, 24, 25, 26],
      [38, 100],
      [41, 42, 43, 44],
    ],
  );
  assert.ok(catalog.variants[0].description.startsWith("You have"));
  assert.deepEqual(
    catalog.variants
      .filter((entry) => entry.formats.includes("matrix"))
      .map((entry) => entry.ids),
    [
      [23, 24, 25, 26],
      [41, 42, 43, 44],
    ],
  );
  const uniqueIds = selectQuestions({ mode: "unique" }, Math.random, catalog);
  assert.equal(uniqueIds.length, 115);
  assert.ok(
    uniqueIds.every(
      (id) =>
        !catalog.byQuestion[id].duplicateOf &&
        catalog.byQuestion[id].category === "unique",
    ),
  );
  for (const type of ["matrix", "multiple", "dropdown", "matching", "ordering"])
    assert.ok(uniqueIds.some((id) => bank[id - 1].type === type));
});

test("category modes select exact individual questions or complete groups", () => {
  assert.deepEqual(
    selectQuestions(
      { mode: "unique", selectionIds: ["question-4", "question-33"] },
      Math.random,
      catalog,
    ),
    [4, 33],
  );
  assert.deepEqual(
    selectQuestions(
      { mode: "cases", selectionIds: ["case-1"] },
      Math.random,
      catalog,
    ),
    [1, 2, 27, 28, 56, 61, 62, 67],
  );
  assert.deepEqual(
    selectQuestions(
      { mode: "variants", selectionIds: ["variant-38", "variant-23"] },
      Math.random,
      catalog,
    ),
    [23, 24, 25, 26, 38, 100],
  );
  for (const mode of ["unique", "cases", "variants"]) {
    assert.throws(() =>
      selectQuestions({ mode, selectionIds: [] }, Math.random, catalog),
    );
    assert.throws(() =>
      selectQuestions(
        { mode, selectionIds: ["missing"] },
        Math.random,
        catalog,
      ),
    );
    assert.throws(() => selectQuestions({ mode }));
  }
  assert.throws(() =>
    selectedEntries({ mode: "unique", selectionIds: "invalid" }, catalog),
  );
});

test("shuffling preserves group adjacency and does not mutate saved selection or catalog", () => {
  const config = {
    mode: "variants",
    shuffle: true,
    selectionIds: catalog.variants.map((entry) => entry.id),
  };
  const snapshot = JSON.stringify({ config, catalog });
  const ids = selectQuestions(config, () => 0, catalog);
  assert.equal(new Set(ids).size, 10);
  for (const entry of catalog.variants) {
    const start = ids.indexOf(entry.ids[0]);
    assert.deepEqual(ids.slice(start, start + entry.ids.length), entry.ids);
  }
  assert.equal(JSON.stringify({ config, catalog }), snapshot);
});

test("exact duplicates deduplicate but differing exhibits remain independent", () => {
  const source = bank[2];
  const result = buildQuestionCatalog([
    source,
    { ...source, id: 200, prompt: source.prompt.replace(/\n/g, " ") },
    { ...source, id: 201, images: ["/different-exhibit.png"] },
  ]);
  assert.deepEqual(
    result.unique.map((entry) => entry.ids),
    [[3], [201]],
  );
  assert.deepEqual(result.duplicates, [{ id: 200, keptId: 3 }]);
  assert.equal(result.byQuestion[200].duplicateOf, 3);
});
