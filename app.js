"use strict";

const STORAGE_KEY = "index.notes.v1";
const LEGACY_STORAGE_KEYS = ["daymark.notes.v2", "daymark.notes.v1"];
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
const noteBodyEditor = document.getElementById("note-body-editor");
const noteBodyInput = document.getElementById("note-body");
const noteDate = document.getElementById("note-date");
const wordCount = document.getElementById("word-count");
const pinButton = document.getElementById("toggle-pin");
const pinLabel = document.getElementById("pin-label");
const deleteButton = document.getElementById("delete-note");
const localStatus = document.querySelector(".sidebar-footer");
const localStatusTitle = document.getElementById("local-status-title");
const localStatusCaption = document.getElementById("local-status-caption");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const undoDeleteButton = document.getElementById("undo-delete");
let noteDrag = null;
let noteDragTimer = null;
let noteClickTimer = null;
let suppressNoteClick = false;

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
    && Number.isFinite(Date.parse(value.updatedAt));
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
let currentNotesLayout = "list";
let searchQuery = "";
let persistenceError = initialState.error;
let saveTimer = null;
let toastTimer = null;
let toastHideTimer = null;
let quickNoteBlurTimer = null;
let deletedNoteRecord = null;
let renderedNoteId = null;
let isMarkdownComposing = false;

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

function renderMarkdownSourceInline(source) {
  const fragments = [];
  const stash = (markup) => {
    const token = `\uE000${fragments.length}\uE001`;
    fragments.push(markup);
    return token;
  };
  const symbol = (value) => `<span class="markdown-source-symbol">${escapeHtml(value)}</span>`;
  let html = escapeHtml(source);

  html = html
    .replace(/`([^`\n]+)`/g, (match, code) => stash(`${symbol("`")}<code>${code}</code>${symbol("`")}`))
    .replace(/(\*\*|__)(.+?)\1/g, (match, marker, text) => stash(`${symbol(marker)}<strong>${text}</strong>${symbol(marker)}`))
    .replace(/~~(.+?)~~/g, (match, text) => stash(`${symbol("~~")}<del>${text}</del>${symbol("~~")}`))
    .replace(/==(.+?)==/g, (match, text) => stash(`${symbol("==")}<mark>${text}</mark>${symbol("==")}`))
    .replace(/(^|[^\w])\*([^*\n]+)\*(?!\*)/g, (match, before, text) => `${before}${stash(`${symbol("*")}<em>${text}</em>${symbol("*")}`)}`)
    .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, (match, before, text) => `${before}${stash(`${symbol("_")}<em>${text}</em>${symbol("_")}`)}`)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#)[^)\s]*)\)/gi,
      (match, label, url) => stash(`${symbol("[")}${label}${symbol("](")}<span class="markdown-source-url">${url}</span>${symbol(")")}`));

  const tokenPattern = /\uE000(\d+)\uE001/g;
  for (let pass = 0; pass <= fragments.length; pass += 1) {
    let hasTokens = false;
    html = html.replace(tokenPattern, (match, index) => {
      hasTokens = true;
      return fragments[Number(index)] ?? match;
    });
    if (!hasTokens) {
      break;
    }
  }
  return html;
}

function renderMarkdownSource(content) {
  let insideCodeBlock = false;
  const sourceLines = content.replace(/\r\n?/g, "\n").split("\n");
  return sourceLines.map((line) => {
    if (/^\s*```/.test(line)) {
      insideCodeBlock = !insideCodeBlock;
      return `<span class="markdown-source-symbol markdown-source-fence">${escapeHtml(line)}</span>`;
    }
    if (insideCodeBlock) {
      return `<span class="markdown-source-code-block">${escapeHtml(line)}</span>`;
    }

    const heading = line.match(/^(\s*#{1,6}\s+)(.*)$/);
    if (heading) {
      const level = heading[1].match(/#/g).length;
      return `<span class="markdown-source-symbol">${escapeHtml(heading[1])}</span><span class="markdown-source-heading markdown-source-heading-${level}">${renderMarkdownSourceInline(heading[2])}</span>`;
    }

    const quote = line.match(/^(\s*>\s?)(.*)$/);
    if (quote) {
      return `<span class="markdown-source-symbol">${escapeHtml(quote[1])}</span><span class="markdown-source-quote">${renderMarkdownSourceInline(quote[2])}</span>`;
    }

    const listPrefix = line.match(/^(\s*(?:[-+*]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+|>\s?))(.*)$/);
    if (listPrefix) {
      return `<span class="markdown-source-symbol">${escapeHtml(listPrefix[1])}</span><span class="markdown-source-list-item">${renderMarkdownSourceInline(listPrefix[2])}</span>`;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
      return `<span class="markdown-source-symbol markdown-source-rule">${escapeHtml(line)}</span>`;
    }
    return renderMarkdownSourceInline(line);
  }).join('<br data-markdown-break="">');
}

