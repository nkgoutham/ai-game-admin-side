/**
 * App Context Provider for Ether Excel
 * Manages global state for the application
 */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppView, Chapter, ProcessingState, Question, Topic, UploadState, GameState, GameSession } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  view: AppView;
  setView: (view: AppView) => void;
  uploadState: UploadState;
  setUploadState: (state: UploadState) => void;
  processingState: ProcessingState;
  setProcessingState: (state: ProcessingState) => void;
  currentChapter: Chapter | null;
  setCurrentChapter: (chapter: Chapter | null) => void;
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
  questions: Record<string, Question[]>;
  setQuestions: (questions: Record<string, Question[]>) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  gameSession: GameSession | null;
  setGameSession: (session: GameSession | null) => void;
  resetState: () => void;
}

const defaultUploadState: UploadState = {
  status: 'initial',
  content: '',
  error: '',
};

const defaultProcessingState: ProcessingState = {
  status: 'idle',
  progress: 0,
  error: '',
};

const defaultGameState: GameState = {
  status: 'waiting',
  countdown: 3,
  currentTopic: null,
  currentQuestion: null,
  sessionId: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<AppView>('select');
  const [uploadState, setUploadState] = useState<UploadState>(defaultUploadState);
  const [processingState, setProcessingState] = useState<ProcessingState>(defaultProcessingState);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  // Set up real-time subscription for student status changes
  useEffect(() => {
    // Subscribe to all students table updates
    const subscription = supabase
      .channel('students_channel')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'students',
      }, (payload) => {
        console.log('Student status updated:', payload);
        
        // Handle student status changes here if needed
        if (payload.new.status === 'playing' && gameState.status === 'waiting') {
          setGameState({
            ...gameState,
            status: 'countdown',
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [gameState.status]);

  const resetState = () => {
    setView('select');
    setUploadState(defaultUploadState);
    setProcessingState(defaultProcessingState);
    setCurrentChapter(null);
    setTopics([]);
    setQuestions({});
    setGameState(defaultGameState);
    setGameSession(null);
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        uploadState,
        setUploadState,
        processingState,
        setProcessingState,
        currentChapter,
        setCurrentChapter,
        topics,
        setTopics,
        questions,
        setQuestions,
        gameState,
        setGameState,
        gameSession,
        setGameSession,
        resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};