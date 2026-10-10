"use strict";

const STORAGE_KEY = "index.notes.v1";
const LEGACY_STORAGE_KEYS = ["daymark.notes.v2", "daymark.notes.v1"];
const NOTE_COLORS = ["default", "rose", "amber", "sage", "sky", "lavender"];
const icons = {
  pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15.5 4.75 3.75 3.75-2.5 1.25-.5 4.25-1.5 1.5-3.5-3.5-4.5 4.5-.75-.75 4.5-4.5-3.5-3.5 1.5-1.5 4.25-.5 1.25-2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const appShell = document.getElementById("app-shell");
const searchInput = document.getElementById("search-input");
const clearSearchButton = document.getElementById("clear-search");
const quickNoteInput = document.getElementById("quick-note-input");
const notesList = document.getElementById("notes-list");
const listSummary = document.getElementById("list-summary");
const emptyState = document.getElementById("empty-state");
const emptyTitle = document.getElementById("empty-title");
const emptyDescription = document.getElementById("empty-description");
const emptyAction = document.getElementById("empty-action");
const editorContent = document.getElementById("editor-content");
const editorEmpty = document.getElementById("editor-empty");
const noteBodyInput = document.getElementById("note-body");
const markdownWorkspace = document.getElementById("markdown-workspace");
const markdownPreview = document.getElementById("markdown-preview");
const noteDate = document.getElementById("note-date");
const wordCount = document.getElementById("word-count");
const pinButton = document.getElementById("toggle-pin");
const pinLabel = document.getElementById("pin-label");
const noteColorPicker = document.getElementById("note-color-picker");
const noteColorButton = document.getElementById("note-color-button");
const noteColorMenu = document.getElementById("note-color-options");
const deleteButton = document.getElementById("delete-note");
const saveIndicator = document.getElementById("save-indicator");
const saveIndicatorText = document.getElementById("save-indicator-text");
const localStatus = document.querySelector(".sidebar-footer");
const localStatusTitle = document.getElementById("local-status-title");
const localStatusCaption = document.getElementById("local-status-caption");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const undoDeleteButton = document.getElementById("undo-delete");
let noteDrag = null;

function createStarterNotes() {
  const now = Date.now();
  return [
    {
      id: "welcome-to-index",
      title: "A quieter place to think",
      body: "Welcome to Index — your space for the ideas worth keeping.\n\nWrite a quick note, save a thought for later, or pin something you want to come back to. Everything stays right here on this device.",
      pinned: true,
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "little-things",
      title: "Little things to remember",
      body: "Bring a tote bag\nPick up lemons\nText Maya about Sunday",
      pinned: false,
      createdAt: new Date(now - 25 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 25 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "slower-weekend",
      title: "Ideas for a slower weekend",
      body: "Take the long route to the farmers market.\n\nFind a new place to read. Leave a little room for nothing.",
      pinned: false,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function isNote(value) {
  return value !== null
    && typeof value === "object"
    && !Array.isArray(value)
    && typeof value.id === "string"
    && value.id.length > 0
    && typeof value.title === "string"
    && typeof value.body === "string"
    && typeof value.pinned === "boolean"
    && typeof value.createdAt === "string"
    && Number.isFinite(Date.parse(value.createdAt))
    && typeof value.updatedAt === "string"
    && Number.isFinite(Date.parse(value.updatedAt))
    && (value.color === undefined || NOTE_COLORS.includes(value.color));
}

function readNotes() {
  try {
    const savedNotes = window.localStorage.getItem(STORAGE_KEY);
    if (savedNotes !== null) {
      const parsedNotes = JSON.parse(savedNotes);
      if (!Array.isArray(parsedNotes) || !parsedNotes.every(isNote)) {
        throw new Error("Saved notes have an invalid format.");
      }
      return { notes: parsedNotes, error: null, needsInitialization: false };
    }

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyNotes = window.localStorage.getItem(legacyKey);
      if (legacyNotes === null) {
        continue;
      }
      const parsedLegacyNotes = JSON.parse(legacyNotes);
      if (!Array.isArray(parsedLegacyNotes) || !parsedLegacyNotes.every(isNote)) {
        throw new Error(`Saved notes at ${legacyKey} have an invalid format.`);
      }
      const migratedNotes = legacyKey === "daymark.notes.v1"
        ? parsedLegacyNotes.sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt))
        : parsedLegacyNotes;
      return { notes: migratedNotes, error: null, needsInitialization: true };
    }

    return { notes: createStarterNotes(), error: null, needsInitialization: true };
  } catch (error) {
    console.error("Unable to read Index notes from local storage.", error);
    return {
      notes: createStarterNotes(),
      error: "Saved notes couldn't be read. Changes may not persist until storage is available.",
      needsInitialization: false
    };
  }
}

const initialState = readNotes();
let notes = initialState.notes;
let activeNoteId = notes[0]?.id ?? null;
let currentFilter = "all";
let searchQuery = "";
let persistenceError = initialState.error;
let saveTimer = null;
let toastTimer = null;
let toastHideTimer = null;
let quickNoteBlurTimer = null;
let deletedNoteRecord = null;

function getActiveNote() {
  return notes.find((note) => note.id === activeNoteId) ?? null;
}

function noteContent(note) {
  if (!note.title) {
    return note.body ? `\n${note.body}` : "";
  }
  return note.body ? `${note.title}\n${note.body}` : note.title;
}

function splitNoteContent(content) {
  const normalizedContent = content.replace(/\r\n?/g, "\n");
  const firstLineBreak = normalizedContent.indexOf("\n");
  if (firstLineBreak === -1) {
    return { title: normalizedContent.trim(), body: "" };
  }
  return {
    title: normalizedContent.slice(0, firstLineBreak).trim(),
    body: normalizedContent.slice(firstLineBreak + 1)
  };
}

function normalizeSearchText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function tokenizeSearchText(value) {
  return normalizeSearchText(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

function editDistance(first, second) {
  const distances = Array.from(
    { length: first.length + 1 },
    () => Array(second.length + 1).fill(0)
  );
  for (let firstIndex = 0; firstIndex <= first.length; firstIndex += 1) {
    distances[firstIndex][0] = firstIndex;
  }
  for (let secondIndex = 0; secondIndex <= second.length; secondIndex += 1) {
    distances[0][secondIndex] = secondIndex;
  }

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const substitutionCost = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
      const transpositionCost = firstIndex > 1
        && secondIndex > 1
        && first[firstIndex - 1] === second[secondIndex - 2]
        && first[firstIndex - 2] === second[secondIndex - 1]
        ? distances[firstIndex - 2][secondIndex - 2] + 1
        : Number.POSITIVE_INFINITY;
      distances[firstIndex][secondIndex] = Math.min(
        distances[firstIndex][secondIndex - 1] + 1,
        distances[firstIndex - 1][secondIndex] + 1,
        distances[firstIndex - 1][secondIndex - 1] + substitutionCost,
        transpositionCost
      );
    }
  }
  return distances[first.length][second.length];
}

function tokenMatchScore(queryToken, noteToken) {
  if (queryToken === noteToken) {
    return 1;
  }
  if (queryToken.length <= 2) {
    return 0;
  }
  if (noteToken.includes(queryToken)) {
    return Math.max(0.84, 0.94 - (noteToken.length - queryToken.length) * 0.015);
  }
  if (queryToken.includes(noteToken) && noteToken.length >= 3) {
    return 0.82;
  }

  const maxDistance = queryToken.length <= 5 ? 1 : Math.max(1, Math.floor(queryToken.length * 0.22));
  if (Math.abs(queryToken.length - noteToken.length) > maxDistance) {
    return 0;
  }
  const distance = editDistance(queryToken, noteToken);
  return distance <= maxDistance ? 0.8 - distance * 0.13 : 0;
}

function noteMatchScore(note, queryTokens) {
  const titleTokens = tokenizeSearchText(note.title);
  const bodyTokens = tokenizeSearchText(note.body);
  const scores = queryTokens.map((queryToken) => {
    const titleScore = titleTokens.reduce(
      (best, token) => Math.max(best, tokenMatchScore(queryToken, token)),
      0
    );
    const bodyScore = bodyTokens.reduce(
      (best, token) => Math.max(best, tokenMatchScore(queryToken, token)),
      0
    );
    const bestScore = Math.max(titleScore, bodyScore);
    return bestScore > 0 ? Math.min(1, bestScore + (titleScore > 0 ? 0.08 : 0)) : 0;
  });

  return scores.every((score) => score >= 0.55)
    ? scores.reduce((total, score) => total + score, 0) / scores.length
    : 0;
}

function visibleNotes() {
  const query = searchQuery.trim();
  const queryTokens = tokenizeSearchText(query);
  if (query && queryTokens.length === 0) {
    return [];
  }
  return notes
    .map((note, index) => ({
      note,
      index,
      score: queryTokens.length ? noteMatchScore(note, queryTokens) : 1
    }))
    .filter(({ note, score }) => (currentFilter !== "pinned" || note.pinned) && score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .map(({ note }) => note);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderInlineMarkdown(source) {
  const codeSegments = [];
  let html = escapeHtml(source).replace(/`([^`\n]+)`/g, (match, code) => {
    const index = codeSegments.push(`<code>${code}</code>`) - 1;
    return `\u0000${index}\u0000`;
  });

  html = html
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#)[^)\s]*)\)/gi,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*|__(.+?)__/g, (match, a, b) => `<strong>${a ?? b}</strong>`)
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/==(.+?)==/g, '<mark class="note-highlight">$1</mark>')
    .replace(/(^|[^\w])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, "$1<em>$2</em>");

  return html.replace(/\u0000(\d+)\u0000/g, (match, index) => codeSegments[Number(index)] ?? "");
}

function renderMarkdownBlocks(lines) {
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";
  let quoteLines = [];
  let codeLines = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push(`<${listType}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listType}>`);
      listItems = [];
      listType = "";
    }
  };
  const flushQuote = () => {
    if (quoteLines.length) {
      blocks.push(`<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`);
      quoteLines = [];
    }
  };
  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  lines.forEach((line, lineIndex) => {
    if (codeLines !== null) {
      if (/^\s*```/.test(line)) {
        blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      return;
    }

    if (/^\s*```/.test(line)) {
      flushTextBlocks();
      codeLines = [];
      return;
    }
    if (!line.trim()) {
      flushTextBlocks();
      return;
    }

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flushTextBlocks();
      const level = line.match(/^#+/)[0].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[1])}</h${level}>`);
      return;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushTextBlocks();
      blocks.push("<hr>");
      return;
    }

    const taskItem = line.match(/^\s*[-+*]\s+\[([ xX])\]\s+(.*)$/);
    const unorderedItem = line.match(/^\s*[-+*]\s+(.+)$/);
    const orderedItem = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (taskItem || unorderedItem || orderedItem) {
      flushParagraph();
      flushQuote();
      const nextListType = unorderedItem || taskItem ? "ul" : "ol";
      if (listType && listType !== nextListType) {
        flushList();
      }
      listType = nextListType;
      if (taskItem) {
        const checked = taskItem[1].toLowerCase() === "x";
        listItems.push(`<span class="task-list-item"><input type="checkbox" data-task-line="${lineIndex + 1}"${checked ? " checked" : ""} aria-label="${checked ? "Completed" : "Incomplete"} task">${renderInlineMarkdown(taskItem[2])}</span>`);
      } else {
        listItems.push(renderInlineMarkdown((unorderedItem ?? orderedItem)[1]));
      }
      return;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      return;
    }

    flushQuote();
    flushList();
    paragraph.push(line);
  });

  flushTextBlocks();
  if (codeLines !== null) {
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  return blocks.join("\n");
}

