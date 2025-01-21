import React from 'react';

const Alert = ({ children, className = '' }) => (
    <div className={`alert alert-primary ${className}`} role="alert">
        {children}
    </div>
);

const AlertTitle = ({ children }) => (
    <h4 className="alert-heading">{children}</h4>
);

const AlertDescription = ({ children }) => (
    <p className="mb-0">{children}</p>
);

export { Alert, AlertTitle, AlertDescription };