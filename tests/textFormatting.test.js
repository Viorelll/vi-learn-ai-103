import test from "node:test";
import assert from "node:assert/strict";
import { formatStructuredText } from "../src/textFormatting.js";

test("reflows OCR line wraps and emphasizes the closing question", () => {
  const blocks = formatStructuredText(
    "Each agent will access\nthe same Azure AI Search resource.\nWhat should you recommend?",
    { emphasizeClosingTask: true },
  );
  assert.deepEqual(blocks, [
    {
      type: "paragraph",
      text: "Each agent will access the same Azure AI Search resource.",
    },
    { type: "question", text: "What should you recommend?" },
  ]);
});

test("formats requirements as a list and keeps the final task separate", () => {
  const blocks = formatStructuredText(
    "The solution must meet the following requirements:\nSupport high-volume processing.\nUse reference data.\nHow should you configure the solution? To answer, select the appropriate options.",
    { emphasizeClosingTask: true },
  );
  assert.deepEqual(blocks, [
    {
      type: "list",
      introduction: "The solution must meet the following requirements:",
      items: ["Support high-volume processing.", "Use reference data."],
    },
    { type: "question", text: "How should you configure the solution?" },
    { type: "paragraph", text: "To answer, select the appropriate options." },
  ]);
});

test("recognizes case-study headings and note blocks", () => {
  assert.deepEqual(
    formatStructuredText(
      "Existing Environment -\nContoso uses Microsoft Entra ID.\nNOTE: Review all requirements.",
    ),
    [
      { type: "heading", text: "Existing Environment" },
      { type: "paragraph", text: "Contoso uses Microsoft Entra ID." },
      { type: "note", text: "NOTE: Review all requirements." },
    ],
  );
});

test("separates embedded closing tasks and explicit OCR bullets", () => {
  const blocks = formatStructuredText(
    "Use the following:\n• Exact product names\n• Natural language descriptions What should you configure?",
    { emphasizeClosingTask: true },
  );
  assert.deepEqual(blocks, [
    {
      type: "list",
      introduction: "Use the following:",
      items: ["Exact product names", "Natural language descriptions"],
    },
    { type: "question", text: "What should you configure?" },
  ]);
});