function renderMarkdownPreview(content) {
  const [firstLine = "", ...bodyLines] = content.replace(/\r\n?/g, "\n").split("\n");
  const title = firstLine.trim().replace(/^#{1,6}\s+/, "");
  const titleHtml = title ? `<h1 class="rendered-note-title">${renderInlineMarkdown(title)}</h1>` : "";
  const bodyHtml = renderMarkdownBlocks(bodyLines);
  markdownPreview.innerHTML = titleHtml + bodyHtml || '<p class="markdown-empty">Nothing to preview yet.</p>';
}

function formatShortDate(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatFullDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function updatePersistenceStatus(state = "saved") {
  const hasError = Boolean(persistenceError);
  localStatus.classList.toggle("is-error", hasError);
  saveIndicator.classList.toggle("is-error", hasError);

  if (hasError) {
    localStatusTitle.textContent = "Storage needs attention";
    localStatusCaption.textContent = persistenceError;
    saveIndicatorText.textContent = "Not saved";
    saveIndicator.title = persistenceError;
    return;
  }

  localStatusTitle.textContent = state === "saving" ? "Saving changes..." : "Saved on this device";
  localStatusCaption.textContent = state === "saving" ? "Keeping your latest edits." : "Your notes stay yours.";
  saveIndicatorText.textContent = state === "saving" ? "Saving..." : "Saved";
  saveIndicator.title = "Your notes are saved on this device.";
}

function persistNotes() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    persistenceError = null;
    updatePersistenceStatus();
    return true;
  } catch (error) {
    console.error("Unable to save Index notes to local storage.", error);
    persistenceError = "Changes are only available in this tab until storage is available.";
    updatePersistenceStatus();
    return false;
  }
}

