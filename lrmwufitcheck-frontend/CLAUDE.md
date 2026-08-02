# lrmwufitcheck-frontend

## Animation standard (Kozmetik grubu, 2026-08-02)

Reusable hover/transition primitives live in [`src/index.css`](src/index.css)
under `@layer utilities`, with a comment block marking them as the project
standard. New pages/components should reach for these instead of inventing
one-off hover effects or pulling in an animation library (no framer-motion —
plain CSS transitions/keyframes cover everything needed so far):

- **`.hover-zoom`** — clickable primary/green buttons and cards: subtle
  `scale(1.035)` grow on hover, slight shrink on active. Already applied to
  the `Button` component's `default` variant
  ([`src/components/ui/button.tsx`](src/components/ui/button.tsx)) and the
  dashboard FAB. Apply to any new primary-colored clickable element.
- **`.hover-lift-glow`** — stat/metric boxes: lifts `-3px` and adds a colored
  glow + border tint on hover. Set `--glow-color: <hex>` inline per box to
  tint the glow to match that box's own color (see the macro grid in
  [`src/pages/DashboardPage.tsx`](src/pages/DashboardPage.tsx) for the
  pattern — each macro carries its own `glow` hex alongside its Tailwind
  `color` class).
- **`.animate-page-fade`** — route-level fade-in (~220ms), applied via
  `<PageTransition>` ([`src/components/PageTransition.tsx`](src/components/PageTransition.tsx)).
  Wrap any new layout's `<Outlet/>` with it — already done in `MainLayout`,
  `AuthLayout`, and `MinimalLayout`. It's keyed on `location.pathname`, so it
  remounts (and re-fades) on every route change, including param-only
  changes on the same route component.
- **`.particle-dot` + `.calorie-ring-group`** — drifting-particle hover
  effect: dots sit at `opacity:0`/`scale(0.6)` by default and animate out to
  `translate(var(--particle-x), var(--particle-y)) scale(1)` when the
  ancestor `.calorie-ring-group` is hovered, then ease back on mouse-leave.
  Set `--particle-x`/`--particle-y` per dot (see `CALORIE_PARTICLES` in
  `DashboardPage.tsx` for how positions are generated around a circle).

## Sidebar active-route indicator

`MainLayout`'s `SidebarLink` uses `NavLink` (not `Link`) so the current route
gets `bg-primary/10 text-primary font-semibold` + a left accent border,
consistent across the desktop sidebar, mobile drawer, and mobile bottom nav.
Any new nav-link-style component should follow the same `NavLink` + `isActive`
pattern rather than a plain `Link`.

## Dev environment notes

- This repo is checked out both directly (`lrmwufitcheck-frontend/`, run via
  `npm start` / dev scripts) and inside a git worktree at
  `.claude/worktrees/distracted-pike-c9a599/lrmwufitcheck-frontend/` — the
  worktree is what actual running dev servers use day-to-day. Edits made in
  the main checkout must be copied file-by-file into the worktree copy (and
  vice versa) to stay in sync; `.dev.env` files are gitignored per-service
  and must be kept in sync separately by hand.
- Backend services (`auth`, `bff`, `notification`, `nutritionlibrary`,
  `mealtracker`, `nutritionai`) are started with `npm start` (not
  `npm run dev` — that script doesn't exist on these services), which runs
  `nodemon src/index.js` under `SERVICE_CONFIG=dev`.
- The worktree can end up in detached HEAD even while "on" what looks like a
  branch. `git push origin <branch>` will silently no-op in that state
  ("Everything up-to-date") — fix with
  `git branch -f <branch> HEAD && git push origin HEAD:<branch>`.
