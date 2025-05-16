/**
 * Main Layout component for Ether Excel
 */
import React, { ReactNode } from 'react';
import Header from './Header';
import StepIndicator from './StepIndicator';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <StepIndicator />
      <main className="flex-1 px-4 py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="py-4 px-6 bg-white border-t border-gray-200 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ether Excel • AI-Powered Classroom Game
      </footer>
    </div>
  );
};

export default Layout;