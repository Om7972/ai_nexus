import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userProfileReducer from './slices/userProfileSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import searchReducer from './slices/searchSlice';
import textStudioReducer from './slices/textStudioSlice';
import imageLabReducer from './slices/imageLabSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userProfile: userProfileReducer,
    subscription: subscriptionReducer,
    notifications: notificationReducer,
    search: searchReducer,
    textStudio: textStudioReducer,
    imageLab: imageLabReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

