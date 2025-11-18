import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center h-screen bg-red-50 text-red-800 p-4 font-sans">
          <div className="text-center max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-2">Something went wrong.</h1>
            <p className="mb-6 text-lg">An unexpected error occurred inside the application. Please try refreshing the page.</p>
            <details className="p-4 bg-red-100 rounded-lg text-left text-sm border border-red-200">
              <summary className="cursor-pointer font-semibold text-red-900">
                Click to see error details
              </summary>
              <pre className="mt-4 whitespace-pre-wrap break-all bg-white p-3 rounded text-red-700">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
