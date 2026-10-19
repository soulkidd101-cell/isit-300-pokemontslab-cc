/**
 * ISIT 300 — Week 7 TypeScript error lab
 *
 * The finished class demo is still here: fetch the first 24 Pokémon,
 * draw one card each, and cache that list in localStorage.
 *
 * Search, sort, the card-count badge, Caught, and Look up are new.
 * Ten lines in that new code are type errors. Each one is numbered
 * below with a comment that starts "ERROR".
 *
 * Bun still serves the page. It does not check types. The editor does:
 * open the Problems panel to see the ten errors.
 *
 * Rules: do not use `any`, `as`, or `// @ts-ignore`, and do not change
 * an interface or a return type to make an error go away.
 */

const PAGE_SIZE = 24;
const LIST_URL = `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}`;
const STORAGE_KEY = "isit300-pokemon";
const CAUGHT_KEY = "isit300-pokemon-caught";

// Only the fields the page renders. The API returns much more.
interface PokemonListEntry {
  name: string;
  url: string;
}

interface PokemonListResponse {
  results: PokemonListEntry[];
}

interface PokemonTypeSlot {
  type: {
    name: string;
  };
}

interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonTypeSlot[];
}

// A caught Pokémon. nickname is optional: the box can be left empty.
interface CaughtRecord {
  id: number;
  nickname?: string;
}

interface PokemonSummary {
  id: number;
  name: string;
  primaryType: string;
}

interface PokemonStat {
  name: string;
  value: number;
}

interface PokemonMeasurement {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
}

// The stat shape the API sends. toStat turns it into PokemonStat.
interface ApiStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface ApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: ApiStat[];
}

let current: PokemonDetail[] = [];
let caught: CaughtRecord[] = [];

function requireElement(selector: string): HTMLElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function requireButton(selector: string): HTMLButtonElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Missing button: ${selector}`);
  }
  return element;
}

function requireSelect(selector: string): HTMLSelectElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error(`Missing select: ${selector}`);
  }
  return element;
}

function requireInput(selector: string): HTMLInputElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Missing input: ${selector}`);
  }
  return element;
}

const loadButton = requireButton("#load-button");
const lookupButton = requireButton("#lookup-button");
const statusElement = requireElement("#status");
const emptyElement = requireElement("#empty");
const countElement = requireElement("#count");
const toneElement = requireElement("#tone");
const grid = requireElement("#pokedex");
const searchInput = requireInput("#search");
const sortSelect = requireSelect("#sort");
const nicknameInput = requireInput("#nickname");
const matchElement = requireElement("#match");
const spotlight = requireElement("#spotlight");
const spotlightNumber = requireElement("#spotlight-number");
const spotlightName = requireElement("#spotlight-name");
const spotlightSummary = requireElement("#spotlight-summary");
const spotlightMeasure = requireElement("#spotlight-measure");
const spotlightHp = requireElement("#spotlight-hp");
const spotlightNickname = requireElement("#spotlight-nickname");

