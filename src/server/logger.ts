export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const ACTIVE_LEVEL = (process.env.LOG_LEVEL as LogLevel) || DEFAULT_LEVEL;
const APP_NAME = process.env.APP_NAME || 'lifepilot-server';

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PAYMENT_ID_PATTERN = /\b(pay_[A-Za-z0-9]+|pi_[A-Za-z0-9]+|pm_[A-Za-z0-9]+|order_[A-Za-z0-9]+|rzp_[A-Za-z0-9_]+)\b/g;
const TOKEN_KEY_PATTERN = /(token|authorization|auth|secret|password|api[_-]?key|jwt|cookie|session)/i;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[ACTIVE_LEVEL];
}

function redactString(value: string): string {
  const emailRedacted = value.replace(EMAIL_PATTERN, '[REDACTED_EMAIL]');
  const paymentRedacted = emailRedacted.replace(PAYMENT_ID_PATTERN, '[REDACTED_PAYMENT_ID]');
  return paymentRedacted;
}

function redactValue(value: unknown, keyHint?: string): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (keyHint && TOKEN_KEY_PATTERN.test(keyHint)) {
      return '[REDACTED_SECRET]';
    }
    return redactString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (TOKEN_KEY_PATTERN.test(key)) {
        out[key] = '[REDACTED_SECRET]';
      } else {
        out[key] = redactValue(nested, key);
      }
    }
    return out;
  }

  return String(value);
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactString(error.message),
      stack: error.stack ? redactString(error.stack) : undefined,
    };
  }
  return { value: redactValue(error) };
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry = {
    ts: new Date().toISOString(),
    app: APP_NAME,
    env: process.env.NODE_ENV || 'development',
    level,
    message: redactString(message),
    ...(meta ? { meta: redactValue(meta) } : {}),
  };

  const line = JSON.stringify(entry);
  if (level === 'error' || level === 'warn') {
    process.stderr.write(`${line}\n`);
    return;
  }

  process.stdout.write(`${line}\n`);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    emit('debug', message, meta);
  },
  info(message: string, meta?: Record<string, unknown>) {
    emit('info', message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    emit('warn', message, meta);
  },
  error(message: string, errorOrMeta?: unknown, meta?: Record<string, unknown>) {
    if (errorOrMeta instanceof Error) {
      emit('error', message, { error: serializeError(errorOrMeta), ...(meta || {}) });
      return;
    }
    if (errorOrMeta && typeof errorOrMeta === 'object') {
      emit('error', message, errorOrMeta as Record<string, unknown>);
      return;
    }
    emit('error', message, meta);
  },
  async clientError(payload: Record<string, unknown>) {
    setImmediate(() => emit('error', 'client_error', { payload }));
  },
};

export const LOGGING_STRATEGY = {
  destination: 'stdout-stderr',
  rotation: 'managed_by_platform',
  retention: 'managed_by_platform',
};
