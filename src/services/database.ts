/**
 * Database service for Supabase operations
 * Handles all interactions with the Supabase database
 */
import { supabase } from '../lib/supabase';
import { ExtractedTopic, GeneratedQuestion, TopicNarrative } from '../lib/openai';

/**
 * Save a chapter to the database
 */
export async function saveChapter(title: string, content: string, grade: string, pdfUrl?: string | null) {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        title,
        content,
        grade,
        pdf_url: pdfUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving chapter:', error);
    throw new Error('Failed to save chapter to database');
  }
}

/**
 * Save topics to the database
 */
export async function saveTopics(topics: ExtractedTopic[], narratives: TopicNarrative[], chapterId: string) {
  try {
    const topicsWithNarratives = topics.map((topic, index) => {
      const narrative = narratives.find(n => parseInt(n.topicId) === index)?.narrative || '';
      
      return {
        chapter_id: chapterId,
        topic_name: topic.title,
        topic_coverage: topic.description,
        topic_narrative: narrative
      };
    });
    
    const { data, error } = await supabase
      .from('topic_details')
      .insert(topicsWithNarratives)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving topics:', error);
    throw new Error('Failed to save topics to database');
  }
}

/**
 * Save questions to the database
 */
export async function saveQuestions(questions: GeneratedQuestion[], topicIdMap: Record<string, string>) {
  try {
    const formattedQuestions = questions.map(question => ({
      topic_id: topicIdMap[question.topicId],
      question_stem: question.stem,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      correct_option: question.correctOption
    }));
    
    const { data, error } = await supabase
      .from('questions')
      .insert(formattedQuestions)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving questions:', error);
    throw new Error('Failed to save questions to database');
  }
}

/**
 * Create a new game session
 */
export async function createGameSession(chapterId: string, teacherName: string = 'Anonymous') {
  try {
    // Generate a random game code
    const gameCode = generateGameCode();
    
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        chapter_id: chapterId,
        teacher_name: teacherName,
        status: 'not_started',
        game_code: gameCode
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating game session:', error);
    throw new Error('Failed to create game session');
  }
}

/**
 * Generate a random 6-character game code
 */
function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get chapter by ID
 */
export async function getChapterById(chapterId: string) {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting chapter:', error);
    throw new Error('Failed to get chapter from database');
  }
}

/**
 * Get topics by chapter ID
 */
export async function getTopicsByChapterId(chapterId: string) {
  try {
    const { data, error } = await supabase
      .from('topic_details')
      .select('*')
      .eq('chapter_id', chapterId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting topics:', error);
    throw new Error('Failed to get topics from database');
  }
}

/**
 * Get questions by topic ID
 */
export async function getQuestionsByTopicId(topicId: string) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting questions:', error);
    throw new Error('Failed to get questions from database');
  }
}

/**
 * Get students by session ID
 */
export async function getStudentsBySessionId(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('session_id', sessionId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting students:', error);
    throw new Error('Failed to get students from database');
  }
}

/**
 * Add a student to a game session
 */
export async function addStudentToSession(name: string, sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        name,
        session_id: sessionId,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw new Error('Failed to add student to game session');
  }
}

/**
 * Save a student's response to a question
 */
export async function saveStudentResponse(studentId: string, questionId: string, selectedOption: string, isCorrect: boolean) {
  try {
    const { data, error } = await supabase
      .from('responses')
      .insert({
        student_id: studentId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving response:', error);
    throw new Error('Failed to save student response');
  }
}

/**
 * Update game session status
 */
export async function updateGameSessionStatus(sessionId: string, status: 'not_started' | 'in_progress' | 'completed') {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .update({ status })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating game session:', error);
    throw new Error('Failed to update game session status');
  }
}

/**
 * Set current topic for game session
 */
export async function setCurrentTopic(sessionId: string, topicId: string) {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .update({ current_topic_id: topicId })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting current topic:', error);
    throw new Error('Failed to set current topic for game session');
  }
}

/**
 * Get active game sessions
 */
export async function getActiveGameSessions() {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('status', 'in_progress');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting active game sessions:', error);
    throw new Error('Failed to get active game sessions');
  }
}

/**
 * Get game session by code
 */
export async function getGameSessionByCode(gameCode: string) {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('game_code', gameCode)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting game session by code:', error);
    throw new Error('Failed to get game session');
  }
}

/**
 * Clear all content from the database (for testing purposes)
 */
export async function clearAllContent() {
  try {
    // Delete in order that respects foreign key constraints
    // Start with tables that reference others
    await supabase.from('responses').delete();
    await supabase.from('students').delete();
    await supabase.from('questions').delete();
    await supabase.from('game_sessions').delete();
    await supabase.from('topic_details').delete();
    await supabase.from('chapters').delete();
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing content:', error);
    throw new Error('Failed to clear database content');
  }
}