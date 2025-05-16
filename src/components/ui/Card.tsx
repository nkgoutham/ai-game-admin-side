/**
 * Card component for Ether Excel
 */
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm p-6 
        ${hoverable ? 'transition-all duration-200 hover:shadow-md' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return <h3 className={`text-xl font-semibold text-[#1F2937] ${className}`}>{children}</h3>;
};

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => {
  return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>;
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>{children}</div>;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };