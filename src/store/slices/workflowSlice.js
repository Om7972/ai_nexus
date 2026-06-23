import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const API_URL = API_BASE_URL;

// Async thunks
export const fetchWorkflows = createAsyncThunk(
  'workflow/fetchWorkflows',
  async ({ page = 1, limit = 10, status, search }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await axios.get(`${API_URL}/workflows?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWorkflow = createAsyncThunk(
  'workflow/fetchWorkflow',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createWorkflow = createAsyncThunk(
  'workflow/createWorkflow',
  async (workflowData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/workflows`, workflowData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  'workflow/updateWorkflow',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/workflows/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  'workflow/deleteWorkflow',
  async (workflowId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return workflowId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const duplicateWorkflow = createAsyncThunk(
  'workflow/duplicateWorkflow',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/workflows/${workflowId}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const executeWorkflow = createAsyncThunk(
  'workflow/executeWorkflow',
  async ({ workflowId, input }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/workflows/${workflowId}/execute`, { input }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchExecution = createAsyncThunk(
  'workflow/fetchExecution',
  async (executionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/workflows/executions/${executionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWorkflowVersions = createAsyncThunk(
  'workflow/fetchVersions',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/workflows/${workflowId}/versions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const workflowSlice = createSlice({
  name: 'workflow',
  initialState: {
    workflows: [],
    currentWorkflow: null,
    currentExecution: null,
    versions: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    },
    loading: false,
    executionLoading: false,
    error: null
  },
  reducers: {
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
    },
    clearCurrentExecution: (state) => {
      state.currentExecution = null;
    },
    updateCurrentWorkflowNodes: (state, action) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.nodes = action.payload;
      }
    },
    updateCurrentWorkflowEdges: (state, action) => {
      if (state.currentWorkflow) {
        state.currentWorkflow.edges = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch workflows
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single workflow
      .addCase(fetchWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(fetchWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create workflow
      .addCase(createWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows.unshift(action.payload);
        state.currentWorkflow = action.payload;
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update workflow
      .addCase(updateWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkflow = action.payload;
        const index = state.workflows.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
      })
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete workflow
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.workflows = state.workflows.filter(w => w._id !== action.payload);
        if (state.currentWorkflow?._id === action.payload) {
          state.currentWorkflow = null;
        }
      })
      // Duplicate workflow
      .addCase(duplicateWorkflow.fulfilled, (state, action) => {
        state.workflows.unshift(action.payload);
      })
      // Execute workflow
      .addCase(executeWorkflow.pending, (state) => {
        state.executionLoading = true;
        state.error = null;
      })
      .addCase(executeWorkflow.fulfilled, (state, action) => {
        state.executionLoading = false;
        state.currentExecution = action.payload;
      })
      .addCase(executeWorkflow.rejected, (state, action) => {
        state.executionLoading = false;
        state.error = action.payload;
      })
      // Fetch execution
      .addCase(fetchExecution.fulfilled, (state, action) => {
        state.currentExecution = action.payload;
      })
      // Fetch versions
      .addCase(fetchWorkflowVersions.fulfilled, (state, action) => {
        state.versions = action.payload;
      });
  }
});

export const {
  clearCurrentWorkflow,
  clearCurrentExecution,
  updateCurrentWorkflowNodes,
  updateCurrentWorkflowEdges,
  clearError
} = workflowSlice.actions;

export default workflowSlice.reducer;
