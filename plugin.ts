/**
 * Terrain from Image — a plugin for the scmJS map editor, and the worked example for
 * its plugin API (https://github.com/jeany55/scm-js/blob/main/docs/plugins.md).
 *
 * File ▸ Import ▸ Terrain from Image… opens a dialog; the terrain palette's and the map's
 * context menus add *Terrain from Image into Area…*, which first lets you drag the target
 * rectangle on the map (`api.ui.pickArea`) and then opens the dialog with it selected.
 * In the dialog: bring a picture in (file, Ctrl+V, drop, URL), say where it goes and how
 * it fits, tune it (brightness, contrast, saturation, hue, gamma), choose the terrains it
 * may become — each with a *key colour* it matches, settable from the picture with the
 * eyedropper — and how cells are matched and cleaned up, preview, apply. Apply is one
 * `api.document.edit` transaction — one undo step — painting every lattice diamond in
 * the target with the isometric brush (low ground first, rare features last) so cliffs
 * and shores are generated at the boundaries, or stamping flat pairs when the map has no
 * ISOM (or the user asks for tiles).
 *
 * Plain DOM only: a plugin's dialog is an element the host hands over, so this file
 * carries a tiny `h()` builder and its own scoped stylesheet. `convert.ts` is the pure
 * part; everything that touches a canvas lives here. `plugin-api/` is the editor's
 * emitted type declarations (`npm run build:plugin-types` there), vendored so this
 * repository type-checks on its own; the host erases the type-only import.
 */
import type { ContextMenuContext, DialogHandle, DialogTransfer, PluginApi, Rect, TerrainType } from "./plugin-api/plugins/api";
import {
  adjustSamples, boxBlur, cellsByTerrain, countCells, DEFAULT_ADJUSTMENTS, diamondTerrain, fitRect, fromHex, isNeutral, matchTerrains, paintOrder, toHex, unpack,
  type Adjustments, type Fit, type MatchMode, type TerrainChoice,
} from "./convert";

/* ── DOM helpers ────────────────────────────────────────── */

type Child = Node | string | null | undefined | false;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "className") el.className = String(v);
      else if (k === "style") el.setAttribute("style", String(v));
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      else if (k in el && typeof v !== "string") (el as unknown as Record<string, unknown>)[k] = v;
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(typeof c === "string" ? document.createTextNode(c) : c);
  return el;
}

const STYLE = `
.tfi { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 14px; font-size: 12px; min-height: 0; flex: 1; }
.tfi .tfi-controls { display: flex; flex-direction: column; gap: 10px; min-height: 0; overflow: auto; padding-right: 6px; }
.tfi .tfi-side { display: flex; flex-direction: column; gap: 10px; min-height: 0; min-width: 0; }
.tfi .tfi-sec { display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--border, #333); border-radius: 4px; background: var(--bg-1, #14171d); }
.tfi .tfi-sec > header { display: flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: .04em; text-transform: uppercase; color: var(--text-dim, #99a2b3); }
.tfi .tfi-sec > header .tfi-spacer { flex: 1; }
.tfi .tfi-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tfi .tfi-row.wrap { flex-wrap: wrap; }
.tfi .tfi-row > label:first-child { min-width: 66px; color: var(--text-dim, #99a2b3); }
.tfi .tfi-row > select.grow { flex: 1; min-width: 0; }
.tfi .tfi-slider { display: grid; grid-template-columns: 66px 1fr 40px; align-items: center; gap: 8px; }
.tfi .tfi-slider > label { color: var(--text-dim, #99a2b3); }
.tfi .tfi-slider > input[type=range] { width: 100%; margin: 0; }
.tfi .tfi-slider > output { text-align: right; font-variant-numeric: tabular-nums; color: var(--text, #e6e9ef); }
.tfi .tfi-num { width: 60px; }
.tfi .tfi-url { flex: 1; min-width: 0; }
.tfi .tfi-hint { color: var(--text-dim, #99a2b3); }
.tfi .tfi-file { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tfi .tfi-drop { border: 1px dashed var(--border-strong, #3b4453); border-radius: 4px; padding: 6px 8px; text-align: center; color: var(--text-faint, #6b7382); }
.tfi .tfi-previews { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tfi .tfi-preview { display: flex; flex-direction: column; gap: 4px; align-items: center; min-width: 0; }
.tfi .tfi-preview > span { font-size: 11px; color: var(--text-dim, #99a2b3); }
.tfi .tfi-canvas { display: grid; place-items: center; width: 100%; aspect-ratio: 1; background: var(--bg-0, #0a0c10); border: 1px solid var(--border, #333); border-radius: 3px; overflow: hidden; }
.tfi .tfi-canvas canvas { image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain; }
.tfi .tfi-canvas.dropper canvas { cursor: crosshair; }
.tfi .tfi-terrains { display: flex; flex-direction: column; gap: 1px; min-height: 80px; overflow: auto; padding: 4px; border: 1px solid var(--border, #333); background: var(--bg-0, #111); flex: 1; }
.tfi .tfi-terrain { display: grid; grid-template-columns: 16px 20px 22px 1fr 52px; align-items: center; gap: 6px; height: 22px; padding: 0 2px; border-radius: 3px; }
.tfi .tfi-terrain:hover { background: var(--bg-2, #1b1f27); }
.tfi .tfi-terrain.off { opacity: .55; }
.tfi .tfi-terrain input[type=color] { width: 20px; height: 18px; padding: 0; border: 1px solid rgba(0,0,0,.6); border-radius: 2px; background: none; cursor: pointer; }
.tfi .tfi-terrain input[type=color]::-webkit-color-swatch-wrapper { padding: 0; }
.tfi .tfi-terrain input[type=color]::-webkit-color-swatch { border: none; }
.tfi .tfi-terrain input[type=color].custom { outline: 1px solid var(--gold, #e6b95c); outline-offset: 1px; }
.tfi .tfi-terrain .tfi-eye { width: 22px; height: 18px; padding: 0; font-size: 12px; line-height: 1; }
.tfi .tfi-terrain .tfi-eye.armed { background: var(--teal-dim, #2c8a83); color: #fff; }
.tfi .tfi-terrain .tfi-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tfi .tfi-terrain .tfi-count { text-align: right; color: var(--text-faint, #6b7382); font-variant-numeric: tabular-nums; }
.tfi .tfi-summary { color: var(--text-dim, #99a2b3); min-height: 16px; }
.tfi .btn.sm { height: 22px; padding: 0 8px; font-size: 11px; }
.tfi .error-text { color: #ffb3b0; }
`;

