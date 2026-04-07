import { execa } from 'execa';

export async function run(cmd: string, args: string[], cwd: string): Promise<string> {
  const result = await execa(cmd, args, { cwd, stdout: 'pipe', stderr: 'inherit' });
  return result.stdout;
}

export async function runCaptureAll(cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  const result = await execa(cmd, args, { cwd, stdout: 'pipe', stderr: 'pipe' });
  return { stdout: result.stdout, stderr: result.stderr };
}

export async function runInherited(cmd: string, args: string[], cwd: string): Promise<void> {
  await execa(cmd, args, { cwd, stdio: 'inherit' });
}

export async function runSilent(cmd: string, args: string[], cwd: string): Promise<string> {
  const result = await execa(cmd, args, { cwd, stdout: 'pipe', stderr: 'pipe' });
  return result.stdout;
}

export async function pipeToStdin(cmd: string, args: string[], input: string, cwd: string): Promise<string> {
  const result = await execa(cmd, args, { cwd, input, stdout: 'pipe', stderr: 'inherit' });
  return result.stdout;
}