function readEditableMarkdown(root) {
  if (
    root.childNodes.length === 1
    && root.firstChild.nodeName === "BR"
    && !root.firstChild.hasAttribute("data-markdown-break")
  ) {
    return "";
  }

  let content = "";
  const appendNode = (node, hasNextSibling = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      content += node.nodeValue;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    if (node.nodeName === "BR") {
      const parent = node.parentElement;
      const emptyBlockPlaceholder = parent
        && ["DIV", "P"].includes(parent.nodeName)
        && parent.childNodes.length === 1
        && !node.hasAttribute("data-markdown-break");
      if (!emptyBlockPlaceholder) {
        content += "\n";
      }
      return;
    }

    const isBlock = ["DIV", "P"].includes(node.nodeName);
    const children = Array.from(node.childNodes);
    const emptyBlockPlaceholder = isBlock
      && children.length === 1
      && children[0].nodeName === "BR"
      && !children[0].hasAttribute("data-markdown-break");

    if (isBlock && content.length > 0 && !content.endsWith("\n")) {
      content += "\n";
    }
    children.forEach((child, index) => appendNode(child, index < children.length - 1));
    if (emptyBlockPlaceholder && hasNextSibling) {
      content += "\n";
    }
  };

  Array.from(root.childNodes).forEach((child, index, children) => {
    appendNode(child, index < children.length - 1);
  });
  return content.replace(/\r\n?/g, "\n");
}

function getEditableTextOffset(root, node, offset) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return readEditableMarkdown(range.cloneContents()).length;
}

function getMarkdownEditorSelection() {
  const selection = window.getSelection();
  if (!selection?.anchorNode || !selection.focusNode
    || !noteBodyEditor.contains(selection.anchorNode)
    || !noteBodyEditor.contains(selection.focusNode)) {
    return {
      start: noteBodyInput.selectionStart,
      end: noteBodyInput.selectionEnd,
      direction: noteBodyInput.selectionDirection
    };
  }

  const anchor = getEditableTextOffset(noteBodyEditor, selection.anchorNode, selection.anchorOffset);
  const focus = getEditableTextOffset(noteBodyEditor, selection.focusNode, selection.focusOffset);
  return {
    start: Math.min(anchor, focus),
    end: Math.max(anchor, focus),
    direction: anchor > focus ? "backward" : "forward"
  };
}

function syncMarkdownSelectionToInput() {
  const selection = window.getSelection();
  if (!selection?.anchorNode || !selection.focusNode
    || !noteBodyEditor.contains(selection.anchorNode)
    || !noteBodyEditor.contains(selection.focusNode)) {
    return;
  }
  const offsets = getMarkdownEditorSelection();
  noteBodyInput.setSelectionRange(offsets.start, offsets.end, offsets.direction);
}

