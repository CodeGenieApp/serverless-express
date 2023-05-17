export interface Logger {
  info: (message: string, ...additional: Object[]) => void;
  debug: (message: string, ...additional: Object[]) => void;
  error: (message: string, ...additional: Object[]) => void;
  warn: (message: string, ...additional: Object[]) => void;
  verbose: (message: string, ...additional: Object[]) => void;
}
interface Options {
  level?: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | string;
}

export default function logger(options?: Options): Logger;
