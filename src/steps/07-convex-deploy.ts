import { existsSync, appendFileSync } from 'fs';
import { join } from 'path';
import { runInherited } from '../lib/exec.js';
import { readEnvFile } from '../lib/env-file.js';
import { step, success, info, note, text, isCancel } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

export async function deployConvex(config: StackConfig): Promise<void> {
  step('Deploying Convex to production...');

  await runInherited('npx', ['convex', 'deploy'], config.appDir);

  success('Convex deployed to production.');

  // Check if the deploy key was already saved from a previous run
  const envLocalPath = join(config.appDir, '.env.local');
  if (existsSync(envLocalPath)) {
    const env = readEnvFile(envLocalPath);
    if (env['CONVEX_DEPLOY_KEY']) {
      config.convexDeployKey = env['CONVEX_DEPLOY_KEY'];
      info('✓ Convex deploy key loaded from .env.local, skipping prompt.');
      return;
    }
  }

  note(
    [
      'You need a production deploy key to set as a Vercel env var.',
      '',
      '1. Go to: https://dashboard.convex.dev',
      `2. Open your "${config.appName}" project`,
      '3. Navigate to Settings → Deploy Keys',
      '4. Click "Generate Production Deploy Key"',
      '5. Copy the key (it starts with "prod:")',
    ].join('\n'),
    'Get your Convex deploy key',
  );

  const deployKey = await text({
    message: 'Paste your Convex production deploy key:',
    validate: (v) => {
      if (!v) return 'Deploy key is required.';
      if (!v.startsWith('prod:')) return 'Key should start with "prod:"';
    },
  });

  if (isCancel(deployKey)) {
    console.error('Cancelled. Re-run and paste your deploy key to continue.');
    process.exit(1);
  }

  config.convexDeployKey = deployKey as string;

  // Save to .env.local so future re-runs skip this prompt
  appendFileSync(envLocalPath, `\nCONVEX_DEPLOY_KEY=${config.convexDeployKey}\n`);
}