function findEditablePoint(root, targetOffset) {
  let textOffset = 0;
  let point = null;
  const visit = (node) => {
    if (point) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      if (targetOffset <= textOffset + node.nodeValue.length) {
        point = { node, offset: targetOffset - textOffset };
        return;
      }
      textOffset += node.nodeValue.length;
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
      const parent = node.parentNode;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);
      if (targetOffset === textOffset) {
        point = { node: parent, offset: index };
        return;
      }
      textOffset += 1;
      if (targetOffset === textOffset) {
        point = { node: parent, offset: index + 1 };
      }
      return;
    }
    for (const child of node.childNodes ?? []) {
      visit(child);
      if (point) {
        return;
      }
    }
  };

  visit(root);
  return point ?? { node: root, offset: root.childNodes.length };
}

function restoreMarkdownEditorSelection(start, end, direction = "forward") {
  const contentLength = noteBodyInput.value.length;
  const startPoint = findEditablePoint(noteBodyEditor, Math.min(start, contentLength));
  const endPoint = findEditablePoint(noteBodyEditor, Math.min(end, contentLength));
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  selection.removeAllRanges();
  if (direction === "backward" && typeof selection.setBaseAndExtent === "function") {
    selection.setBaseAndExtent(endPoint.node, endPoint.offset, startPoint.node, startPoint.offset);
    return;
  }

  const range = document.createRange();
  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset);
  selection.addRange(range);
}

function renderMarkdownEditor(content, selection = null) {
  const scrollTop = noteBodyEditor.scrollTop;
  const scrollLeft = noteBodyEditor.scrollLeft;
  noteBodyEditor.innerHTML = renderMarkdownSource(content);
  noteBodyEditor.scrollTop = scrollTop;
  noteBodyEditor.scrollLeft = scrollLeft;
  if (selection) {
    restoreMarkdownEditorSelection(selection.start, selection.end, selection.direction);
  }
}

function replaceMarkdownEditorSelection(replacement) {
  syncMarkdownSelectionToInput();
  const start = noteBodyInput.selectionStart;
  const end = noteBodyInput.selectionEnd;
  noteBodyInput.setRangeText(replacement, start, end, "end");
  const caret = start + replacement.length;
  noteBodyInput.setSelectionRange(caret, caret);
  noteBodyEditor.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
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

  if (hasError) {
    localStatusTitle.textContent = "Storage needs attention";
    localStatusCaption.textContent = persistenceError;
    return;
  }

  localStatusTitle.textContent = state === "saving" ? "Saving changes..." : "Saved on this device";
  localStatusCaption.textContent = state === "saving" ? "Keeping your latest edits." : "Your notes stay yours.";
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

function setNotesLayout(layout) {
  currentNotesLayout = layout;
  notesList.dataset.layout = layout;
  document.querySelectorAll("[data-notes-layout]").forEach((button) => {
    const isActive = button.dataset.notesLayout === layout;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
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
  notesList.dataset.layout = currentNotesLayout;
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
    const contentLength = note.title.trim().length + plainText.length;
    card.dataset.contentSize = contentLength < 90 ? "short" : contentLength < 300 ? "medium" : "long";
    preview.textContent = plainText || "No additional text";

    card.append(heading, preview);

    const controls = document.createElement("div");
    controls.className = "note-card-move-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", `Reorder ${note.title.trim() || "Untitled note"}`);
    const dragHandle = document.createElement("button");
    dragHandle.className = "move-note-button drag-note-handle";
    dragHandle.type = "button";
    dragHandle.dataset.dragNoteId = note.id;
    dragHandle.setAttribute("aria-label", `Drag ${note.title.trim() || "Untitled note"} to reorder`);
    dragHandle.title = "Drag to reorder";
    dragHandle.innerHTML = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="5" cy="4" r="1"/><circle cx="11" cy="4" r="1"/><circle cx="5" cy="8" r="1"/><circle cx="11" cy="8" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="11" cy="12" r="1"/></svg>';
    controls.append(dragHandle);

    item.append(card, controls);
    fragment.append(item);
  });

  notesList.append(fragment);
}

