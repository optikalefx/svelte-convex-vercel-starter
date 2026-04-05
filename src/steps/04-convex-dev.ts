import { join } from 'path';
import { existsSync } from 'fs';
import { runInherited } from '../lib/exec.js';
import { readEnvFile } from '../lib/env-file.js';
import { step, success, info, note } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

export async function runConvexDev(config: StackConfig): Promise<void> {
  const envFile = join(config.appDir, '.env.local');

  if (existsSync(envFile)) {
    const env = readEnvFile(envFile);
    if (env['PUBLIC_CONVEX_URL']) {
      config.convexUrl = env['PUBLIC_CONVEX_URL'];
      config.convexSiteUrl = env['PUBLIC_CONVEX_SITE_URL'] ?? '';
      info(`✓ Convex dev already configured (${config.convexUrl}), skipping.`);
      return;
    }
  }

  step('Setting up Convex (dev)...');

  note(
    [
      'npx convex dev will now launch.',
      '',
      '1. Log in or create a Convex account when prompted in your browser.',
      `2. Create a new project named "${config.appName}" (or choose an existing one).`,
      '3. Wait until you see "✔ Convex functions ready!" in the output.',
      '4. Press Ctrl+C to continue setup.',
    ].join('\n'),
    'Action required',
  );

  // Suppress SIGINT in the parent while convex dev is running so that
  // Ctrl+C kills only the child process and lets setup continue.
  const noopSigint = () => {};
  process.on('SIGINT', noopSigint);

  try {
    await runInherited('npx', ['convex', 'dev'], config.appDir);
  } catch (err: any) {
    // Ctrl+C causes an SIGINT exit. Convex dev may exit with 130 (standard)
    // or 254 (observed with npx convex dev) — treat both as the expected "done" signal.
    const isUserExit = err?.signal === 'SIGINT' || err?.exitCode === 130 || err?.exitCode === 254;
    if (!isUserExit) {
      throw err;
    }
  } finally {
    process.off('SIGINT', noopSigint);
  }

  // Read the URLs that convex dev wrote to .env.local
  const env = readEnvFile(envFile);
  config.convexUrl = env['PUBLIC_CONVEX_URL'] ?? '';
  config.convexSiteUrl = env['PUBLIC_CONVEX_SITE_URL'] ?? '';

  success(`Convex dev URL: ${config.convexUrl}`);
}
