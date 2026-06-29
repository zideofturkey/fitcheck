# fitcheck Frontend

**Version:** v1.0.95

Auto-generated React + TypeScript + TailwindCSS v4 frontend for the **fitcheck** Mindbricks project.

## How this project was generated

This repository is produced by the **Mindbricks UI generator**, which lives at `src/ui/` in the `mindbricks-genesis-service` codebase. Every file in this project — including this README — is rendered from an EJS template at build time, with the live project model (services, data objects, business APIs) supplied as the template context.

| Generator entrypoint                         | Output                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/ui/root-gen.js`                         | Project root (package.json, vite.config.ts, tsconfig, Dockerfiles, this README)      |
| `src/ui/src/root-gen.js`                     | `src/` tree — types, API clients, hooks, context, lib, config                        |
| `src/ui/README.ejs`                          | This file                                                                            |
| `src/ui/src/services/api/service-api.ts.ejs` | Per-service typed API client (`<service>-api.ts`)                                    |
| `src/ui/src/hooks/api/use-service.ts.ejs`    | Per-service React Query hooks (`use-<service>.ts`)                                   |
| `src/ui/src/foundation-context.json.ejs`     | `src/foundation-context.json` — AI-readable manifest of hooks, types, and API routes |

Anything under `src/pages`, `src/components`, `src/layouts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/lib/utils.ts`, and `src/hooks/use-mobile.ts` is **preserved across regenerations** — that's your application code. Everything else is owned by the generator and will be overwritten on the next deploy.

`package.json` is **generated once on the first deploy and preserved on every regeneration after that** — it lives on the preserved-paths list alongside your application code. Any package you add (manually, via `pnpm add`, or via MindUI) sticks around. The tradeoff is that template-side dep changes do not retroactively flow into already-deployed projects, so the template ships `socket.io-client` and the Stripe SDKs unconditionally (rather than gating them on hubs / stripe usage) — they cost nothing if unused since the bundler tree-shakes them.

## Project Structure

```
src/
├── config/
│   └── environment.ts      # Service URL configuration (3 environments)
├── types/
│   └── api.ts              # TypeScript interfaces for all data objects
├── lib/
│   ├── api-client.ts       # Base fetch wrapper (Mindbricks envelope)
│   ├── service-client.ts   # Per-service API clients
│   ├── token-store.ts      # JWT token storage
│   └── store-manager.ts    # Multi-tenant store helper
├── services/
│   ├── auth-service.ts     # Authentication API
│   └── api/
│       ├── auth-api.ts
│       ├── invitationcenter-api.ts
│       ├── nutritionlibrary-api.ts
│       ├── mealtracker-api.ts
│       ├── nutritionai-api.ts
│       ├── agenthub-api.ts
├── hooks/
│   └── api/
│       ├── use-auth.ts     # Auth React Query hooks
│       ├── use-auth.ts
│       ├── use-invitationcenter.ts
│       ├── use-nutritionlibrary.ts
│       ├── use-mealtracker.ts
│       ├── use-nutritionai.ts
│       ├── use-agenthub.ts
└── App.tsx                 # Root router — add your pages here
```

## Getting Started

```bash
pnpm install
pnpm dev          # starts on http://localhost:8080 (port from .dev.env VITE_PORT)
```

## Environments

| Script             | Environment              |
| ------------------ | ------------------------ |
| `pnpm dev`         | Local (`.dev.env`)       |
| `pnpm build-test`  | Preview (`.test.env`)    |
| `pnpm build-stage` | Staging (`.stage.env`)   |
| `pnpm build-prod`  | Production (`.prod.env`) |

Switch environment at runtime:

```ts
import { environmentManager } from "@/config/environment";
environmentManager.setEnvironment("preview");
```

## Using the Hooks

```tsx
import { useCurrentUser, useLogin } from "@/hooks/api/use-auth";
import { useAuths } from "@/hooks/api/use-auth";
import { useInvitationCenters } from "@/hooks/api/use-invitationcenter";
import { useNutritionLibrarys } from "@/hooks/api/use-nutritionlibrary";
import { useMealTrackers } from "@/hooks/api/use-mealtracker";
import { useNutritionAis } from "@/hooks/api/use-nutritionai";
import { useAgentHubs } from "@/hooks/api/use-agenthub";

function MyComponent() {
  const { data: user } = useCurrentUser();
  const login = useLogin();
  // ...
}
```
