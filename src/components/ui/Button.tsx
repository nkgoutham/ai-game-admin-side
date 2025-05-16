/**
 * Button component for Ether Excel
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    primary: 'bg-[#3A7AFE] text-white hover:bg-[#2563EB] focus-visible:ring-[#3A7AFE]',
    secondary: 'bg-[#EEF4FF] text-[#1F2937] hover:bg-[#DBEAFE] focus-visible:ring-[#EEF4FF]',
    outline: 'border border-[#D1D5DB] bg-transparent hover:bg-[#F9FAFB] text-[#1F2937] focus-visible:ring-[#D1D5DB]',
    ghost: 'bg-transparent hover:bg-[#F9FAFB] text-[#1F2937] focus-visible:ring-[#F9FAFB]',
    link: 'bg-transparent underline-offset-4 hover:underline text-[#3A7AFE] focus-visible:ring-[#3A7AFE]',
  };
  
  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;