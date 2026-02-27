import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import UserLogin from "./pages/user-login";
import AIDataAnalysisWorkspace from './pages/ai-data-analysis-workspace';
import MainDashboard from './pages/main-dashboard';
import AIImageProcessingLab from './pages/ai-image-processing-lab';
import UserRegistration from './pages/user-registration';
import AITextGenerationStudio from './pages/ai-text-generation-studio';

// New Individual Account/Settings Pages
import UserProfile from './pages/user-profile';
import UserSettings from './pages/user-settings';
import SubscriptionManagement from './pages/subscription-management';
import Billing from './pages/billing';
import SecuritySettings from './pages/security-settings';
import HelpSupport from './pages/help-support';
import NotificationsPage from './pages/notifications';

import AuthGuard from './components/AuthGuard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/" element={
            <AuthGuard requireAuth={false}>
              <AIDataAnalysisWorkspace />
            </AuthGuard>
          } />
          <Route path="/user-login" element={
            <AuthGuard requireAuth={false}>
              <UserLogin />
            </AuthGuard>
          } />
          <Route path="/user-registration" element={
            <AuthGuard requireAuth={false}>
              <UserRegistration />
            </AuthGuard>
          } />

          {/* Protected routes */}
          <Route path="/main-dashboard" element={
            <AuthGuard requireAuth={true}>
              <MainDashboard />
            </AuthGuard>
          } />
          <Route path="/ai-data-analysis-workspace" element={
            <AuthGuard requireAuth={true}>
              <AIDataAnalysisWorkspace />
            </AuthGuard>
          } />
          <Route path="/ai-image-processing-lab" element={
            <AuthGuard requireAuth={true}>
              <AIImageProcessingLab />
            </AuthGuard>
          } />
          <Route path="/ai-text-generation-studio" element={
            <AuthGuard requireAuth={true}>
              <AITextGenerationStudio />
            </AuthGuard>
          } />
          <Route path="/user-profile" element={
            <AuthGuard requireAuth={true}>
              <UserProfile />
            </AuthGuard>
          } />
          <Route path="/user-settings" element={
            <AuthGuard requireAuth={true}>
              <UserSettings />
            </AuthGuard>
          } />
          <Route path="/subscription-management" element={
            <AuthGuard requireAuth={true}>
              <SubscriptionManagement />
            </AuthGuard>
          } />
          <Route path="/billing" element={
            <AuthGuard requireAuth={true}>
              <Billing />
            </AuthGuard>
          } />
          <Route path="/security-settings" element={
            <AuthGuard requireAuth={true}>
              <SecuritySettings />
            </AuthGuard>
          } />
          <Route path="/help-support" element={
            <AuthGuard requireAuth={true}>
              <HelpSupport />
            </AuthGuard>
          } />
          <Route path="/notifications" element={
            <AuthGuard requireAuth={true}>
              <NotificationsPage />
            </AuthGuard>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
