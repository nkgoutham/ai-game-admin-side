/**
 * App Context Provider for Ether Excel
 * Manages global state for the application
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppView, Chapter, ProcessingState, Question, Topic, UploadState } from '../types';

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<AppView>('upload');
  const [uploadState, setUploadState] = useState<UploadState>(defaultUploadState);
  const [processingState, setProcessingState] = useState<ProcessingState>(defaultProcessingState);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});

  const resetState = () => {
    setView('upload');
    setUploadState(defaultUploadState);
    setProcessingState(defaultProcessingState);
    setCurrentChapter(null);
    setTopics([]);
    setQuestions({});
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