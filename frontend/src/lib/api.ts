import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: BASE, timeout: 30_000 });

// Inject JWT from localStorage on each request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Primary: read from Zustand persist store (reliable after page refresh)
    let token: string | null = null;
    try {
      const stored = localStorage.getItem('Zawjia_auth');
      if (stored) token = JSON.parse(stored)?.state?.token ?? null;
    } catch { /* ignore parse errors */ }
    // Fallback: direct key set at login time
    if (!token) token = localStorage.getItem('Zawjia_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      // Avoid redirect loop if already on auth pages
      const isAuthPage = ['/login', '/register'].some(p => window.location.pathname.startsWith(p));
      if (!isAuthPage) {
        localStorage.removeItem('Zawjia_token');
        localStorage.removeItem('Zawjia_auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login:    (data: object) => api.post('/auth/login', data),
  acceptCharter:   () => api.post('/auth/accept-charter'),
  deleteAccount:   () => api.delete('/auth/delete-account'),
};

// ── User ───────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile:    () => api.get('/user/me'),
  updateProfile: (data: object) => api.patch('/user/me', data),
  uploadPhoto:   (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post('/user/me/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── AI ─────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat:       (prompt: string) => api.post('/ai/chat', { prompt }),
  getProfile: () => api.get('/ai/profile'),
};

// ── Matching ───────────────────────────────────────────────────────────────────
export const matchingApi = {
  getProposals:  () => api.get('/matching/proposals'),
  choose:        (userId: string, choice: boolean) => api.post('/matching/choose', { userId, choice }),
  finalDecision: (matchId: string, accept: boolean) => api.post('/matching/final-decision', { matchId, accept }),
  getMyMatches:  () => api.get('/matching/my-matches'),
  uploadPhoto:   (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post('/matching/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Subscription ───────────────────────────────────────────────────────────────
export const subscriptionApi = {
  createCheckout: (plan: string) => api.post('/subscription/create-checkout', { plan }),
  getStatus:      () => api.get('/subscription/status'),
};

// ── Wali ───────────────────────────────────────────────────────────────────────
export const waliApi = {
  add:          (data: object) => api.post('/wali/add', data),
  getContact:   (matchId: string) => api.get(`/wali/contact/${matchId}`),
};

// ── Admin ───────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:         () => api.get('/admin/stats'),
  getUsers:         (params?: object) => api.get('/admin/users', { params }),
  banUser:          (id: string) => api.patch(`/admin/ban/${id}`),
  unbanUser:        (id: string) => api.patch(`/admin/unban/${id}`),
  getMatches:       () => api.get('/admin/matches'),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getWalis:         () => api.get('/admin/walis'),
  verifyWali:       (id: string) => api.patch(`/admin/walis/verify/${id}`),
  getAiLogs:        () => api.get('/admin/ai-logs'),
};
