export type AiProvider = 'gemini-direct';

export const AI_REQUIRED_ENV_VARS = [
  'AI_PROVIDER',
  'GEMINI_API_KEY',
  'GEMINI_PRIMARY_MODEL',
  'GEMINI_FAST_MODEL',
] as const;

const SUPPORTED_PROVIDER: AiProvider = 'gemini-direct';

const getRequiredEnv = (name: (typeof AI_REQUIRED_ENV_VARS)[number]): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required AI environment variable: ${name}`);
  }
  return value;
};

const redactSecret = (value: string): string => {
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
};

export type BackendAiConfig = {
  provider: AiProvider;
  apiKey: string;
  models: {
    primary: string;
    fast: string;
  };
};

let cachedConfig: BackendAiConfig | null = null;

export const getBackendAiConfig = (): BackendAiConfig => {
  if (cachedConfig) return cachedConfig;

  const providerFromEnv = getRequiredEnv('AI_PROVIDER').toLowerCase();
  if (providerFromEnv !== SUPPORTED_PROVIDER) {
    throw new Error(`Unsupported AI_PROVIDER: ${providerFromEnv}. Supported provider: ${SUPPORTED_PROVIDER}`);
  }

  cachedConfig = {
    provider: providerFromEnv as AiProvider,
    apiKey: getRequiredEnv('GEMINI_API_KEY'),
    models: {
      primary: getRequiredEnv('GEMINI_PRIMARY_MODEL'),
      fast: getRequiredEnv('GEMINI_FAST_MODEL'),
    },
  };

  return cachedConfig;
};

export const logBackendAiSelection = () => {
  const config = getBackendAiConfig();
  console.log(
    `🤖 AI provider ready: provider=${config.provider}, primary=${config.models.primary}, fast=${config.models.fast}, apiKey=${redactSecret(config.apiKey)}`
  );
};
