import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        profile: {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@ainexus.com',
          role: 'admin',
          avatar: '',
          bio: 'AI Enthusiast & Developer',
          location: 'San Francisco, CA',
          website: 'https://ainexus.com',
          phone: '(555) 123-4567',
          occupation: 'Senior Developer',
          company: 'AI Nexus Inc.',
          skills: ['React', 'Node.js', 'AI/ML', 'Python'],
          interests: ['Robotics', 'Generative AI', 'Space Exploration']
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/Los_Angeles',
          emailNotifications: true,
          pushNotifications: true
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      // const { auth } = getState();
      // const response = await axios.put('/api/user/profile', profileData, {
      //   headers: { Authorization: `Bearer ${auth.token}` }
      // });
      await new Promise(r => setTimeout(r, 400));
      return Object.fromEntries(profileData instanceof FormData ? profileData.entries() : Object.entries(profileData));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'userProfile/updateUserPreferences',
  async (preferences, { rejectWithValue, getState }) => {
    try {
      // const { auth } = getState();
      // const response = await axios.put('/api/user/preferences', preferences, {
      //   headers: { Authorization: `Bearer ${auth.token}` }
      // });
      await new Promise(r => setTimeout(r, 400));
      return preferences;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'userProfile/uploadProfileImage',
  async (imageFile, { rejectWithValue, getState }) => {
    try {
      // const { auth } = getState();
      // const formData = new FormData();
      // formData.append('profileImage', imageFile);

      // const response = await axios.post('/api/user/profile-image', formData, {
      //   headers: {
      //     Authorization: `Bearer ${auth.token}`,
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      await new Promise(r => setTimeout(r, 600));
      return { avatar: URL.createObjectURL(imageFile) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

const initialState = {
  profile: {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    company: '',
    skills: [],
    interests: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      portfolio: ''
    }
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    privacySettings: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    },
    aiPreferences: {
      defaultModel: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      autoSave: true
    }
  },
  loading: false,
  error: null,
  lastUpdated: null
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTheme: (state, action) => {
      state.preferences.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.preferences.language = action.payload;
    },
    toggleNotification: (state, action) => {
      const { type } = action.payload;
      state.preferences[type] = !state.preferences[type];
    },
    updatePrivacySetting: (state, action) => {
      const { setting, value } = action.payload;
      state.preferences.privacySettings[setting] = value;
    },
    updateAIPreference: (state, action) => {
      const { setting, value } = action.payload;
      state.preferences.aiPreferences[setting] = value;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload.profile };
        state.preferences = { ...state.preferences, ...action.payload.preferences };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Profile Image
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.profile.avatar = action.payload.avatar;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setTheme,
  setLanguage,
  toggleNotification,
  updatePrivacySetting,
  updateAIPreference
} = userProfileSlice.actions;

export default userProfileSlice.reducer; 