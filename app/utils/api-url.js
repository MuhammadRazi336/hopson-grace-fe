export const DEFAULT_API_BASE_URL = 'https://api.theregistry.ca';
// const DEFAULT_API_BASE_URL = 'https://dev-hopsongrace.codup.io';

export function getApiBaseUrl(envLike) {
  const envApiBase = envLike?.API_BASE_URL;
  if (envApiBase && typeof envApiBase === 'string') {
    return envApiBase.replace(/\/$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window?.ENV?.API_BASE_URL &&
    typeof window.ENV.API_BASE_URL === 'string'
  ) {
    return window.ENV.API_BASE_URL.replace(/\/$/, '');
  }

  if (
    typeof process !== 'undefined' &&
    process?.env?.API_BASE_URL &&
    typeof process.env.API_BASE_URL === 'string'
  ) {
    return process.env.API_BASE_URL.replace(/\/$/, '');
  }

  return DEFAULT_API_BASE_URL;
}

export function buildApiUrl(path, envLike) {
  const cleanPath = String(path || '').replace(/^\/+/, '');
  return `${getApiBaseUrl(envLike)}/api/${cleanPath}`;
}
