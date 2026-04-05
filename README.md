# create-stack

Scaffolds a full SvelteKit + Convex + Vercel project in one command.

## What it does

1. Creates a SvelteKit app (minimal template, TypeScript, Prettier, ESLint, Vercel adapter, Claude MCP)
2. Initialises git and creates a private GitHub repo
3. Installs `convex` and `convex-svelte`, writes `convex.json`
4. Runs `npx convex dev` so you can authenticate and create your Convex project
5. Writes `src/routes/+layout.svelte` with Convex initialised
6. Links the project to Vercel and writes `vercel.json` with the correct build command
7. Deploys Convex to production
8. Sets the required Vercel environment variables
9. Pushes to GitHub, triggering a live Vercel deployment

## Prerequisites

All of the following must be installed and authenticated before running:

| Tool | Install | Auth |
|------|---------|------|
| Node.js + npm | [nodejs.org](https://nodejs.org) | — |
| GitHub CLI | `brew install gh` | `gh auth login` |
| Vercel CLI | `npm i -g vercel` | `vercel login` |
| Convex account | — | Prompted during setup |

## Usage

### Development (no build step)

```bash
npm install
npm run dev my-app
```

### Global install

```bash
npm install
npm run build
npm link
```

Then from anywhere:

```bash
create-stack my-app
```

## What's automated vs manual

Almost everything is automated. The one step that requires manual action:

- **Convex production deploy key** — after `npx convex deploy` runs, you'll be prompted to copy a key from the Convex dashboard (`Settings → Deploy Keys → Generate Production Deploy Key`). Paste it into the terminal and setup continues automatically.

## Environment variables set in Vercel

| Variable | Source |
|----------|--------|
| `PUBLIC_CONVEX_URL` | Read from `.env.local` after `convex dev` |
| `PUBLIC_CONVEX_SITE_URL` | Read from `.env.local` after `convex dev` |
| `CONVEX_DEPLOY_KEY` | Pasted manually from Convex dashboard |
