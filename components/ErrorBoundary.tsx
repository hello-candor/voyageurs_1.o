
import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    name?: string;
    compact?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * React Error Boundary — prevents the entire app from crashing to a blank screen.
 * 
 * Two modes:
 * - Full page (default): Styled recovery screen matching the app's design. Used at root.
 * - Compact (compact=true): Small inline error card. Used around Suspense blocks.
 */
class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
        this.handleReload = this.handleReload.bind(this);
        this.handleClearAndReload = this.handleClearAndReload.bind(this);
        this.handleRetry = this.handleRetry.bind(this);
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        console.error(
            `[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`,
            error,
            errorInfo
        );
    }

    handleReload() {
        window.location.reload();
    }

    handleClearAndReload() {
        try {
            const theme = localStorage.getItem('theme');
            sessionStorage.clear();
            localStorage.clear();
            if (theme) localStorage.setItem('theme', theme);
        } catch (_e) {
            // Ignore storage errors
        }
        window.location.reload();
    }

    handleRetry() {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        if (this.props.compact) {
            return (
                <div style={{
                    padding: '24px',
                    margin: '16px',
                    borderRadius: '16px',
                    background: 'rgba(214, 114, 82, 0.06)',
                    border: '1px solid rgba(214, 114, 82, 0.2)',
                    textAlign: 'center' as const,
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                }}>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#8B4513',
                        marginBottom: '8px',
                    }}>
                        {this.props.name
                            ? `Something went wrong loading ${this.props.name}.`
                            : 'Something went wrong loading this section.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: '8px 20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            color: '#fff',
                            background: '#D67252',
                            border: 'none',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return (
            <div style={{
                position: 'fixed' as const,
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(160deg, #0e1c2a 0%, #1a2d45 50%, #0e1c2a 100%)',
                fontFamily: "'Montserrat', system-ui, sans-serif",
                padding: '24px',
                overflow: 'hidden' as const,
            }}>
                {/* Ambient glow */}
                <div style={{
                    position: 'absolute' as const,
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    opacity: 0.15,
                    filter: 'blur(120px)',
                    background: 'radial-gradient(circle, #C07D5E 0%, transparent 70%)',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none' as const,
                }} />

                {/* Logo */}
                <div style={{ marginBottom: '24px' }}>
                    <img
                        src="/assets/voyageurs-icon.png"
                        alt="Voyageurs"
                        style={{ width: '64px', height: '64px', objectFit: 'contain' as const, opacity: 0.9 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                </div>

                {/* Title */}
                <h1 style={{
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 300,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    marginBottom: '16px',
                    opacity: 0.9,
                }}>
                    Voyageurs
                </h1>

                {/* Error message */}
                <div style={{
                    maxWidth: '420px',
                    textAlign: 'center' as const,
                    marginBottom: '32px',
                }}>
                    <p style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '15px',
                        fontWeight: 400,
                        lineHeight: 1.6,
                        marginBottom: '8px',
                    }}>
                        Something unexpected happened.
                    </p>
                    <p style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: 1.5,
                    }}>
                        Don&apos;t worry — your data is safe. Try reloading, or clear cached data if the issue persists.
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
                    <button
                        onClick={this.handleClearAndReload}
                        style={{
                            padding: '12px 32px',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #D67252, #C07D5E)',
                            border: 'none',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(214, 114, 82, 0.3)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                    >
                        Reset RSVP
                    </button>
                    <button
                        onClick={this.handleClearAndReload}
                        style={{
                            padding: '12px 32px',
                            fontSize: '13px',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            color: 'rgba(255,255,255,0.6)',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(8px)',
                            transition: 'background 0.2s, color 0.2s',
                        }}
                    >
                        Clear Data &amp; Reload
                    </button>
                </div>

                {/* Debug info (collapsed) */}
                {this.state.error && (
                    <details style={{
                        marginTop: '32px',
                        maxWidth: '480px',
                        width: '100%',
                    }}>
                        <summary style={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'center' as const,
                            letterSpacing: '0.1em',
                            fontWeight: 500,
                        }}>
                            TECHNICAL DETAILS
                        </summary>
                        <pre style={{
                            marginTop: '12px',
                            padding: '16px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '12px',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '11px',
                            lineHeight: 1.5,
                            overflow: 'auto' as const,
                            maxHeight: '200px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            whiteSpace: 'pre-wrap' as const,
                            wordBreak: 'break-word' as const,
                        }}>
                            {this.state.error.toString()}
                            {this.state.errorInfo?.componentStack
                                ? `\n\nComponent Stack:${this.state.errorInfo.componentStack}`
                                : ''}
                        </pre>
                    </details>
                )}
            </div>
        );
    }
}

export { ErrorBoundaryClass as ErrorBoundary };
