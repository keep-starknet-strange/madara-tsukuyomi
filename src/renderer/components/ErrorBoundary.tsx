import React from 'react';
import { toast } from 'react-toastify';
import defaultToastStyleOptions from 'shared/constants';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: boolean | Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: false };
  }

  static getDerivedStateFromError(error: Error): object {
    return { error };
  }

  // componentDidCatch(error: Error, errorInfo: any): void {
  //   // add our error logging service here
  //   // errorLoggingService(error,errorInfo)
  // }

  render(): React.ReactNode {
    const { children } = this.props;
    const { error } = this.state;
    if (error) {
      toast('Something went wrong', defaultToastStyleOptions);
    }

    return children;
  }
}

export default ErrorBoundary;
