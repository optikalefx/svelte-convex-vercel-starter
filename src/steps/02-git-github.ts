import { run } from '../lib/exec.js';
import { step, success, info } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

export async function setupGitHub(config: StackConfig): Promise<void> {
  // Check if a remote is already configured
  let remoteUrl = '';
  try {
    remoteUrl = await run('git', ['remote', 'get-url', 'origin'], config.appDir);
  } catch {
    // no remote yet
  }

  if (remoteUrl) {
    config.githubRepoUrl = remoteUrl.trim();
    info(`✓ GitHub already set up (${config.githubRepoUrl}), skipping.`);
    return;
  }

  step('Setting up git and GitHub...');

  await run('git', ['init'], config.appDir);

  // sv create may have already set an SSH remote — remove it so gh can set the correct one
  try { await run('git', ['remote', 'remove', 'origin'], config.appDir); } catch {}

  await run('git', ['add', '-A'], config.appDir);

  // sv create may have already made an initial commit — only commit if there's something staged
  const status = await run('git', ['status', '--porcelain'], config.appDir);
  if (status.trim()) {
    await run('git', ['commit', '-m', 'Initial SvelteKit scaffold'], config.appDir);
  }

  // Creates private repo, sets remote, and pushes in one command
  const output = await run('gh', [
    'repo', 'create', config.appName,
    '--private',
    '--source', '.',
    '--push',
  ], config.appDir);

  // Extract repo URL from gh output (e.g. "https://github.com/user/name")
  const match = output.match(/https:\/\/github\.com\/\S+/);
  config.githubRepoUrl = match ? match[0] : `https://github.com/unknown/${config.appName}`;

  success(`GitHub repo created: ${config.githubRepoUrl}`);
}