function updateWordCount() {
  const words = noteBodyInput.value.trim().match(/\S+/g)?.length ?? 0;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;
}

function renderEditor(selection = null) {
  const note = getActiveNote();
  editorContent.hidden = note === null;
  editorEmpty.hidden = note !== null;
  pinButton.disabled = note === null;
  deleteButton.disabled = note === null;

  if (!note) {
    renderedNoteId = null;
    pinButton.classList.remove("is-pinned");
    pinButton.setAttribute("aria-pressed", "false");
    return;
  }

  if (renderedNoteId !== note.id || document.activeElement !== noteBodyEditor) {
    noteBodyInput.value = noteContent(note);
  }
  renderedNoteId = note.id;

  noteDate.dateTime = note.updatedAt;
  noteDate.textContent = `Edited ${formatShortDate(note.updatedAt).toLocaleLowerCase()}`;
  pinButton.classList.toggle("is-pinned", note.pinned);
  pinButton.setAttribute("aria-pressed", String(note.pinned));
  pinButton.setAttribute("aria-label", note.pinned ? "Unpin note" : "Pin note");
  pinLabel.textContent = note.pinned ? "Pinned" : "Pin";
  updateWordCount();
  renderMarkdownEditor(noteBodyInput.value, selection);
}

function render() {
  renderFilters();
  renderNotesList();
  renderEditor();
  updatePersistenceStatus(persistenceError ? "saved" : undefined);
}

