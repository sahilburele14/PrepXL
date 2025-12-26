// WebSite/src/components/common/ErrorDisplay.jsx
// Reusable error display component

import React from 'react';
import { AlertCircle, XCircle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorDisplay = ({
  error,
  onRetry = null,
  onDismiss = null,
  variant = 'default', // 'default', 'inline', 'toast'
  title = 'Something went wrong',
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'An unexpected error occurred';

  const defaultContent = (
    <>
      <div className="flex items-start space-x-3">
        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{errorMessage}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center space-x-2 text-[#4b4bff] hover:text-[#3b3bef] font-medium text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </>
  );

  const inlineContent = (
    <div className="flex items-center space-x-2 text-red-600">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{errorMessage}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 text-[#4b4bff] hover:underline text-sm font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );

  if (variant === 'inline') {
    return <div className="py-2">{inlineContent}</div>;
  }

  if (variant === 'toast') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-red-500 p-4">
            {defaultContent}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // default variant
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      {defaultContent}
    </div>
  );
};

// specific error types
export const NetworkError = ({ onRetry }) => (
  <ErrorDisplay
    title="Connection Problem"
    error="Unable to connect to the server. Please check your internet connection."
    onRetry={onRetry}
  />
);

export const NotFoundError = () => (
  <ErrorDisplay
    title="Not Found"
    error="The requested resource could not be found."
    variant="default"
  />
);

export const UnauthorizedError = () => (
  <ErrorDisplay
    title="Authentication Required"
    error="You need to be logged in to access this content."
    variant="default"
  />
);

export default ErrorDisplay;