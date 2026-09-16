const sentenceEnd = /[.!?]["')\]]?$/;
const headingEnd = /\s[-\u2013\u2014]\s*$/;
const listIntroduction =
  /(?:following|requirements?|actions?|configurations?|issues?|capabilities?|features?|contains?|include|provide)\s*:?$/i;
const closingTask =
  /^(?:what|which|how|why|where|when|who|to what|is|are|do|does|should|for each|select the (?:appropriate|answer)|drag the appropriate)/i;
const embeddedClosingTask =
  /\s(?=(?:What|Which|How|Why|Where|When|Who|To what|Is|Are|Do|Does|Should|For each|Select the (?:appropriate|answer)|Drag the appropriate)\b)/g;
const paragraphTransition =
  /^(?:you need|you must|the solution|company policy|a separate|users? report|to resolve|to address|you are provided)/i;

function cleanLine(line) {
  return line.trim().replace(/\s+/g, " ");
}

function isHeading(line) {
  return line.length <= 80 && headingEnd.test(line);
}

function isListIntroduction(line) {
  return line.endsWith(":") && listIntroduction.test(line);
}

function splitClosingInstruction(line) {
  const taskBoundary = [...line.matchAll(embeddedClosingTask)].at(-1)?.index;
  const sections = taskBoundary
    ? [line.slice(0, taskBoundary), line.slice(taskBoundary + 1)]
    : [line];

  return sections.flatMap((section) => {
    const match = section.match(
      /^(.*?\?)\s+(?=(?:To answer|Each correct|NOTE:|Select |Drag |You may))/i,
    );
    return match ? [match[1], section.slice(match[0].length)] : [section];
  });
}

function logicalLines(text) {
  const output = [];
  let current = "";
  let blankBreak = false;

  const flush = () => {
    if (current) output.push(current);
    current = "";
  };

  const source = String(text || "").replace(/\s*•\s*/g, "\n• ");
  for (const rawLine of source.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    if (!line) {
      // OCR may insert a blank line in the middle of a sentence. Defer the
      // paragraph decision until the next non-empty line is available.
      blankBreak = Boolean(current);
      continue;
    }

    const structural =
      isHeading(line) || isListIntroduction(line) || /^NOTE:|^•\s*/i.test(line);
    const continuesAcrossBlank =
      blankBreak &&
      current &&
      !structural &&
      !isHeading(current) &&
      !isListIntroduction(current) &&
      (!sentenceEnd.test(current) || /^[a-z]/.test(line));

    if (blankBreak && !continuesAcrossBlank) flush();
    blankBreak = false;

    if (
      current &&
      (isHeading(current) ||
        isListIntroduction(current) ||
        /^NOTE:|^•\s*/i.test(current))
    )
      flush();
    if (
      !current ||
      ((!sentenceEnd.test(current) || /^[a-z]/.test(line)) &&
        !current.endsWith(":") &&
        !structural)
    ) {
      current = current ? `${current} ${line}` : line;
      continue;
    }

    flush();
    current = line;
  }

  flush();
  return output.flatMap(splitClosingInstruction).filter(Boolean);
}

export function formatStructuredText(
  text,
  { emphasizeClosingTask = false } = {},
) {
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const line of logicalLines(text)) {
    const task = emphasizeClosingTask && closingTask.test(line);
    const heading = isHeading(line);
    const note = /^NOTE:/i.test(line);
    const bullet = /^•\s*/.test(line);

    if (
      task ||
      heading ||
      note ||
      (list?.items.length && paragraphTransition.test(line))
    )
      flushList();

    if (task) {
      blocks.push({ type: "question", text: line });
    } else if (heading) {
      blocks.push({ type: "heading", text: line.replace(headingEnd, "") });
    } else if (note) {
      blocks.push({ type: "note", text: line });
    } else if (isListIntroduction(line)) {
      flushList();
      list = { type: "list", introduction: line, items: [] };
    } else if (bullet) {
      if (!list) list = { type: "list", introduction: "", items: [] };
      list.items.push(line.replace(/^•\s*/, ""));
    } else if (list) {
      list.items.push(line);
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }

  flushList();
  return blocks;
}
