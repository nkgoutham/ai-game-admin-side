/**
 * OpenAI client configuration and API helpers
 * Handles the AI interaction for topic extraction, narrative generation, and question creation
 */
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made server-side
});

export interface ExtractedTopic {
  title: string;
  description: string;
}

export interface TopicNarrative {
  topicId: string;
  narrative: string;
}

export interface GeneratedQuestion {
  topicId: string;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

/**
 * Extract instructional topics from chapter content
 */
export async function extractTopics(chapterContent: string, grade: string): Promise<ExtractedTopic[]> {
  try {
    const prompt = `You are given the full text of a chapter for Grade ${grade}. 
    Extract 3-5 instructional topics from this chapter that represent distinct conceptual areas a teacher might cover. 
    For each topic, include a short 1-2 line summary of what is covered in that topic.
    
    Format your response as a JSON array with each object having 'title' and 'description' fields.
    
    Chapter content:
    ${chapterContent.substring(0, 8000)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    const parsedResponse = JSON.parse(content);
    
    return parsedResponse.topics || [];
  } catch (error) {
    console.error('Error extracting topics:', error);
    throw new Error('Failed to extract topics from chapter content');
  }
}

/**
 * Generate narrative snippets for each topic
 */
export async function generateNarratives(topics: ExtractedTopic[]): Promise<TopicNarrative[]> {
  try {
    const topicTitles = topics.map(t => t.title).join(', ');
    
    const prompt = `Using the following list of topics: ${topicTitles}, 
    generate a connected storyline that links all the topics together as a single classroom adventure. 
    Provide one short narrative snippet (2-3 lines) for each topic, forming parts of a continuous story.
    
    Format your response as a JSON array with each object having 'topicId' (the index of the topic, 0-based) and 'narrative' fields.
    
    Topics:
    ${topics.map((t, i) => `${i}: ${t.title} - ${t.description}`).join('\n')}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    const parsedResponse = JSON.parse(content);
    
    return parsedResponse.narratives || [];
  } catch (error) {
    console.error('Error generating narratives:', error);
    throw new Error('Failed to generate topic narratives');
  }
}

/**
 * Generate questions for a specific topic
 */
export async function generateQuestions(topic: ExtractedTopic, grade: string): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `Create 3-5 multiple choice questions based on the topic: '${topic.title}'. 
    Each question should be clear and targeted at a Grade ${grade} student. 
    
    Topic description: ${topic.description}
    
    For each question provide:
    - Question stem
    - Four options (A, B, C, D)
    - The correct option letter
    
    Format your response as a JSON array with objects having 'stem', 'optionA', 'optionB', 'optionC', 'optionD', and 'correctOption' fields.
    The response should have a 'questions' key containing this array.
    
    The correctOption field should contain only the letter: A, B, C or D.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    const parsedResponse = JSON.parse(content);
    
    // Check if questions array exists before mapping
    if (!Array.isArray(parsedResponse.questions)) {
      console.warn(`No questions array returned for topic: ${topic.title}`);
      return [];
    }
    
    return parsedResponse.questions.map((q: any) => ({
      ...q,
      topicId: topic.title
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions for topic: ${topic.title}`);
  }
}