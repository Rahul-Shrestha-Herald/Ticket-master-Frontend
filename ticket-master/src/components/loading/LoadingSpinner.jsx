import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
    // Size classes based on provided size prop
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const spinnerSize = sizeClasses[size] || sizeClasses.medium;

    return (
        <div className="flex justify-center items-center">
            <div className={`${spinnerSize} border-4 border-neutral-200 border-t-primary rounded-full animate-spin`}></div>
        </div>
    );
};

export default LoadingSpinner; 