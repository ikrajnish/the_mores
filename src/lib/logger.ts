
const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
    if (isProduction && level === 'debug') return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };

    // In production, you would send this to Sentry/Datadog/LogRocket
    if (isProduction) {
       // Placeholder for Sentry integration
       // Sentry.captureMessage(message, { level, extra: context });
       if (level === 'error' && error) {
           console.error(JSON.stringify(entry)); // Minimal structured log for cloud watch
       }
    } else {
      // Dev friendly logging
      const color = {
        info: '\x1b[34m', // Blue
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[32m', // Green
      }[level];
      const reset = '\x1b[0m';
      
      console.log(
        `${color}[${level.toUpperCase()}]${reset} ${message}`, 
        context ? context : '',
        error ? error : ''
      );
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log('error', message, context, error);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();
