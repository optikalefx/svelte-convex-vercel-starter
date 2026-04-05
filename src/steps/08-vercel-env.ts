import { pipeToStdin } from '../lib/exec.js';
import { step, success } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

async function setEnv(name: string, value: string, cwd: string): Promise<void> {
  await pipeToStdin('vercel', ['env', 'add', name, 'production', '--force'], value, cwd);
}

export async function setVercelEnv(config: StackConfig): Promise<void> {
  step('Setting Vercel environment variables...');

  await setEnv('PUBLIC_CONVEX_URL', config.convexUrl, config.appDir);
  await setEnv('PUBLIC_CONVEX_SITE_URL', config.convexSiteUrl, config.appDir);
  await setEnv('CONVEX_DEPLOY_KEY', config.convexDeployKey, config.appDir);

  success('Vercel env vars set.');
}
