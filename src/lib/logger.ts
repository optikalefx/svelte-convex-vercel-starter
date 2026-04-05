import chalk from 'chalk';
export { intro, outro, spinner, note, text, confirm, isCancel } from '@clack/prompts';

export const step = (msg: string) => console.log(chalk.cyan(`\n→ ${msg}`));
export const success = (msg: string) => console.log(chalk.green(`✓ ${msg}`));
export const warn = (msg: string) => console.log(chalk.yellow(`⚠ ${msg}`));
export const info = (msg: string) => console.log(chalk.dim(msg));

/** Wraps a URL in OSC 8 hyperlink escape codes so it's cmd-clickable in iTerm2 / modern terminals. */
export const link = (url: string) => `\x1b]8;;${url}\x07${url}\x1b]8;;\x07`;
