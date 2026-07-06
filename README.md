# 🧠 MIND VAULT — Ultimate 3D Puzzle Experience

> A **zero-text, 100% visual** 3D puzzle-box game built for neurodivergent minds.
> Part of the **HYPERFOCUS ZONE**. Harness your visual-spatial superpowers — no reading required.

Open a themed vault. Solve the puzzles on its face. Watch it burst open. Repeat across five worlds.

---

## ✨ 2026 rebuild

MIND VAULT v2 is a full re-platform of the original single-file prototype onto a modern, cinematic stack:

- **Vite + React 19 + TypeScript**
- **React Three Fiber** (`@react-three/fiber`, `drei`, `postprocessing`) for the 3D scene
- **zustand** for state + save persistence
- **motion** for spring-based UI transitions
- Procedural **Web Audio** sound engine — no audio files
- No image/model/font assets: every visual is generated in code (keeps the whole game tiny and offline-friendly)

The original prototype is preserved under [`legacy/`](./legacy) and still runs by opening `legacy/index.html`.

---

## 🎮 The game

Five themed worlds, unlocked in sequence as you clear them:

| World | Signature mechanic |
|---|---|
| 🧩 Tutorial Basics | learn the three classics |
| ⚙️ Clockwork Gears | **gear alignment** — mesh gears so torque reaches the golden output |
| 💎 Crystal Caves | **light refraction** — rotate prisms to route the beam into the gem |
| 🛰️ Space Station | **holo sequence** — echo a shape+colour+sound pattern |
| 🏺 Ancient Temple | **glyph pattern** — retrace a flashed constellation in molten gold |

Each vault holds **three puzzles**, presented one at a time. Solve all three and the lid springs open — crystals, confetti, a victory stinger, and (when a world is cleared) the next world unlocks.

**Seven puzzle mechanics** total: colour dials, shape assembly, spatial rotation (the classics) plus the four signature mechanics above. Every puzzle is solvable through colour, shape, motion and sound alone — no words anywhere.

Progress, crystals and achievements are saved to `localStorage`. Saves from the original prototype are migrated automatically on first load.

---

## ♿ Built for neurodivergent players

See [ACCESSIBILITY.md](./ACCESSIBILITY.md). Highlights:

- **Zero required reading** — icons, colour, shape, motion and sound carry all meaning
- **One puzzle on screen at a time** — no overwhelm; progress dots always visible
- **No on-screen timer / no failure states** — wrong moves are harmless, retries are infinite
- **Reduced-motion** support (auto / on / off) that kills camera drift, particles and confetti
- **High-contrast** mode (brighter scene, bolder outlines)
- **Haptics** and large (≥56 px) touch targets
- **Reward moments** on every win

All four accessibility controls live in the in-game ⚙️ settings and persist immediately.

---

## 🚀 Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

Requires Node 18+. A WebGL2-capable browser is recommended.

---

## 📁 Layout

```
src/
├── themes/       # the 5 worlds (palette, sound, environment)
├── puzzles/      # 7 self-contained mechanics (pure logic.ts + R3F View.tsx)
├── scenes/       # persistent 3D canvas, camera, vault box, effects, confetti
├── screens/      # DOM overlays (splash, world select, preview, HUD, victory, panels)
├── state/        # zustand stores (progress/settings + play session)
├── audio/        # procedural Web Audio engine
└── achievements/ # 8 achievements + evaluation engine
legacy/           # the original single-file prototype (still runnable)
```

Adding a puzzle mechanic is a matter of dropping a `logic.ts` + `View.tsx` into `src/puzzles/` and registering it — the game loop, HUD and save system are mechanic-agnostic.

---

MIT licensed. Made with 💜 in the HYPERFOCUS ZONE.
