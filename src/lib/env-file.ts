import { readFileSync } from 'fs';
import { parse } from 'dotenv';

export function readEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  return parse(content) as Record<string, string>;
}
