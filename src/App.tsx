import React, { useEffect, useState } from 'react';
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
  const { authState, isTeacher, isPlayer } = useAuth();
  const [gameCode, setGameCode] = useState<string | null>(null);

  // Get game code from local storage for player
  useEffect(() => {
    // Check if user is a player and has joined a game
    if (isPlayer()) {
      const studentData = localStorage.getItem('student');
      if (studentData) {
        try {
          const student = JSON.parse(studentData);
          if (student.session_id) {
            // Fetch game code from session id
            // For demonstration, we'll just use a dummy code
            setGameCode('ABCDEF');
          }
        } catch (e) {
          console.error('Error parsing student data:', e);
        }
      }
    }
  }, [isPlayer]);

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#3A7AFE] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!authState.user) {
    return <LoginPage />;
  }

  // Player view
  if (isPlayer()) {
    // If player has joined a game, show the waiting room
    if (gameCode) {
      return <WaitingRoom gameCode={gameCode} />;
    }
    
    // Otherwise, show the login page
    return <LoginPage />;
  }

  // Teacher view - show appropriate view based on app state
  if (isTeacher()) {
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
  }

  // Fallback
  return <LoginPage />;
};

// App component with context providers
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
          <MainContent />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;