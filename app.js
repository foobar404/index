"use strict";

const STORAGE_KEY = "index.notes.v1";
const LEGACY_STORAGE_KEYS = ["daymark.notes.v2", "daymark.notes.v1"];
const GOOGLE_FONTS = {
  default: { label: "System default", family: "", css: "" },
  inter: { label: "Inter", family: "Inter", css: '"Inter", sans-serif' },
  roboto: { label: "Roboto", family: "Roboto", css: '"Roboto", sans-serif' },
  "open-sans": { label: "Open Sans", family: "Open Sans", css: '"Open Sans", sans-serif' },
  lato: { label: "Lato", family: "Lato", css: '"Lato", sans-serif' },
  montserrat: { label: "Montserrat", family: "Montserrat", css: '"Montserrat", sans-serif' },
  poppins: { label: "Poppins", family: "Poppins", css: '"Poppins", sans-serif' },
  nunito: { label: "Nunito", family: "Nunito", css: '"Nunito", sans-serif' },
  "source-sans-3": { label: "Source Sans 3", family: "Source Sans 3", css: '"Source Sans 3", sans-serif' },
  "work-sans": { label: "Work Sans", family: "Work Sans", css: '"Work Sans", sans-serif' },
  "dm-sans": { label: "DM Sans", family: "DM Sans", css: '"DM Sans", sans-serif' },
  manrope: { label: "Manrope", family: "Manrope", css: '"Manrope", sans-serif' },
  raleway: { label: "Raleway", family: "Raleway", css: '"Raleway", sans-serif' },
  merriweather: { label: "Merriweather", family: "Merriweather", css: '"Merriweather", serif' },
  lora: { label: "Lora", family: "Lora", css: '"Lora", serif' },
  "playfair-display": { label: "Playfair Display", family: "Playfair Display", css: '"Playfair Display", serif' },
  "libre-baskerville": { label: "Libre Baskerville", family: "Libre Baskerville", css: '"Libre Baskerville", serif' },
  "pt-sans": { label: "PT Sans", family: "PT Sans", css: '"PT Sans", sans-serif' },
  ubuntu: { label: "Ubuntu", family: "Ubuntu", css: '"Ubuntu", sans-serif' },
  "roboto-mono": { label: "Roboto Mono", family: "Roboto Mono", css: '"Roboto Mono", monospace' },
  "fira-code": { label: "Fira Code", family: "Fira Code", css: '"Fira Code", monospace' },
  inconsolata: { label: "Inconsolata", family: "Inconsolata", css: '"Inconsolata", monospace' },
  "space-grotesk": { label: "Space Grotesk", family: "Space Grotesk", css: '"Space Grotesk", sans-serif' },
  quicksand: { label: "Quicksand", family: "Quicksand", css: '"Quicksand", sans-serif' }
};
const NOTE_THEMES = {
  paper: { label: "Paper", background: "#ffffff", text: "#40463f", accent: "#70826e", subtext: "#f1f3ee" },
  cream: { label: "Cream", background: "#fff8e9", text: "#54432e", accent: "#91724c", subtext: "#f5eddc" },
  sage: { label: "Sage", background: "#edf4eb", text: "#334b38", accent: "#587760", subtext: "#e0eadf" },
  ocean: { label: "Ocean", background: "#dcecf8", text: "#263f57", accent: "#2e7898", subtext: "#c7e0ef" },
  lavender: { label: "Lavender", background: "#f0eafb", text: "#4b3b67", accent: "#8b6ca8", subtext: "#e6dcf4" },
  rose: { label: "Rose", background: "#fae9ed", text: "#5a3540", accent: "#b15c71", subtext: "#f4dce2" },
  peach: { label: "Peach", background: "#fff0e4", text: "#5b3b2b", accent: "#c97949", subtext: "#ffe0ca" },
  slate: { label: "Slate", background: "#e9eef2", text: "#35434d", accent: "#697f90", subtext: "#dce4ea" },
  sunshine: { label: "Sunshine", background: "#fff6cb", text: "#534817", accent: "#978315", subtext: "#f5e99c" },
  mint: { label: "Mint", background: "#e6f4ee", text: "#2e4d44", accent: "#4e8e75", subtext: "#d2eee1" },
  forest: { label: "Forest", background: "#e5eee7", text: "#314839", accent: "#5e826b", subtext: "#d6e6d9" },
  cocoa: { label: "Cocoa", background: "#f1e8e0", text: "#50392d", accent: "#9a7056", subtext: "#e9d8c8" },
  acid: { label: "Acid", background: "#efff00", text: "#252b00", accent: "#596400", subtext: "#d8e800" },
  limeade: { label: "Limeade", background: "#baff3a", text: "#20330e", accent: "#4b7813", subtext: "#a7e526" },
  slime: { label: "Toxic Slime", background: "#a6ff00", text: "#1b2e00", accent: "#4c7700", subtext: "#94e600" },
  bubblegum: { label: "Bubblegum", background: "#ffb3ee", text: "#4c1744", accent: "#bc4e9c", subtext: "#f394d9" },
  vaporwave: { label: "Vaporwave", background: "#f4b2ff", text: "#3e1454", accent: "#a246c3", subtext: "#e69cf5" },
  "arcade-blue": { label: "Arcade Blue", background: "#52e5ff", text: "#083348", accent: "#007d98", subtext: "#b0f5ff" },
  "coral-pop": { label: "Coral Pop", background: "#ff715b", text: "#40150e", accent: "#a4392a", subtext: "#ffc2b7" },
  highlighter: { label: "Highlighter", background: "#fff900", text: "#292600", accent: "#776f00", subtext: "#eee600" },
  midnight: { label: "Midnight", background: "#171923", text: "#f3f0fa", accent: "#b9a9ff", subtext: "#292b3a" },
  oled: { label: "OLED", background: "#0b0d10", text: "#f3f5f7", accent: "#b0c0d2", subtext: "#20242a" },
  "deep-ocean": { label: "Deep Ocean", background: "#092b3a", text: "#e2f6ff", accent: "#68d4ed", subtext: "#153b4d" },
  ultraviolet: { label: "Ultraviolet", background: "#1b1544", text: "#f0eaff", accent: "#b6a0ff", subtext: "#2a235f" },
  cyberpunk: { label: "Cyberpunk", background: "#241126", text: "#ffe1fc", accent: "#ff4fd8", subtext: "#421b3f" },
  "forest-night": { label: "Forest Night", background: "#15251d", text: "#e3f4e7", accent: "#9de0aa", subtext: "#233b2d" },
  "cobalt-night": { label: "Cobalt Night", background: "#11204a", text: "#ecf3ff", accent: "#90b2ff", subtext: "#1d3264" },
  ember: { label: "Ember", background: "#351d17", text: "#ffe6d9", accent: "#ff9d6f", subtext: "#542b1f" },
  "grape-soda": { label: "Grape Soda", background: "#31124a", text: "#f1d7ff", accent: "#d79aff", subtext: "#4a1e68" },
  "cherry-cola": { label: "Cherry Cola", background: "#391622", text: "#ffdee7", accent: "#ff8dab", subtext: "#571e32" },
  terminal: { label: "Terminal Green", background: "#061b13", text: "#b4ffc8", accent: "#49ef89", subtext: "#0c3022" },
  "lava-lamp": { label: "Lava Lamp", background: "#2b170a", text: "#fff0c2", accent: "#ffbf47", subtext: "#482b12" }
};
const DEFAULT_NOTE_THEME = "paper";
const icons = {
  pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15.5 4.75 3.75 3.75-2.5 1.25-.5 4.25-1.5 1.5-3.5-3.5-4.5 4.5-.75-.75 4.5-4.5-3.5-3.5 1.5-1.5 4.25-.5 1.25-2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const appShell = document.getElementById("app-shell");
const editorPane = document.querySelector(".editor-pane");
const topNavbar = document.querySelector(".top-navbar");
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
const noteFormattingToolbar = document.getElementById("note-format-toolbar");
const noteTextContextMenu = document.getElementById("note-text-context-menu");
const noteDate = document.getElementById("note-date");
const wordCount = document.getElementById("word-count");
const pinButton = document.getElementById("toggle-pin");
const pinLabel = document.getElementById("pin-label");
const deleteButton = document.getElementById("delete-note");
const noteSettingsButtons = Array.from(document.querySelectorAll("[data-open-note-settings]"));
const noteSettingsModal = document.getElementById("note-settings-modal");
const noteSettingsFont = document.getElementById("note-font-setting");
const noteSettingsThemeGrid = document.getElementById("note-theme-grid");
const noteSettingsNoteTitle = document.getElementById("note-settings-note-title");
const noteSettingsPreview = document.getElementById("note-settings-preview");
const noteSettingsPreviewTitle = document.getElementById("note-settings-preview-title");
const localStatus = document.querySelector(".sidebar-footer");
const localStatusTitle = document.getElementById("local-status-title");
const localStatusCaption = document.getElementById("local-status-caption");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const undoDeleteButton = document.getElementById("undo-delete");
const notesPane = document.getElementById("notes-pane");
let noteContextSelection = null;
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
let noteSettingsReturnFocus = null;

function getActiveNote() {
  return notes.find((note) => note.id === activeNoteId) ?? null;
}

function noteContent(note) {
  if (!note.title) {
    return note.body ? `\n${note.body}` : "";
  }
  return note.body ? `${note.title}\n${note.body}` : note.title;
}

function normalizeNoteColor(value) {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : "";
}

function colorDistance(first, second) {
  const firstChannels = first.slice(1).match(/../g).map((channel) => Number.parseInt(channel, 16));
  const secondChannels = second.slice(1).match(/../g).map((channel) => Number.parseInt(channel, 16));
  return firstChannels.reduce((distance, channel, index) => (
    distance + (channel - secondChannels[index]) ** 2
  ), 0);
}

function findClosestNoteTheme(note) {
  const backgroundColor = normalizeNoteColor(note?.backgroundColor);
  const textColor = normalizeNoteColor(note?.textColor);
  if (!backgroundColor && !textColor) {
    return DEFAULT_NOTE_THEME;
  }

  const targetBackground = backgroundColor || NOTE_THEMES[DEFAULT_NOTE_THEME].background;
  const targetText = textColor || NOTE_THEMES[DEFAULT_NOTE_THEME].text;
  return Object.entries(NOTE_THEMES).reduce((closest, [key, theme]) => {
    const distance = colorDistance(targetBackground, theme.background)
      + colorDistance(targetText, theme.text);
    return distance < closest.distance ? { key, distance } : closest;
  }, { key: DEFAULT_NOTE_THEME, distance: Number.POSITIVE_INFINITY }).key;
}

function getNoteAppearance(note) {
  const storedFont = typeof note?.font === "string" ? note.font : "default";
  const font = Object.prototype.hasOwnProperty.call(GOOGLE_FONTS, storedFont)
    ? storedFont
    : storedFont === "serif"
      ? "lora"
      : storedFont === "mono"
        ? "roboto-mono"
        : "default";
  const theme = typeof note?.theme === "string"
    && Object.prototype.hasOwnProperty.call(NOTE_THEMES, note.theme)
    ? note.theme
    : findClosestNoteTheme(note);
  return {
    font,
    theme
  };
}

let googleFontsConnected = false;
const requestedGoogleFonts = new Set();

function ensureGoogleFontLoaded(fontKey) {
  const font = GOOGLE_FONTS[fontKey];
  if (!font?.family || requestedGoogleFonts.has(fontKey)) {
    return;
  }
  requestedGoogleFonts.add(fontKey);

  if (!googleFontsConnected) {
    const googleFontsOrigin = document.createElement("link");
    googleFontsOrigin.rel = "preconnect";
    googleFontsOrigin.href = "https://fonts.googleapis.com";
    document.head.append(googleFontsOrigin);

    const googleFontFilesOrigin = document.createElement("link");
    googleFontFilesOrigin.rel = "preconnect";
    googleFontFilesOrigin.href = "https://fonts.gstatic.com";
    googleFontFilesOrigin.crossOrigin = "anonymous";
    document.head.append(googleFontFilesOrigin);
    googleFontsConnected = true;
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family).replace(/%20/g, "+")}:wght@400;700&display=swap`;
  stylesheet.addEventListener("error", () => {
    console.error(`Unable to load the Google Font "${font.family}".`);
  }, { once: true });
  document.head.append(stylesheet);
}

function setNoteAppearance(element, note) {
  const appearance = getNoteAppearance(note);
  const theme = NOTE_THEMES[appearance.theme];
  const hasSavedTheme = typeof note?.theme === "string"
    && Object.prototype.hasOwnProperty.call(NOTE_THEMES, note.theme);
  const backgroundColor = hasSavedTheme
    ? theme.background
    : normalizeNoteColor(note?.backgroundColor) || theme.background;
  const textColor = hasSavedTheme
    ? theme.text
    : normalizeNoteColor(note?.textColor) || theme.text;
  const font = GOOGLE_FONTS[appearance.font];

  if (font?.family) {
    ensureGoogleFontLoaded(appearance.font);
    element.style.setProperty("--note-font-family", font.css);
  } else {
    element.style.removeProperty("--note-font-family");
  }
  element.style.setProperty("--note-background-color", backgroundColor);
  element.style.setProperty("--note-text-color", textColor);
  element.style.setProperty("--note-muted-text-color", `color-mix(in srgb, ${textColor} 76%, ${backgroundColor})`);
  element.style.setProperty("--note-subtle-text-color", `color-mix(in srgb, ${textColor} 58%, ${backgroundColor})`);
  element.style.setProperty("--note-link-color", textColor);
  element.style.setProperty("--note-accent-color", theme.accent);
  element.style.setProperty("--note-symbol-color", `color-mix(in srgb, ${textColor} 62%, ${backgroundColor})`);
  element.style.setProperty("--note-subtext-background", theme.subtext);
  element.style.setProperty("--note-border-color", `color-mix(in srgb, ${backgroundColor} 84%, ${textColor})`);
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

function renderSyntaxSymbol(value, modifier = "") {
  const modifierClass = modifier ? ` ${modifier}` : "";
  return `<span class="markdown-source-symbol${modifierClass}">${escapeHtml(value)}</span>`;
}

function renderNoteSyntaxInline(source) {
  const syntaxPattern = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|#)[^)\s]+)\)|\*\*(.+?)\*\*|__([^_\n]+)__|~~([^~\n]+)~~|==([^=\n]+)==|\*([^*\n]+)\*/gi;
  let html = "";
  let sourceIndex = 0;
  let match;

  while ((match = syntaxPattern.exec(source)) !== null) {
    html += escapeHtml(source.slice(sourceIndex, match.index));
    if (match[1] !== undefined) {
      const [, label, url] = match;
      html += `<a class="markdown-source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${renderSyntaxSymbol("[")}${renderNoteSyntaxInline(label)}${renderSyntaxSymbol("](")}<span class="markdown-source-url">${escapeHtml(url)}</span>${renderSyntaxSymbol(")")}</a>`;
    } else if (match[3] !== undefined) {
      html += `${renderSyntaxSymbol("**")}<strong>${renderNoteSyntaxInline(match[3])}</strong>${renderSyntaxSymbol("**")}`;
    } else if (match[4] !== undefined) {
      html += `${renderSyntaxSymbol("__")}<u>${renderNoteSyntaxInline(match[4])}</u>${renderSyntaxSymbol("__")}`;
    } else if (match[5] !== undefined) {
      html += `${renderSyntaxSymbol("~~")}<del>${renderNoteSyntaxInline(match[5])}</del>${renderSyntaxSymbol("~~")}`;
    } else if (match[6] !== undefined) {
      html += `${renderSyntaxSymbol("==")}<mark>${renderNoteSyntaxInline(match[6])}</mark>${renderSyntaxSymbol("==")}`;
    } else {
      html += `${renderSyntaxSymbol("*")}<em>${renderNoteSyntaxInline(match[7])}</em>${renderSyntaxSymbol("*")}`;
    }
    sourceIndex = syntaxPattern.lastIndex;
  }

  return html + escapeHtml(source.slice(sourceIndex));
}