function scheduleSave() {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
  }
  updatePersistenceStatus("saving");
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    persistNotes();
  }, 350);
}

function setFilter(filter) {
  currentFilter = filter;
  renderFilters();
  renderNotesList();
}

function renderFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const pinnedCount = notes.filter((note) => note.pinned).length;
  document.querySelectorAll(".count-all").forEach((count) => {
    count.textContent = String(notes.length);
  });
  document.querySelectorAll(".count-pinned").forEach((count) => {
    count.textContent = String(pinnedCount);
  });
}

function renderEmptyState() {
  if (searchQuery.trim()) {
    emptyTitle.textContent = "No notes found";
    emptyDescription.textContent = "Try a different search, or clear your filters.";
    emptyAction.textContent = "Clear search";
    return;
  }

  if (currentFilter === "pinned" && notes.some((note) => note.pinned)) {
    emptyTitle.textContent = "No matching pinned notes";
    emptyDescription.textContent = "Try a different search to find a pinned note.";
    emptyAction.textContent = "Clear search";
    return;
  }

  if (currentFilter === "pinned") {
    emptyTitle.textContent = "Nothing pinned yet";
    emptyDescription.textContent = "Pin notes you want to come back to quickly.";
    emptyAction.textContent = "Create a note";
    return;
  }

  emptyTitle.textContent = "Your space is clear";
  emptyDescription.textContent = "Start with a thought. You can always find it here.";
  emptyAction.textContent = "Create your first note";
}

