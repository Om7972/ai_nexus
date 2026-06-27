import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const API_URL = API_BASE_URL;

// Async thunks
export const uploadFile = createAsyncThunk(
  'knowledge/uploadFile',
  async ({ file, collection, tags }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);
      if (tags) formData.append('tags', JSON.stringify(tags));

      const response = await axios.post(`${API_URL}/knowledge/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFiles = createAsyncThunk(
  'knowledge/fetchFiles',
  async ({ page = 1, limit = 20, collection, fileType, status, search }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (collection) params.append('collection', collection);
      if (fileType) params.append('fileType', fileType);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await axios.get(`${API_URL}/knowledge/files?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFile = createAsyncThunk(
  'knowledge/fetchFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/knowledge/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFile = createAsyncThunk(
  'knowledge/updateFile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/knowledge/files/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'knowledge/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/knowledge/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
      });
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchKnowledge = createAsyncThunk(
  'knowledge/search',
  async ({ query, fileIds, limit, threshold }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/knowledge/search`, 
        { query, fileIds, limit, threshold },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const chatWithKnowledge = createAsyncThunk(
  'knowledge/chat',
  async ({ message, sessionId, fileIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/knowledge/chat`, 
        { message, sessionId, fileIds },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatSessions = createAsyncThunk(
  'knowledge/fetchChatSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/knowledge/chat/sessions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'knowledge/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/knowledge/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState: {
    files: [],
    currentFile: null,
    searchResults: [],
    chatSessions: [],
    currentChat: null,
    statistics: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 0
    },
    uploading: false,
    loading: false,
    searching: false,
    chatting: false,
    error: null
  },
  reducers: {
    clearCurrentFile: (state) => {
      state.currentFile = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    addChatMessage: (state, action) => {
      if (state.currentChat) {
        state.currentChat.messages.push(action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.files.unshift(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Fetch files
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single file
      .addCase(fetchFile.fulfilled, (state, action) => {
        state.currentFile = action.payload;
      })
      // Update file
      .addCase(updateFile.fulfilled, (state, action) => {
        const index = state.files.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
        if (state.currentFile?._id === action.payload._id) {
          state.currentFile = action.payload;
        }
      })
      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f._id !== action.payload);
        if (state.currentFile?._id === action.payload) {
          state.currentFile = null;
        }
      })
      // Search
      .addCase(searchKnowledge.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchKnowledge.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchKnowledge.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload;
      })
      // Chat
      .addCase(chatWithKnowledge.pending, (state) => {
        state.chatting = true;
        state.error = null;
      })
      .addCase(chatWithKnowledge.fulfilled, (state, action) => {
        state.chatting = false;
        state.currentChat = action.payload;
      })
      .addCase(chatWithKnowledge.rejected, (state, action) => {
        state.chatting = false;
        state.error = action.payload;
      })
      // Fetch chat sessions
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.chatSessions = action.payload;
      })
      // Fetch statistics
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  }
});

export const {
  clearCurrentFile,
  clearSearchResults,
  clearCurrentChat,
  addChatMessage,
  clearError
} = knowledgeSlice.actions;

export default knowledgeSlice.reducer;
