import test from "node:test";
import assert from "node:assert/strict";
import { parseRoute, routeForPage } from "../src/routing.js";

const isKnownQuestion = (id) => id >= 1 && id <= 135;

test("builds canonical routes for pages, questions, sessions, and reviews", () => {
  assert.equal(routeForPage("dashboard"), "/");
  assert.equal(routeForPage("setup"), "/setup");
  assert.equal(routeForPage("question", { questionId: 42 }), "/question/42");
  assert.equal(
    routeForPage("test", { questionId: 42 }),
    "/test?question=42",
  );
  assert.equal(
    routeForPage("results", { reviewId: "session/42" }),
    "/results?session=session%2F42",
  );
});

test("parses shareable question URLs and legacy query links", () => {
  assert.deepEqual(
    parseRoute({ pathname: "/question/42", search: "" }, isKnownQuestion),
    { page: "question", questionId: 42 },
  );
  assert.deepEqual(
    parseRoute({ pathname: "/", search: "?question=42" }, isKnownQuestion),
    { page: "question", questionId: 42 },
  );
  assert.deepEqual(
    parseRoute({ pathname: "/question", search: "?question=42" }, isKnownQuestion),
    { page: "question", questionId: 42 },
  );
  assert.deepEqual(
    parseRoute({ pathname: "/question/999", search: "" }, isKnownQuestion),
    { page: "library", questionId: null },
  );
});

test("parses page routes and session context", () => {
  assert.deepEqual(parseRoute({ pathname: "/library", search: "" }), {
    page: "library",
    questionId: null,
  });
  assert.deepEqual(
    parseRoute({ pathname: "/test", search: "?question=12" }, isKnownQuestion),
    { page: "test", questionId: 12 },
  );
  assert.deepEqual(
    parseRoute({ pathname: "/results", search: "?session=session-1" }),
    { page: "results", questionId: null, reviewId: "session-1" },
  );
});