function renderNotesList() {
  const matchingNotes = visibleNotes();
  notesList.replaceChildren();
  notesList.hidden = matchingNotes.length === 0;
  emptyState.hidden = matchingNotes.length !== 0;
  listSummary.textContent = `${matchingNotes.length} ${matchingNotes.length === 1 ? "note" : "notes"}`;

  if (matchingNotes.length === 0) {
    renderEmptyState();
    return;
  }

  const fragment = document.createDocumentFragment();
  matchingNotes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-list-item";
    item.dataset.noteItemId = note.id;

    const card = document.createElement("div");
    card.className = "note-card";
    const color = NOTE_COLORS.includes(note.color) ? note.color : "default";
    card.classList.add(`note-color-${color}`);
    card.classList.toggle("is-selected", note.id === activeNoteId);
    card.dataset.noteId = note.id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-current", String(note.id === activeNoteId));

    const heading = document.createElement("div");
    heading.className = "note-card-heading";
    const title = document.createElement("h2");
    title.className = "note-card-title";
    if (note.pinned) {
      const pin = document.createElement("span");
      pin.className = "note-card-pin";
      pin.innerHTML = icons.pin;
      title.append(pin);
    }
    title.append(document.createTextNode(note.title.trim() || "Untitled note"));

    const date = document.createElement("time");
    date.className = "note-card-date";
    date.dateTime = note.updatedAt;
    date.textContent = formatShortDate(note.updatedAt);
    heading.append(title, date);

    const preview = document.createElement("p");
    preview.className = "note-card-preview";
    const plainText = note.body.replace(/\s+/g, " ").trim();
    preview.textContent = plainText
      ? (plainText.length > 105 ? `${plainText.slice(0, 105).trimEnd()}...` : plainText)
      : "No additional text";

    card.append(heading, preview);

    const controls = document.createElement("div");
    controls.className = "note-card-move-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `Reorder ${note.title.trim() || "Untitled note"}`);
    const noteIndex = matchingNotes.indexOf(note);
    const dragHandle = document.createElement("button");
    dragHandle.className = "move-note-button drag-note-handle";
    dragHandle.type = "button";
    dragHandle.dataset.dragNoteId = note.id;
    dragHandle.setAttribute("aria-label", `Drag ${note.title.trim() || "Untitled note"} to reorder`);
    dragHandle.title = "Drag to reorder";
    dragHandle.innerHTML = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="5" cy="4" r="1"/><circle cx="11" cy="4" r="1"/><circle cx="5" cy="8" r="1"/><circle cx="11" cy="8" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="11" cy="12" r="1"/></svg>';
    controls.append(dragHandle);

    [
      { direction: "up", disabled: noteIndex === 0, path: "m6 14 6-6 6 6" },
      { direction: "down", disabled: noteIndex === matchingNotes.length - 1, path: "m6 10 6 6 6-6" }
    ].forEach(({ direction, disabled, path }) => {
      const moveButton = document.createElement("button");
      moveButton.className = "move-note-button";
      moveButton.type = "button";
      moveButton.dataset.moveNoteId = note.id;
      moveButton.dataset.direction = direction;
      moveButton.disabled = disabled;
      moveButton.setAttribute("aria-label", `Move ${note.title.trim() || "Untitled note"} ${direction}`);
      moveButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${path}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      controls.append(moveButton);
    });

    item.append(card, controls);
    fragment.append(item);
  });

  notesList.append(fragment);
}

