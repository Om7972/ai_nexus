import React from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import Button from "./ui/Button";

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
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden"
        role="alert"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="card max-w-lg w-full p-10 text-center space-y-6 bg-card border border-border shadow-2xl rounded-2xl relative z-10">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center ring-4 ring-destructive/5">
              <AlertOctagon className="w-10 h-10 text-destructive drop-shadow-sm" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              A System Error Occurred
            </h1>
            <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed text-balance">
              An unexpected process failure caused this module to crash. We've logged the error and are investigating.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50 overflow-x-auto text-left">
                <code className="text-[11px] font-mono text-destructive/80 break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[140px]"
              icon={<RefreshCw className="w-4 h-4 mr-2" />}
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.assign('/main-dashboard')}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[140px]"
              icon={<Home className="w-4 h-4 mr-2" />}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;