import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Helper function to get auth config
const getAuthConfig = (getState) => {
  const token = getState().auth.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============= TEAM ACTIONS =============

export const fetchTeams = createAsyncThunk(
  'collaboration/fetchTeams',
  async ({ page = 1, limit = 20, search = '' }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(
        `${API_URL}/collaboration/teams?page=${page}&limit=${limit}&search=${search}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const createTeam = createAsyncThunk(
  'collaboration/createTeam',
  async (teamData, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(`${API_URL}/collaboration/teams`, teamData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'collaboration/updateTeam',
  async ({ teamId, updates }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.patch(`${API_URL}/collaboration/teams/${teamId}`, updates, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update team');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'collaboration/deleteTeam',
  async (teamId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      await axios.delete(`${API_URL}/collaboration/teams/${teamId}`, config);
      return teamId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete team');
    }
  }
);

// ============= PROJECT ACTIONS =============

export const fetchProjects = createAsyncThunk(
  'collaboration/fetchProjects',
  async ({ team, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(
        `${API_URL}/collaboration/projects?team=${team || ''}&page=${page}&limit=${limit}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'collaboration/createProject',
  async (projectData, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(`${API_URL}/collaboration/projects`, projectData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'collaboration/updateProject',
  async ({ projectId, updates }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.patch(`${API_URL}/collaboration/projects/${projectId}`, updates, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'collaboration/deleteProject',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      await axios.delete(`${API_URL}/collaboration/projects/${projectId}`, config);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

// ============= DOCUMENT ACTIONS =============

export const fetchDocuments = createAsyncThunk(
  'collaboration/fetchDocuments',
  async ({ project, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(
        `${API_URL}/collaboration/documents?project=${project || ''}&page=${page}&limit=${limit}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'collaboration/fetchDocument',
  async (documentId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(`${API_URL}/collaboration/documents/${documentId}`, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch document');
    }
  }
);

export const createDocument = createAsyncThunk(
  'collaboration/createDocument',
  async (documentData, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(`${API_URL}/collaboration/documents`, documentData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create document');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'collaboration/updateDocument',
  async ({ documentId, updates }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.patch(`${API_URL}/collaboration/documents/${documentId}`, updates, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'collaboration/deleteDocument',
  async (documentId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      await axios.delete(`${API_URL}/collaboration/documents/${documentId}`, config);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

// ============= COMMENT ACTIONS =============

export const fetchComments = createAsyncThunk(
  'collaboration/fetchComments',
  async ({ document, parentComment }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(
        `${API_URL}/collaboration/comments?document=${document}&parentComment=${parentComment || ''}`,
        config
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'collaboration/createComment',
  async (commentData, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(`${API_URL}/collaboration/comments`, commentData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
  }
);

export const resolveComment = createAsyncThunk(
  'collaboration/resolveComment',
  async (commentId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(`${API_URL}/collaboration/comments/${commentId}/resolve`, {}, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve comment');
    }
  }
);

// ============= ACTIVITY ACTIONS =============

export const fetchActivities = createAsyncThunk(
  'collaboration/fetchActivities',
  async ({ type, id, limit = 50 }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(
        `${API_URL}/collaboration/activities/${type}/${id}?limit=${limit}`,
        config
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

// ============= SLICE =============

const initialState = {
  // Teams
  teams: [],
  selectedTeam: null,
  teamsLoading: false,
  teamsError: null,

  // Projects
  projects: [],
  selectedProject: null,
  projectsLoading: false,
  projectsError: null,

  // Documents
  documents: [],
  currentDocument: null,
  documentsLoading: false,
  documentsError: null,

  // Comments
  comments: [],
  commentsLoading: false,
  commentsError: null,

  // Activities
  activities: [],
  activitiesLoading: false,
  activitiesError: null,

  // Real-time
  activeUsers: [],
  cursorPositions: {},
  isConnected: false,
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setSelectedTeam: (state, action) => {
      state.selectedTeam = action.payload;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    updateDocumentContent: (state, action) => {
      if (state.currentDocument && state.currentDocument._id === action.payload.documentId) {
        state.currentDocument.content = action.payload.content;
      }
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    updateCursorPosition: (state, action) => {
      const { userId, position } = action.payload;
      state.cursorPositions[userId] = position;
    },
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    addComment: (state, action) => {
      state.comments.unshift(action.payload);
    },
    updateComment: (state, action) => {
      const index = state.comments.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    clearCollaboration: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // Teams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.teamsLoading = true;
        state.teamsError = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teamsLoading = false;
        state.teams = action.payload.data;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.teamsLoading = false;
        state.teamsError = action.payload;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.unshift(action.payload);
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t._id !== action.payload);
      });

    // Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.projectsLoading = true;
        state.projectsError = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projectsLoading = false;
        state.projects = action.payload.data;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.projectsLoading = false;
        state.projectsError = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
      });

    // Documents
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documentsLoading = false;
        state.documents = action.payload.data;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(d => d._id !== action.payload);
      });

    // Comments
    builder
      .addCase(fetchComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
      });

    // Activities
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.activitiesLoading = true;
        state.activitiesError = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activitiesLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.activitiesError = action.payload;
      });
  },
});

export const {
  setSelectedTeam,
  setSelectedProject,
  setCurrentDocument,
  updateDocumentContent,
  setActiveUsers,
  updateCursorPosition,
  setSocketConnected,
  addComment,
  updateComment,
  clearCollaboration,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
