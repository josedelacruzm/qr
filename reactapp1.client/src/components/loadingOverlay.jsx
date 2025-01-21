import React from 'react';

const LoadingOverlay = ({
    isLoading,
    children,
    spinnerVariant = "primary",
    overlayColor = "rgba(255, 255, 255, 0.8)",
    spinnerSize = "3rem",
    message = "Cargando..."
}) => {
    if (!isLoading) return children;

    return (
        <div style={{ position: 'relative' }}>
            {children && <div style={{ opacity: '0.5' }}>{children}</div>}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: overlayColor,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1050
                }}
            >
                <div className="text-center">
                    <div
                        className={`spinner-border text-${spinnerVariant}`}
                        style={{ width: spinnerSize, height: spinnerSize }}
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    {message && (
                        <div className="mt-2">
                            <span className="fw-medium">{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;