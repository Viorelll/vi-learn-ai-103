import { useState } from "react";
import { Search, CheckCheck, X } from "lucide-react";
import { typeLabels } from "./engine";
import { selectedEntries } from "./questionGroups";

export default function SessionPicker({ config, catalog, updateConfig }) {
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("all");
  const entries = catalog[config.mode];
  const selected = selectedEntries(config, catalog).map((entry) => entry.id);
  const visible = entries.filter(
    (entry) =>
      (format === "all" || entry.formats.includes(format)) &&
      (!search ||
        `${entry.title} ${entry.description} ${entry.ids.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const updateSelection = (ids, checked) =>
    updateConfig({
      selectionIds: checked
        ? [...new Set([...selected, ...ids])]
        : selected.filter((id) => !ids.includes(id)),
    });
  const count = selectedEntries(config, catalog).reduce(
    (sum, entry) => sum + entry.ids.length,
    0,
  );
  return (
    <section className="session-picker" aria-label="Select session questions">
      <div className="picker-summary">
        <div>
          <strong>
            {config.mode === "unique"
              ? "Pick your questions"
              : "Pick complete groups"}
          </strong>
          <p>
            {config.mode === "unique"
              ? "Standalone questions without repeated scenarios. Each question appears once."
              : config.mode === "cases"
                ? "Each selection includes every available question for the same case study."
                : "The same scenario with different solutions or answer choices. Includes Yes / No solution sets."}
          </p>
        </div>
        <span className="pill">{count} selected</span>
      </div>
      <div className="picker-tools">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search session questions"
            placeholder="Search question numbers or keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter session question format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="all">All answer formats</option>
          {Object.entries(typeLabels)
            .filter(([type]) =>
              entries.some((entry) => entry.formats.includes(type)),
            )
            .map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
        </select>
      </div>
      <div className="picker-actions">
        <button
          className="text-button"
          disabled={!visible.length}
          onClick={() =>
            updateSelection(
              visible.map((entry) => entry.id),
              true,
            )
          }
        >
          <CheckCheck size={15} />
          Select visible
        </button>
        <button
          className="text-button"
          disabled={!selected.length}
          onClick={() => updateConfig({ selectionIds: [] })}
        >
          <X size={15} />
          Clear selection
        </button>
        <small>
          {visible.length} of {entries.length}{" "}
          {config.mode === "unique" ? "questions" : "groups"}
        </small>
      </div>
      <div className="picker-list">
        {visible.map((entry) => (
          <label
            className={`picker-row ${selected.includes(entry.id) ? "picked" : ""}`}
            key={entry.id}
          >
            <input
              type="checkbox"
              aria-label={`Select ${entry.title}`}
              checked={selected.includes(entry.id)}
              onChange={(e) => updateSelection([entry.id], e.target.checked)}
            />
            <span>
              <strong>{entry.title}</strong>
              <span className="picker-description">{entry.description}</span>
              <span className="picker-meta">
                {entry.ids.length > 1 && `Sources: ${entry.ids.join(", ")} · `}
                {entry.formats.map((type) => typeLabels[type]).join(" / ")}
                {entry.ids.length > 1 && ` · ${entry.ids.length} questions`}
              </span>
            </span>
          </label>
        ))}
        {!visible.length && (
          <p className="picker-empty">
            No matches. Try another keyword or answer format.
          </p>
        )}
      </div>
      {!selected.length && (
        <p className="picker-empty" role="status">
          Select at least one question or group to start.
        </p>
      )}
      {config.mode !== "unique" && (
        <p className="picker-note">
          Shuffling changes group order; related questions stay together. Format
          filters show whole groups, without removing their other questions.
        </p>
      )}
      <p className="picker-note">
        All 135 sources reviewed: {catalog.unique.length} unique standalone
        questions, {catalog.cases.length} case study, {catalog.variants.length}{" "}
        shared-question groups. Incomplete sources{" "}
        {catalog.unavailable.join(" and ")} are excluded from these sessions.
      </p>
    </section>
  );
}
