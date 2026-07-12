# MVP Ocean — explainer video (`/mvp-video`)

A self-contained, full-screen animated explainer ("Test before you build"),
served at **`/mvp-video`** by `../../mvp-video.html`. ~26s, portrait
(1080×1920), autoplays and loops; the voiceover starts on first interaction
(browsers block audio autoplay until a gesture).

## Provenance

Imported from the Claude Design project **"Video animation improvement
request"**. The animation is a small React timeline engine plus six scenes,
originally authored as a `.dc.html` design (`MVP Video.dc.html`) that mounts
`MvpVideoFull` from two JSX modules.

For the live page the design-tool preview harness (`support.js`, the
`<x-dc>`/`<x-import>` custom elements, and in-browser Babel) is dropped;
`MvpVideoFull` is mounted directly with `ReactDOM.createRoot`. This mirrors the
`design-drop` convention in the `mvpocean` repo (ship the design, strip the
preview scaffolding).

## Files

| File | Role |
| --- | --- |
| `src/animations.jsx` | Source — timeline engine (Stage, Sprite, easings, playback bar). |
| `src/mvp-scenes.jsx` | Source — the six scenes + characters/props + `MvpVideoFull`. |
| `engine.js` | `src/animations.jsx` compiled to plain JS (do not hand-edit). |
| `scenes.js` | `src/mvp-scenes.jsx` compiled to plain JS (do not hand-edit). |
| `react.production.min.js` | React 18.3.1 UMD (self-hosted, pinned). |
| `react-dom.production.min.js` | ReactDOM 18.3.1 UMD (self-hosted, pinned). |
| `voiceover.mp3` | Andrew VO, ~26.35s. Referenced by `mvp-scenes.jsx` as `VO_SRC`. |

The only edit to the imported source is `VO_SRC` in `mvp-scenes.jsx`, repointed
to `/assets/mvp-video/voiceover.mp3` (the deployed asset path).

## Rebuilding `engine.js` / `scenes.js`

The static site has no build step, so the JSX is precompiled. To regenerate
after editing a `src/*.jsx` file, transpile with Babel's `react` preset (the
same transform the design runtime uses) and wrap each output in an IIFE so the
two files don't collide in the shared global script scope:

```js
// npm i @babel/standalone@7.29.0
const Babel = require('@babel/standalone');
const fs = require('fs');
for (const [src, out] of [['src/animations.jsx','engine.js'], ['src/mvp-scenes.jsx','scenes.js']]) {
  const { code } = Babel.transform(fs.readFileSync(src,'utf8'), { presets: ['react'], compact: false });
  fs.writeFileSync(out, ';(function () {\n' + code + '\n})();\n');
}
```

Load order in `mvp-video.html` matters: React → ReactDOM → `engine.js`
(publishes `Stage`, `Sprite`, … on `window`) → `scenes.js` (reads them, publishes
`MvpVideoFull`) → mount.
