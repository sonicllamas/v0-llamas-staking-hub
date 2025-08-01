import React from 'react';

export const Spinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => (
    <div className={`animate-spin rounded-full border-b-2 border-white ${size}`}></div>
);
