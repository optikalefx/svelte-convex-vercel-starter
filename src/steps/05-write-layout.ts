import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { step, success, info } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

export async function writeLayout(config: StackConfig): Promise<void> {
  const layoutPath = join(config.appDir, 'src/routes/+layout.svelte');
  if (existsSync(layoutPath) && readFileSync(layoutPath, 'utf-8').includes('setupConvex')) {
    info('✓ +layout.svelte already has Convex setup, skipping.');
    return;
  }

  step('Writing +layout.svelte with Convex setup...');

  const content = `<script lang="ts">
  import { PUBLIC_CONVEX_URL } from '$env/static/public';
  import { setupConvex } from 'convex-svelte';

  const { children } = $props();
  setupConvex(PUBLIC_CONVEX_URL);
</script>

{@render children()}
`;

  writeFileSync(join(config.appDir, 'src/routes/+layout.svelte'), content);

  success('+layout.svelte written.');
}
