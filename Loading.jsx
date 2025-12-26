// WebSite/src/components/common/Loading.jsx
// Reusable loading component with different variants

import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ 
  size = 'md', 
  variant = 'spinner', 
  text = null,
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  const renderSpinner = () => (
    <div className={`${spinnerSize} border-4 border-gray-200 border-t-[#4b4bff] rounded-full animate-spin`} />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-[#4b4bff] rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`${spinnerSize} bg-[#4b4bff] rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && (
        <p className="text-gray-600 text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// specific loading states for common use cases
export const PageLoading = () => (
  <Loading 
    size="lg" 
    variant="spinner" 
    text="Loading..." 
    fullScreen 
  />
);

export const ButtonLoading = () => (
  <Loading size="sm" variant="spinner" />
);

export const ContentLoading = ({ message = "Loading content..." }) => (
  <div className="flex items-center justify-center py-12">
    <Loading size="lg" variant="dots" text={message} />
  </div>
);

export default Loading;