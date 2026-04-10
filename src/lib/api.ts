import { auth } from '../firebase';

export const getFreshToken = async () => {
  if (!auth.currentUser) return null;
  try {
    const newToken = await auth.currentUser.getIdToken(true);
    localStorage.setItem('lifepilot_token', newToken);
    return newToken;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    return null;
  }
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('lifepilot_token');
  if (!token) {
    token = await getFreshToken();
  }
  if (!token) throw new Error("No authentication token available");

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    token = await getFreshToken();
    if (token) {
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || `Request failed with status ${res.status}`);
    } else {
      const text = await res.text();
      throw new Error(`Request failed with status ${res.status}: ${text.substring(0, 100)}`);
    }
  }

  return res;
};
