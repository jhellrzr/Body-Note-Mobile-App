import { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ThreeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    console.log('ThreeJS Error caught:', error);
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThreeJS Error:', error);
    console.error('Error Info:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-2 border-red-500 rounded-lg">
          <h3 className="text-red-500 font-bold">3D Viewer Error</h3>
          <p className="text-sm mt-2">Error: {this.state.error?.message}</p>
          <p className="text-sm mt-2">Stack: {this.state.error?.stack}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}