function setBusy(isBusy: boolean): void {
  loadButton.disabled = isBusy;
  lookupButton.disabled = isBusy;
  grid.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function refreshChrome(): void {
  const showingStatus = !statusElement.hidden;
  const count = grid.childElementCount;
  emptyElement.hidden = count > 0 || showingStatus;
  countElement.textContent = count === 1 ? "1 shown" : `${count} shown`;
  toneElement.textContent = toneLabel(countTone(count));
}

function setStatus(message: string, kind: "loading" | "saved" | "error" = "loading"): void {
  statusElement.textContent = message;
  statusElement.classList.toggle("is-error", kind === "error");
  statusElement.classList.toggle("is-saved", kind === "saved");
  statusElement.hidden = message.length === 0;
  statusElement.setAttribute("role", kind === "error" ? "alert" : "status");
  refreshChrome();
}

function clearGrid(): void {
  grid.replaceChildren();
  refreshChrome();
}

function formatNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

function formatName(name: string): string {
  return name
    .split("-")
    .map(function (part) {
      if (part.length === 0) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function renderCard(pokemon: PokemonDetail): void {
  const card = document.createElement("li");
  card.className = "card";
  card.dataset.id = String(pokemon.id);
  card.classList.toggle("is-caught", isCaught(pokemon.id));

  const number = document.createElement("p");
  number.className = "number";
  number.textContent = formatNumber(pokemon.id);

  const name = document.createElement("h3");
  name.className = "name";
  name.textContent = formatName(pokemon.name);

  const types = document.createElement("ul");
  types.className = "types";

  pokemon.types.forEach(function (slot) {
    const chip = document.createElement("li");
    chip.className = "type";
    chip.dataset.type = slot.type.name;
    chip.textContent = formatName(slot.type.name);
    types.appendChild(chip);
  });

  const record = findCaught(pokemon.id);
  const nickname = document.createElement("p");
  nickname.className = "nickname";
  if (record) {
    nickname.textContent = caughtLabel(record, pokemon.name);
  } else {
    nickname.hidden = true;
  }

  const catchButton = document.createElement("button");
  catchButton.type = "button";
  catchButton.className = "btn caught";
  catchButton.textContent = isCaught(pokemon.id) ? "Release" : "Caught";
  catchButton.setAttribute("aria-pressed", isCaught(pokemon.id) ? "true" : "false");
  catchButton.addEventListener("click", function () {
    catchFromCard(card);
  });

  card.append(number, name, nickname, types, catchButton);
  grid.appendChild(card);
}

// The live API object is much bigger than this interface. Store only the fields we render.
function toStoredPokemon(pokemon: PokemonDetail): PokemonDetail {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map(function (slot) {
      return {
        type: { name: slot.type.name },
      };
    }),
  };
}

function savePokemon(pokemon: PokemonDetail[]): void {
  const stored = pokemon.map(toStoredPokemon);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  console.log("Saved", stored.length, "Pokémon to localStorage.");
}

function loadCachedPokemon(): PokemonDetail[] | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PokemonDetail[];
    if (!Array.isArray(parsed) || parsed.length !== PAGE_SIZE) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Could not read cached Pokémon:", error);
    return null;
  }
}

function renderPokemon(pokemon: PokemonDetail[]): void {
  current = pokemon;
  const visible = sortPokemon(filterByQuery(pokemon, readQuery()), readSort());
  clearGrid();
  visible.forEach(function (item) {
    renderCard(item);
  });
  refreshChrome();
  updateMatchLine();
}

// json() does not know this API. `as PokemonDetail` names the shape we expect.
async function fetchPokemon(url: string): Promise<PokemonDetail> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load Pokémon (${response.status})`);
  }
  return (await response.json()) as PokemonDetail;
}

async function fetchPokemonList(): Promise<PokemonListResponse> {
  const response = await fetch(LIST_URL);
  if (!response.ok) {
    throw new Error(`Could not load the list (${response.status})`);
  }
  return (await response.json()) as PokemonListResponse;
}

async function loadPokedex(forceRefresh = false): Promise<void> {
  if (!forceRefresh) {
    const cached = loadCachedPokemon();
    if (cached) {
      renderPokemon(cached);
      setStatus("Loaded from this browser.", "saved");
      console.log("Loaded Pokémon from localStorage.");
      return;
    }
  }

  setBusy(true);
  setStatus("Loading the first 24 Pokémon…");
  clearGrid();

  try {
    const list = await fetchPokemonList();
    // One request per entry. Promise.all waits until every request finishes.
    const details = await Promise.all(
      list.results.map(function (entry) {
        return fetchPokemon(entry.url);
      }),
    );

    savePokemon(details);
    renderPokemon(details);
    setStatus("Saved in this browser.", "saved");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    setStatus(message, "error");
  } finally {
    setBusy(false);
  }
}

function readQuery(): string {
  return searchInput.value.trim().toLowerCase();
}

function filterByQuery(list: PokemonDetail[], query: string): PokemonDetail[] {
  if (query.length === 0) {
    return list;
  }
  return list.filter(function (pokemon) {
    return pokemon.name.includes(query);
  });
}

function sortPokemon(list: PokemonDetail[], key: "id" | "name"): PokemonDetail[] {
  const copy = list.slice();
  copy.sort(function (a, b) {
    if (key === "name") {
      return a.name.localeCompare(b.name);
    }
    return a.id - b.id;
  });
  return copy;
}

function updateMatchLine(): void {
  const query = readQuery();
  if (query.length === 0) {
    matchElement.hidden = true;
    return;
  }
  matchElement.hidden = false;
  matchElement.textContent = speciesLabel(current, query);
}

function toneLabel(tone: "none" | "one" | "many"): string {
  if (tone === "none") {
    return "No cards";
  }
  if (tone === "one") {
    return "One card";
  }
  if (tone === "many") {
    return "Several cards";
  }
  return tone;
}

function loadCaught(): CaughtRecord[] {
  const raw = localStorage.getItem(CAUGHT_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as CaughtRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.error("Could not read caught Pokémon:", error);
    return [];
  }
}

function saveCaught(): void {
  localStorage.setItem(CAUGHT_KEY, JSON.stringify(caught));
  console.log("Saved", caught.length, "caught Pokémon.");
}

function findCaught(id: number): CaughtRecord | undefined {
  return caught.find(function (record) {
    return record.id === id;
  });
}

function isCaught(id: number): boolean {
  return findCaught(id) !== undefined;
}

function readNickname(): string | undefined {
  const nickname = nicknameInput.value.trim();
  if (nickname.length === 0) {
    return undefined;
  }
  return nickname;
}

function rememberCaught(id: number): void {
  if (isCaught(id)) {
    caught = caught.filter(function (record) {
      return record.id !== id;
    });
  } else {
    caught.push({
      id: id,
      nickname: readNickname(),
    });
  }
  saveCaught();
}

function toStat(entry: ApiStat): PokemonStat {
  return {
    name: entry.stat.name,
    value: entry.base_stat,
  };
}

function toMeasurement(raw: ApiPokemon): PokemonMeasurement {
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    types: raw.types,
    stats: raw.stats.map(toStat),
  };
}

async function loadMeasurement(name: string): Promise<PokemonMeasurement> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error(`Could not look up "${name}" (${response.status})`);
  }
  const raw = (await response.json()) as ApiPokemon;
  return toMeasurement(raw);
}

// PokéAPI sends height in decimeters and weight in hectograms.
function formatHeight(decimeters: number): string {
  return `${(decimeters / 10).toFixed(1)} m`;
}

function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

function hpLine(measurement: PokemonMeasurement): string {
  const hp = measurement.stats.find(function (stat) {
    return stat.name === "hp";
  });
  if (!hp) {
    return "HP unknown";
  }
  return formatStat(hp);
}

// ---------------------------------------------------------------------------
// The ten errors are below. Fix each one without changing the line's job.
// ---------------------------------------------------------------------------

// ERROR 1 — Caught button. The card stores its id as text in data-id.
// rememberCaught needs a number.
function catchFromCard(card: HTMLElement): void {
  const rawId = card.dataset.id ?? "";
  rememberCaught(Number(rawId));
  renderPokemon(current);
}

// ERROR 2 — Look up number line. pokemon.id is a number.
// formatNumber, near the top of this file, already turns a number into "#001".
function renderSpotlightNumber(pokemon: PokemonMeasurement): void {
  spotlightNumber.textContent = formatNumber(pokemon.id);
}

// ERROR 3 — Sort menu. The menu's two values are "id" and "name".
function readSort(): "id" | "name" {
  if (sortSelect.value === "name") {
    return "name";
  }
  return "id";
}

// ERROR 4 — Match line. find returns undefined when no name matches exactly.
// When that happens, show "No exact match".
function speciesLabel(list: PokemonDetail[], name: string): string {
  const match = list.find(function (pokemon) {
    return pokemon.name === name;
  });

  if (!match) {
    return "No exact match";
  }

  return `Match: ${formatName(match.name)}`;
}

// ERROR 5 — Look up HP line. Read the PokemonStat interface for the field name.
function formatStat(stat: PokemonStat): string {
  return `${formatName(stat.name)} ${stat.value}`;
}

// ERROR 6 — Look up type line. PokemonSummary has three fields.
// The first type is pokemon.types[0].type.name.
function summarize(pokemon: PokemonDetail): PokemonSummary {
  return {
    id: pokemon.id,
    name: formatName(pokemon.name),
    primaryType: pokemon.types[0].type.name,
  };
}

// ERROR 7 — Nickname line. nickname is optional in CaughtRecord.
// When it is missing, use the species name instead.
function caughtLabel(record: CaughtRecord, speciesName: string): string {
  const label = record.nickname ?? formatName(speciesName);
  return `Caught as ${label}`;
}

// ERROR 8 — Card-count badge. Zero cards should read "No cards".
function countTone(count: number): "none" | "one" | "many" {
  if (count === 0) {
    return "none";
  }
  if (count === 1) {
    return "one";
  }
  return "many";
}

// ERROR 9 — Look up turns the buttons off while it loads.
// The last line should turn them back on.
// ERROR 10 — loadMeasurement is async. It hands back a Promise, not a Pokémon.
async function showSpotlight(name: string): Promise<void> {
  setBusy(true);
  try {
    const pokemon = await loadMeasurement(name);
    renderSpotlight(pokemon);
    setStatus(`Looked up ${formatName(name)}.`, "saved");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not look up that Pokémon.";
    setStatus(message, "error");
  } finally {
    setBusy(false);
  }
}

function renderSpotlight(pokemon: PokemonMeasurement): void {
  const summary = summarize(pokemon);
  spotlight.hidden = false;
  spotlightName.textContent = summary.name;
  spotlightSummary.textContent = summary.primaryType
    ? formatName(summary.primaryType)
    : "Type missing";
  spotlightMeasure.textContent = `${formatHeight(pokemon.height)} · ${formatWeight(pokemon.weight)}`;
  spotlightHp.textContent = hpLine(pokemon);

  const record = findCaught(pokemon.id);
  if (record) {
    spotlightNickname.hidden = false;
    spotlightNickname.textContent = caughtLabel(record, pokemon.name);
  } else {
    spotlightNickname.hidden = true;
  }

  renderSpotlightNumber(pokemon);
}

loadButton.addEventListener("click", function () {
  void loadPokedex(true);
});

searchInput.addEventListener("input", function () {
  renderPokemon(current);
});

sortSelect.addEventListener("change", function () {
  renderPokemon(current);
});

lookupButton.addEventListener("click", function () {
  const name = readQuery();
  if (name.length === 0) {
    setStatus("Type a Pokémon name in Search first.", "error");
    return;
  }
  void showSpotlight(name);
});

caught = loadCaught();
void loadPokedex();
