import React from 'react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading your data. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  className = ""
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Error Icon */}
      <div className="mb-6 flex justify-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 dark:text-red-400" />
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h3>
      
      {/* Message */}
      <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
        {message}
      </p>
      
      {/* Retry Button */}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

// Exclamation Triangle Icon
const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
    />
  </svg>
);