/* ── Image sampling ─────────────────────────────────────── */

type Sampling = "smooth" | "nearest";

interface SampleOptions { fit: Fit; flipH: boolean; flipV: boolean; sampling: Sampling }

/**
 * One RGBA sample per target cell: the picture placed over the `width × height` grid per
 * `fit` (cells it does not cover stay transparent), flipped as asked, stepping down by
 * halves first so a large smooth downscale averages its pixels rather than skipping them.
 */
function resampleImage(img: ImageBitmap, width: number, height: number, opts: SampleOptions): Uint8ClampedArray {
  const place = fitRect(img.width, img.height, width, height, opts.fit);
  let src: CanvasImageSource = img;
  let w = img.width, hh = img.height;
  if (opts.sampling === "smooth") {
    while (w / 2 >= place.dw && hh / 2 >= place.dh) {
      w = Math.max(1, Math.floor(w / 2));
      hh = Math.max(1, Math.floor(hh / 2));
      const step = document.createElement("canvas");
      step.width = w;
      step.height = hh;
      const ctx = step.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, 0, 0, w, hh);
      src = step;
    }
  }
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = opts.sampling === "smooth";
  ctx.imageSmoothingQuality = "high";
  ctx.translate(opts.flipH ? width : 0, opts.flipV ? height : 0);
  ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);
  ctx.drawImage(src, place.dx, place.dy, place.dw, place.dh);
  return ctx.getImageData(0, 0, width, height).data;
}

/** Blit RGBA samples into a canvas, sized to the cell grid (CSS scales it up, pixelated). */
function showSamples(canvas: HTMLCanvasElement, rgba: Uint8ClampedArray, width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(width, height);
  img.data.set(rgba);
  ctx.putImageData(img, 0, 0);
}

/* ── Settings and session ───────────────────────────────── */

type Method = "isom" | "tiles";

/** What the dialog remembers between uses (`api.storage`). */
interface Settings {
  method: Method;
  mode: MatchMode;
  balance: number;
  smooth: number;
  despeckle: number;
  minRegion: number;
  fit: Fit;
  flipH: boolean;
  flipV: boolean;
  sampling: Sampling;
  adjust: Adjustments;
}

const DEFAULT_SETTINGS: Settings = {
  method: "isom", mode: "adaptive", balance: 0.5, smooth: 1, despeckle: 1, minRegion: 3,
  fit: "stretch", flipH: false, flipV: false, sampling: "smooth", adjust: { ...DEFAULT_ADJUSTMENTS },
};

/**
 * Everything the dialog holds that must outlive one showing of it: the dialog is closed
 * and reopened around a pick on the map, and the picture must not be lost in between.
 */
interface Session {
  image: ImageBitmap | null;
  imageName: string;
  target: "map" | "marked" | "custom";
  custom: Rect;
  marked: Rect | null;
  settings: Settings;
  /** Terrain ids ticked; empty until the list first shows (then everything). */
  chosen: Set<number>;
  /** Key colours the user changed, by terrain id. */
  keys: Map<number, number>;
  /** The terrain whose key colour the next click on the source preview sets. */
  dropper: number | null;
}

