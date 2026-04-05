import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { runInherited } from '../lib/exec.js';
import { step, success, info } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

export async function scaffold(config: StackConfig): Promise<void> {
  if (existsSync(join(config.appDir, 'package.json'))) {
    info('✓ Scaffold already done, skipping.');
    return;
  }

  step('Scaffolding SvelteKit project...');

  mkdirSync(config.appDir, { recursive: true });

  await runInherited('npx', [
    'sv@latest', 'create',
    '--template', 'minimal',
    '--types', 'ts',
    '--add', 'prettier', 'eslint',
    'sveltekit-adapter=adapter:vercel',
    'mcp=ide:claude-code+setup:remote',
    '--install', 'npm',
    '.',
  ], config.appDir);

  success('SvelteKit project scaffolded.');
}
