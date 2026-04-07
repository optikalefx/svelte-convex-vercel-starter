# SVCX

I've been using the same stack on every project for a while now. I love using SvelteKit + Convex. I also like to deploy my side projects to vercel. When starting a new project, it's good practice to also deploy a bare-bones app right away.

With that said, this utility scaffolds out Sveltekit + convex + deploy to vercel with GitHub linked for push-to-main deploy in (almost) 1 step.

You still have to paste your convex deploy key, but that's all.

```bash
npx svcx-deploy my-app
```

## What it does

1. Creates a SvelteKit app (minimal template, TypeScript, Prettier, ESLint, Vercel adapter, Claude MCP)
2. Initializes git and creates a private GitHub repo
3. Installs `convex` and `convex-svelte`, writes `convex.json`
4. Runs `npx convex dev` so you can authenticate and create your Convex project
5. Writes `src/routes/+layout.svelte` with Convex initialized
6. Links the project to Vercel and connects the GitHub repo for auto-deploys
7. Deploys Convex to production
8. Sets the required Vercel environment variables
9. Pushes to GitHub and triggers a live Vercel deployment

## Prerequisites

All of the following must be installed and authenticated before running:

| Tool           | Install                          | Auth                  |
| -------------- | -------------------------------- | --------------------- |
| Node.js 18+    | [nodejs.org](https://nodejs.org) | —                     |
| GitHub CLI     | `brew install gh`                | `gh auth login`       |
| Vercel CLI     | `npm i -g vercel`                | `vercel login`        |
| Convex account | —                                | Prompted during setup |

## Usage

```bash
npx svcx-deploy my-app
```

## What's automated vs manual

Almost everything is automated. The one step that requires manual action:

- **Convex production deploy key** — after `npx convex deploy` runs, you'll be prompted to copy a key from the Convex dashboard (`Settings → Deploy Keys → Generate Production Deploy Key`). Paste it into the terminal and setup continues automatically. The key is saved to `.env.local` so re-runs skip this step.

## Environment variables set in Vercel

| Variable                 | Source                                         |
| ------------------------ | ---------------------------------------------- |
| `PUBLIC_CONVEX_URL`      | Read from `.env.local` after `convex dev`      |
| `PUBLIC_CONVEX_SITE_URL` | Read from `.env.local` after `convex dev`      |
| `CONVEX_DEPLOY_KEY`      | Pasted once from Convex dashboard, then cached |

## Contributing

```bash
git clone https://github.com/optikalefx/svelte-convex-vercel-starter
cd svelte-convex-vercel-starter
npm install
npm run dev my-app
```