function updateWordCount() {
  const words = noteBodyInput.value.trim().match(/\S+/g)?.length ?? 0;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function renderEditor() {
  const note = getActiveNote();
  editorContent.hidden = note === null;
  editorEmpty.hidden = note !== null;
  pinButton.disabled = note === null;
  noteColorButton.disabled = note === null;
  deleteButton.disabled = note === null;
  noteColorMenu.hidden = true;
  noteColorButton.setAttribute("aria-expanded", "false");

  if (!note) {
    pinButton.classList.remove("is-pinned");
    pinButton.setAttribute("aria-pressed", "false");
    return;
  }

  const color = NOTE_COLORS.includes(note.color) ? note.color : "default";
  editorContent.classList.remove(...NOTE_COLORS.map((value) => `note-color-${value}`));
  editorContent.classList.add(`note-color-${color}`);
  const colorIndicator = noteColorButton.querySelector(".note-color-indicator");
  colorIndicator.classList.remove(...NOTE_COLORS.map((value) => `note-color-swatch-${value}`));
  colorIndicator.classList.add(`note-color-swatch-${color}`);
  document.querySelectorAll("[data-note-color]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.noteColor === color));
  });

  if (document.activeElement !== noteBodyInput) {
    noteBodyInput.value = noteContent(note);
  }

  noteDate.dateTime = note.updatedAt;
  noteDate.textContent = `Edited ${formatShortDate(note.updatedAt).toLocaleLowerCase()}`;
  pinButton.classList.toggle("is-pinned", note.pinned);
  pinButton.setAttribute("aria-pressed", String(note.pinned));
  pinLabel.textContent = note.pinned ? "Pinned" : "Pin";
  updateWordCount();
  renderMarkdownPreview(noteBodyInput.value);
}

function render() {
  renderFilters();
  renderNotesList();
  renderEditor();
  updatePersistenceStatus(persistenceError ? "saved" : undefined);
}

