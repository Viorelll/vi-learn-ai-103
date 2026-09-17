import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
  ChartNoAxesCombined,
  Settings2,
  Clock,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Sparkles,
  Target,
  X,
  Library,
  Info,
  GraduationCap,
  PanelLeftClose,
} from "lucide-react";
import bank from "./data/questions.json";
import {
  typeLabels,
  selectQuestions,
  isAnswered,
  summarize,
  duration,
  elapsed,
  readSaved,
  isOpenAIOnlyAnswer,
} from "./engine";
import { QuestionContent, AnswerInput, AnswerReview } from "./Question";
import { Pill, Stat, Empty, Hero, Builder } from "./Dashboard";
import { relatedQuestions } from "./relatedQuestions";
const byId = Object.fromEntries(bank.map((q) => [q.id, q]));
const linkedQuestionId = Number(
  new URLSearchParams(window.location.search).get("question"),
);
const initialLibraryQuestionId = byId[linkedQuestionId]
  ? linkedQuestionId
  : null;
const initialConfig = {
  mode: "blocks",
  size: 10,
  block: 1,
  start: 1,
  end: 10,
  shuffle: false,
  basis: "reviewed",
};
const dateLabel = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
export default function App() {
  const [page, setPage] = useState(
    initialLibraryQuestionId ? "question" : "dashboard",
  );
  const [config, setConfig] = useState(() => ({
    ...initialConfig,
    ...readSaved("foundry:config", {}),
  }));
  const [session, setSession] = useState(() => {
    const s = readSaved("foundry:session", null);
    return s &&
      Array.isArray(s.ids) &&
      s.ids.length &&
      s.ids.every((id) => byId[id]) &&
      s.answers &&
      Number.isFinite(s.elapsed)
      ? s
      : null;
  });
  const [history, setHistory] = useState(() => {
    const x = readSaved("foundry:history", []);
    return Array.isArray(x)
      ? x.filter((h) => h.ids?.every((id) => byId[id]) && h.answers)
      : [];
  });
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [libraryQuestionId, setLibraryQuestionId] = useState(
    initialLibraryQuestionId,
  );
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryPageSize, setLibraryPageSize] = useState(10);
  const [libraryAnswers, setLibraryAnswers] = useState({});
  const [checkedLibraryQuestions, setCheckedLibraryQuestions] = useState({});
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("foundry:config", JSON.stringify(config));
      localStorage.setItem("foundry:session", JSON.stringify(session));
      localStorage.setItem("foundry:history", JSON.stringify(history));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [config, session, history]);
  const updateConfig = (patch) =>
    setConfig((c) => ({
      ...c,
      ...patch,
    }));
  const go = (p) => {
    setPage(p);
    setMobileNav(false);
    window.scrollTo(0, 0);
  };
  const start = (ids = null) => {
    try {
      const chosen = ids || selectQuestions(config);
      const s = {
        id: crypto.randomUUID(),
        ids: chosen,
        answers: {},
        flags: [],
        index: 0,
        elapsed: 0,
        runningSince: Date.now(),
        basis: config.basis,
        started: new Date().toISOString(),
        label: ids
          ? ids.length === 1
            ? `Question ${ids[0]}`
            : "Practice set"
          : config.mode === "random"
            ? "Random practice"
            : `Questions ${Math.min(...chosen)}–${Math.max(...chosen)}`,
      };
      setSession(s);
      setReview(null);
      setError("");
      go("test");
    } catch (e) {
      setError(e.message);
    }
  };
  const requestStart = (ids = null) => {
    if (session)
      setConfirm({
        type: "replace",
        ids,
      });
    else start(ids);
  };
  const pause = () =>
    setSession((s) => ({
      ...s,
      elapsed: elapsed(s),
      runningSince: null,
    }));
  const resume = () => {
    setSession((s) => ({
      ...s,
      runningSince: s.runningSince || Date.now(),
    }));
    go("test");
  };
  const finish = () => {
    const done = {
      ...session,
      elapsed: elapsed(session),
      runningSince: null,
      finished: new Date().toISOString(),
    };
    setHistory((h) => [done, ...h].slice(0, 100));
    setReview(done);
    setReviewFilter("all");
    setSession(null);
    setConfirm(null);
    go("results");
  };
  const changeIndex = (i) => {
    setSession((s) => ({
      ...s,
      index: i,
    }));
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };
  const uniquePracticed = new Set(
    history.flatMap((h) => Object.keys(h.answers).map(Number)),
  ).size;
  const validGrades = history
    .map((h) =>
      summarize(
        h.ids.map((id) => byId[id]),
        h.answers,
        h.basis,
      ),
    )
    .filter((g) => g.percent !== null);
  const average = validGrades.length
    ? Math.round(
        validGrades.reduce((s, g) => s + g.percent, 0) / validGrades.length,
      )
    : null;
  const totalTime = history.reduce((sum, h) => sum + h.elapsed, 0);
  let selected = [];
  try {
    selected = selectQuestions(
      {
        ...config,
        shuffle: false,
      },
      () => 0.5,
    );
  } catch {}
  const q = session ? byId[session.ids[session.index]] : null;
  const answered = session
    ? session.ids.filter((id) => isAnswered(byId[id], session.answers[id]))
        .length
    : 0;
  const result = review
    ? summarize(
        review.ids.map((id) => byId[id]),
        review.answers,
        review.basis,
      )
    : null;
  const matchesLibraryFormat = (question) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "unclear") return isOpenAIOnlyAnswer(question);
    if (typeFilter === "case-study") return Boolean(question.caseStudy);
    return question.type === typeFilter;
  };
  const libraryQuestions = bank.filter(
    (question) =>
      matchesLibraryFormat(question) &&
      (!search ||
        String(question.id) === search ||
        `${question.prompt} ${question.caseStudy}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const libraryPageCount = Math.max(
    1,
    Math.ceil(libraryQuestions.length / libraryPageSize),
  );
  const currentLibraryPage = Math.min(libraryPage, libraryPageCount);
  const libraryPageStart = (currentLibraryPage - 1) * libraryPageSize;
  const visibleLibraryQuestions = libraryQuestions.slice(
    libraryPageStart,
    libraryPageStart + libraryPageSize,
  );
  const libraryQuestion = libraryQuestionId ? byId[libraryQuestionId] : null;
  const relatedLibraryQuestions = libraryQuestion
    ? relatedQuestions(libraryQuestion, bank)
    : [];
  const openLibraryQuestion = (questionId) => {
    setLibraryQuestionId(questionId);
    go("question");
  };
  const openReview = (h) => {
    setReview(h);
    setReviewFilter("all");
    go("results");
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("dashboard");
          }}
        >
          <span className="brand-mark">
            f<span>°</span>
          </span>
          <span>
            foundry<span className="brand-caption">YOUR STUDY STUDIO</span>
          </span>
        </a>
        <div className="workspace-tag">
          <span className="course-icon">
            <GraduationCap size={19} />
          </span>
          <div>
            <strong>Microsoft AI-103</strong>
            <small>AI engineering pathway</small>
          </div>
          <span className="tiny-dot" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {[
            {
              id: "dashboard",
              label: "Overview",
              icon: LayoutDashboard,
            },
            {
              id: "setup",
              label: "Build a test",
              icon: Settings2,
            },
            {
              id: "library",
              label: "Question library",
              icon: Library,
            },
            {
              id: "history",
              label: "My progress",
              icon: ChartNoAxesCombined,
            },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => go(id)}
            >
              <Icon size={19} />
              {label}
              {id === "library" && <span className="nav-count">135</span>}
            </button>
          ))}
        </nav>
        {session && (
          <button className="resume-sidebar" onClick={resume}>
            <span className="pulse" />
            <span>
              Test in progress
              <small>{session.ids.length} questions · resume</small>
            </span>
            <ArrowRight size={16} />
          </button>
        )}
        <div className="sidebar-bottom">
          <div className="little-quote">
            <span>ONE QUESTION AT A TIME.</span>
            <p>
              Small steps.
              <br />
              Lasting knowledge.
            </p>
            <div className="mini-progress">
              <i
                style={{
                  width: `${(uniquePracticed / 135) * 100}%`,
                }}
              />
            </div>
            <small>{uniquePracticed} of 135 questions practiced</small>
          </div>
          <div className="local-profile">
            <div className="avatar">Y</div>
            <div>
              <strong>Your learning space</strong>
              <small>Saved on this device</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Toggle navigation"
            onClick={() => setMobileNav(!mobileNav)}
          >
            <PanelLeftClose size={22} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>
              {page === "test"
                ? "Practice session"
                : page === "results"
                  ? "Session review"
                  : page === "library"
                    ? "Question library"
                    : page === "history"
                      ? "My progress"
                      : page === "setup"
                        ? "Build a test"
                        : "Overview"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="live-label">
              <span className="online-dot" /> Ready when you are
            </span>
            <span className="edition">
              AI-103 <span>STUDY EDITION</span>
            </span>
          </div>
        </header>
        <main>
          {storageError && (
            <div className="source-note">
              Browser storage is unavailable or full. Keep this tab open;
              progress cannot currently be saved.
            </div>
          )}
          {(page === "dashboard" || page === "setup") && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    A LITTLE PRACTICE. A LOT OF PROGRESS.
                  </div>
                  <h1>
                    {page === "setup"
                      ? "Make this session yours."
                      : "Your next chapter starts here."}
                  </h1>
                  <p>
                    Build confidence for AI-103, one focused session at a time.
                  </p>
                </div>
                <Pill tone="outline">
                  <span className="online-dot" />
                  135 questions, one place
                </Pill>
              </div>
              {page === "dashboard" && (
                <>
                  <Hero />
                  <section className="stats-grid">
                    <Stat
                      icon={BookOpen}
                      title="Questions practiced"
                      value={uniquePracticed}
                      suffix="/ 135"
                      detail={
                        uniquePracticed
                          ? "Keep building your knowledge"
                          : "A fresh start, full of possibilities"
                      }
                      color="sage"
                    />
                    <Stat
                      icon={Target}
                      title="Average score"
                      value={average === null ? "—" : `${average}%`}
                      detail={
                        average === null
                          ? "Your first milestone is ahead"
                          : "Across your scored sessions"
                      }
                      color="lavender"
                    />
                    <Stat
                      icon={Clock}
                      title="Time invested"
                      value={duration(totalTime)}
                      detail={`${history.length} completed ${history.length === 1 ? "session" : "sessions"}`}
                      color="peach"
                    />
                  </section>
                </>
              )}
              <Builder
                {...{
                  config,
                  updateConfig,
                  selected,
                  error,
                  requestStart,
                  go,
                }}
              />
              {page === "dashboard" && (
                <section className="recent-section">
                  <div className="section-heading">
                    <h2>Recent sessions</h2>
                    <button
                      className="text-button"
                      onClick={() => go("history")}
                    >
                      View progress <ArrowRight size={16} />
                    </button>
                  </div>
                  {history.length ? (
                    <HistoryList
                      items={history.slice(0, 3)}
                      onOpen={openReview}
                    />
                  ) : (
                    <div className="first-session">
                      <span className="soft-icon">
                        <Flag size={20} />
                      </span>
                      <div>
                        <strong>
                          Every expert starts with a first session.
                        </strong>
                        <p>
                          Yours will appear here, along with your score and
                          time.
                        </p>
                      </div>
                      <ArrowUpRight size={21} />
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          {page === "library" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ALL THE BUILDING BLOCKS</span>
                  <h1>Your question library.</h1>
                  <p>
                    Browse all 135 questions and open any one without starting a
                    session.
                  </p>
                </div>
                <Pill>135 QUESTIONS</Pill>
              </div>
              <div className="library-tools">
                <label className="search-field">
                  <Search size={19} />
                  <input
                    aria-label="Search questions"
                    placeholder="Search by number, topic, or keyword…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setLibraryPage(1);
                    }}
                  />
                </label>
                <select
                  aria-label="Filter by question type"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setLibraryPage(1);
                  }}
                >
                  <option value="all">All question formats</option>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <label className="library-page-size">
                  <span>Show</span>
                  <select
                    aria-label="Questions per page"
                    value={libraryPageSize}
                    onChange={(e) => {
                      setLibraryPageSize(Number(e.target.value));
                      setLibraryPage(1);
                    }}
                  >
                    {[10, 20, 30].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span>per page</span>
                </label>
              </div>
              <div className="library-list">
                {visibleLibraryQuestions.map((q) => (
                  <button
                    className="library-row"
                    key={q.id}
                    onClick={() => openLibraryQuestion(q.id)}
                  >
                    <span className="question-id">
                      {String(q.id).padStart(3, "0")}
                    </span>
                    <div>
                      <div className="library-meta">
                        {q.caseStudy && <Pill tone="outline">Case study</Pill>}
                        <Pill>{typeLabels[q.type]}</Pill>
                        {q.keyDifference && (
                          <span className="key-difference">Key differs</span>
                        )}
                        {q.note && <Info size={14} />}
                      </div>
                      <p>
                        {q.prompt.slice(0, 210)}
                        {q.prompt.length > 210 ? "…" : ""}
                      </p>
                    </div>
                    <ArrowUpRight size={20} />
                  </button>
                ))}
              </div>
              {libraryQuestions.length > 0 && (
                <nav className="library-pagination" aria-label="Question pages">
                  <span>
                    {libraryPageStart + 1}-
                    {Math.min(
                      libraryPageStart + libraryPageSize,
                      libraryQuestions.length,
                    )}{" "}
                    of {libraryQuestions.length}
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Previous question page"
                      disabled={currentLibraryPage === 1}
                      onClick={() => setLibraryPage(currentLibraryPage - 1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span>
                      Page {currentLibraryPage} of {libraryPageCount}
                    </span>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Next question page"
                      disabled={currentLibraryPage === libraryPageCount}
                      onClick={() => setLibraryPage(currentLibraryPage + 1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </nav>
              )}
              {!libraryQuestions.length && (
                <Empty title="No matching questions">
                  Try a different number, keyword, or format.
                </Empty>
              )}
            </>
          )}
          {page === "question" && libraryQuestion && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">QUESTION LIBRARY</span>
                  <h1>Question {libraryQuestion.id}</h1>
                  <p>
                    Review the source material without changing your session.
                  </p>
                </div>
                <button className="secondary" onClick={() => go("library")}>
                  <ArrowLeft size={16} />
                  Back to library
                </button>
              </div>
              <section className="panel question-card library-question">
                <div className="question-top">
                  <div>
                    <span className="eyebrow">
                      QUESTION {libraryQuestion.id}
                    </span>
                    <div className="question-tags">
                      <Pill>{typeLabels[libraryQuestion.type]}</Pill>
                      <span>Source #{libraryQuestion.id}</span>
                    </div>
                  </div>
                </div>
                <QuestionContent
                  q={libraryQuestion}
                  relatedGroups={relatedLibraryQuestions}
                />
                <div className="answer-heading">
                  <strong>Your answer</strong>
                  <span>
                    {libraryQuestion.type === "multiple"
                      ? `Select ${libraryQuestion.reviewed?.length || libraryQuestion.original?.length || "all applicable"} answers`
                      : libraryQuestion.fields.length
                        ? `${libraryQuestion.fields.length} selections`
                        : "Select one answer"}
                  </span>
                </div>
                <AnswerInput
                  q={libraryQuestion}
                  value={libraryAnswers[libraryQuestion.id]}
                  onChange={(value) => {
                    setLibraryAnswers((answers) => ({
                      ...answers,
                      [libraryQuestion.id]: value,
                    }));
                    setCheckedLibraryQuestions((questions) => ({
                      ...questions,
                      [libraryQuestion.id]: false,
                    }));
                  }}
                />
                <div className="question-footer">
                  <span />
                  <button
                    className="primary"
                    disabled={
                      libraryQuestion.type !== "unavailable" &&
                      !isAnswered(
                        libraryQuestion,
                        libraryAnswers[libraryQuestion.id],
                      )
                    }
                    onClick={() =>
                      setCheckedLibraryQuestions((questions) => ({
                        ...questions,
                        [libraryQuestion.id]: true,
                      }))
                    }
                  >
                    Check answer <CheckCheck size={17} />
                  </button>
                </div>
                {checkedLibraryQuestions[libraryQuestion.id] && (
                  <AnswerReview
                    q={libraryQuestion}
                    answer={libraryAnswers[libraryQuestion.id]}
                    basis={config.basis}
                  />
                )}
              </section>
            </>
          )}
          {page === "history" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">LOOK HOW FAR YOU’VE COME</span>
                  <h1>Progress, one session at a time.</h1>
                  <p>Revisit your answers and see your knowledge take shape.</p>
                </div>
              </div>
              <section className="stats-grid">
                <Stat
                  icon={CheckCheck}
                  title="Sessions completed"
                  value={history.length}
                  detail="Each one is a step forward"
                  color="sage"
                />
                <Stat
                  icon={Target}
                  title="Average score"
                  value={average === null ? "—" : `${average}%`}
                  detail="Across scored sessions"
                  color="lavender"
                />
                <Stat
                  icon={Clock}
                  title="Time invested"
                  value={duration(totalTime)}
                  detail={`${uniquePracticed} unique questions practiced`}
                  color="peach"
                />
              </section>
              <section className="panel history-panel">
                <h2>Session history</h2>
                {history.length ? (
                  <HistoryList items={history} onOpen={openReview} />
                ) : (
                  <Empty title="Your story is just getting started">
                    Finish a session to see your score, time, and answer review
                    here.
                  </Empty>
                )}
              </section>
            </>
          )}
          {page === "test" && session && (
            <>
              <div className="test-heading">
                <div>
                  <span className="eyebrow">FOCUS MODE</span>
                  <h1>{session.label}</h1>
                  <p>
                    {session.basis === "reviewed"
                      ? "PDF reviewed key"
                      : "Original PDF key"}{" "}
                    · Answers revealed after submission
                  </p>
                </div>
                <div className="session-clock">
                  <Clock size={20} />
                  <span>{duration(elapsed(session, now))}</span>
                  <button
                    className="icon-button"
                    onClick={session.runningSince ? pause : resume}
                    aria-label={
                      session.runningSince ? "Pause test" : "Resume test"
                    }
                  >
                    {session.runningSince ? (
                      <Pause size={19} />
                    ) : (
                      <Play size={19} />
                    )}
                  </button>
                </div>
              </div>
              {!session.runningSince ? (
                <section className="panel paused">
                  <span className="pause-circle">
                    <Pause size={35} />
                  </span>
                  <h2>A moment to recharge.</h2>
                  <p>Your answers are saved and the timer is paused.</p>
                  <button className="primary" onClick={resume}>
                    Resume session <Play size={17} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => go("dashboard")}
                  >
                    Back to overview
                  </button>
                </section>
              ) : (
                <div className="test-layout">
                  <section className="panel question-card" key={q.id}>
                    <div className="question-top">
                      <div>
                        <span className="eyebrow">
                          QUESTION {session.index + 1} OF {session.ids.length}
                        </span>
                        <div className="question-tags">
                          <Pill>{typeLabels[q.type]}</Pill>
                          <span>Source #{q.id}</span>
                        </div>
                      </div>
                      <button
                        className={`flag-button ${session.flags.includes(q.id) ? "flagged" : ""}`}
                        aria-pressed={session.flags.includes(q.id)}
                        onClick={() =>
                          setSession((s) => ({
                            ...s,
                            flags: s.flags.includes(q.id)
                              ? s.flags.filter((id) => id !== q.id)
                              : [...s.flags, q.id],
                          }))
                        }
                      >
                        <Flag size={16} />
                        {session.flags.includes(q.id)
                          ? "Flagged"
                          : "Flag for review"}
                      </button>
                    </div>
                    <QuestionContent q={q} />
                    <div className="answer-heading">
                      <strong>Your answer</strong>
                      <span>
                        {q.type === "multiple"
                          ? `Select ${q.reviewed?.length || q.original?.length || "all applicable"} answers`
                          : q.fields.length
                            ? `${q.fields.length} selections`
                            : "Select one answer"}
                      </span>
                    </div>
                    <AnswerInput
                      q={q}
                      value={session.answers[q.id]}
                      onChange={(value) =>
                        setSession((s) => ({
                          ...s,
                          answers: {
                            ...s.answers,
                            [q.id]: value,
                          },
                        }))
                      }
                    />
                    <div className="question-footer">
                      <button
                        className="secondary"
                        disabled={session.index === 0}
                        onClick={() => changeIndex(session.index - 1)}
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                      <button
                        className="text-button"
                        disabled={!session.answers[q.id]}
                        onClick={() =>
                          setSession((s) => {
                            const answers = {
                              ...s.answers,
                            };
                            delete answers[q.id];
                            return {
                              ...s,
                              answers,
                            };
                          })
                        }
                      >
                        Clear answer
                      </button>
                      {session.index === session.ids.length - 1 ? (
                        <button
                          className="primary"
                          onClick={() =>
                            setConfirm({
                              type: "finish",
                            })
                          }
                        >
                          Finish session <CheckCheck size={17} />
                        </button>
                      ) : (
                        <button
                          className="primary"
                          onClick={() => changeIndex(session.index + 1)}
                        >
                          Next question <ArrowRight size={17} />
                        </button>
                      )}
                    </div>
                  </section>
                  <aside className="test-aside">
                    <div className="panel navigator">
                      <div className="section-heading">
                        <h3>Your session</h3>
                        <span>
                          {answered}/{session.ids.length}
                        </span>
                      </div>
                      <div className="progress-track">
                        <i
                          style={{
                            width: `${(answered / session.ids.length) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="question-map">
                        {session.ids.map((id, i) => (
                          <button
                            key={id}
                            title={`Question ${id}`}
                            aria-label={`Go to question ${id}`}
                            className={`${session.index === i ? "current" : ""} ${isAnswered(byId[id], session.answers[id]) ? "answered" : ""} ${session.flags.includes(id) ? "flagged" : ""}`}
                            onClick={() => changeIndex(i)}
                          >
                            {i + 1}
                            {session.flags.includes(id) && <i />}
                          </button>
                        ))}
                      </div>
                      <div className="map-legend">
                        <span>
                          <i className="done" />
                          Answered
                        </span>
                        <span>
                          <i />
                          Unanswered
                        </span>
                        <span>
                          <i className="flag" />
                          Flagged
                        </span>
                      </div>
                      <button
                        className="secondary full-width"
                        onClick={() =>
                          setConfirm({
                            type: "finish",
                          })
                        }
                      >
                        Finish &amp; review <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="focus-note">
                      <Sparkles size={19} />
                      <p>
                        Take your time.
                        <br />
                        Understanding is the goal.
                      </p>
                      <small>Progress saves automatically.</small>
                    </div>
                  </aside>
                </div>
              )}
            </>
          )}
          {page === "results" && review && result && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ANOTHER STEP FORWARD</span>
                  <h1>Practice done. Knowledge gained.</h1>
                  <p>
                    {review.label} · {dateLabel(review.finished)} ·{" "}
                    {review.basis === "reviewed"
                      ? "PDF reviewed key"
                      : "Original PDF key"}
                  </p>
                </div>
                <button className="primary" onClick={() => go("setup")}>
                  New session <ArrowRight size={17} />
                </button>
              </div>
              <section className="results-hero">
                <div
                  className="score-ring"
                  style={{
                    "--score": `${(result.percent || 0) * 3.6}deg`,
                  }}
                >
                  <div>
                    <strong>
                      {result.percent === null ? "—" : `${result.percent}%`}
                    </strong>
                    <span>YOUR SCORE</span>
                  </div>
                </div>
                <div className="result-message">
                  <Pill tone="outline">SESSION COMPLETE</Pill>
                  <h2>
                    {result.percent === null
                      ? "A session for discovery."
                      : result.percent >= 80
                        ? "Your hard work is showing."
                        : result.percent >= 50
                          ? "You’re building momentum."
                          : "Every attempt teaches you something."}
                  </h2>
                  <p>
                    {result.earned} of {result.possible} available points
                    earned.
                    <br />
                    Review the details below, then give it another go.
                  </p>
                  <div className="result-actions">
                    <button
                      className="secondary"
                      onClick={() => requestStart(review.ids)}
                    >
                      <RotateCcw size={15} />
                      Try this set again
                    </button>
                    {result.rows.some(
                      (r) => r.status === "incorrect" || r.status === "partial",
                    ) && (
                      <button
                        className="text-button"
                        onClick={() =>
                          requestStart(
                            result.rows
                              .filter(
                                (r) =>
                                  r.status === "incorrect" ||
                                  r.status === "partial",
                              )
                              .map((r) => r.id),
                          )
                        }
                      >
                        Practice missed questions <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="result-metrics">
                  <div>
                    <Clock size={19} />
                    <span>
                      Time spent<strong>{duration(review.elapsed)}</strong>
                    </span>
                  </div>
                  <div>
                    <CheckCircle2 size={19} />
                    <span>
                      Fully correct
                      <strong>
                        {result.correct} / {review.ids.length - result.ungraded}
                      </strong>
                    </span>
                  </div>
                  <div>
                    <Layers size={19} />
                    <span>
                      Study-only items<strong>{result.ungraded}</strong>
                    </span>
                  </div>
                </div>
              </section>
              <p className="scoring-note">
                <Info size={15} />
                Each keyed dropdown, statement, or matching slot earns one
                point. Checkbox questions require an exact selection. Missing
                keys are excluded; unanswered keyed items earn zero.
              </p>
              <div className="review-heading">
                <h2>A closer look at your answers</h2>
                <div className="filter-buttons">
                  {[
                    ["all", "All answers"],
                    ["missed", "Needs practice"],
                    ["flagged", "Flagged"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      className={reviewFilter === id ? "selected" : ""}
                      onClick={() => setReviewFilter(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="review-list">
                {result.rows
                  .filter(
                    (r) =>
                      reviewFilter === "all" ||
                      (reviewFilter === "missed" &&
                        ["incorrect", "partial"].includes(r.status)) ||
                      (reviewFilter === "flagged" &&
                        review.flags.includes(r.id)),
                  )
                  .map((r) => {
                    const item = byId[r.id];
                    return (
                      <details
                        className={`panel review-item ${r.status}`}
                        key={`${review.id}-${r.id}`}
                      >
                        <summary>
                          <span className={`status-icon ${r.status}`}>
                            {r.status === "correct" ? (
                              <CheckCircle2 size={21} />
                            ) : r.status === "ungraded" ? (
                              <MinusCircle size={21} />
                            ) : (
                              <XCircle size={21} />
                            )}
                          </span>
                          <span className="review-title">
                            <strong>
                              Question {r.id}
                              <Pill>{typeLabels[item.type]}</Pill>
                            </strong>
                            <span>{item.prompt.slice(0, 145)}…</span>
                          </span>
                          <span className="review-points">
                            {r.possible
                              ? `${r.earned}/${r.possible}`
                              : "Study only"}
                          </span>
                          <ChevronRight size={18} />
                        </summary>
                        <div className="review-body">
                          <QuestionContent q={item} />
                          <AnswerReview
                            q={item}
                            answer={review.answers[r.id]}
                            basis={review.basis}
                          />
                        </div>
                      </details>
                    );
                  })}
              </div>
              {!result.rows.some(
                (r) =>
                  reviewFilter === "all" ||
                  (reviewFilter === "missed" &&
                    ["incorrect", "partial"].includes(r.status)) ||
                  (reviewFilter === "flagged" && review.flags.includes(r.id)),
              ) && (
                <Empty
                  icon={CheckCircle2}
                  title={
                    reviewFilter === "missed"
                      ? "No missed questions in this session"
                      : "No flagged questions"
                  }
                >
                  Choose All answers to review the full session.
                </Empty>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              foundry<span className="footer-dot"> / </span>A space for steady
              progress.
            </span>
            <span>AI-103 study studio · Local &amp; private</span>
          </footer>
        </main>
      </div>
      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirm(null);
              if (e.key === "Tab") {
                const focusable = [
                  ...e.currentTarget.querySelectorAll("button"),
                ];
                const first = focusable[0],
                  last = focusable.at(-1);
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => setConfirm(null)}
            >
              <X size={20} />
            </button>
            <div className="modal-icon">
              {confirm.type === "finish" ? (
                <CheckCheck size={26} />
              ) : (
                <RotateCcw size={26} />
              )}
            </div>
            <h2 id="modal-title">
              {confirm.type === "finish"
                ? "Ready to see how you did?"
                : "Start a fresh session?"}
            </h2>
            <p>
              {confirm.type === "finish"
                ? `${answered} of ${session.ids.length} questions fully answered. ${session.flags.length} flagged. Unanswered keyed items receive zero points.`
                : "You have a session in progress. Starting a new one replaces its saved answers."}
            </p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setConfirm(null)}>
                {confirm.type === "finish"
                  ? "Keep practicing"
                  : "Keep current session"}
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (confirm.type === "finish") finish();
                  else {
                    start(confirm.ids);
                    setConfirm(null);
                  }
                }}
              >
                {confirm.type === "finish"
                  ? "Submit & see results"
                  : "Start new session"}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function HistoryList({ items, onOpen }) {
  return (
    <div className="history-list">
      {items.map((h) => {
        const g = summarize(
          h.ids.map((id) => byId[id]),
          h.answers,
          h.basis,
        );
        return (
          <button key={h.id} className="history-row" onClick={() => onOpen(h)}>
            <span className="history-icon">
              <CheckCheck size={20} />
            </span>
            <span className="history-title">
              <strong>{h.label}</strong>
              <small>
                {dateLabel(h.finished)} · {h.ids.length} questions
              </small>
            </span>
            <span className="history-time">
              <Clock size={15} />
              {duration(h.elapsed)}
            </span>
            <span
              className={`history-score ${g.percent >= 80 ? "good-score" : ""}`}
            >
              {g.percent === null ? "Study only" : `${g.percent}%`}
            </span>
            <ArrowUpRight size={18} />
          </button>
        );
      })}
    </div>
  );
}
