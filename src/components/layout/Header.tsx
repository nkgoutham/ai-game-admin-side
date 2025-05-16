/**
 * Header component for Ether Excel
 */
import React, { useState } from 'react';
import { BookOpen, Trash2, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { clearAllContent } from '../../services/database';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { currentChapter, resetState } = useAppContext();
  const [isClearing, setIsClearing] = useState(false);
  const { signOut } = useAuth();

  const handleClearContent = async () => {
    if (window.confirm('Are you sure you want to clear ALL content from the database? This action cannot be undone.')) {
      try {
        setIsClearing(true);
        await clearAllContent();
        resetState();
        alert('All content has been cleared from the database.');
      } catch (error) {
        console.error('Error clearing content:', error);
        alert('Failed to clear content. Please try again.');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-8 h-8 text-[#3A7AFE]" />
          <div>
            <h1 className="text-xl font-bold text-[#1F2937]">Ether Excel</h1>
            <p className="text-sm text-gray-500">AI-Powered Classroom Game</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentChapter && (
            <div className="hidden md:block">
              <div className="rounded-full bg-[#EEF4FF] px-4 py-1.5">
                <span className="text-sm font-medium text-[#3A7AFE]">
                  Chapter: {currentChapter.title || 'Untitled'}
                </span>
              </div>
            </div>
          )}
          
          {/* Sign Out Button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
          
          {/* Clear Content Button (for testing only) */}
          <Button 
            variant="outline" 
            size="sm"
            isLoading={isClearing}
            onClick={handleClearContent}
            icon={<Trash2 className="w-4 h-4" />}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Clear Content
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;