function wrapSelectedText(marker) {
  const start = noteBodyInput.selectionStart;
  const end = noteBodyInput.selectionEnd;
  const selectedText = noteBodyInput.value.slice(start, end);
  const replacement = `${marker}${selectedText}${marker}`;
  noteBodyInput.setRangeText(replacement, start, end, "end");
  if (!selectedText) {
    noteBodyInput.setSelectionRange(start + marker.length, start + marker.length);
  } else {
    noteBodyInput.setSelectionRange(start + marker.length, start + marker.length + selectedText.length);
  }
  noteBodyInput.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyLineFormatting(action) {
  let value = noteBodyInput.value;
  let selectionStart = noteBodyInput.selectionStart;
  let selectionEnd = noteBodyInput.selectionEnd;
  const currentLineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  if (selectionStart === selectionEnd && currentLineStart === 0) {
    const titleBreak = value.indexOf("\n");
    if (titleBreak === -1) {
      value += "\n";
      noteBodyInput.value = value;
      selectionStart = value.length;
    } else {
      selectionStart = titleBreak + 1;
    }
    selectionEnd = selectionStart;
  }
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineBreak = value.indexOf("\n", selectionEnd);
  const lineEnd = lineBreak === -1 ? value.length : lineBreak;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const rules = {
    "heading-1": {
      prefix: "# ",
      pattern: /^\s*#(?!#)\s+/,
      strip: /^\s*#{1,6}\s+/
    },
    "heading-2": {
      prefix: "## ",
      pattern: /^\s*##\s+/,
      strip: /^\s*#{1,6}\s+/
    },
    "heading-3": {
      prefix: "### ",
      pattern: /^\s*###\s+/,
      strip: /^\s*#{1,6}\s+/
    },
    "unordered-list": {
      prefix: "- ",
      pattern: /^\s*[-+*]\s+(?:\[[ xX]\]\s+)?/,
      strip: /^\s*(?:[-+*]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/
    },
    "ordered-list": {
      prefix: null,
      pattern: /^\s*\d+[.)]\s+/,
      strip: /^\s*(?:[-+*]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/
    },
    "task-list": {
      prefix: "- [ ] ",
      pattern: /^\s*[-+*]\s+\[[ xX]\]\s+/,
      strip: /^\s*(?:[-+*]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/
    }
  };
  const { prefix, pattern, strip } = rules[action];
  const eligibleLines = lines.filter((line, index) => (
    (line.trim() || lines.length === 1) && !(lineStart === 0 && index === 0)
  ));
  if (!eligibleLines.length) {
    noteBodyInput.focus({ preventScroll: true });
    return;
  }

  const removeFormatting = eligibleLines.every((line) => pattern.test(line));
  let orderedIndex = 0;
  const replacement = lines.map((line, index) => {
    if (!line.trim() && lines.length > 1) {
      return line;
    }
    if (lineStart === 0 && index === 0) {
      return line;
    }
    if (removeFormatting) {
      return line.replace(pattern, "");
    }

    const content = line.replace(strip, "");
    if (action === "ordered-list") {
      orderedIndex += 1;
      return `${orderedIndex}. ${content}`;
    }
    return `${prefix}${content}`;
  }).join("\n");

  noteBodyInput.setRangeText(replacement, lineStart, lineEnd, "select");
  if (selectionStart === selectionEnd) {
    const firstLine = replacement.split("\n")[0];
    const insertedPrefix = firstLine.match(/^(?:#{1,6}\s+|[-+*]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/)?.[0].length ?? 0;
    const caret = lineStart + insertedPrefix;
    noteBodyInput.setSelectionRange(caret, caret);
  }
  noteBodyInput.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertLink() {
  const start = noteBodyInput.selectionStart;
  const end = noteBodyInput.selectionEnd;
  const selectedText = noteBodyInput.value.slice(start, end);
  const label = selectedText || "link";
  const replacement = `[${label}](https://example.com)`;
  const urlStart = start + label.length + 3;
  const urlEnd = urlStart + "https://example.com".length;
  noteBodyInput.setRangeText(replacement, start, end, "end");
  noteBodyInput.setSelectionRange(urlStart, urlEnd);
  noteBodyInput.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyMarkdownAction(action) {
  if (action === "link") {
    insertLink();
    return;
  }
  applyLineFormatting(action);
}

function setEditorView(view) {
  markdownWorkspace.dataset.mode = view;
  editorContent.dataset.editorMode = view;
  document.querySelectorAll("[data-editor-view]").forEach((button) => {
    const isActive = button.dataset.editorView === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function showToast(message, actionLabel = "") {
  if (toastTimer !== null) {
    window.clearTimeout(toastTimer);
  }
  if (toastHideTimer !== null) {
    window.clearTimeout(toastHideTimer);
    toastHideTimer = null;
  }

  toastMessage.textContent = message;
  undoDeleteButton.hidden = !actionLabel;
  undoDeleteButton.textContent = actionLabel;
  toast.hidden = false;
  window.requestAnimationFrame(() => toast.classList.add("is-visible"));
  toastTimer = window.setTimeout(hideToast, 4500);
}

function hideToast() {
  if (toastTimer !== null) {
    window.clearTimeout(toastTimer);
    toastTimer = null;
  }
  toast.classList.remove("is-visible");
  toastHideTimer = window.setTimeout(() => {
    toast.hidden = true;
    toastHideTimer = null;
  }, 190);
}

function createNoteRecord(content) {
  const now = new Date().toISOString();
  const id = typeof window.crypto?.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const parsedContent = splitNoteContent(content);
  return {
    id,
    title: parsedContent.title,
    body: parsedContent.body,
    pinned: false,
    color: "default",
    createdAt: now,
    updatedAt: now
  };
}

function submitQuickNote() {
  const content = quickNoteInput.value.replace(/\s+$/, "");
  if (!content.trim()) {
    return false;
  }

  notes.unshift(createNoteRecord(content));
  quickNoteInput.value = "";
  render();
  persistNotes();
  return true;
}

function createNote(content = "") {
  const note = createNoteRecord(content);
  notes.unshift(note);
  activeNoteId = note.id;
  currentFilter = "all";
  searchQuery = "";
  searchInput.value = "";
  clearSearchButton.hidden = true;
  appShell.dataset.view = "editor";
  render();
  persistNotes();
  window.requestAnimationFrame(() => noteBodyInput.focus());
}

function selectNote(noteId) {
  if (!notes.some((note) => note.id === noteId)) {
    return;
  }
  activeNoteId = noteId;
  if (isMobileViewport()) {
    appShell.dataset.view = "editor";
  }
  render();
}

function moveNote(noteId, direction) {
  const matchingNotes = visibleNotes();
  const visibleIndex = matchingNotes.findIndex((note) => note.id === noteId);
  const targetNote = matchingNotes[visibleIndex + (direction === "up" ? -1 : 1)];
  if (visibleIndex === -1 || !targetNote) {
    return;
  }

  const sourceIndex = notes.findIndex((note) => note.id === noteId);
  const targetIndex = notes.findIndex((note) => note.id === targetNote.id);
  [notes[sourceIndex], notes[targetIndex]] = [notes[targetIndex], notes[sourceIndex]];
  renderNotesList();
  persistNotes();
}

function reorderNote(sourceId, targetId, position = "before") {
  const sourceIndex = notes.findIndex((note) => note.id === sourceId);
  if (sourceIndex === -1 || !notes.some((note) => note.id === targetId) || sourceId === targetId) {
    return;
  }

  const [note] = notes.splice(sourceIndex, 1);
  const targetIndex = notes.findIndex((item) => item.id === targetId);
  const insertionIndex = targetIndex + (position === "after" ? 1 : 0);
  if (insertionIndex === sourceIndex) {
    notes.splice(sourceIndex, 0, note);
    return;
  }
  notes.splice(insertionIndex, 0, note);
  renderNotesList();
  persistNotes();
}

function deleteActiveNote() {
  const index = notes.findIndex((note) => note.id === activeNoteId);
  if (index === -1) {
    return;
  }

  const [deletedNote] = notes.splice(index, 1);
  deletedNoteRecord = { note: deletedNote, index };
  activeNoteId = visibleNotes()[0]?.id ?? null;
  render();
  persistNotes();
  showToast("Note deleted", "Undo");
}

function undoDelete() {
  if (!deletedNoteRecord) {
    return;
  }
  if (notes.some((note) => note.id === deletedNoteRecord.note.id)) {
    console.error("Unable to restore deleted note because its ID is already in use.");
    showToast("This note could not be restored.");
    deletedNoteRecord = null;
    return;
  }

  const { note, index } = deletedNoteRecord;
  notes.splice(Math.min(index, notes.length), 0, note);
  activeNoteId = note.id;
  currentFilter = "all";
  searchQuery = "";
  searchInput.value = "";
  clearSearchButton.hidden = true;
  deletedNoteRecord = null;
  if (isMobileViewport()) {
    appShell.dataset.view = "editor";
  }
  render();
  persistNotes();
  hideToast();
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

document.getElementById("create-from-empty").addEventListener("click", createNote);

notesList.addEventListener("click", (event) => {
  const moveButton = event.target.closest("[data-move-note-id]");
  if (moveButton) {
    moveNote(moveButton.dataset.moveNoteId, moveButton.dataset.direction);
    return;
  }
  const card = event.target.closest("[data-note-id]");
  const selection = window.getSelection();
  if (card && !selection?.toString().trim()) {
    selectNote(card.dataset.noteId);
  }
});

notesList.addEventListener("keydown", (event) => {
  const card = event.target.closest('[data-note-id][role="button"]');
  if (!card || (event.key !== "Enter" && event.key !== " ")) {
    return;
  }
  event.preventDefault();
  selectNote(card.dataset.noteId);
});

function clearNoteDrag() {
  noteDrag?.item.classList.remove("is-dragging");
  notesList.querySelectorAll(".is-drop-before, .is-drop-after").forEach((item) => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
  noteDrag = null;
}

notesList.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-drag-note-id]");
  const item = handle?.closest("[data-note-item-id]");
  if (!handle || !item || event.button !== 0) {
    return;
  }
  noteDrag = {
    handle,
    item,
    pointerId: event.pointerId,
    noteId: item.dataset.noteItemId,
    startX: event.clientX,
    startY: event.clientY,
    active: false,
    targetId: null,
    position: "before"
  };
  handle.setPointerCapture(event.pointerId);
});

notesList.addEventListener("pointermove", (event) => {
  if (!noteDrag || event.pointerId !== noteDrag.pointerId) {
    return;
  }
  if (!noteDrag.active && Math.hypot(event.clientX - noteDrag.startX, event.clientY - noteDrag.startY) < 6) {
    return;
  }
  noteDrag.active = true;
  noteDrag.item.classList.add("is-dragging");
  event.preventDefault();

  const scrollBounds = notesList.parentElement.getBoundingClientRect();
  const scrollEdge = 42;
  if (event.clientY < scrollBounds.top + scrollEdge) {
    notesList.parentElement.scrollTop -= Math.ceil((scrollBounds.top + scrollEdge - event.clientY) / 4);
  } else if (event.clientY > scrollBounds.bottom - scrollEdge) {
    notesList.parentElement.scrollTop += Math.ceil((event.clientY - (scrollBounds.bottom - scrollEdge)) / 4);
  }

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-note-item-id]");
  notesList.querySelectorAll(".is-drop-before, .is-drop-after").forEach((item) => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
  if (!target || target.dataset.noteItemId === noteDrag.noteId) {
    noteDrag.targetId = null;
    return;
  }

  const bounds = target.getBoundingClientRect();
  noteDrag.targetId = target.dataset.noteItemId;
  noteDrag.position = event.clientY > bounds.top + bounds.height / 2 ? "after" : "before";
  target.classList.add(noteDrag.position === "after" ? "is-drop-after" : "is-drop-before");
});

notesList.addEventListener("pointerup", (event) => {
  if (!noteDrag || event.pointerId !== noteDrag.pointerId) {
    return;
  }
  const { noteId, targetId, position, active } = noteDrag;
  clearNoteDrag();
  if (active && targetId) {
    reorderNote(noteId, targetId, position);
  }
});

notesList.addEventListener("pointercancel", clearNoteDrag);

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  clearSearchButton.hidden = searchQuery.length === 0;
  renderNotesList();
});

document.querySelectorAll("[data-markdown-wrap]").forEach((button) => {
  button.addEventListener("click", () => wrapSelectedText(button.dataset.markdownWrap));
});

document.querySelectorAll("[data-markdown-action]").forEach((button) => {
  button.addEventListener("click", () => applyMarkdownAction(button.dataset.markdownAction));
});

document.querySelectorAll("[data-editor-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setEditorView(button.dataset.editorView);
    if (button.dataset.editorView === "write") {
      noteBodyInput.focus({ preventScroll: true });
    }
  });
});

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  clearSearchButton.hidden = true;
  renderNotesList();
  searchInput.focus();
});

emptyAction.addEventListener("click", () => {
  if (searchQuery.trim()) {
    searchInput.value = "";
    searchQuery = "";
    clearSearchButton.hidden = true;
    currentFilter = "all";
    render();
    searchInput.focus();
    return;
  }
  createNote();
});

noteBodyInput.addEventListener("input", () => {
  const note = getActiveNote();
  if (!note) {
    return;
  }
  Object.assign(note, splitNoteContent(noteBodyInput.value));
  note.updatedAt = new Date().toISOString();
  renderNotesList();
  renderEditor();
  scheduleSave();
});

markdownPreview.addEventListener("change", (event) => {
  const checkbox = event.target.closest("input[data-task-line]");
  if (!checkbox) {
    return;
  }

  const lineIndex = Number(checkbox.dataset.taskLine);
  const lines = noteBodyInput.value.replace(/\r\n?/g, "\n").split("\n");
  const task = lines[lineIndex]?.match(/^(\s*[-+*]\s+\[)([ xX])(\]\s+.*)$/);
  if (!Number.isInteger(lineIndex) || !task) {
    console.error("Unable to update the selected Markdown checklist item.");
    renderMarkdownPreview(noteBodyInput.value);
    return;
  }

  lines[lineIndex] = `${task[1]}${checkbox.checked ? "x" : " "}${task[3]}`;
  noteBodyInput.value = lines.join("\n");
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
  markdownPreview.querySelector(`[data-task-line="${lineIndex}"]`)?.focus({ preventScroll: true });
});

quickNoteInput.addEventListener("focus", () => {
  if (quickNoteBlurTimer !== null) {
    window.clearTimeout(quickNoteBlurTimer);
    quickNoteBlurTimer = null;
  }
});

quickNoteInput.addEventListener("blur", () => {
  if (quickNoteBlurTimer !== null) {
    window.clearTimeout(quickNoteBlurTimer);
  }
  quickNoteBlurTimer = window.setTimeout(() => {
    quickNoteBlurTimer = null;
    submitQuickNote();
  }, 0);
});

pinButton.addEventListener("click", () => {
  const note = getActiveNote();
  if (!note) {
    return;
  }
  note.pinned = !note.pinned;
  render();
  persistNotes();
});

noteColorButton.addEventListener("click", () => {
  if (noteColorButton.disabled) {
    return;
  }
  noteColorMenu.hidden = !noteColorMenu.hidden;
  noteColorButton.setAttribute("aria-expanded", String(!noteColorMenu.hidden));
});

noteColorMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-note-color]");
  const note = getActiveNote();
  if (!option || !note || !NOTE_COLORS.includes(option.dataset.noteColor)) {
    return;
  }
  note.color = option.dataset.noteColor;
  noteColorMenu.hidden = true;
  noteColorButton.setAttribute("aria-expanded", "false");
  render();
  persistNotes();
  noteColorButton.focus({ preventScroll: true });
});