function renderNoteSyntaxLine(line) {
  const alignment = line.match(/^(\s*)(:left:|:right:)(\s*)(.*)$/i);
  const content = alignment ? alignment[4] : line;
  let html = "";

  const heading = content.match(/^(\s*#{1,6}\s+)(.*)$/);
  if (heading) {
    const level = heading[1].match(/#/g).length;
    html = `${renderSyntaxSymbol(heading[1])}<span class="markdown-source-heading markdown-source-heading-${level}">${renderNoteSyntaxInline(heading[2])}</span>`;
  } else {
    const subtext = content.match(/^(\s*>\s?)(.*)$/);
    if (subtext) {
      html = `${renderSyntaxSymbol(subtext[1])}<span class="markdown-source-subtext">${renderNoteSyntaxInline(subtext[2])}</span>`;
    } else {
      const checkbox = content.match(/^(\s*)(-\s*)?\[([ xX]?)\](\s*)(.*)$/);
      if (checkbox) {
        const checked = checkbox[3].toLocaleLowerCase() === "x";
        const marker = `${checkbox[1]}${checkbox[2] ?? ""}[${checkbox[3]}]${checkbox[4]}`;
        html = `<span class="markdown-source-checkbox" data-checked="${checked}" role="checkbox" aria-checked="${checked}" aria-label="${checked ? "Completed" : "Not completed"}" tabindex="0">${escapeHtml(marker)}</span><span class="markdown-source-list-item">${renderNoteSyntaxInline(checkbox[5])}</span>`;
      } else {
        const listItem = content.match(/^(\s*)(-\s*|\d+\.\s+)(.*)$/);
        if (listItem) {
          const markerClass = listItem[2].startsWith("-")
            ? "markdown-source-list-marker-unordered"
            : "markdown-source-list-marker-ordered";
          html = `${renderSyntaxSymbol(`${listItem[1]}${listItem[2]}`, markerClass)}<span class="markdown-source-list-item">${renderNoteSyntaxInline(listItem[3])}</span>`;
        } else {
          html = renderNoteSyntaxInline(content);
        }
      }
    }
  }

  if (alignment) {
    const marker = `${alignment[1]}${alignment[2]}${alignment[3]}`;
    const align = alignment[2].slice(1, -1).toLocaleLowerCase();
    return `<div class="markdown-source-line markdown-source-align-${align}">${renderSyntaxSymbol(marker)}${html}</div>`;
  }
  return `<div class="markdown-source-line">${html || "<br>"}</div>`;
}

function renderNoteSyntax(content) {
  if (!content) {
    return "";
  }
  const sourceLines = content.replace(/\r\n?/g, "\n").split("\n");
  return sourceLines.map(renderNoteSyntaxLine).join("");
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
  let lastCharacter = "";
  let point = null;
  const visit = (node, hasNextSibling = false) => {
    if (point) {
      return;
    }
    if (
      node !== root
      && node.nodeType === Node.ELEMENT_NODE
      && ["DIV", "P"].includes(node.nodeName)
      && textOffset > 0
      && lastCharacter !== "\n"
    ) {
      textOffset += 1;
      lastCharacter = "\n";
    }
    if (node.nodeType === Node.TEXT_NODE) {
      if (targetOffset <= textOffset + node.nodeValue.length) {
        point = { node, offset: targetOffset - textOffset };
        return;
      }
      textOffset += node.nodeValue.length;
      if (node.nodeValue.length) {
        lastCharacter = node.nodeValue.at(-1);
      }
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
      const parent = node.parentNode;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);
      const emptyBlockPlaceholder = parent
        && ["DIV", "P"].includes(parent.nodeName)
        && parent.childNodes.length === 1
        && !node.hasAttribute("data-markdown-break");
      if (targetOffset === textOffset) {
        point = { node: parent, offset: index };
        return;
      }
      if (!emptyBlockPlaceholder) {
        textOffset += 1;
        lastCharacter = "\n";
      }
      if (targetOffset === textOffset) {
        point = { node: parent, offset: index + 1 };
      }
      return;
    }
    const children = Array.from(node.childNodes ?? []);
    children.forEach((child, index) => {
      visit(child, index < children.length - 1);
      if (point) {
        return;
      }
    });
    const emptyBlockPlaceholder = node.nodeType === Node.ELEMENT_NODE
      && ["DIV", "P"].includes(node.nodeName)
      && node.childNodes.length === 1
      && node.firstChild.nodeName === "BR"
      && !node.firstChild.hasAttribute("data-markdown-break");
    if (emptyBlockPlaceholder && hasNextSibling) {
      textOffset += 1;
      lastCharacter = "\n";
      if (targetOffset === textOffset) {
        const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
        point = { node: node.parentNode, offset: index + 1 };
      }
    }
  };

  const children = Array.from(root.childNodes);
  children.forEach((child, index) => {
    visit(child, index < children.length - 1);
    if (point) {
      return;
    }
  });
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

function renderNoteEditorContent(content, selection = null) {
  const scrollTop = noteBodyEditor.scrollTop;
  const scrollLeft = noteBodyEditor.scrollLeft;
  noteBodyEditor.innerHTML = renderNoteSyntax(content);
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

function insertNoteEditorLineBreak() {
  syncMarkdownSelectionToInput();
  const value = noteBodyInput.value;
  const selectionStart = noteBodyInput.selectionStart;
  const selectionEnd = noteBodyInput.selectionEnd;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const nextLineBreak = value.indexOf("\n", selectionEnd);
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
  const line = value.slice(lineStart, lineEnd);
  const alignmentPrefix = line.match(/^\s*:(?:left|right):\s*/i)?.[0] ?? "";
  const listLine = line.slice(alignmentPrefix.length);
  const listLineStart = lineStart + alignmentPrefix.length;
  const checkboxList = listLine.match(/^(\s*)(-\s*)?\[([ xX]?)\](\s*)(.*)$/);
  const unorderedList = listLine.match(/^(\s*)(-\s*)(.*)$/);
  const orderedList = listLine.match(/^(\s*)(\d+\.\s+)(.*)$/);
  let nextPrefix = "";

  if (checkboxList) {
    const markerEnd = checkboxList[1].length
      + (checkboxList[2]?.length ?? 0)
      + 2
      + checkboxList[3].length
      + checkboxList[4].length;
    const content = checkboxList[5];
    if (!content.trim() && selectionStart === selectionEnd && selectionEnd === lineEnd) {
      replaceNoteEditorText(lineStart, lineEnd, "", lineStart, lineStart);
      return;
    }
    if (selectionStart >= listLineStart + markerEnd) {
      nextPrefix = `${alignmentPrefix}${checkboxList[1]}[] `;
    }
  } else if (unorderedList) {
    const markerEnd = unorderedList[1].length + unorderedList[2].length;
    const content = unorderedList[3];
    if (!content.trim() && selectionStart === selectionEnd && selectionEnd === lineEnd) {
      replaceNoteEditorText(lineStart, lineEnd, "", lineStart, lineStart);
      return;
    }
    if (selectionStart >= listLineStart + markerEnd) {
      nextPrefix = `${alignmentPrefix}${unorderedList[1]}- `;
    }
  } else if (orderedList) {
    const markerEnd = orderedList[1].length + orderedList[2].length;
    const content = orderedList[3];
    if (!content.trim() && selectionStart === selectionEnd && selectionEnd === lineEnd) {
      replaceNoteEditorText(lineStart, lineEnd, "", lineStart, lineStart);
      return;
    }
    if (selectionStart >= listLineStart + markerEnd) {
      const currentNumber = Number.parseInt(orderedList[2], 10);
      nextPrefix = `${alignmentPrefix}${orderedList[1]}${currentNumber + 1}. `;
    }
  }

  const replacement = `\n${nextPrefix}`;
  const caret = selectionStart + replacement.length;
  replaceNoteEditorText(selectionStart, selectionEnd, replacement, caret, caret);
}

function replaceNoteEditorText(start, end, replacement, selectionStart, selectionEnd) {
  noteBodyInput.setRangeText(replacement, start, end, "end");
  noteBodyInput.setSelectionRange(selectionStart, selectionEnd);
  noteBodyEditor.focus({ preventScroll: true });
  noteBodyInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyInlineNoteFormatting(marker) {
  const start = noteBodyInput.selectionStart;
  const end = noteBodyInput.selectionEnd;
  const selectedText = noteBodyInput.value.slice(start, end);
  if (!selectedText) {
    replaceNoteEditorText(start, end, `${marker}${marker}`, start + marker.length, start + marker.length);
    return;
  }

  const lines = selectedText.split("\n");
  const replacement = lines.map((line) => (
    line ? `${marker}${line}${marker}` : line
  )).join("\n");
  if (lines.length === 1) {
    replaceNoteEditorText(start, end, replacement, start + marker.length, start + marker.length + selectedText.length);
    return;
  }
  const caret = start + replacement.length;
  replaceNoteEditorText(start, end, replacement, caret, caret);
}

function applyBlockNoteFormatting(action) {
  const value = noteBodyInput.value;
  const selectionStart = noteBodyInput.selectionStart;
  const selectionEnd = noteBodyInput.selectionEnd;
  const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lastSelectedCharacter = selectionEnd > selectionStart && value[selectionEnd - 1] === "\n"
    ? selectionEnd - 1
    : selectionEnd;
  const nextLineBreak = value.indexOf("\n", lastSelectedCharacter);
  const end = nextLineBreak === -1 ? value.length : nextLineBreak;
  const lines = value.slice(start, end).split("\n");
  if (action === "align-left" || action === "align-right") {
    const alignment = action === "align-left" ? "left" : "right";
    const contentLines = lines.filter((line) => line.trim());
    const removeFormatting = contentLines.length > 0
      && contentLines.every((line) => splitNoteLinePrefixes(line).alignment === alignment);
    const replacement = lines.map((line) => {
      if (!line.trim()) {
        return line;
      }
      const parts = splitNoteLinePrefixes(line);
      return removeFormatting
        ? `${parts.indent}${parts.content}`
        : `${parts.indent}:${alignment}: ${parts.content}`;
    }).join("\n");
    const caret = start + replacement.length;
    replaceNoteEditorText(start, end, replacement, caret, caret);
    return;
  }

  const formats = {
    "heading-1": { marker: "# ", pattern: /^(\s*)#\s+/ },
    "heading-2": { marker: "## ", pattern: /^(\s*)##\s+/ },
    "heading-3": { marker: "### ", pattern: /^(\s*)###\s+/ },
    subtext: { marker: "> ", pattern: /^(\s*)>\s?/ },
    "unordered-list": { marker: "- ", pattern: /^(\s*)-\s*/ },
    "ordered-list": { marker: null, pattern: /^(\s*)\d+\.\s+/ },
    "checkbox-list": { marker: "[] ", pattern: /^(\s*)(?:-\s*)?\[[ xX]?\]\s*/ }
  };
  const format = formats[action];
  const contentLines = lines.filter((line) => line.trim());
  const removeFormatting = contentLines.length > 0
    && contentLines.every((line) => format.pattern.test(splitNoteLinePrefixes(line).content));
  let orderedIndex = 0;

  const replacement = lines.map((line) => {
    if (!line.trim() && lines.length > 1) {
      return line;
    }
    const parts = splitNoteLinePrefixes(line);
    const linePrefix = `${parts.indent}${parts.alignment ? `:${parts.alignment}: ` : ""}`;
    if (removeFormatting) {
      return `${linePrefix}${parts.content.replace(format.pattern, "$1")}`;
    }

    const withoutMarker = parts.content.replace(/^(?:#{1,6}\s+|>\s*|(?:-\s*)?\[[ xX]?\]\s*|-\s*|\d+\.\s+)/, "");
    const indent = withoutMarker.match(/^\s*/)[0];
    const content = withoutMarker.slice(indent.length);
    if (action === "ordered-list") {
      orderedIndex += 1;
      return `${linePrefix}${indent}${orderedIndex}. ${content}`;
    }
    return `${linePrefix}${indent}${format.marker}${content}`;
  }).join("\n");
  const caret = start + replacement.length;
  replaceNoteEditorText(start, end, replacement, caret, caret);
}

function splitNoteLinePrefixes(line) {
  const match = line.match(/^(\s*)(?::(left|right):\s*)?(.*)$/i);
  return {
    indent: match[1],
    alignment: match[2]?.toLocaleLowerCase() ?? "",
    content: match[3]
  };
}

function applyNoteFormatting(action, syncSelection = true) {
  if (syncSelection) {
    syncMarkdownSelectionToInput();
  }
  const inlineMarkers = {
    bold: "**",
    italic: "*",
    underline: "__",
    strikethrough: "~~",
    highlight: "=="
  };
  if (inlineMarkers[action]) {
    applyInlineNoteFormatting(inlineMarkers[action]);
  } else if (action === "link") {
    const start = noteBodyInput.selectionStart;
    const end = noteBodyInput.selectionEnd;
    const selectedText = noteBodyInput.value.slice(start, end).replace(/\n/g, " ") || "link";
    const url = "https://example.com";
    const replacement = `[${selectedText}](${url})`;
    const urlStart = start + selectedText.length + 3;
    replaceNoteEditorText(start, end, replacement, urlStart, urlStart + url.length);
  } else {
    applyBlockNoteFormatting(action);
  }
}

function toggleNoteCheckbox(marker) {
  syncMarkdownSelectionToInput();
  const markerText = marker.firstChild?.nodeValue ?? "";
  const markerStart = getEditableTextOffset(noteBodyEditor, marker.firstChild, 0);
  const checkboxStart = markerText.indexOf("[");
  const checkboxEnd = markerText.indexOf("]", checkboxStart);
  if (checkboxStart === -1 || checkboxEnd === -1) {
    return;
  }

  const selectionStart = noteBodyInput.selectionStart;
  const selectionEnd = noteBodyInput.selectionEnd;
  const sourceStart = markerStart + checkboxStart;
  const sourceEnd = markerStart + checkboxEnd + 1;
  const replacement = marker.dataset.checked === "true" ? "[]" : "[x]";
  const offsetAfterToggle = (offset) => {
    if (offset >= sourceEnd) {
      return offset + replacement.length - (sourceEnd - sourceStart);
    }
    return offset > sourceStart ? sourceStart + replacement.length : offset;
  };
  replaceNoteEditorText(
    sourceStart,
    sourceEnd,
    replacement,
    offsetAfterToggle(selectionStart),
    offsetAfterToggle(selectionEnd)
  );
}

function closeNoteTextContextMenu() {
  noteTextContextMenu.hidden = true;
  noteTextContextMenu.style.removeProperty("left");
  noteTextContextMenu.style.removeProperty("top");
  noteContextSelection = null;
}

function openNoteTextContextMenu(event) {
  const selection = window.getSelection();
  if (
    !selection?.anchorNode
    || !selection.focusNode
    || !noteBodyEditor.contains(selection.anchorNode)
    || !noteBodyEditor.contains(selection.focusNode)
    || !selection.toString()
  ) {
    return;
  }

  syncMarkdownSelectionToInput();
  const start = noteBodyInput.selectionStart;
  const end = noteBodyInput.selectionEnd;
  if (start === end) {
    return;
  }
  event.preventDefault();
  noteContextSelection = {
    start,
    end,
    direction: noteBodyInput.selectionDirection,
    text: noteBodyInput.value.slice(start, end)
  };
  noteTextContextMenu.hidden = false;
  noteTextContextMenu.style.left = `${event.clientX}px`;
  noteTextContextMenu.style.top = `${event.clientY}px`;
  window.requestAnimationFrame(() => {
    if (noteTextContextMenu.hidden) {
      return;
    }
    const bounds = noteTextContextMenu.getBoundingClientRect();
    noteTextContextMenu.style.left = `${Math.max(8, Math.min(event.clientX, window.innerWidth - bounds.width - 8))}px`;
    noteTextContextMenu.style.top = `${Math.max(8, Math.min(event.clientY, window.innerHeight - bounds.height - 8))}px`;
    noteTextContextMenu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
  });
}

async function copySelectedNoteText(selection) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function" && window.isSecureContext) {
      await navigator.clipboard.writeText(selection.text);
    } else {
      const copyBuffer = document.createElement("textarea");
      copyBuffer.value = selection.text;
      copyBuffer.setAttribute("readonly", "");
      copyBuffer.style.position = "fixed";
      copyBuffer.style.opacity = "0";
      document.body.append(copyBuffer);
      let copied;
      try {
        copyBuffer.select();
        copied = document.execCommand("copy");
      } finally {
        copyBuffer.remove();
      }
      if (!copied) {
        throw new Error("The browser did not copy the selected note text.");
      }
    }
    showToast("Text copied");
  } catch (error) {
    console.error("Unable to copy selected note text.", error);
    showToast("Text could not be copied.");
  } finally {
    noteBodyEditor.focus({ preventScroll: true });
    restoreMarkdownEditorSelection(selection.start, selection.end, selection.direction);
  }
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
  localStatus.classList.toggle("is-saving", !hasError && state === "saving");

  if (hasError) {
    localStatusTitle.textContent = "Storage needs attention";
    localStatusCaption.textContent = persistenceError;
    return;
  }

  localStatusTitle.textContent = state === "saving" ? "Saving changes..." : "";
  localStatusCaption.textContent = state === "saving" ? "Keeping your latest edits." : "";
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

function getNoteSettingsFromForm() {
  const selectedTheme = noteSettingsThemeGrid.querySelector('[role="radio"][aria-checked="true"]');
  return {
    font: Object.prototype.hasOwnProperty.call(GOOGLE_FONTS, noteSettingsFont.value)
      ? noteSettingsFont.value
      : "default",
    theme: selectedTheme?.dataset.noteTheme ?? DEFAULT_NOTE_THEME
  };
}

function renderNoteFontOptions() {
  Object.entries(GOOGLE_FONTS).forEach(([key, font]) => {
    if (key === "default") {
      return;
    }
    const option = document.createElement("option");
    option.value = key;
    option.textContent = font.label;
    noteSettingsFont.append(option);
  });
}

function renderNoteThemeChoices(selectedTheme) {
  const fragment = document.createDocumentFragment();
  Object.entries(NOTE_THEMES).forEach(([key, theme]) => {
    const choice = document.createElement("button");
    choice.className = "note-theme-choice";
    choice.type = "button";
    choice.setAttribute("role", "radio");
    choice.setAttribute("aria-label", theme.label);
    choice.setAttribute("aria-checked", String(key === selectedTheme));
    choice.tabIndex = key === selectedTheme ? 0 : -1;
    choice.dataset.noteTheme = key;
    choice.style.setProperty("--theme-background", theme.background);
    choice.style.setProperty("--theme-text", theme.text);

    const sample = document.createElement("span");
    sample.className = "note-theme-sample";
    sample.textContent = "Aa";
    sample.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "note-theme-label";
    label.textContent = theme.label;
    choice.append(sample, label);
    fragment.append(choice);
  });
  noteSettingsThemeGrid.replaceChildren(fragment);
}

function selectNoteTheme(themeKey) {
  if (!Object.prototype.hasOwnProperty.call(NOTE_THEMES, themeKey)) {
    return;
  }
  noteSettingsThemeGrid.querySelectorAll("[data-note-theme]").forEach((choice) => {
    const isSelected = choice.dataset.noteTheme === themeKey;
    choice.setAttribute("aria-checked", String(isSelected));
    choice.tabIndex = isSelected ? 0 : -1;
  });
  updateNoteSettingsPreview();
  applyNoteSettings();
}

function updateNoteSettingsPreview() {
  const note = getActiveNote();
  if (!note) {
    return;
  }
  setNoteAppearance(noteSettingsPreview, {
    ...note,
    ...getNoteSettingsFromForm()
  });
}

function openNoteSettings(trigger) {
  const note = getActiveNote();
  if (!note) {
    return;
  }
  const appearance = getNoteAppearance(note);
  noteSettingsReturnFocus = trigger;
  noteSettingsFont.value = appearance.font;
  renderNoteThemeChoices(appearance.theme);
  noteSettingsNoteTitle.textContent = note.title.trim() || "Untitled note";
  noteSettingsPreviewTitle.textContent = note.title.trim() || "A note preview";
  updateNoteSettingsPreview();
  noteSettingsModal.hidden = false;
  window.requestAnimationFrame(() => noteSettingsFont.focus({ preventScroll: true }));
}

function closeNoteSettings() {
  noteSettingsModal.hidden = true;
  const returnFocus = noteSettingsReturnFocus;
  noteSettingsReturnFocus = null;
  if (returnFocus?.isConnected && !returnFocus.disabled) {
    returnFocus.focus({ preventScroll: true });
  }
}

function applyNoteSettings() {
  const note = getActiveNote();
  if (!note) {
    return;
  }
  const nextAppearance = getNoteSettingsFromForm();
  const currentAppearance = getNoteAppearance(note);
  if (
    currentAppearance.font === nextAppearance.font
    && currentAppearance.theme === nextAppearance.theme
  ) {
    updateNoteSettingsPreview();
    return;
  }

  Object.assign(note, nextAppearance);
  delete note.backgroundColor;
  delete note.textColor;
  note.updatedAt = new Date().toISOString();
  noteDate.dateTime = note.updatedAt;
  noteDate.textContent = `Edited ${formatShortDate(note.updatedAt).toLocaleLowerCase()}`;
  setNoteAppearance(noteBodyEditor, note);
  setNoteAppearance(noteSettingsPreview, note);
  renderNotesList();
  scheduleSave();
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
    setNoteAppearance(card, note);
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
  noteFormattingToolbar.hidden = note === null;
  pinButton.disabled = note === null;
  deleteButton.disabled = note === null;
  noteSettingsButtons.forEach((button) => {
    button.disabled = note === null;
  });
  setNoteAppearance(noteBodyEditor, note);

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
  renderNoteEditorContent(noteBodyInput.value, selection);
}

function render() {
  renderFilters();
  renderNotesList();
  renderEditor();
  const isEditorOpen = appShell.dataset.view === "editor";
  notesPane.inert = isEditorOpen;
  topNavbar.inert = isEditorOpen;
  updatePersistenceStatus(persistenceError ? "saved" : undefined);
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
    font: "default",
    theme: DEFAULT_NOTE_THEME,
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
  appShell.dataset.view = "editor";
  render();
  window.requestAnimationFrame(() => {
    noteBodyEditor.focus({ preventScroll: true });
    restoreMarkdownEditorSelection(noteBodyInput.value.length, noteBodyInput.value.length);
  });
}

function closeNoteEditor() {
  if (appShell.dataset.view !== "editor") {
    return;
  }
  appShell.dataset.view = "list";
  render();
  searchInput.focus({ preventScroll: true });
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
  if (noteDrag) {
    noteDrag.item.style.removeProperty("--drag-x");
    noteDrag.item.style.removeProperty("--drag-y");
  }
  notesList.querySelectorAll(".is-drop-target").forEach((item) => {
    item.classList.remove("is-drop-target");
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
    startScrollTop: notesList.parentElement.scrollTop,
    active: false,
    targetId: null
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

  noteDrag.item.style.setProperty("--drag-x", `${clientX - noteDrag.startX}px`);
  noteDrag.item.style.setProperty(
    "--drag-y",
    `${clientY - noteDrag.startY + notesList.parentElement.scrollTop - noteDrag.startScrollTop}px`
  );

  const target = document.elementFromPoint(clientX, clientY)?.closest("[data-note-item-id]");
  notesList.querySelectorAll(".is-drop-target").forEach((item) => {
    item.classList.remove("is-drop-target");
  });
  if (!target || target.dataset.noteItemId === noteDrag.noteId) {
    noteDrag.targetId = null;
    return;
  }

  noteDrag.targetId = target.dataset.noteItemId;
  target.classList.add("is-drop-target");
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
    reorderNote(drag.noteId, drag.targetId);
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
  const item = event.target.closest("[data-note-item-id]");
  const dragHandle = event.target.closest("[data-drag-note-id]");
  if (!item || (event.target.closest("button") && !dragHandle)) {
    return;
  }
  startNoteDrag(item, "pointer", event.pointerId, event.clientX, event.clientY);
});

window.addEventListener("pointermove", (event) => {
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

window.addEventListener("pointerup", (event) => {
  if (noteDrag?.input === "pointer" && event.pointerId === noteDrag.pointerId) {
    finishNoteDrag();
  }
});

window.addEventListener("pointercancel", () => {
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
  const checkbox = event.target.closest?.(".markdown-source-checkbox");
  if (checkbox && event.key === " ") {
    event.preventDefault();
    toggleNoteCheckbox(checkbox);
    return;
  }
  if (event.key !== "Enter" || event.isComposing || isMarkdownComposing) {
    return;
  }
  event.preventDefault();
  insertNoteEditorLineBreak();
});

noteBodyEditor.addEventListener("click", (event) => {
  const checkbox = event.target.closest?.(".markdown-source-checkbox");
  if (!checkbox) {
    return;
  }
  event.preventDefault();
  toggleNoteCheckbox(checkbox);
});

noteBodyEditor.addEventListener("beforeinput", (event) => {
  if (
    (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak")
    && !event.isComposing
    && !isMarkdownComposing
  ) {
    event.preventDefault();
    insertNoteEditorLineBreak();
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

noteBodyEditor.addEventListener("contextmenu", openNoteTextContextMenu);

noteFormattingToolbar.addEventListener("mousedown", (event) => {
  if (event.target.closest("[data-note-format]")) {
    event.preventDefault();
  }
});

noteFormattingToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-note-format]");
  if (!button) {
    return;
  }
  event.preventDefault();
  applyNoteFormatting(button.dataset.noteFormat);
});

noteTextContextMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-note-format], [data-note-context-action]");
  if (!button || !noteContextSelection) {
    return;
  }
  event.preventDefault();
  const selection = noteContextSelection;
  if (button.dataset.noteContextAction === "copy") {
    closeNoteTextContextMenu();
    copySelectedNoteText(selection);
    return;
  }

  noteBodyInput.setSelectionRange(selection.start, selection.end, selection.direction);
  closeNoteTextContextMenu();
  applyNoteFormatting(button.dataset.noteFormat, false);
});

noteTextContextMenu.addEventListener("keydown", (event) => {
  const items = Array.from(noteTextContextMenu.querySelectorAll('[role="menuitem"]'));
  const currentIndex = items.indexOf(document.activeElement);
  let nextIndex = null;
  if (event.key === "ArrowDown") {
    nextIndex = (currentIndex + 1) % items.length;
  } else if (event.key === "ArrowUp") {
    nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = items.length - 1;
  }
  if (nextIndex !== null) {
    event.preventDefault();
    items[nextIndex].focus();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!noteTextContextMenu.hidden && !noteTextContextMenu.contains(event.target)) {
    closeNoteTextContextMenu();
  }
});

window.addEventListener("resize", closeNoteTextContextMenu);
window.addEventListener("scroll", closeNoteTextContextMenu, true);

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
document.getElementById("back-to-notes").addEventListener("click", closeNoteEditor);

editorPane.addEventListener("click", (event) => {
  if (event.target === editorPane) {
    closeNoteEditor();
  }
});

editorPane.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") {
    return;
  }
  const focusableElements = Array.from(editorPane.querySelectorAll(
    'button:not(:disabled), [contenteditable="plaintext-only"], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'
  )).filter((element) => !element.closest("[hidden]"));
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

noteSettingsButtons.forEach((button) => {
  button.addEventListener("click", () => openNoteSettings(button));
});

noteSettingsModal.addEventListener("click", (event) => {
  if (event.target === noteSettingsModal) {
    closeNoteSettings();
  }
});

noteSettingsModal.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") {
    return;
  }
  const focusableElements = Array.from(noteSettingsModal.querySelectorAll(
    'button:not(:disabled):not([tabindex="-1"]), select:not(:disabled), input:not(:disabled), [role="radio"][tabindex="0"]'
  ));
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

document.getElementById("close-note-settings").addEventListener("click", closeNoteSettings);
document.getElementById("done-note-settings").addEventListener("click", closeNoteSettings);
document.getElementById("reset-note-settings").addEventListener("click", () => {
  noteSettingsFont.value = "default";
  renderNoteThemeChoices(DEFAULT_NOTE_THEME);
  updateNoteSettingsPreview();
  applyNoteSettings();
});

noteSettingsFont.addEventListener("input", updateNoteSettingsPreview);
noteSettingsFont.addEventListener("change", applyNoteSettings);

noteSettingsThemeGrid.addEventListener("click", (event) => {
  const choice = event.target.closest?.("[data-note-theme]");
  if (choice) {
    selectNoteTheme(choice.dataset.noteTheme);
  }
});

noteSettingsThemeGrid.addEventListener("keydown", (event) => {
  const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
    ? 1
    : ["ArrowLeft", "ArrowUp"].includes(event.key)
      ? -1
      : 0;
  const choices = Array.from(noteSettingsThemeGrid.querySelectorAll("[data-note-theme]"));
  const currentChoice = event.target.closest?.("[data-note-theme]");
  const currentIndex = choices.indexOf(currentChoice);
  if (!direction || currentIndex === -1) {
    return;
  }
  event.preventDefault();
  const nextIndex = (currentIndex + direction + choices.length) % choices.length;
  choices[nextIndex].focus();
  selectNoteTheme(choices[nextIndex].dataset.noteTheme);
});

window.addEventListener("keydown", (event) => {
  if (!noteSettingsModal.hidden) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeNoteSettings();
    }
    return;
  }

  if (event.key === "Escape" && !noteTextContextMenu.hidden) {
    const selection = noteContextSelection;
    event.preventDefault();
    closeNoteTextContextMenu();
    if (selection) {
      noteBodyEditor.focus({ preventScroll: true });
      restoreMarkdownEditorSelection(selection.start, selection.end, selection.direction);
    }
    return;
  }

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
  if (event.key === "Escape" && appShell.dataset.view === "editor") {
    closeNoteEditor();
  }
});

window.addEventListener("pagehide", () => {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
    persistNotes();
  }
});

renderNoteFontOptions();
if (initialState.needsInitialization) {
  persistNotes();
}
render();
