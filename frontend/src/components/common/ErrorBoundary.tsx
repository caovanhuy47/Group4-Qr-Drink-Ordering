import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full bg-surface-container-lowest border border-border rounded-2xl p-6 md:p-8 shadow-warm-md text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-error-container/40 text-error mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              {this.props.fallbackTitle || 'Đã xảy ra lỗi khi hiển thị giao diện'}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Hệ thống đã ghi nhận lỗi giao diện. Bạn có thể thử tải lại trang hoặc quay về sảnh chính.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-border/60 text-[11px] font-mono text-error/90 text-left overflow-x-auto max-h-24 no-scrollbar">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary-container text-on-primary hover:bg-primary-hover font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Tải lại</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
              >
                Về sảnh chính
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