document.addEventListener("click", (event) => {
  if (!noteColorPicker.contains(event.target)) {
    noteColorMenu.hidden = true;
    noteColorButton.setAttribute("aria-expanded", "false");
  }
});

deleteButton.addEventListener("click", deleteActiveNote);
undoDeleteButton.addEventListener("click", undoDelete);
document.getElementById("dismiss-toast").addEventListener("click", hideToast);
document.getElementById("back-to-notes").addEventListener("click", () => {
  appShell.dataset.view = "list";
  searchInput.focus({ preventScroll: true });
});

window.addEventListener("keydown", (event) => {
  const isShortcut = event.metaKey || event.ctrlKey;
  const key = event.key.toLocaleLowerCase();

  if (isShortcut && key === "n") {
    event.preventDefault();
    createNote();
    return;
  }
  if (isShortcut && key === "k") {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }
  if (event.key === "Escape" && !noteColorMenu.hidden) {
    noteColorMenu.hidden = true;
    noteColorButton.setAttribute("aria-expanded", "false");
    noteColorButton.focus({ preventScroll: true });
    return;
  }
  if (event.key === "Escape" && isMobileViewport() && appShell.dataset.view === "editor") {
    appShell.dataset.view = "list";
  }
});

window.addEventListener("pagehide", () => {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
    persistNotes();
  }
});

if (initialState.needsInitialization) {
  persistNotes();
}
render();
