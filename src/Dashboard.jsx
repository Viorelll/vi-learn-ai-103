import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Settings2,
  Clock,
  Check,
  Shuffle,
  ListOrdered,
  Layers,
  Sparkles,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { blocks, TOTAL } from "./engine";
import SessionPicker from "./SessionPicker";
import { sessionTypeLabels } from "./questionGroups";
import { latestRelease } from "./releases";
export function Pill({ children, tone = "" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
export function NewBadge({ size = "" }) {
  return (
    <span
      className={`new-badge ${size}`}
      title={`Added in the ${latestRelease.label}`}
    >
      <Sparkles size={size === "small" ? 12 : 16} />
      NEW
      {size === "large" && <small>{latestRelease.label}</small>}
    </span>
  );
}
export function Stat({ icon: Icon, title, value, suffix, detail, color }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${color}`}>
        <Icon size={21} />
      </span>
      <div>
        <span className="stat-title">{title}</span>
        <div className="stat-value">
          {value}
          <small>{suffix}</small>
        </div>
        <span className="stat-detail">{detail}</span>
      </div>
    </div>
  );
}
export function Empty({ icon: Icon = BookOpen, title, children }) {
  return (
    <div className="empty">
      <Icon size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <Pill>MICROSOFT AI-103</Pill>
        <h2>
          Turn what you know
          <br />
          into what you can do.
        </h2>
        <p>
          A focused space to learn, practice, and find your rhythm.
          <br className="desktop-break" /> Your next milestone is a few
          questions away.
        </p>
        <button
          className="primary light"
          onClick={() =>
            document.getElementById("test-builder").scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          Let’s practice <ArrowUpRight size={18} />
        </button>
        <span className="hero-foot">Your pace. Your path. Your progress.</span>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />
        <span className="orbit-star star-one">✳</span>
        <span className="orbit-star star-two">✧</span>
        <div className="art-card card-behind" />
        <div className="art-card card-front">
          <div className="art-card-top">
            <span>LEARNING IN MOTION</span>
            <Sparkles size={17} />
          </div>
          <div className="art-number">
            AI<span>103</span>
            <i>↗</i>
          </div>
          <div className="art-line" />
          <div className="art-card-bottom">
            <span>
              BUILD SOMETHING
              <br />
              WITH WHAT YOU KNOW.
            </span>
            <div className="art-check">
              <Check size={22} />
            </div>
          </div>
        </div>
        <span className="floating-chip">
          <CheckCircle2 size={17} /> A little better, every day
        </span>
      </div>
    </section>
  );
}
export function Builder({
  config,
  catalog,
  updateConfig,
  selected,
  error,
  requestStart,
  go,
}) {
  const uniqueMode = config.mode === "unique";
  const rangeIds = (start, end) =>
    catalog.unique.slice(start - 1, end).map((entry) => entry.id);
  const rangeSelected = (range) =>
    uniqueMode
      ? selected.length === range.end - range.start + 1 &&
        catalog.unique
          .slice(range.start - 1, range.end)
          .every((entry) => selected.includes(entry.ids[0]))
      : config.block === range.start;
  return (
    <div className="builder-layout" id="test-builder">
      <section className="panel builder">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRACTICE, YOUR WAY</span>
            <h2>Build your next session</h2>
          </div>
          <span className="soft-icon">
            <Settings2 size={21} />
          </span>
        </div>
        <label className="field-label">
          01 <span>Choose your focus</span>
        </label>
        <div className="mode-grid">
          {[
            {
              id: "blocks",
              icon: Layers,
              title: "By question range",
              desc: "Learn in smaller chapters",
            },
            {
              id: "random",
              icon: Shuffle,
              title: "Mix it up",
              desc: "A fresh random selection",
            },
            {
              id: "all",
              icon: ListOrdered,
              title: "The full collection",
              desc: `All ${TOTAL}, start to finish`,
            },
            {
              id: "new",
              icon: Sparkles,
              title: "New questions",
              desc: `${latestRelease.label} · ${latestRelease.start}–${latestRelease.end}`,
            },
            {
              id: "custom",
              icon: Settings2,
              title: "Custom range",
              desc: "Choose your own start & end",
            },
            {
              id: "unique",
              icon: CheckCircle2,
              title: "Unique questions",
              desc: `${catalog.unique.length} standalone questions to select`,
            },
            {
              id: "cases",
              icon: BookOpen,
              title: "Case studies",
              desc: "One study, different questions",
            },
            {
              id: "variants",
              icon: Layers,
              title: "Shared-question variants",
              desc: "Same scenario, different solutions",
            },
          ].map(({ id, icon: Icon, title, desc }) => (
            <button
              key={id}
              className={`mode-card ${config.mode === id ? "chosen" : ""}`}
              onClick={() =>
                updateConfig({
                  mode: id,
                  selectionIds:
                    config.mode === id
                      ? config.selectionIds
                      : id === "unique"
                        ? rangeIds(1, config.size)
                        : null,
                  ...(config.mode !== id && id === "unique"
                    ? { block: 1 }
                    : {}),
                })
              }
            >
              <Icon size={21} />
              <strong>
                {title}
                {id === "new" && <NewBadge size="small" />}
              </strong>
              <small>{desc}</small>
              <span className="radio-indicator">
                {config.mode === id && <i />}
              </span>
            </button>
          ))}
        </div>
        {["blocks", "random", "unique"].includes(config.mode) && (
          <>
            <label className="field-label">
              02 <span>How many questions?</span>
            </label>
            <div className="size-buttons">
              {[10, 15, 20, 30, 50].map((n) => (
                <button
                  key={n}
                  className={config.size === n ? "selected" : ""}
                  onClick={() =>
                    updateConfig({
                      size: n,
                      block: 1,
                      ...(uniqueMode ? { selectionIds: rangeIds(1, n) } : {}),
                    })
                  }
                >
                  {n}
                  <span>questions</span>
                </button>
              ))}
            </div>
          </>
        )}
        {(config.mode === "blocks" || uniqueMode) && (
          <>
            <label className="field-label">
              03 <span>Pick a range</span>
              <small>
                {uniqueMode
                  ? `${catalog.unique.length} unique questions · `
                  : ""}
                Grouped by {config.size}
              </small>
            </label>
            <div className="range-grid">
              {blocks(
                config.size,
                uniqueMode ? catalog.unique.length : undefined,
              ).map((b) => (
                <button
                  key={b.start}
                  className={rangeSelected(b) ? "selected" : ""}
                  onClick={() =>
                    updateConfig({
                      block: b.start,
                      ...(uniqueMode
                        ? { selectionIds: rangeIds(b.start, b.end) }
                        : {}),
                    })
                  }
                >
                  {b.start}–{b.end}
                  {rangeSelected(b) && <Check size={13} />}
                </button>
              ))}
            </div>
          </>
        )}
        {sessionTypeLabels[config.mode] && (
          <SessionPicker
            key={config.mode}
            config={config}
            catalog={catalog}
            updateConfig={updateConfig}
          />
        )}
        {config.mode === "custom" && (
          <div className="custom-range">
            <label>
              First question
              <input
                type="number"
                min="1"
                max={TOTAL}
                value={config.start}
                onChange={(e) =>
                  updateConfig({
                    start: e.target.value,
                  })
                }
              />
            </label>
            <span>to</span>
            <label>
              Last question
              <input
                type="number"
                min="1"
                max={TOTAL}
                value={config.end}
                onChange={(e) =>
                  updateConfig({
                    end: e.target.value,
                  })
                }
              />
            </label>
          </div>
        )}
        {config.mode === "all" && (
          <div className="all-note">
            <BookOpen size={23} />
            <div>
              <strong>The complete AI-103 collection</strong>
              <p>Questions 1–{TOTAL}. Pause and resume whenever you need.</p>
            </div>
          </div>
        )}
        {config.mode === "new" && (
          <div className="all-note">
            <Sparkles size={23} />
            <div>
              <strong>{latestRelease.label}</strong>
              <p>
                Questions {latestRelease.start}–{latestRelease.end}, added on{" "}
                {latestRelease.date}.
              </p>
            </div>
          </div>
        )}
        <div className="builder-options">
          {config.mode !== "random" && (
            <label className="switch-row">
              <input
                type="checkbox"
                checked={config.shuffle}
                onChange={(e) =>
                  updateConfig({
                    shuffle: e.target.checked,
                  })
                }
              />
              <span className="switch" />
              <span>Shuffle question order</span>
              <Shuffle size={16} />
            </label>
          )}
          <label className="key-label">
            Score answers against
            <select
              value={config.basis}
              onChange={(e) =>
                updateConfig({
                  basis: e.target.value,
                })
              }
            >
              <option value="reviewed">PDF reviewed key</option>
              <option value="original">Original PDF key</option>
            </select>
          </label>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="builder-footer">
          <span>
            <Clock size={16} />
            {selected.length} questions <b>·</b> No time limit
          </span>
          <button
            className="primary"
            disabled={!selected.length}
            onClick={() => requestStart()}
          >
            Start session <ArrowRight size={18} />
          </button>
        </div>
      </section>
      <aside className="builder-aside">
        <div className="tip-card">
          <div className="tip-icon">
            <Sparkles size={22} />
          </div>
          <span className="eyebrow">A GOOD WAY TO BEGIN</span>
          <h3>
            Consistency beats
            <br />
            cramming.
          </h3>
          <p>
            Start with 10 questions. Review what tripped you up. Come back a
            little more confident.
          </p>
          <div className="tip-divider" />
          <ul>
            <li>
              <CheckCircle2 size={17} />
              Real question formats
            </li>
            <li>
              <CheckCircle2 size={17} />
              Answers after you finish
            </li>
            <li>
              <CheckCircle2 size={17} />
              Your time, tracked automatically
            </li>
          </ul>
        </div>
        <div className="source-card">
          <BookOpen size={20} />
          <strong>Built from your study guide</strong>
          <p>135 questions · September 15, 2026</p>
          <p>
            <NewBadge size="small" /> +
            {latestRelease.end - latestRelease.start + 1} questions ·{" "}
            {latestRelease.date}
          </p>
          <small>
            Original and reviewed PDF keys are preserved. Two cropped questions
            are study-only; two statements lack a key. Scores exclude missing
            answers.
          </small>
          <button className="text-button" onClick={() => go("library")}>
            Explore the question library <ArrowUpRight size={15} />
          </button>
        </div>
      </aside>
    </div>
  );
}