function loadSettings(api: PluginApi): Settings {
  const stored = api.storage.get<Partial<Settings>>("settings", {});
  return { ...DEFAULT_SETTINGS, ...stored, adjust: { ...DEFAULT_ADJUSTMENTS, ...stored.adjust } };
}

function loadKeys(api: PluginApi): Map<number, number> {
  const stored = api.storage.get<Record<string, number>>(`keys.${api.tileset.id() ?? "none"}`, {});
  return new Map(Object.entries(stored).map(([k, v]) => [Number(k), v]));
}

function saveKeys(api: PluginApi, keys: Map<number, number>) {
  api.storage.set(`keys.${api.tileset.id() ?? "none"}`, Object.fromEntries([...keys].map(([k, v]) => [String(k), v])));
}

function newSession(api: PluginApi, marked: Rect | null, custom: Rect | null): Session {
  const info = api.document.info()!;
  const settings = loadSettings(api);
  if (settings.method === "isom" && !api.terrain.hasIsom()) settings.method = "tiles";
  return {
    image: null,
    imageName: "",
    target: custom ? "custom" : marked ? "marked" : "map",
    custom: custom ?? marked ?? { x0: 0, y0: 0, x1: info.width, y1: info.height },
    marked,
    settings,
    chosen: new Set(),
    keys: loadKeys(api),
    dropper: null,
  };
}

const normalizeRect = (r: Rect, w: number, hh: number): Rect => ({
  x0: Math.max(0, Math.min(r.x0, r.x1)), y0: Math.max(0, Math.min(r.y0, r.y1)),
  x1: Math.min(w, Math.max(r.x0, r.x1)), y1: Math.min(hh, Math.max(r.y0, r.y1)),
});

/* ── The dialog ─────────────────────────────────────────── */

