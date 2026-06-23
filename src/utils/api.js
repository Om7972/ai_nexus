const DEFAULT_API_URL = 'http://localhost:5000/api/v1';

const normalizeUrl = (url) => url.replace(/\/+$/, '');

export const API_BASE_URL = normalizeUrl(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
);

export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '') || 'http://localhost:5000';
