# Terrain from Image

A plugin for [scmJS](https://github.com/scm-js/scm-js), the browser-based StarCraft 1 /
Brood War map editor. It paints a picture onto the map as terrain.

## Install

Terrain from Image comes with the editor and is on by default. If you turned it off, tick
it on again in Plugins ▸ **Manage Plugins…**.

To add it by hand, open Plugins ▸ **Manage Plugins…**, paste

```
https://github.com/scm-js/plugin-image-to-terrain
```

and press **Add**. To pin a version, add a tag: `github:scm-js/plugin-image-to-terrain@v1.1.0`.

## Use

Open the dialog in one of these ways:

- File ▸ Import ▸ **Terrain from Image…** works on the whole map, or on the marked area if
  there is one.
- **Terrain from Image…** in the context menu of the map or the terrain palette does the
  same. With an area marked it reads **Terrain from Image into Marked Area…**.
- **Terrain from Image into Area…** in the same context menus asks you to drag the target
  rectangle on the map first.

In the dialog:

1. Bring in a picture: choose a file, paste it with Ctrl+V, drop it on the dialog, or load
   it from a URL.
2. Say where on the map it goes and how it fits (fill, letterbox or stretch).
3. Adjust it if you need to. There are sliders for brightness, contrast, saturation, hue
   and gamma, and checkboxes for auto-levels and invert.
4. Choose the terrains to use and give each a key colour. You can pick one out of the
   picture with the eyedropper. Each terrain in the list is shown with its own tile art.
5. Press **Apply**. Every cell becomes the terrain whose key colour is nearest, and the
   whole change is one undo step.

By default the plugin paints with the editor's isometric brush, low ground first and rare
terrains last. Cliffs and shores are generated at the boundaries. On a map with no `ISOM`
section, or if you choose **Flat tiles**, it stamps flat tile pairs instead.

Your settings, and the key colours for each tileset, are remembered between sessions.

## Files

| File | What it is |
| --- | --- |
| `plugin.json` | The manifest the editor reads. |
| `plugin.ts` | The dialog, the image sources, the eyedropper and the edit to the map. |
| `convert.ts` | The image processing: colour adjustment, matching in OKLab, clean-up and fit. |
| `ko.ts` | The Korean for the words the plugin shows. |
| `dist/plugin.js` | The bundle the editor loads. `npm run build` writes it and CI commits it. |
| `tests/` | Tests of `convert.ts`, and a check that `ko.ts` is complete. |

## Development

```sh
npm install
npm run typecheck
npm test
npm run dev
```

`npm run dev` rebuilds `dist/plugin.js` on every change. To try your changes in the editor,
serve this folder with `npx serve --cors .`, add `http://localhost:3000/` in Plugins ▸
**Manage Plugins…**, and press **Reload** on the plugin's row after each edit.

The types come from [`@scm-js/plugin-api`](https://github.com/scm-js/plugin-api). Run
`npm update @scm-js/plugin-api` for the newest. The
[plugin guide](https://docs.scmjs.dev/plugins/writing-a-plugin/) covers the rest.

A plugin runs with the editor's own privileges. There is no sandbox.

## Licence

MIT. See [LICENSE](LICENSE).
