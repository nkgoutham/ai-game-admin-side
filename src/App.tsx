import React from 'react';
import Layout from './components/layout/Layout';
import ChapterUpload from './components/upload/ChapterUpload';
import AIProcessing from './components/processing/AIProcessing';
import ContentReview from './components/review/ContentReview';
import GameLaunch from './components/launch/GameLaunch';
import LoginPage from './components/auth/LoginPage';
import WaitingRoom from './components/player/WaitingRoom';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Main content component that conditionally renders the current view
const MainContent: React.FC = () => {
  const { view } = useAppContext();

  switch (view) {
    case 'upload':
      return <ChapterUpload />;
    case 'processing':
      return <AIProcessing />;
    case 'review':
      return <ContentReview />;
    case 'launch':
      return <GameLaunch />;
    default:
      return <ChapterUpload />;
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
  const { authState, isTeacher, isPlayer } = useAuth();

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

  // Player view - show waiting room
  if (isPlayer()) {
    return <WaitingRoom />;
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