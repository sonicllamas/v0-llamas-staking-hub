// Spinner component for loading states

import React from 'react';

interface SpinnerProps {
  size?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "h-5 w-5", className = "" }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-white ${size} ${className}`} />
);