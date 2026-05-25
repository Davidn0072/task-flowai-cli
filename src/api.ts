const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5033';

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const getHeaders = (isFormData: boolean = false): HeadersInit => {
  const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
  const token = getToken();

  if (token) {
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
      ...getHeaders(options.body instanceof FormData),
      ...options.headers,
    },
  };

  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login (handled by App.tsx checking isLoggedIn)
    window.dispatchEvent(new CustomEvent('logout'));
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
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
