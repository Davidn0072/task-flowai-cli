const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5033';

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const PUBLIC_AUTH_PATHS = ['/api/auth/login'];

const isPublicAuthEndpoint = (endpoint: string): boolean =>
  PUBLIC_AUTH_PATHS.some((path) => endpoint.startsWith(path));

const getHeaders = (endpoint: string, isFormData: boolean = false): HeadersInit => {
  const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
  const token = getToken();

  if (token && !isPublicAuthEndpoint(endpoint)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(endpoint, options.body instanceof FormData),
      ...options.headers,
    },
  };

  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized - token expired or invalid (not on login)
  if (response.status === 401 && !isPublicAuthEndpoint(endpoint)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('logout'));
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    let message: string;
    if (typeof errorData === 'string') {
      message = errorData;
    } else if (Array.isArray(errorData)) {
      message = errorData.join(', ');
    } else if (errorData.message) {
      message = errorData.message;
    } else if (errorData.errors) {
      // ASP.NET Core validation problem details: { errors: { field: ["msg"] } }
      message = Object.values(errorData.errors as Record<string, string[]>).flat().join(', ');
    } else if (errorData.title) {
      message = errorData.title;
    } else {
      message = `HTTP Error: ${response.status}`;
    }
    throw new Error(message);
  }

  // PUT/DELETE often return 204 No Content with an empty body
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body: any) =>
    apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body: any) =>
    apiCall<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'DELETE' }),
};

export default { apiCall, api, getToken };
