import { writeFileSync, readFileSync, appendFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { runCaptureAll } from '../lib/exec.js';
import { step, success, warn } from '../lib/logger.js';
import type { StackConfig } from '../lib/types.js';

function getVercelToken(): string {
  const candidates = [
    join(homedir(), 'Library/Application Support/com.vercel.cli/auth.json'), // macOS
    join(homedir(), '.local/share/com.vercel.cli/auth.json'),                 // Linux
    join(homedir(), '.config/com.vercel.cli/auth.json'),                      // Linux alt
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        const data = JSON.parse(readFileSync(p, 'utf-8'));
        if (data.token) return data.token as string;
      } catch { /* try next */ }
    }
  }
  return '';
}

function parseGitHubSlug(remoteUrl: string): string {
  // SSH:   git@github.com:org/repo.git
  // HTTPS: https://github.com/org/repo.git
  const ssh = remoteUrl.match(/git@github\.com:(.+?)(?:\.git)?$/);
  if (ssh) return ssh[1];
  const https = remoteUrl.match(/github\.com\/(.+?)(?:\.git)?$/);
  if (https) return https[1];
  return '';
}

async function connectGitHubRepo(config: StackConfig): Promise<void> {
  const token = getVercelToken();
  if (!token) {
    warn('Could not read Vercel auth token — skipping GitHub repo connection. Connect manually in the Vercel dashboard.');
    return;
  }

  const projectJsonPath = join(config.appDir, '.vercel/project.json');
  const { projectId, orgId } = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
  const repoSlug = parseGitHubSlug(config.githubRepoUrl);

  if (!repoSlug) {
    warn(`Could not parse GitHub repo from "${config.githubRepoUrl}" — skipping GitHub connection.`);
    return;
  }

  const url = `https://api.vercel.com/v9/projects/${projectId}/link?teamId=${orgId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'github', repo: repoSlug }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to connect GitHub repo via API (${res.status}): ${body}`);
  }
}

export async function setupVercel(config: StackConfig): Promise<void> {
  step('Linking Vercel project...');

  // vercel link downloads Vercel's dev env vars and overwrites .env.local,
  // which removes the Convex vars. Back them up first.
  const envLocalPath = join(config.appDir, '.env.local');
  const convexLines = existsSync(envLocalPath)
    ? readFileSync(envLocalPath, 'utf-8')
        .split('\n')
        .filter((line) => /^(CONVEX_|PUBLIC_CONVEX_)/.test(line))
    : [];

  // Always delete .vercel before linking so it gets a fresh project.json
  const vercelDir = join(config.appDir, '.vercel');
  if (existsSync(vercelDir)) {
    rmSync(vercelDir, { recursive: true, force: true });
  }

  const args = ['link', '--yes'];
  if (config.appName !== '.') {
    args.push('--project', config.appName);
  }
  const { stdout, stderr } = await runCaptureAll('vercel', args, config.appDir);
  const combined = stdout + stderr;
  process.stdout.write(combined);

  if (combined.includes('Error:')) {
    throw new Error(`Vercel link failed:\n${combined.trim()}`);
  }

  // Restore any Convex vars that vercel link removed from .env.local
  if (convexLines.length > 0) {
    const current = existsSync(envLocalPath) ? readFileSync(envLocalPath, 'utf-8') : '';
    const missing = convexLines.filter((line) => {
      const key = line.split('=')[0];
      return key && !current.includes(key);
    });
    if (missing.length > 0) {
      appendFileSync(envLocalPath, '\n' + missing.join('\n') + '\n');
    }
  }

  // Connect the GitHub repo via the Vercel API (the CLI link command doesn't
  // reliably do this, especially after a previously failed attempt).
  await connectGitHubRepo(config);

  // Write vercel.json with the custom build command
  writeFileSync(
    join(config.appDir, 'vercel.json'),
    JSON.stringify(
      {
        buildCommand: "npx convex deploy --cmd 'npm run build'",
        framework: 'sveltekit',
      },
      null,
      2,
    ) + '\n',
  );

  success('Vercel project linked, GitHub repo connected, and vercel.json written.');
}
