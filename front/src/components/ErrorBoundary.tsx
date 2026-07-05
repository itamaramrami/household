import React from "react";


class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error: Error) {
      return { hasError: true };
    }
  
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.log('Error:', error);
      console.log('Error Info:', errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return <div>שגיאה בטעינת הדף</div>;
      }
      return this.props.children;
    }
  }
  
  export default ErrorBoundary