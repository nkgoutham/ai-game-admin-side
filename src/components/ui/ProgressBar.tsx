/**
 * Progress Bar component for Ether Excel
 */
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
  animate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  showLabel = false,
  size = 'md',
  variant = 'default',
  animate = true,
}) => {
  // Ensure value is between 0 and 100
  const progress = Math.min(Math.max(value, 0), 100);
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const variantStyles = {
    default: 'bg-[#3A7AFE]',
    success: 'bg-green-500',
    warning: 'bg-[#FFC857]',
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`
            ${sizeStyles[size]} 
            ${variantStyles[variant]} 
            rounded-full 
            ${animate ? 'transition-all duration-300 ease-in-out' : ''}
          `}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;