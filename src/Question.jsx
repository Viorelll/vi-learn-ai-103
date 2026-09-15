import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Check,
  CheckCheck,
  ChevronRight,
  Expand,
  GripVertical,
  Info,
  Users,
} from "lucide-react";
import { grade } from "./engine";
import { formatStructuredText } from "./textFormatting";
const codeExhibits = new Set([
  9, 11, 14, 30, 35, 77, 93, 98, 101, 103, 104, 107, 113, 114, 119, 120, 121,
  124, 130, 134,
]);

function StructuredText({ text, className, emphasizeClosingTask = false }) {
  const blocks = formatStructuredText(text, { emphasizeClosingTask });
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "heading") return <h4 key={index}>{block.text}</h4>;
        if (block.type === "note")
          return (
            <p className="text-note" key={index}>
              {block.text}
            </p>
          );
        if (block.type === "question")
          return (
            <p className="closing-question" key={index}>
              <strong>{block.text}</strong>
            </p>
          );
        if (block.type === "list")
          return (
            <div className="text-list" key={index}>
              {block.introduction && <p>{block.introduction}</p>}
              <ul>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          );
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}

export function AnswerInput({ q, value, onChange, disabled = false }) {
  const [picked, setPicked] = useState(null);
  const [dragging, setDragging] = useState(false);
  const vals = value || {};
  const setField = (i, v) => {
    if (disabled) return;
    const next = {
      ...vals,
      [i]: v,
    };
    if (q.type === "ordering")
      Object.keys(next).forEach((k) => {
        if (Number(k) !== i && next[k] === v) delete next[k];
      });
    onChange(next);
    setPicked(null);
    setDragging(false);
  };
  if (q.type === "unavailable")
    return (
      <div className="source-note">
        <Info size={18} />
        <span>
          This is a study-only item. Its original controls are missing from the
          PDF, so no answer is required.
        </span>
      </div>
    );
  if (q.options.length)
    return (
      <div className="options">
        {q.options.map((o) => {
          const selected = Array.isArray(value) && value.includes(o.id);
          return (
            <label
              className={`option ${selected ? "selected" : ""}`}
              key={o.id}
            >
              <input
                disabled={disabled}
                type={q.type === "multiple" ? "checkbox" : "radio"}
                name={`question-${q.id}`}
                checked={selected}
                onChange={() =>
                  onChange(
                    q.type === "multiple"
                      ? selected
                        ? value.filter((x) => x !== o.id)
                        : [...(value || []), o.id]
                      : [o.id],
                  )
                }
              />
              <span className="option-letter">{o.id}</span>
              <span>{o.text}</span>
              {selected && <Check size={17} className="answer-check" />}
            </label>
          );
        })}
      </div>
    );
  if (q.type === "matrix")
    return (
      <div className="matrix">
        {q.fields.map((f, i) => (
          <fieldset key={i}>
            <legend>{f.label}</legend>
            <div className="yesno">
              {f.options.map((o, j) => (
                <label key={o} className={vals[i] === j ? "selected" : ""}>
                  <input
                    type="radio"
                    disabled={disabled}
                    name={`matrix-${q.id}-${i}`}
                    checked={vals[i] === j}
                    onChange={() => setField(i, j)}
                  />
                  {o}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    );
  if (q.type === "matching" || q.type === "ordering")
    return (
      <div className={dragging ? "match-ui dragging" : "match-ui"}>
        <p className="input-hint">
          Drag an option into a slot, or select an option and then a slot.
          Dropdowns also work with a keyboard.
        </p>
        <div className="match-bank">
          {q.fields[0].options.map((o, i) => (
            <button
              type="button"
              className={`drag-option ${picked === i ? "picked" : ""}`}
              aria-pressed={picked === i}
              key={i}
              disabled={disabled}
              draggable={!disabled}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(i));
                setPicked(i);
                setDragging(true);
              }}
              onDragEnd={() => {
                setDragging(false);
                setPicked(null);
              }}
              onClick={() => setPicked(picked === i ? null : i)}
            >
              <GripVertical size={15} />
              {o}
            </button>
          ))}
        </div>
        <div className="slots">
          {q.fields.map((f, i) => (
            <div
              className={`drop-slot ${vals[i] !== undefined ? "filled" : ""}`}
              key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const raw = e.dataTransfer.getData("text/plain"),
                  v = Number(raw);
                if (
                  raw !== "" &&
                  Number.isInteger(v) &&
                  v >= 0 &&
                  v < f.options.length
                )
                  setField(i, v);
              }}
            >
              <div className="slot-top">
                <span className="slot-number">{i + 1}</span>
                <label htmlFor={`slot-${i}`}>{f.label}</label>
                {picked !== null && !disabled && (
                  <button
                    type="button"
                    className="place-button"
                    onClick={() => setField(i, picked)}
                  >
                    Place here <ArrowRight size={13} />
                  </button>
                )}
              </div>
              <select
                id={`slot-${i}`}
                disabled={disabled}
                value={vals[i] ?? ""}
                onChange={(e) =>
                  setField(
                    i,
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
              >
                <option value="">Drop or select an answer…</option>
                {f.options.map((o, j) => (
                  <option key={j} value={j}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="dropdown-fields">
      {q.fields.map((f, i) => (
        <label key={i}>
          <span>{f.label}</span>
          <select
            disabled={disabled}
            value={vals[i] ?? ""}
            onChange={(e) =>
              setField(
                i,
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          >
            <option value="">Select an answer…</option>
            {f.options.map((o, j) => (
              <option key={j} value={j}>
                {o}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
export function QuestionContent({ q }) {
  return (
    <>
      {q.note && (
        <div className="source-note">
          <Info size={18} />
          <span>{q.note}</span>
        </div>
      )}
      {q.caseStudy && (
        <details className="exhibit case">
          <summary>
            <BookOpen size={16} />
            Case study · scenario and requirements <ChevronRight size={16} />
          </summary>
          <StructuredText
            className="prose structured-text"
            text={q.caseStudy}
          />
        </details>
      )}
      <StructuredText
        className="question-prompt structured-text"
        text={q.prompt}
        emphasizeClosingTask
      />
      {q.code && (
        <pre className="code-exhibit">
          <code>{q.code}</code>
        </pre>
      )}
      {q.images.map((src) => (
        <details
          key={src}
          className="exhibit"
          open={(!q.code && codeExhibits.has(q.id)) || undefined}
        >
          <summary>
            <Expand size={16} />
            Original question &amp; code exhibit <span>PDF p. {q.page}</span>
            <ChevronRight size={16} />
          </summary>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            title="Open full-resolution question image"
          >
            <img
              src={src}
              alt={`Original PDF question ${q.id}, including its scenario, code or visual exhibit and answer options`}
            />
          </a>
        </details>
      ))}
    </>
  );
}

function sameKey(first, second) {
  return (
    Array.isArray(first) &&
    Array.isArray(second) &&
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

function communityStatus(q) {
  const source = q.sourceAnswer || "";
  const unclear =
    /WARNING - community\/source answer is not fully clear/i.test(source) ||
    /No clear answer was captured/i.test(source);
  const hasCommunityVote = /Community vote/i.test(source);
  const hasOriginalKey =
    Array.isArray(q.original) && q.original.some((value) => value !== null);
  const agreesWithSelectedKey =
    hasOriginalKey && sameKey(q.original, q.reviewed);

  if (unclear) {
    return {
      tone: "warning",
      label: "Community/source answer needs care",
      message:
        "The supplied PDF marks this answer as unclear, split, missing, or provisional. Compare the guidance before relying on it.",
      icon: AlertTriangle,
    };
  }

  if (hasCommunityVote && agreesWithSelectedKey) {
    return {
      tone: "confirmed",
      label: "Community answer is clear",
      message:
        "The PDF captured one community answer and the selected reviewed key matches it.",
      icon: BadgeCheck,
    };
  }

  return {
    tone: "source",
    label: "Community answer available",
    message:
      "The PDF includes source guidance. It does not contain enough structured evidence to mark it as a confirmed community consensus.",
    icon: Users,
  };
}

function CommunityAnswerCard({ q }) {
  const status = communityStatus(q);
  const Icon = status.icon;
  const source = (
    q.sourceAnswer || "No original community answer was captured in the PDF."
  )
    .replace(
      /WARNING - community\/source answer is not fully clear[\s\S]*/i,
      "",
    )
    .trim();
  return (
    <section className={`evidence-card ${status.tone}`}>
      <div className="evidence-card-heading">
        <span className="evidence-icon">
          <Icon size={19} />
        </span>
        <div>
          <span className="evidence-kicker">
            ORIGINAL PDF COMMUNITY GUIDANCE
          </span>
          <h4>{status.label}</h4>
        </div>
      </div>
      <p className="evidence-summary">{status.message}</p>
      {status.tone === "warning" && (
        <div className="community-warning">
          <AlertTriangle size={16} />
          <span>
            <strong>Warning:</strong> community/source answer is not fully
            clear.
          </span>
        </div>
      )}
      <details className="original-answer">
        <summary>
          Read the original community answer and discussion notes{" "}
          <ChevronRight size={16} />
        </summary>
        <div className="prose">
          {source || "No original community answer was captured in the PDF."}
        </div>
      </details>
    </section>
  );
}

function OpenAIAnswerCard({ q }) {
  if (!q.reviewAnswer) return null;
  const matchesOriginal = sameKey(q.original, q.reviewed);
  return (
    <section className="evidence-card openai">
      <div className="evidence-card-heading">
        <span className="evidence-icon">
          <Bot size={19} />
        </span>
        <div>
          <span className="evidence-kicker">
            INDEPENDENT OPENAI STUDY ANSWER
          </span>
          <h4>OpenAI review</h4>
        </div>
      </div>
      <p className="evidence-summary">{q.reviewAnswer}</p>
      <p className="evidence-explanation">{q.explanation}</p>
      <div className="openai-note">
        <Info size={15} />
        <span>
          {matchesOriginal
            ? "Matches the original PDF key."
            : "Differs from the original PDF key. Your selected scoring basis controls the score."}{" "}
          This is model-generated study guidance, not an official Microsoft
          answer.
        </span>
      </div>
    </section>
  );
}

export function AnswerReview({ q, answer, basis }) {
  const key = q[basis],
    g = grade(q, answer, basis);
  return (
    <div className="answer-review">
      <div className={`review-banner ${g.status}`}>
        <CheckCheck size={19} />
        <strong>
          {g.status === "ungraded"
            ? "Study only · not scored"
            : `${g.earned} / ${g.possible} points`}
        </strong>
        <span>
          {basis === "reviewed" ? "PDF reviewed key" : "Original PDF key"}
        </span>
      </div>
      {key && (
        <div className="answer-comparison">
          {q.fields.length ? (
            q.fields.map((f, i) => (
              <div key={i}>
                <strong>{f.label}</strong>
                <p>
                  Your answer:{" "}
                  <span className={answer?.[i] === key[i] ? "good" : "bad"}>
                    {f.options[answer?.[i]] ?? "Not answered"}
                  </span>
                </p>
                <p>
                  Key:{" "}
                  {key[i] === null
                    ? "Not supplied in PDF · excluded from score"
                    : f.options[key[i]]}
                </p>
              </div>
            ))
          ) : (
            <div>
              <p>
                Your answer:{" "}
                <strong>{answer?.join(", ") || "Not answered"}</strong>
              </p>
              <p>
                Key:{" "}
                <strong>
                  {key
                    .map(
                      (k) => `${k}. ${q.options.find((o) => o.id === k)?.text}`,
                    )
                    .join(" / ")}
                </strong>
              </p>
            </div>
          )}
        </div>
      )}
      {!key && (
        <p className="muted">
          No usable answer key is available for this item under the selected
          scoring basis.
        </p>
      )}
      <section className="answer-evidence" aria-label="Answer evidence">
        <div className="answer-evidence-title">
          <span className="eyebrow">ANSWER EVIDENCE</span>
          <h3>How to read this answer</h3>
        </div>
        <p className="evidence-legend">
          <span className="legend-confirmed">
            Green: clear community answer and matching key
          </span>
          <span className="legend-warning">
            Yellow: community/source answer needs care
          </span>
          <span className="legend-openai">
            Blue: independent OpenAI study answer
          </span>
        </p>
        <CommunityAnswerCard q={q} />
        <OpenAIAnswerCard q={q} />
      </section>
    </div>
  );
}
