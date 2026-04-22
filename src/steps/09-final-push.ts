import { run, runInherited } from '../lib/exec.js';
import { step, success, spinner, link } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function finalPush(config: StackConfig): Promise<void> {
  // Push to GitHub (sets up future auto-deploys via webhook)
  step('Pushing to GitHub...');
  await run('git', ['add', '-A'], config.appDir);
  const dirty = await run('git', ['status', '--porcelain'], config.appDir);
  if (dirty.trim()) {
    await run('git', ['commit', '-m', 'Add Convex + Vercel integration'], config.appDir);
  }
  await run('git', ['push', '--set-upstream', 'origin', 'main'], config.appDir);
  success('Pushed to GitHub.');

  // Trigger the first production deployment directly via Vercel CLI.
  // This activates the GitHub webhook so future pushes deploy automatically.
  step('Deploying to Vercel...');
  const s = spinner();
  s.start('Building and deploying...');

  let vercelUrl = `https://${config.appName}.vercel.app`;
  try {
    const output = await run('vercel', ['deploy', '--prod'], config.appDir);
    const match = output.match(/https:\/\/\S+\.vercel\.app/);
    if (match) vercelUrl = match[0];
    s.stop('Deployed!');
  } catch (err: any) {
    s.stop('Deployment failed — check the Vercel dashboard for build logs.');
    console.error(err?.message ?? err);
  }

  success(`Live at ${link(vercelUrl)}`);
  console.log(`
  GitHub:  ${link(config.githubRepoUrl)}
  Vercel:  ${link(vercelUrl)}
  Convex:  ${link(config.convexUrl)}`);
}
