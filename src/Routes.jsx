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
import UserProfileSettings from './pages/user-profile-settings';
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
          <Route path="/user-profile-settings" element={
            <AuthGuard requireAuth={true}>
              <UserProfileSettings />
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
