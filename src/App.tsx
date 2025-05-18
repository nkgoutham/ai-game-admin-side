/**
 * Main App component for Ether Excel
 * Handles routing and layout management
 */
import React from 'react';
import Layout from './components/layout/Layout';
import ChapterSelection from './components/selection/ChapterSelection';
import ChapterUpload from './components/upload/ChapterUpload';
import AIProcessing from './components/processing/AIProcessing';
import ContentReview from './components/review/ContentReview';
import GameLaunch from './components/launch/GameLaunch';
import LobbyView from './components/teacher/LobbyView';
import LoginPage from './components/auth/LoginPage';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Main content component that conditionally renders the current view
const MainContent: React.FC = () => {
  const { view } = useAppContext();

  switch (view) {
    case 'select':
      return <ChapterSelection />;
    case 'upload':
      return <ChapterUpload />;
    case 'processing':
      return <AIProcessing />;
    case 'review':
      return <ContentReview />;
    case 'launch':
      return <GameLaunch />;
    case 'lobby':
      return <LobbyView />;
    default:
      return <ChapterSelection />;
  }
};

// App component with context providers
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

// Component to handle routing based on authentication state
const AppContent: React.FC = () => {
  const { authState, isTeacher } = useAuth();

  // If not authenticated, show login page
  if (!authState.user) {
    return <LoginPage />;
  }

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#3A7AFE] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Teacher view - show the original layout with proper content
  if (isTeacher()) {
    return (
      <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
        <Layout>
          <MainContent />
        </Layout>
      </div>
    );
  }

  // Fallback - should never reach here with proper roles
  return <LoginPage />;
};

export default App;