import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateNotificationSettings',
  async (settings, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put('/api/notifications/settings', settings, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    email: {
      enabled: true,
      types: {
        projectUpdates: true,
        systemAlerts: true,
        billingReminders: true,
        newFeatures: false,
        marketing: false
      }
    },
    push: {
      enabled: true,
      types: {
        projectUpdates: true,
        systemAlerts: true,
        billingReminders: false,
        newFeatures: false,
        marketing: false
      }
    },
    inApp: {
      enabled: true,
      types: {
        projectUpdates: true,
        systemAlerts: true,
        billingReminders: true,
        newFeatures: true,
        marketing: false
      }
    }
  },
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    toggleNotificationType: (state, action) => {
      const { channel, type } = action.payload;
      state.settings[channel].types[type] = !state.settings[channel].types[type];
    },
    toggleNotificationChannel: (state, action) => {
      const { channel } = action.payload;
      state.settings[channel].enabled = !state.settings[channel].enabled;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.settings = action.payload.settings;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      })
      // Update Settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const { 
  clearError, 
  addNotification, 
  removeNotification, 
  markAsRead, 
  markAllAsRead,
  updateUnreadCount,
  toggleNotificationType,
  toggleNotificationChannel
} = notificationSlice.actions;

export default notificationSlice.reducer; 