function wrapSelectedText(marker) {
  syncMarkdownSelectionToInput();
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
  noteBodyEditor.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyLineFormatting(action) {
  syncMarkdownSelectionToInput();
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
    noteBodyEditor.focus({ preventScroll: true });
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
  noteBodyEditor.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertLink() {
  syncMarkdownSelectionToInput();
  const start = noteBodyInput.selectionStart;
  const end = noteBodyInput.selectionEnd;
  const selectedText = noteBodyInput.value.slice(start, end);
  const label = selectedText || "link";
  const replacement = `[${label}](https://example.com)`;
  const urlStart = start + label.length + 3;
  const urlEnd = urlStart + "https://example.com".length;
  noteBodyInput.setRangeText(replacement, start, end, "end");
  noteBodyInput.setSelectionRange(urlStart, urlEnd);
  noteBodyEditor.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyMarkdownAction(action) {
  if (action === "link") {
    insertLink();
    return;
  }
  applyLineFormatting(action);
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

  if ("serviceWorker" in navigator && window.isSecureContext && location.protocol !== "file:") {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Index service worker registration failed.", error);
    });
  }
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
  window.requestAnimationFrame(() => {
    noteBodyEditor.focus();
    restoreMarkdownEditorSelection(noteBodyInput.value.length, noteBodyInput.value.length);
  });
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

document.querySelectorAll("[data-notes-layout]").forEach((button) => {
  button.addEventListener("click", () => setNotesLayout(button.dataset.notesLayout));
});

document.getElementById("create-from-empty").addEventListener("click", createNote);

notesList.addEventListener("click", (event) => {
  if (suppressNoteClick) {
    suppressNoteClick = false;
    window.clearTimeout(noteClickTimer);
    noteClickTimer = null;
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
  if (noteDragTimer !== null) {
    window.clearTimeout(noteDragTimer);
    noteDragTimer = null;
  }
  noteDrag?.item.classList.remove("is-dragging");
  notesList.querySelectorAll(".is-drop-before, .is-drop-after").forEach((item) => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
  noteDrag = null;
}

function startNoteDrag(item, input, pointerId, clientX, clientY) {
  noteDrag = {
    item,
    input,
    pointerId,
    noteId: item.dataset.noteItemId,
    startX: clientX,
    startY: clientY,
    active: false,
    targetId: null,
    position: "before"
  };
}

function activateNoteDrag() {
  if (!noteDrag) {
    return;
  }
  noteDrag.active = true;
  noteDrag.item.classList.add("is-dragging");
}

function updateNoteDrag(clientX, clientY) {
  if (!noteDrag?.active) {
    return;
  }
  const scrollBounds = notesList.parentElement.getBoundingClientRect();
  const scrollEdge = 42;
  if (clientY < scrollBounds.top + scrollEdge) {
    notesList.parentElement.scrollTop -= Math.ceil((scrollBounds.top + scrollEdge - clientY) / 4);
  } else if (clientY > scrollBounds.bottom - scrollEdge) {
    notesList.parentElement.scrollTop += Math.ceil((clientY - (scrollBounds.bottom - scrollEdge)) / 4);
  }

  const target = document.elementFromPoint(clientX, clientY)?.closest("[data-note-item-id]");
  notesList.querySelectorAll(".is-drop-before, .is-drop-after").forEach((item) => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
  if (!target || target.dataset.noteItemId === noteDrag.noteId) {
    noteDrag.targetId = null;
    return;
  }

  const bounds = target.getBoundingClientRect();
  noteDrag.targetId = target.dataset.noteItemId;
  const horizontalDrop = notesList.dataset.layout === "grid"
    && Math.abs(clientX - (bounds.left + bounds.width / 2)) > Math.abs(clientY - (bounds.top + bounds.height / 2));
  noteDrag.position = horizontalDrop
    ? (clientX > bounds.left + bounds.width / 2 ? "after" : "before")
    : (clientY > bounds.top + bounds.height / 2 ? "after" : "before");
  target.classList.add(noteDrag.position === "after" ? "is-drop-after" : "is-drop-before");
}

function finishNoteDrag() {
  const drag = noteDrag;
  clearNoteDrag();
  if (!drag?.active) {
    return;
  }
  suppressNoteClick = true;
  if (noteClickTimer !== null) {
    window.clearTimeout(noteClickTimer);
  }
  noteClickTimer = window.setTimeout(() => {
    suppressNoteClick = false;
    noteClickTimer = null;
  }, 500);
  if (drag.targetId) {
    reorderNote(drag.noteId, drag.targetId, drag.position);
  }
}

function resetNoteClickSuppression() {
  if (!suppressNoteClick) {
    return;
  }
  suppressNoteClick = false;
  window.clearTimeout(noteClickTimer);
  noteClickTimer = null;
}

notesList.addEventListener("pointerdown", (event) => {
  resetNoteClickSuppression();
  if (event.pointerType === "touch" || event.button !== 0) {
    return;
  }
  const handle = event.target.closest("[data-drag-note-id]");
  const item = handle?.closest("[data-note-item-id]");
  if (!handle || !item) {
    return;
  }
  startNoteDrag(item, "pointer", event.pointerId, event.clientX, event.clientY);
  handle.setPointerCapture(event.pointerId);
});

notesList.addEventListener("pointermove", (event) => {
  if (!noteDrag || noteDrag.input !== "pointer" || event.pointerId !== noteDrag.pointerId) {
    return;
  }
  if (!noteDrag.active && Math.hypot(event.clientX - noteDrag.startX, event.clientY - noteDrag.startY) < 6) {
    return;
  }
  activateNoteDrag();
  event.preventDefault();
  updateNoteDrag(event.clientX, event.clientY);
});

notesList.addEventListener("pointerup", (event) => {
  if (noteDrag?.input === "pointer" && event.pointerId === noteDrag.pointerId) {
    finishNoteDrag();
  }
});

notesList.addEventListener("pointercancel", () => {
  if (noteDrag?.input === "pointer") {
    clearNoteDrag();
  }
});

notesList.addEventListener("touchstart", (event) => {
  resetNoteClickSuppression();
  if (event.touches.length !== 1 || noteDrag || event.target.closest("button")) {
    return;
  }
  const item = event.target.closest("[data-note-item-id]");
  if (!item) {
    return;
  }
  const touch = event.touches[0];
  startNoteDrag(item, "touch", touch.identifier, touch.clientX, touch.clientY);
  const pendingDrag = noteDrag;
  noteDragTimer = window.setTimeout(() => {
    if (noteDrag === pendingDrag) {
      activateNoteDrag();
    }
    noteDragTimer = null;
  }, 250);
}, { passive: true });

notesList.addEventListener("touchmove", (event) => {
  if (noteDrag?.input !== "touch") {
    return;
  }
  const touch = Array.from(event.touches).find((item) => item.identifier === noteDrag.pointerId);
  if (!touch) {
    return;
  }
  if (!noteDrag.active) {
    if (Math.hypot(touch.clientX - noteDrag.startX, touch.clientY - noteDrag.startY) > 8) {
      clearNoteDrag();
    }
    return;
  }
  event.preventDefault();
  updateNoteDrag(touch.clientX, touch.clientY);
}, { passive: false });

notesList.addEventListener("touchend", (event) => {
  if (noteDrag?.input === "touch" && Array.from(event.changedTouches).some((touch) => touch.identifier === noteDrag.pointerId)) {
    finishNoteDrag();
  }
});

notesList.addEventListener("touchcancel", () => {
  if (noteDrag?.input === "touch") {
    clearNoteDrag();
  }
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  clearSearchButton.hidden = searchQuery.length === 0;
  renderNotesList();
});

document.querySelectorAll("[data-markdown-wrap]").forEach((button) => {
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => wrapSelectedText(button.dataset.markdownWrap));
});

document.querySelectorAll("[data-markdown-action]").forEach((button) => {
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => applyMarkdownAction(button.dataset.markdownAction));
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

function updateActiveNoteBody(selection, renderEditorImmediately = true) {
  const note = getActiveNote();
  if (!note) {
    return;
  }
  Object.assign(note, splitNoteContent(noteBodyInput.value));
  note.updatedAt = new Date().toISOString();
  renderNotesList();
  if (renderEditorImmediately) {
    renderEditor(selection);
  } else {
    updateWordCount();
  }
  scheduleSave();
}

function syncMarkdownEditorInput(renderEditorImmediately = true) {
  const content = readEditableMarkdown(noteBodyEditor);
  const selection = getMarkdownEditorSelection();
  const start = Math.min(selection.start, content.length);
  const end = Math.min(selection.end, content.length);
  noteBodyInput.value = content;
  noteBodyInput.setSelectionRange(start, end, selection.direction);
  const safeSelection = { start, end, direction: selection.direction };

  if (renderEditorImmediately) {
    noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    updateActiveNoteBody(safeSelection, false);
  }
}

noteBodyEditor.addEventListener("input", (event) => {
  syncMarkdownEditorInput(!isMarkdownComposing && !event.isComposing);
});

noteBodyEditor.addEventListener("compositionstart", () => {
  isMarkdownComposing = true;
});

noteBodyEditor.addEventListener("compositionend", () => {
  isMarkdownComposing = false;
  window.requestAnimationFrame(() => syncMarkdownEditorInput());
});

noteBodyEditor.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.isComposing || isMarkdownComposing) {
    return;
  }
  event.preventDefault();
  replaceMarkdownEditorSelection("\n");
});

noteBodyEditor.addEventListener("beforeinput", (event) => {
  if (
    (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak")
    && !event.isComposing
    && !isMarkdownComposing
  ) {
    event.preventDefault();
    replaceMarkdownEditorSelection("\n");
  }
});

noteBodyEditor.addEventListener("paste", (event) => {
  const content = event.clipboardData?.getData("text/plain");
  if (content === undefined) {
    return;
  }
  event.preventDefault();
  replaceMarkdownEditorSelection(content.replace(/\r\n?/g, "\n"));
});

document.addEventListener("selectionchange", syncMarkdownSelectionToInput);

noteBodyInput.addEventListener("input", () => {
  updateActiveNoteBody({
    start: noteBodyInput.selectionStart,
    end: noteBodyInput.selectionEnd,
    direction: noteBodyInput.selectionDirection
  });
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
