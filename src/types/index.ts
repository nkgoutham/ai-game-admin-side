/**
 * Type definitions for the Ether Excel application
 */

// Game session related types
export interface Chapter {
  id: string;
  title: string;
  content: string;
  grade: string;
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  file?: File;
}

export interface Topic {
  id: string;
  chapter_id: string;
  topic_name: string;
  topic_coverage: string;
  topic_narrative: string;
  created_at?: string;
}

export interface Question {
  id: string;
  topic_id: string;
  question_stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  created_at?: string;
}

// UI state types
export interface UploadState {
  status: 'initial' | 'uploading' | 'preview_ready' | 'confirmed';
  file?: File;
  content?: string;
  error?: string;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'ready' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export type AppView = 'select' | 'upload' | 'processing' | 'review' | 'launch' | 'lobby';

// Auth and user types
export interface UserProfile {
  id: string;
  role: 'teacher'; // Removed 'player' option
  display_name: string;
  created_at?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

// Game session type
export interface GameSession {
  id: string;
  chapter_id: string | null;
  teacher_name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  game_code: string;
  started_at: string;
  ended_at?: string | null;
  created_at?: string;
  banned_students?: string[];
}

// Game state types
export interface GameState {
  status: 'waiting' | 'countdown' | 'playing' | 'results';
  countdown: number;
  currentTopic: Topic | null;
  currentQuestion: Question | null;
  sessionId: string | null;
}