function openDialog(api: PluginApi, session: Session) {
  const info = api.document.info();
  if (!info) { api.ui.status("Open or create a map first."); return; }
  const s = session;
  const mapRect: Rect = { x0: 0, y0: 0, x1: info.width, y1: info.height };
  let types: TerrainType[] = [];
  let isomIds = new Set<number>();
  let grid: Int32Array | null = null;
  let choices: TerrainChoice[] = [];
  /** The samples the matcher saw (adjusted, blurred) — what the eyedropper reads. */
  let samples: Uint8ClampedArray | null = null;
  let gridW = 0, gridH = 0;
  let rawCache: { key: string; data: Uint8ClampedArray } | null = null;
  let handle: DialogHandle | null = null;
  let update: () => void = () => {};
  let setImage: (image: ImageBitmap, name: string) => void = () => {};
  let showProblem: (text: string) => void = () => {};

  const saveSettings = () => api.storage.set("settings", s.settings);
  const targetRect = (): Rect => normalizeRect(s.target === "marked" && s.marked ? s.marked : s.target === "custom" ? s.custom : mapRect, info.width, info.height);
  const listed = () => (s.settings.method === "isom" ? types.filter((t) => isomIds.has(t.id)) : types);
  const keyOf = (id: number) => s.keys.get(id) ?? api.terrain.terrainColor(id) ?? 0;

  /** Bring in whatever a paste, a drop or a URL box hands over. */
  const takeTransfer = async (t: DialogTransfer) => {
    const file = t.files.find((f) => f.type.startsWith("image/")) ?? t.files[0];
    if (file) { await loadFrom(file, file.name); return; }
    if (t.text) await loadFrom(t.text, t.text.replace(/^data:.*$/, "pasted image").split("/").pop() ?? "image");
  };
  const loadFrom = async (source: Blob | string, name: string) => {
    showProblem("Loading…");
    try {
      const image = await api.ui.loadImage(source);
      setImage(image, name);
    } catch (err) {
      showProblem(err instanceof Error ? err.message : String(err));
    }
  };

  handle = api.ui.dialog({
    title: "Terrain from Image",
    size: "xl",
    tall: true,
    buttons: [
      { label: "Apply", primary: true, run: () => apply() },
      { label: "Cancel" },
    ],
    onPaste: (t) => { void takeTransfer(t); },
    onDrop: (t) => { void takeTransfer(t); },
    mount(body) {
      const root = h("div", { className: "tfi" });
      root.append(h("style", null, STYLE));
      body.append(root);
      const controls = h("div", { className: "tfi-controls" });
      const side = h("div", { className: "tfi-side" });
      root.append(controls, side);

      const section = (title: string, ...extra: Child[]) => {
        const sec = h("div", { className: "tfi-sec" }, h("header", null, title, h("span", { className: "tfi-spacer" }), ...extra));
        controls.append(sec);
        return sec;
      };
      const btn = (label: string, onClick: () => void, title?: string) => h("button", { className: "btn sm", type: "button", title, onClick }, label);
      const select = (label: string, options: [string, string][], value: string, onChange: (v: string) => void) => {
        const sel = h("select", { className: "select", style: "width: auto", "aria-label": label, onChange: () => onChange(sel.value) }, ...options.map(([v, text]) => h("option", { value: v }, text)));
        sel.value = value;
        return sel;
      };
      const tick = (label: string, checked: boolean, onChange: (v: boolean) => void, title?: string) => {
        const input = h("input", { type: "checkbox", checked, onChange: () => onChange(input.checked) });
        return h("label", { className: "check", title }, input, label);
      };

      /* Image */
      const fileLine = h("span", { className: "tfi-hint tfi-file" }, "no image yet");
      showProblem = (text) => { fileLine.textContent = text; fileLine.className = "tfi-file error-text"; };
      const urlInput = h("input", { className: "input tfi-url", type: "text", placeholder: "https://…/picture.png", "aria-label": "Image URL", onKeyDown: (e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); void loadFrom(urlInput.value, urlInput.value.split("/").pop() ?? "image"); } } });
      const image = section("Image");
      image.append(
        h("div", { className: "tfi-row wrap" },
          btn("Choose File…", () => { void (async () => { const [file] = await api.ui.pickFiles({ accept: "image/*" }); if (file) await loadFrom(file, file.name); })(); }),
          btn("Paste", () => {
            void (async () => {
              const blob = await api.ui.readClipboardImage();
              if (blob) await loadFrom(blob, "pasted image");
              else showProblem("No picture on the clipboard that the page may read — press Ctrl+V in this dialog instead.");
            })();
          }, "Take the picture on the system clipboard (Ctrl+V works too)"),
          fileLine,
        ),
        h("div", { className: "tfi-row" }, urlInput, btn("Load", () => { void loadFrom(urlInput.value, urlInput.value.split("/").pop() ?? "image"); }, "Fetch the picture at this address")),
        h("div", { className: "tfi-drop" }, "…or drop a picture on this dialog, or press Ctrl+V"),
      );

      /* Target */
      const targetSel = select("Target area", [
        ["map", `Whole map (${info.width} × ${info.height})`],
        ...(s.marked ? [["marked", `Marked area (${s.marked.x1 - s.marked.x0} × ${s.marked.y1 - s.marked.y0} at ${s.marked.x0}, ${s.marked.y0})`] as [string, string]] : []),
        ["custom", "Rectangle"],
      ], s.target, (v) => { s.target = v as Session["target"]; syncCustom(); update(); });
      const num = (label: string, get: () => number, set: (v: number) => void) => {
        const input = h("input", { className: "input tfi-num", type: "number", min: 0, step: 1, "aria-label": label, onChange: () => { set(Number(input.value) || 0); update(); } });
        input.value = String(get());
        return input;
      };
      const cx = num("Left", () => s.custom.x0, (v) => { s.custom = { ...s.custom, x1: v + (s.custom.x1 - s.custom.x0), x0: v }; });
      const cy = num("Top", () => s.custom.y0, (v) => { s.custom = { ...s.custom, y1: v + (s.custom.y1 - s.custom.y0), y0: v }; });
      const cw = num("Width", () => s.custom.x1 - s.custom.x0, (v) => { s.custom = { ...s.custom, x1: s.custom.x0 + v }; });
      const ch = num("Height", () => s.custom.y1 - s.custom.y0, (v) => { s.custom = { ...s.custom, y1: s.custom.y0 + v }; });
      const customRow = h("div", { className: "tfi-row" }, h("label", null, "Rectangle"), h("span", { className: "tfi-hint" }, "x"), cx, h("span", { className: "tfi-hint" }, "y"), cy, h("span", { className: "tfi-hint" }, "w"), cw, h("span", { className: "tfi-hint" }, "h"), ch);
      const pickBtn = btn("Pick on Map…", () => { void pickTarget(); }, "Close this dialog, drag the target rectangle on the map, and come back here with it selected");
      targetSel.classList.add("grow");
      targetSel.style.width = "";
      section("Target").append(h("div", { className: "tfi-row" }, h("label", null, "Paint into"), targetSel), h("div", { className: "tfi-row" }, h("label", null, ""), pickBtn, h("span", { className: "tfi-hint" }, "drag the rectangle on the map")), customRow);
      const syncCustom = () => {
        customRow.style.display = s.target === "custom" ? "" : "none";
        cx.value = String(s.custom.x0); cy.value = String(s.custom.y0);
        cw.value = String(s.custom.x1 - s.custom.x0); ch.value = String(s.custom.y1 - s.custom.y0);
      };
      syncCustom();
      const pickTarget = async () => {
        handle?.close();
        const rect = await api.ui.pickArea({ prompt: "Terrain from Image: drag the target rectangle" });
        if (rect && rect.x1 > rect.x0 && rect.y1 > rect.y0) { s.target = "custom"; s.custom = rect; }
        openDialog(api, s);
      };

      /* Fit */
      const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { s.settings[k] = v; saveSettings(); update(); };
      section("Fit").append(
        h("div", { className: "tfi-row" },
          h("label", null, "Picture"),
          select("Fit", [["stretch", "Stretch to the area"], ["contain", "Fit inside (letterbox)"], ["cover", "Fill the area (crop)"]], s.settings.fit, (v) => set("fit", v as Fit)),
        ),
        h("div", { className: "tfi-row" },
          h("label", null, "Flip"),
          tick("Horizontally ↔", s.settings.flipH, (v) => set("flipH", v)),
          tick("Vertically ↕", s.settings.flipV, (v) => set("flipV", v)),
        ),
        h("div", { className: "tfi-row" },
          h("label", null, "Sampling"),
          select("Sampling", [["smooth", "Smooth (photos)"], ["nearest", "Nearest (pixel art, one pixel per tile)"]], s.settings.sampling, (v) => set("sampling", v as Sampling)),
        ),
      );

      /* Adjust */
      const sliders: { input: HTMLInputElement; out: HTMLOutputElement; get: () => number; fmt: (v: number) => string }[] = [];
      const slider = (label: string, min: number, max: number, step: number, get: () => number, setV: (v: number) => void, fmt: (v: number) => string = (v) => String(v)) => {
        const out = h("output", null, fmt(get()));
        const input = h("input", { type: "range", min, max, step, "aria-label": label, onInput: () => { setV(Number(input.value)); out.textContent = fmt(Number(input.value)); saveSettings(); update(); } });
        input.value = String(get());
        sliders.push({ input, out, get, fmt });
        return h("div", { className: "tfi-slider" }, h("label", null, label), input, out);
      };
      const adj = () => s.settings.adjust;
      const signed = (v: number) => (v > 0 ? `+${v}` : String(v));
      const autoTick = tick("Auto-levels", adj().autoLevels, (v) => { adj().autoLevels = v; saveSettings(); update(); }, "Stretch the picture's darkest and brightest to black and white first");
      const invertTick = tick("Invert", adj().invert, (v) => { adj().invert = v; saveSettings(); update(); });
      const resetAdjust = () => {
        s.settings.adjust = { ...DEFAULT_ADJUSTMENTS };
        for (const sl of sliders) { sl.input.value = String(sl.get()); sl.out.textContent = sl.fmt(sl.get()); }
        (autoTick.firstChild as HTMLInputElement).checked = false;
        (invertTick.firstChild as HTMLInputElement).checked = false;
        saveSettings();
        update();
      };
      section("Adjust", btn("Reset", resetAdjust)).append(
        slider("Brightness", -100, 100, 1, () => adj().brightness, (v) => { adj().brightness = v; }, signed),
        slider("Contrast", -100, 100, 1, () => adj().contrast, (v) => { adj().contrast = v; }, signed),
        slider("Saturation", -100, 100, 1, () => adj().saturation, (v) => { adj().saturation = v; }, signed),
        slider("Hue", -180, 180, 1, () => adj().hue, (v) => { adj().hue = v; }, (v) => `${signed(v)}°`),
        slider("Gamma", 0.2, 4, 0.05, () => adj().gamma, (v) => { adj().gamma = v; }, (v) => v.toFixed(2)),
        h("div", { className: "tfi-row" }, h("label", null, ""), autoTick, invertTick),
      );

      /* Match */
      const modeHint = h("div", { className: "tfi-hint" });
      const balanceRow = slider("Weigh", 0, 100, 1, () => Math.round(s.settings.balance * 100), (v) => { s.settings.balance = v / 100; }, (v) => (v === 50 ? "even" : v < 50 ? `light ${100 - v}` : `hue ${v}`));
      section("Match").append(
        h("div", { className: "tfi-row" },
          h("label", null, "Method"),
          select("Match by", [["adaptive", "Adaptive colour"], ["exact", "Exact key colours"], ["brightness", "Brightness bands (heightmap)"]], s.settings.mode, (v) => set("mode", v as MatchMode)),
        ),
        balanceRow,
        modeHint,
        h("div", { className: "tfi-row wrap" },
          h("label", null, "Clean up"),
          h("span", { className: "tfi-hint" }, "blur"),
          select("Blur", [["0", "off"], ["1", "1"], ["2", "2"], ["3", "3"]], String(s.settings.smooth), (v) => set("smooth", Number(v))),
          h("span", { className: "tfi-hint" }, "despeckle"),
          select("Despeckle", [["0", "off"], ["1", "1×"], ["2", "2×"], ["3", "3×"]], String(s.settings.despeckle), (v) => set("despeckle", Number(v))),
          h("span", { className: "tfi-hint" }, "min. region"),
          (() => { const n = num("Minimum region size", () => s.settings.minRegion, (v) => { s.settings.minRegion = Math.max(0, v); saveSettings(); }); n.title = "Regions with fewer cells than this join their commonest neighbour"; return n; })(),
        ),
      );

      /* Paint as */
      const isomOk = api.terrain.hasIsom();
      const methodIsom = h("input", { type: "radio", name: "tfi-method", value: "isom", disabled: !isomOk, onChange: () => { set("method", "isom"); rebuildTerrainList(); update(); } });
      const methodTiles = h("input", { type: "radio", name: "tfi-method", value: "tiles", onChange: () => { set("method", "tiles"); rebuildTerrainList(); update(); } });
      (s.settings.method === "isom" ? methodIsom : methodTiles).checked = true;
      section("Paint as").append(h("div", { className: "tfi-row wrap" },
        h("label", { className: "check", title: "Paint every lattice diamond with the isometric brush: cliffs and shorelines are generated at the boundaries" }, methodIsom, "Isometric terrain"),
        h("label", { className: "check", title: "Stamp flat tile pairs only; the ISOM is left alone (Rebuild ISOM from Tiles afterwards to use the isometric brush)" }, methodTiles, "Flat tiles"),
        !isomOk ? h("span", { className: "tfi-hint" }, "— this map has no ISOM section") : null,
      ));

      /* Previews */
      const sourceCanvas = h("canvas", { width: 1, height: 1, title: "The picture as the matcher sees it — with the eyedropper armed, click to take a key colour" });
      const resultCanvas = h("canvas", { width: 1, height: 1 });
      const sourceBox = h("div", { className: "tfi-canvas" }, sourceCanvas);
      const summary = h("div", { className: "tfi-summary" }, "Choose an image to preview.");
      side.append(
        h("div", { className: "tfi-previews" },
          h("div", { className: "tfi-preview" }, h("span", null, "Source (adjusted)"), sourceBox),
          h("div", { className: "tfi-preview" }, h("span", null, "Result"), h("div", { className: "tfi-canvas" }, resultCanvas)),
        ),
        summary,
      );
      sourceCanvas.addEventListener("click", (e) => {
        if (s.dropper === null || !samples) return;
        // The canvas is letterboxed inside its box (object-fit: contain): find the drawn rectangle first.
        const box = sourceCanvas.getBoundingClientRect();
        const scale = Math.min(box.width / gridW, box.height / gridH);
        const left = box.left + (box.width - gridW * scale) / 2, top = box.top + (box.height - gridH * scale) / 2;
        const x = Math.min(gridW - 1, Math.max(0, Math.floor((e.clientX - left) / scale)));
        const y = Math.min(gridH - 1, Math.max(0, Math.floor((e.clientY - top) / scale)));
        const i = (y * gridW + x) * 4;
        if (samples[i + 3] < 8) { api.ui.status("That cell is transparent — pick a painted one."); return; }
        s.keys.set(s.dropper, (samples[i] << 16) | (samples[i + 1] << 8) | samples[i + 2]);
        saveKeys(api, s.keys);
        s.dropper = null;
        rebuildTerrainList();
        update();
      });

      /* Terrains */
      const terrainList = h("div", { className: "tfi-terrains", role: "group", "aria-label": "Terrains to use" });
      const terrainHint = h("div", { className: "tfi-hint" });
      side.append(
        h("div", { className: "tfi-sec", style: "flex: 1; min-height: 0" },
          h("header", null, "Terrains", h("span", { className: "tfi-spacer" }),
            btn("All", () => { for (const t of listed()) s.chosen.add(t.id); rebuildTerrainList(); update(); }),
            btn("None", () => { s.chosen.clear(); rebuildTerrainList(); update(); }),
            btn("Reset colours", () => { s.keys.clear(); saveKeys(api, s.keys); s.dropper = null; rebuildTerrainList(); update(); }, "Back to every terrain's own tile colour"),
          ),
          terrainList,
          terrainHint,
        ),
      );

      const counts = new Map<number, HTMLElement>();
      const rebuildTerrainList = () => {
        terrainList.replaceChildren();
        counts.clear();
        const list = listed();
        // Everything ticked the first time round; keep the user's choice after that.
        if (s.chosen.size === 0 && list.length > 0 && !s.image) for (const t of list) s.chosen.add(t.id);
        if (s.chosen.size === 0 && list.length > 0 && s.image && !s.keys.size) for (const t of list) s.chosen.add(t.id);
        for (const t of list) {
          const on = h("input", { type: "checkbox", checked: s.chosen.has(t.id), "aria-label": `Use ${t.name}`, onChange: () => { if (on.checked) s.chosen.add(t.id); else s.chosen.delete(t.id); row.classList.toggle("off", !on.checked); update(); } });
          const key = h("input", { type: "color", className: s.keys.has(t.id) ? "custom" : "", title: `Key colour ${t.name} matches in the picture (its own tiles average ${toHex(api.terrain.terrainColor(t.id) ?? 0)})`, "aria-label": `Key colour for ${t.name}` });
          key.value = toHex(keyOf(t.id));
          key.addEventListener("input", () => {
            const c = fromHex(key.value);
            if (c === null) return;
            if (c === (api.terrain.terrainColor(t.id) ?? 0)) s.keys.delete(t.id); else s.keys.set(t.id, c);
            key.classList.toggle("custom", s.keys.has(t.id));
            saveKeys(api, s.keys);
            update();
          });
          const eye = h("button", { className: `btn sm tfi-eye ${s.dropper === t.id ? "armed" : ""}`, type: "button", title: `Eyedropper: click a spot on the source preview to make it ${t.name}'s key colour`, "aria-label": `Pick key colour for ${t.name} from the picture`, onClick: () => { s.dropper = s.dropper === t.id ? null : t.id; rebuildTerrainList(); sourceBox.classList.toggle("dropper", s.dropper !== null); } }, "⌖");
          const count = h("span", { className: "tfi-count" });
          counts.set(t.id, count);
          const swatch = api.terrain.terrainColor(t.id);
          const row = h("div", { className: `tfi-terrain ${s.chosen.has(t.id) ? "" : "off"}` }, on, key, eye, h("span", { className: "tfi-name", title: `${t.name} — height ${t.height}${t.buildable ? ", buildable" : ""}` }, h("span", { style: `display:inline-block;width:9px;height:9px;margin-right:5px;vertical-align:-1px;background:${swatch === null ? "#000" : toHex(swatch)};border:1px solid rgba(0,0,0,.6)` }), t.name), count);
          terrainList.append(row);
        }
        sourceBox.classList.toggle("dropper", s.dropper !== null);
        terrainHint.textContent = list.length === 0 ? "No terrain types — the tileset graphics are not installed." : "";
      };

      const rawSamples = (rect: Rect, gw: number, gh: number): Uint8ClampedArray | null => {
        if (!s.image) return null;
        const key = `${gw}x${gh}|${s.settings.fit}|${s.settings.flipH}|${s.settings.flipV}|${s.settings.sampling}|${s.imageName}|${s.image.width}x${s.image.height}|${rect.x0},${rect.y0}`;
        if (!rawCache || rawCache.key !== key) rawCache = { key, data: resampleImage(s.image, gw, gh, { fit: s.settings.fit, flipH: s.settings.flipH, flipV: s.settings.flipV, sampling: s.settings.sampling }) };
        return rawCache.data;
      };

      update = () => {
        const mode = s.settings.mode;
        balanceRow.style.display = mode === "brightness" ? "none" : "";
        modeHint.textContent = mode === "brightness"
          ? "Ticked terrains, top to bottom, become bands from the picture's darkest to its brightest."
          : mode === "adaptive"
            ? "Hue and relative brightness, with the picture's range fitted to the terrains' — good for photos and drawings as they are."
            : "Plain colour distance to the key colours — set them with the swatches or the eyedropper.";
        const rect = targetRect();
        const gw = rect.x1 - rect.x0, gh = rect.y1 - rect.y0;
        choices = listed().filter((t) => s.chosen.has(t.id)).map((t) => ({ id: t.id, color: keyOf(t.id) }));
        for (const el of counts.values()) el.textContent = "";
        if (!s.image || gw <= 0 || gh <= 0) {
          grid = null;
          samples = null;
          summary.textContent = !s.image ? "Choose an image to preview." : "The target rectangle is empty.";
          sourceCanvas.width = sourceCanvas.height = resultCanvas.width = resultCanvas.height = 1;
          return;
        }
        gridW = gw; gridH = gh;
        const raw = rawSamples(rect, gw, gh)!;
        const adjusted = adjustSamples(raw, s.settings.adjust);
        samples = boxBlur(adjusted, gw, gh, s.settings.smooth);
        grid = matchTerrains(samples, gw, gh, { terrains: choices, mode, balance: s.settings.balance, smooth: 0, despeckle: s.settings.despeckle, minRegion: s.settings.minRegion });
        showSamples(sourceCanvas, samples, gw, gh);
        // Result: each cell in its terrain's own tile colour, so it reads like the map will.
        resultCanvas.width = gw;
        resultCanvas.height = gh;
        const ctx = resultCanvas.getContext("2d")!;
        const img = ctx.createImageData(gw, gh);
        const colorOf = new Map(choices.map((c) => [c.id, unpack(api.terrain.terrainColor(c.id) ?? c.color)]));
        for (let i = 0; i < grid.length; i++) {
          const c = colorOf.get(grid[i]);
          if (!c) continue;
          img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        const per = countCells(grid, choices);
        choices.forEach((c, i) => { const el = counts.get(c.id); if (el) el.textContent = String(per[i]); });
        const painted = per.reduce((a, b) => a + b, 0);
        const skipped = gw * gh - painted;
        summary.textContent = `${gw} × ${gh} cells at ${rect.x0}, ${rect.y0} — ${painted} painted, ${choices.length} terrain${choices.length === 1 ? "" : "s"}${skipped > 0 ? `, ${skipped} left as they are` : ""}${!isNeutral(s.settings.adjust) ? " · adjusted" : ""}`;
      };

      setImage = (image, name) => {
        if (s.image && s.image !== image) s.image.close();
        s.image = image;
        s.imageName = name;
        rawCache = null;
        fileLine.textContent = `${name} (${image.width} × ${image.height})`;
        fileLine.className = "tfi-file";
        handle?.setTitle(`Terrain from Image — ${name}`);
        update();
      };
      if (s.image) { fileLine.textContent = `${s.imageName} (${s.image.width} × ${s.image.height})`; fileLine.className = "tfi-file"; handle?.setTitle(`Terrain from Image — ${s.imageName}`); }

      // The terrain list needs the tileset graphics; they may still be loading.
      terrainHint.textContent = "Loading tileset…";
      void api.tileset.load().then(() => {
        types = api.terrain.types();
        isomIds = new Set(api.terrain.isomTypes());
        if (s.settings.method === "isom" && isomIds.size === 0) { s.settings.method = "tiles"; methodTiles.checked = true; methodIsom.disabled = true; }
        rebuildTerrainList();
        update();
      });
    },
  });

  const apply = (): boolean => {
    if (!grid || !s.image) { api.ui.status("Choose an image first."); return false; }
    const g = grid;
    const rect = targetRect();
    const gw = rect.x1 - rect.x0, gh = rect.y1 - rect.y0;
    if (gw <= 0 || gh <= 0) return false;
    const label = `Terrain from image (${s.imageName || "picture"})`;
    const result = api.document.edit(label, (tx) => {
      if (s.settings.method === "isom") {
        // Group the lattice diamonds by terrain and paint low ground first, rare features last (see `paintOrder`).
        const byTerrain = new Map<number, { x: number; y: number }[]>();
        for (const d of api.terrain.diamondsIn(rect)) {
          const id = diamondTerrain(g, gw, gh, 2 * d.x - rect.x0, d.y - rect.y0);
          if (id < 0) continue;
          let list = byTerrain.get(id);
          if (!list) { list = []; byTerrain.set(id, list); }
          list.push(d);
        }
        const counts = new Map([...byTerrain].map(([id, list]) => [id, list.length]));
        let refused = 0;
        for (const id of paintOrder([...byTerrain.keys()], api.terrain.heightOf, counts)) {
          for (const d of byTerrain.get(id)!) if (!tx.paintIsom(d, id, 1)) refused++;
        }
        if (refused > 0) tx.note(`${refused} diamonds could not take their terrain`);
      } else {
        for (const [id, cells] of cellsByTerrain(g, gw, gh, rect.x0, rect.y0, info.width)) tx.stampTerrain(cells, id);
      }
    });
    s.image.close();
    s.image = null;
    if (!result.changed) { api.ui.status(`${label} — nothing changed`); return true; }
    api.ui.status(`${label} — ${result.tiles} tile${result.tiles === 1 ? "" : "s"}${result.isom > 0 ? ", ISOM updated" : ""}${result.notes.length > 0 ? `; ${result.notes.join(", ")}` : ""}`);
    return true;
  };
}

