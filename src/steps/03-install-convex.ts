import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { run } from '../lib/exec.js';
import { step, success, info } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

export async function installConvex(config: StackConfig): Promise<void> {
  if (existsSync(join(config.appDir, 'convex.json'))) {
    info('✓ Convex already installed, skipping.');
    return;
  }

  step('Installing Convex...');

  await run('npm', ['install', 'convex', 'convex-svelte'], config.appDir);

  writeFileSync(
    join(config.appDir, 'convex.json'),
    JSON.stringify({ functions: 'src/convex/' }, null, 2) + '\n',
  );

  success('Convex installed and convex.json written.');
}
