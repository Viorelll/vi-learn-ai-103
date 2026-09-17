const pagePaths = {
  dashboard: "/",
  setup: "/setup",
  library: "/library",
  history: "/history",
  test: "/test",
  results: "/results",
};

function questionIdFrom(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizePath(pathname) {
  const path = pathname.replace(/\/+$/, "");
  return path || "/";
}

export function routeForPage(page, options = {}) {
  if (page === "question" && options.questionId) {
    return `/question/${options.questionId}`;
  }
  if (page === "question") return "/library";
  if (page === "test" && options.questionId) {
    return `/test?question=${options.questionId}`;
  }
  if (page === "results" && options.reviewId) {
    return `/results?session=${encodeURIComponent(options.reviewId)}`;
  }
  return pagePaths[page] || "/";
}

export function parseRoute(location, isKnownQuestion = () => true) {
  const pathname = normalizePath(location.pathname);
  const params = new URLSearchParams(location.search || "");
  const questionPathMatch = pathname.match(/^\/questions?\/(\d+)$/);
  const questionId = questionIdFrom(
    questionPathMatch?.[1] || params.get("question"),
  );
  const knownQuestionId =
    questionId && isKnownQuestion(questionId) ? questionId : null;

  if (
    questionPathMatch ||
    (knownQuestionId && ["/", "/question", "/library"].includes(pathname))
  ) {
    return {
      page: knownQuestionId ? "question" : "library",
      questionId: knownQuestionId,
    };
  }

  const page = Object.entries(pagePaths).find(
    ([, path]) => path === pathname,
  )?.[0];
  return {
    page: page || "dashboard",
    questionId: page === "test" ? knownQuestionId : null,
    reviewId: page === "results" ? params.get("session") || null : null,
  };
}
