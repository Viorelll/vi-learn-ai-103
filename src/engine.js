export const TOTAL = 135;
export const typeLabels = {
  single: 'Single choice',
  multiple: 'Multiple choice',
  dropdown: 'Dropdown',
  matrix: 'Yes / No',
  matching: 'Drag & match',
  ordering: 'Put in order',
  unavailable: 'Source incomplete'
};
export function shuffled(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function blocks(size, total = TOTAL) {
  return Array.from({
    length: Math.ceil(total / size)
  }, (_, i) => ({
    start: i * size + 1,
    end: Math.min((i + 1) * size, total)
  }));
}
export function selectQuestions(config, random = Math.random) {
  const start = config.mode === 'custom' ? Number(config.start) : config.mode === 'blocks' ? Number(config.block) : 1;
  const end = config.mode === 'custom' ? Number(config.end) : config.mode === 'blocks' ? Math.min(start + Number(config.size) - 1, TOTAL) : TOTAL;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > TOTAL || end < start) throw new Error('Choose a valid range between 1 and 135.');
  let ids = Array.from({
    length: end - start + 1
  }, (_, i) => start + i);
  if (config.mode === 'random') ids = shuffled(ids, random).slice(0, Number(config.size));else if (config.shuffle) ids = shuffled(ids, random);
  return ids;
}
export function keyFor(q, basis) {
  return q[basis] ?? null;
}
export function isAnswered(q, answer) {
  if (q.type === 'unavailable') return false;
  if (q.fields.length) return q.fields.every((_, i) => answer?.[i] !== undefined && answer?.[i] !== null && answer?.[i] !== '');
  return Array.isArray(answer) && answer.length > 0;
}
export function grade(q, answer, basis = 'reviewed') {
  const key = keyFor(q, basis);
  if (!key || !key.some(x => x !== null)) return {
    status: 'ungraded',
    earned: 0,
    possible: 0
  };
  let earned = 0,
    possible = 0;
  if (q.fields.length) {
    key.forEach((value, i) => {
      if (value !== null) {
        possible++;
        if (answer?.[i] === value) earned++;
      }
    });
  } else {
    possible = 1;
    const a = Array.isArray(answer) ? answer : [];
    earned = a.length === key.length && key.every(x => a.includes(x)) ? 1 : 0;
  }
  return {
    status: earned === possible ? 'correct' : earned > 0 ? 'partial' : 'incorrect',
    earned,
    possible
  };
}
export function summarize(questions, answers, basis) {
  const rows = questions.map(q => ({
    id: q.id,
    ...grade(q, answers[q.id], basis)
  }));
  const earned = rows.reduce((s, r) => s + r.earned, 0),
    possible = rows.reduce((s, r) => s + r.possible, 0);
  return {
    rows,
    earned,
    possible,
    percent: possible ? Math.round(100 * earned / possible) : null,
    correct: rows.filter(r => r.status === 'correct').length,
    ungraded: rows.filter(r => r.status === 'ungraded').length
  };
}
export function duration(ms) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).slice(seconds >= 3600 ? 0 : 1).join(':');
}
export function elapsed(session, now = Date.now()) {
  return session.elapsed + (session.runningSince ? Math.max(0, now - session.runningSince) : 0);
}
export function readSaved(key, fallback) {
  try {
    const x = JSON.parse(localStorage.getItem(key));
    return x ?? fallback;
  } catch {
    return fallback;
  }
}
