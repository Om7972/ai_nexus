const DEFAULT_API_URL = 'http://localhost:5000/api/v1';

const normalizeUrl = (url) => {
  let normalized = url.replace(/\/+$/, '');
  if (!normalized.endsWith('/api/v1')) {
    normalized = `${normalized}/api/v1`;
  }
  return normalized;
};

export const API_BASE_URL = normalizeUrl(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
);

export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '') || 'http://localhost:5000';
