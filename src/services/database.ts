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
    console.log(`Saving chapter: ${title}, Grade: ${grade}`);
    
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
    
    if (error) {
      console.error('Database error saving chapter:', error);
      throw error;
    }
    
    console.log(`Successfully saved chapter with ID: ${data.id}`);
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
    console.log(`Saving ${topics.length} topics for chapter ${chapterId}`);
    
    const topicsWithNarratives = topics.map((topic, index) => {
      const narrative = narratives.find(n => parseInt(n.topicId) === index)?.narrative || '';
      
      return {
        chapter_id: chapterId,
        topic_name: topic.title,
        topic_coverage: topic.description,
        topic_narrative: narrative
      };
    });
    
    console.log('Prepared topics with narratives:', topicsWithNarratives);
    
    const { data, error } = await supabase
      .from('topic_details')
      .insert(topicsWithNarratives)
      .select();
    
    if (error) {
      console.error('Database error saving topics:', error);
      throw error;
    }
    
    console.log(`Successfully saved ${data.length} topics to database`);
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
    console.log(`Saving ${questions.length} questions with topic ID mapping:`, topicIdMap);
    
    // First, validate that all questions have a matching topic ID
    const validQuestions = questions.filter(q => topicIdMap[q.topicId]);
    
    if (validQuestions.length < questions.length) {
      console.warn(`Filtered out ${questions.length - validQuestions.length} questions with invalid topic IDs`);
    }
    
    const formattedQuestions = validQuestions.map(question => ({
      topic_id: topicIdMap[question.topicId],
      question_stem: question.stem,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      correct_option: question.correctOption
    }));
    
    console.log('Formatted questions for database:', formattedQuestions.length);
    
    // Save in batches if there are many questions
    if (formattedQuestions.length > 50) {
      console.log('Large number of questions detected, saving in batches');
      // Split into batches of 20
      const batches = [];
      for (let i = 0; i < formattedQuestions.length; i += 20) {
        batches.push(formattedQuestions.slice(i, i + 20));
      }
      
      let allData = [];
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Saving batch ${i+1} of ${batches.length} (${batch.length} questions)`);
        
        const { data, error } = await supabase
          .from('questions')
          .insert(batch)
          .select();
        
        if (error) {
          console.error(`Error saving batch ${i+1}:`, error);
          throw error;
        }
        
        allData = [...allData, ...data];
        console.log(`Batch ${i+1} saved successfully`);
      }
      
      console.log(`All ${allData.length} questions saved successfully`);
      return allData;
    } else {
      // Save all at once for smaller sets
      const { data, error } = await supabase
        .from('questions')
        .insert(formattedQuestions)
        .select();
      
      if (error) {
        console.error('Database error saving questions:', error);
        throw error;
      }
      
      console.log(`Successfully saved ${data.length} questions to database`);
      return data;
    }
  } catch (error) {
    console.error('Error saving questions:', error);
    throw new Error('Failed to save questions to database');
  }
}

/**
 * Get or create a default game session
 */
export async function getOrCreateDefaultGameSession(chapterId?: string, teacherName?: string) {
  try {
    console.log('Getting or creating default game session');
    
    // Check if an active session exists
    const { data: existingSessions, error: fetchError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('status', 'not_started')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching existing sessions:', fetchError);
      throw fetchError;
    }
    
    // If a session exists, return it
    if (existingSessions && existingSessions.length > 0) {
      console.log('Found existing game session:', existingSessions[0]);
      return existingSessions[0];
    }
    
    // Generate a random 6-character game code
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create a new session
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        chapter_id: chapterId,
        teacher_name: teacherName || 'Anonymous Teacher',
        status: 'not_started',
        game_code: gameCode,
        started_at: new Date().toISOString(),
        banned_students: []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating game session:', error);
      throw error;
    }
    
    console.log('Created new game session:', data);
    return data;
  } catch (error) {
    console.error('Error in getOrCreateDefaultGameSession:', error);
    throw new Error('Failed to get or create game session');
  }
}

/**
 * Update game session status
 */
export async function updateGameSessionStatus(sessionId: string, status: 'not_started' | 'in_progress' | 'completed') {
  try {
    console.log(`Updating game session ${sessionId} status to ${status}`);
    
    const { data, error } = await supabase
      .from('game_sessions')
      .update({ status })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating game session status:', error);
      throw error;
    }
    
    console.log('Game session status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating game session status:', error);
    throw new Error('Failed to update game session status');
  }
}

/**
 * Get all chapters from the database
 */
export async function getAllChapters() {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all chapters:', error);
    throw new Error('Failed to get chapters from database');
  }
}

/**
 * Get unique grades from chapters
 */
export async function getUniqueGrades() {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('grade');
    
    if (error) throw error;
    
    // Extract unique grades
    const grades = [...new Set(data.map(item => item.grade))];
    
    // Sort grades properly (K, 1, 2, ..., 12)
    grades.sort((a, b) => {
      if (a === 'K') return -1;
      if (b === 'K') return 1;
      return parseInt(a) - parseInt(b);
    });
    
    return grades;
  } catch (error) {
    console.error('Error getting unique grades:', error);
    throw new Error('Failed to get grades from database');
  }
}

/**
 * Get chapters by grade
 */
export async function getChaptersByGrade(grade: string) {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('grade', grade)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting chapters by grade:', error);
    throw new Error('Failed to get chapters by grade from database');
  }
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
 * Get all students in the system
 */
export async function getAllStudents() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('joined_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all students:', error);
    throw new Error('Failed to get students from database');
  }
}

/**
 * Add a student to the game
 */
export async function addStudentToSession(name: string) {
  try {
    const studentObj = {
      name,
      joined_at: new Date().toISOString(),
      status: 'waiting'
    };
    
    const { data, error } = await supabase
      .from('students')
      .insert(studentObj)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw new Error('Failed to add student to the game');
  }
}

/**
 * Update student status
 */
export async function updateStudentStatus(studentId: string, status: 'waiting' | 'playing' | 'completed') {
  try {
    const { data, error } = await supabase
      .from('students')
      .update({ status })
      .eq('id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating student status:', error);
    throw new Error('Failed to update student status');
  }
}

/**
 * Remove a student from the game
 */
export async function removeStudent(studentId: string) {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing student:', error);
    throw new Error('Failed to remove student from the game');
  }
}

/**
 * Ban a student from the current game session
 */
export async function banStudentFromSession(sessionId: string, studentId: string) {
  try {
    // First get current banned list
    const { data: session, error: fetchError } = await supabase
      .from('game_sessions')
      .select('banned_students')
      .eq('id', sessionId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Update banned students array
    const bannedStudents = session.banned_students || [];
    if (!bannedStudents.includes(studentId)) {
      bannedStudents.push(studentId);
    }
    
    // Update the session
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({ banned_students: bannedStudents })
      .eq('id', sessionId);
    
    if (updateError) throw updateError;
    
    // Now remove the student
    await removeStudent(studentId);
    
    return { success: true };
  } catch (error) {
    console.error('Error banning student from session:', error);
    throw new Error('Failed to ban student from game session');
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
 * Get student responses
 */
export async function getStudentResponses(studentId: string) {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('*, questions(*)')
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting student responses:', error);
    throw new Error('Failed to get student responses');
  }
}

/**
 * Clear all content from the database (for testing purposes)
 */
export async function clearAllContent() {
  try {
    console.log('Clearing all content from database');
    
    // Delete in order that respects foreign key constraints
    // Start with tables that reference others
    console.log('Deleting responses...');
    const { error: respError } = await supabase.from('responses').delete();
    if (respError) console.error('Error deleting responses:', respError);
    
    console.log('Deleting students...');
    const { error: studError } = await supabase.from('students').delete();
    if (studError) console.error('Error deleting students:', studError);
    
    console.log('Deleting questions...');
    const { error: qError } = await supabase.from('questions').delete();
    if (qError) console.error('Error deleting questions:', qError);
    
    console.log('Deleting topic_details...');
    const { error: tdError } = await supabase.from('topic_details').delete();
    if (tdError) console.error('Error deleting topic_details:', tdError);
    
    console.log('Deleting chapters...');
    const { error: chError } = await supabase.from('chapters').delete();
    if (chError) console.error('Error deleting chapters:', chError);
    
    console.log('All content cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('Error clearing content:', error);
    throw new Error('Failed to clear database content');
  }
}