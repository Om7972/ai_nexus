import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import UserLogin from './pages/user-login';
import AIDataAnalysisWorkspace from './pages/ai-data-analysis-workspace';
import MainDashboard from './pages/main-dashboard';
import AIImageProcessingLab from './pages/ai-image-processing-lab';
import UserRegistration from './pages/user-registration';
import AITextGenerationStudio from './pages/ai-text-generation-studio';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AIDataAnalysisWorkspace />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/ai-data-analysis-workspace" element={<AIDataAnalysisWorkspace />} />
        <Route path="/main-dashboard" element={<MainDashboard />} />
        <Route path="/ai-image-processing-lab" element={<AIImageProcessingLab />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        <Route path="/ai-text-generation-studio" element={<AITextGenerationStudio />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
