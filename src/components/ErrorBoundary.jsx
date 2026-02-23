import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * ErrorBoundary – catches React render errors and displays a themed fallback.
 * Uses Vanilla / Rose Taupe design tokens via CSS classes.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    error.__ErrorBoundary = true;
    window.__COMPONENT_ERROR__?.(error, info);
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen subtle-gradient flex items-center justify-center p-6"
        role="alert"
        aria-live="assertive"
      >
        {/* Card */}
        <div className="card max-w-md w-full p-8 text-center space-y-6 elevation-3">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="empty-state-icon">
              <AlertTriangle size={36} aria-hidden="true" />
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground text-balance leading-relaxed">
              An unexpected error occurred while rendering this page.
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <span className="block mt-2 font-mono text-xs text-destructive/80 break-all">
                  {this.state.error.message}
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className={[
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md",
                "text-sm font-medium spring-animation focus-ring",
                "bg-primary text-primary-foreground hover:brightness-110 shadow-sm",
              ].join(' ')}
              aria-label="Try rendering again"
            >
              <RefreshCw size={15} aria-hidden="true" />
              Try again
            </button>
            <a
              href="/"
              className={[
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md",
                "text-sm font-medium spring-animation focus-ring",
                "border border-border hover:bg-accent",
              ].join(' ')}
              aria-label="Go to home page"
            >
              <Home size={15} aria-hidden="true" />
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;