import React from 'react';
import Layout from './components/layout/Layout';
import ChapterUpload from './components/upload/ChapterUpload';
import AIProcessing from './components/processing/AIProcessing';
import ContentReview from './components/review/ContentReview';
import GameLaunch from './components/launch/GameLaunch';
import { AppProvider, useAppContext } from './context/AppContext';

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

// App component with context provider
function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
        <Layout>
          <MainContent />
        </Layout>
      </div>
    </AppProvider>
  );
}

export default App;