import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (searchParams, { rejectWithValue, getState }) => {
    try {
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        results: {
          projects: [
            { id: 1, title: 'AI Content Generator', type: 'project', updated: '2 days ago' },
            { id: 2, title: 'Image Enhancement Task', type: 'project', updated: '1 week ago' }
          ],
          documents: [
            { id: 101, title: 'Q3 Report', type: 'document', updated: 'Yesterday' }
          ],
          users: [],
          templates: [],
          analytics: []
        },
        totalResults: 3,
        currentPage: 1,
        hasMore: false
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getSearchSuggestions = createAsyncThunk(
  'search/getSearchSuggestions',
  async (query, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get('/api/search/suggestions', {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: { query }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get suggestions');
    }
  }
);

export const saveSearchHistory = createAsyncThunk(
  'search/saveSearchHistory',
  async (searchQuery, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post('/api/search/history', { query: searchQuery }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save search history');
    }
  }
);

export const getSearchHistory = createAsyncThunk(
  'search/getSearchHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get('/api/search/history', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get search history');
    }
  }
);

export const clearSearchHistory = createAsyncThunk(
  'search/clearSearchHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete('/api/search/history', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear search history');
    }
  }
);

const initialState = {
  query: '',
  results: {
    projects: [],
    documents: [],
    users: [],
    templates: [],
    analytics: []
  },
  suggestions: [],
  searchHistory: [],
  filters: {
    type: 'all',
    dateRange: 'all',
    category: 'all',
    status: 'all',
    sortBy: 'relevance'
  },
  recentSearches: [],
  popularSearches: [
    'Data Analysis',
    'Image Processing',
    'Text Generation',
    'AI Models',
    'Machine Learning',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision'
  ],
  loading: false,
  error: null,
  totalResults: 0,
  currentPage: 1,
  hasMore: false
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearQuery: (state) => {
      state.query = '';
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearResults: (state) => {
      state.results = initialState.results;
      state.totalResults = 0;
      state.currentPage = 1;
      state.hasMore = false;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    addToRecentSearches: (state, action) => {
      const search = action.payload;
      const existingIndex = state.recentSearches.findIndex(s => s.query === search.query);

      if (existingIndex !== -1) {
        state.recentSearches.splice(existingIndex, 1);
      }

      state.recentSearches.unshift(search);

      // Keep only last 10 searches
      if (state.recentSearches.length > 10) {
        state.recentSearches = state.recentSearches.slice(0, 10);
      }
    },
    removeFromRecentSearches: (state, action) => {
      const index = state.recentSearches.findIndex(s => s.query === action.payload);
      if (index !== -1) {
        state.recentSearches.splice(index, 1);
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    appendResults: (state, action) => {
      const { results, type } = action.payload;
      state.results[type] = [...state.results[type], ...results];
    }
  },
  extraReducers: (builder) => {
    builder
      // Perform Search
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.totalResults = action.payload.totalResults;
        state.currentPage = action.payload.currentPage;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Suggestions
      .addCase(getSearchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSearchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload;
      })
      .addCase(getSearchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Search History
      .addCase(saveSearchHistory.fulfilled, (state, action) => {
        state.searchHistory.unshift(action.payload);
        if (state.searchHistory.length > 50) {
          state.searchHistory = state.searchHistory.slice(0, 50);
        }
      })
      // Get Search History
      .addCase(getSearchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSearchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.searchHistory = action.payload;
      })
      .addCase(getSearchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear Search History
      .addCase(clearSearchHistory.fulfilled, (state) => {
        state.searchHistory = [];
      });
  },
});

export const {
  clearError,
  setQuery,
  clearQuery,
  setFilters,
  clearFilters,
  clearResults,
  clearSuggestions,
  addToRecentSearches,
  removeFromRecentSearches,
  clearRecentSearches,
  setCurrentPage,
  appendResults
} = searchSlice.actions;

export default searchSlice.reducer; 