# Snake Game 🐍

A production-ready retro Snake game built with **React 18 + TypeScript + Vite**, deployed automatically to GitHub Pages via GitHub Actions.

## Live Demo

> After pushing to GitHub and enabling Pages, your game lives at:  
> `https://<your-username>.github.io/snake-game/`

## Features

| Feature | Detail |
|---|---|
| Game grid | 20 × 20, black background |
| Snake | Yellow head & body with eyes |
| Food | White dot with glow effect |
| Scoring | 10 pts per food; High Score persisted to `localStorage` |
| Controls | Arrow Keys / WASD + on-screen D-pad (touch) |
| Pause | `P` key, `ESC`, or pause button |
| Responsive | Scales to mobile screens with touch D-pad |

## Local Development

```bash
npm install
npm run dev          # http://localhost:5173/snake-game/
npm test             # run unit tests once
npm run test:watch   # watch mode
npm run test:coverage # coverage report
npm run build        # production build → dist/
```

## Deployment (GitHub Pages)

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source → GitHub Actions**.
3. Push to `main`. The workflow:
   - Runs linting + Vitest unit tests
   - Type-checks with `tsc`
   - Builds with Vite
   - Deploys `dist/` to GitHub Pages

## Architecture

```
src/
  engine/
    types.ts          – Domain types & constants
    gameLogic.ts      – Pure functions (zero React dependency)
  hooks/
    useSnakeGame.ts   – Game loop, state, keyboard wiring
  components/
    GameCanvas.tsx    – Canvas renderer
    ScoreBoard.tsx    – Score / high-score display
    Overlay.tsx       – IDLE / PAUSED / GAMEOVER panels + D-pad
  tests/
    gameLogic.test.ts – 100 % unit coverage of engine functions
  App.tsx             – Root component
```
