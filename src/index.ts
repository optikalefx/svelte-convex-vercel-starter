#!/usr/bin/env node
import { resolve } from 'path';
import { intro, outro } from '@clack/prompts';
import { info } from './lib/logger.js';
import type { StackConfig } from './lib/types.js';
import { scaffold } from './steps/01-scaffold.js';
import { setupGitHub } from './steps/02-git-github.js';
import { installConvex } from './steps/03-install-convex.js';
import { runConvexDev } from './steps/04-convex-dev.js';
import { writeLayout } from './steps/05-write-layout.js';
import { setupVercel } from './steps/06-vercel-setup.js';
import { deployConvex } from './steps/07-convex-deploy.js';
import { setVercelEnv } from './steps/08-vercel-env.js';
import { finalPush } from './steps/09-final-push.js';

const appName = process.argv[2];

if (!appName) {
  console.error('Usage: create-stack <app-name>');
  process.exit(1);
}

const config: StackConfig = {
  appName,
  appDir: resolve(process.cwd(), appName),
  githubRepoUrl: '',
  convexUrl: '',
  convexSiteUrl: '',
  convexDeployKey: '',
};

intro(`Creating ${appName} — SvelteKit + Convex + Vercel`);
info(`App directory: ${config.appDir}`);

try {
  await scaffold(config);
  await setupGitHub(config);
  await installConvex(config);
  await runConvexDev(config);
  await writeLayout(config);
  await setupVercel(config);
  await deployConvex(config);
  await setVercelEnv(config);
  await finalPush(config);

  outro(`Done! Check your Vercel dashboard for the live URL.`);
} catch (err) {
  console.error('\nSetup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
}