/* ── Activation ─────────────────────────────────────────── */

export default function activate(api: PluginApi) {
  const open = (marked: Rect | null, custom: Rect | null = null) => {
    if (!api.document.isOpen()) { api.ui.status("Open or create a map first."); return; }
    openDialog(api, newSession(api, marked, custom));
  };
  /** Drag the target on the map first, then open with it selected (Esc keeps the dialog closed). */
  const pickThenOpen = async (marked: Rect | null) => {
    const rect = await api.ui.pickArea({ prompt: "Terrain from Image: drag the target rectangle" });
    if (rect && rect.x1 > rect.x0 && rect.y1 > rect.y0) open(marked, rect);
  };
  const label = (ctx: ContextMenuContext) => (ctx.markedArea ? "Terrain from Image into Marked Area…" : "Terrain from Image…");
  const enabled = () => api.document.isOpen();

  api.menu.add("File/Import", { label: "Terrain from Image…", enabled, run: () => open(api.selection.markedArea()) });
  for (const surface of ["terrainPalette", "viewport"] as const) {
    const visible = surface === "viewport" ? (ctx: ContextMenuContext) => ctx.layer === "terrain" || ctx.layer === "clipboard" : undefined;
    api.contextMenu.add(surface, { label, visible, enabled, run: (ctx) => open(ctx.markedArea) });
    api.contextMenu.add(surface, { label: "Terrain from Image into Area…", visible, enabled, run: (ctx) => { void pickThenOpen(ctx.markedArea); } });
  }
}
