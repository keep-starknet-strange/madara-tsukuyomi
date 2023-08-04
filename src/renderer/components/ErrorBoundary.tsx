import React from 'react';
import { toast, ToastOptions } from 'react-toastify';

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

  componentDidCatch(error: Error, errorInfo: any): void {
    // console.log(error, errorInfo, 'error');
  }

  render(): React.ReactNode {
    const { children } = this.props;
    const { error } = this.state;
    if (error) {
      const TOAST_STYLE: ToastOptions = {
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        theme: 'dark',
      };
      toast('Something went wrong', { ...TOAST_STYLE });
    }

    return children;
  }
}

export default ErrorBoundary;
