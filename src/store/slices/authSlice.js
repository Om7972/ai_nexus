import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── Axios instance pointing at the Express backend ────────────────────────────
const api = axios.create({
  baseURL: '/api/v1',       // proxied by Vite  → http://localhost:5000/api/v1
  withCredentials: true,    // send/receive HTTP-only cookies (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

// ── Token helper ──────────────────────────────────────────────────────────────
const getStoredToken = () => localStorage.getItem('accessToken');
const setStoredToken = (token) => localStorage.setItem('accessToken', token);
const clearStoredToken = () => localStorage.removeItem('accessToken');

// ── Attach access token to every request ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ═══════════════════════════════════════════════════════════════════════════════
// Async Thunks
// ═══════════════════════════════════════════════════════════════════════════════

/** Register a new account – backend returns user + accessToken in JSON body */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', {
        name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
      });
      // data.data.accessToken comes in the body; cookie is also set by server
      if (data.data?.accessToken) setStoredToken(data.data.accessToken);
      return data.data; // { user, accessToken }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

/** Login with email + password */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      if (data.data?.accessToken) setStoredToken(data.data.accessToken);
      return data.data; // { user, accessToken }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Invalid email or password.'
      );
    }
  }
);

/** Logout – clears cookies server-side and local storage */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the request fails, clear local state
    } finally {
      clearStoredToken();
    }
  }
);

/** Verify persisted access token on app load */
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredToken();
      if (!token) throw new Error('No token');
      const { data } = await api.get('/auth/me');
      return data.data; // { user }
    } catch (err) {
      clearStoredToken();
      return rejectWithValue('Session expired. Please log in again.');
    }
  }
);

/** Silently refresh the access token using the refresh-token cookie */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/refresh');
      if (data.data?.accessToken) setStoredToken(data.data.accessToken);
      return data.data; // { accessToken }
    } catch (err) {
      clearStoredToken();
      return rejectWithValue('Session expired.');
    }
  }
);

/** Send forgot-password email */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Request failed.');
    }
  }
);

/** Reset password with token from email */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      if (data.data?.accessToken) setStoredToken(data.data.accessToken);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password reset failed.');
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// Slice
// ═══════════════════════════════════════════════════════════════════════════════

const initialState = {
  user: null,
  token: getStoredToken(),     // persist across page reloads
  isAuthenticated: false,
  loading: false,
  error: null,
  message: null,               // general success messages (e.g. "Email sent")
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; },

    // Synchronous helper – used by social login or testing
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token || action.payload.accessToken;
      if (state.token) setStoredToken(state.token);
    },
  },
  extraReducers: (builder) => {
    // ── Register ────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Registration returns user but does NOT auto-login (email verify required)
        // We just store the returned state; navigation handled by the page component
        state.isAuthenticated = !!action.payload?.accessToken;
        state.user = action.payload?.user || null;
        state.token = action.payload?.accessToken || null;
        state.message = 'Account created! Check your email to verify your address.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Login ───────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user;
        state.token = action.payload?.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Logout ──────────────────────────────────────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // ── Verify token ────────────────────────────────────────────────────────
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // ── Refresh token ───────────────────────────────────────────────────────
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload?.accessToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // ── Forgot password ─────────────────────────────────────────────────────
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Reset password ──────────────────────────────────────────────────────
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user;
        state.token = action.payload?.accessToken;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, loginSuccess } = authSlice.actions;
export default authSlice.reducer;