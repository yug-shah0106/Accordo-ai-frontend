/**
 * NewDealPageWrapper - Error boundary wrapper for NewDealPage
 * This wraps NewDealPage to catch and display any errors
 */
import React, { Component, ErrorInfo, Suspense } from 'react';

// Error boundary class component
class NewDealErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NewDealPageWrapper] Error caught:', error);
    console.error('[NewDealPageWrapper] Error info:', errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-full bg-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-800 mb-4">
                Error Loading NewDealPage
              </h1>
              <p className="text-red-700 mb-4">
                There was an error loading the Create New Deal page. This is likely a JavaScript error in the component.
              </p>
              <div className="bg-red-100 rounded p-4 mb-4 overflow-auto">
                <pre className="text-sm text-red-900 whitespace-pre-wrap">
                  {this.state.error?.message || 'Unknown error'}
                </pre>
                {this.state.error?.stack && (
                  <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Lazy load the actual NewDealPage
const LazyNewDealPage = React.lazy(() => import('./NewDealPage'));

// Main wrapper component
export default function NewDealPageWrapper() {
  console.log('[NewDealPageWrapper] Rendering wrapper');

  return (
    <NewDealErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LazyNewDealPage />
      </Suspense>
    </NewDealErrorBoundary>
  );
}
