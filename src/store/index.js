import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userProfileReducer from './slices/userProfileSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import searchReducer from './slices/searchSlice';
import textStudioReducer from './slices/textStudioSlice';
import imageLabReducer from './slices/imageLabSlice';
import analyticsReducer from './slices/analyticsSlice';
import workflowReducer from './slices/workflowSlice';
import knowledgeReducer from './slices/knowledgeSlice';
import collaborationReducer from './slices/collaborationSlice';

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
    workflow: workflowReducer,
    knowledge: knowledgeReducer,
    collaboration: collaborationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

