/**
 * OpenAI client configuration and API helpers
 * Handles the AI interaction for topic extraction, narrative generation, and question creation
 */
import OpenAI from 'openai';

// Verify the API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error('OpenAI API key is not set. Please add VITE_OPENAI_API_KEY to your .env file.');
}

const openai = new OpenAI({
  apiKey: apiKey,
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
    console.log(`Extracting topics for Grade ${grade} content (${chapterContent.length} chars)`);
    
    const prompt = `You are given the full text of a chapter for Grade ${grade}. 
    Extract 3-5 instructional topics from this chapter that represent distinct conceptual areas a teacher might cover. 
    For each topic, include a short 1-2 line summary of what is covered in that topic.
    
    Format your response as a JSON object with a "topics" array, where each object in the array has 'title' and 'description' fields.
    
    Example response format:
    {
      "topics": [
        {
          "title": "Topic Title",
          "description": "Short description of what this topic covers"
        }
      ]
    }
    
    Chapter content:
    ${chapterContent.substring(0, 8000)}`;

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('OpenAI response received:', content.substring(0, 150) + '...');
    
    try {
      const parsedResponse = JSON.parse(content);
      
      if (!parsedResponse.topics || !Array.isArray(parsedResponse.topics)) {
        console.error('Invalid response format from OpenAI:', parsedResponse);
        console.error('Response content:', content);
        // Create placeholder topics if the format is incorrect
        return [
          {
            title: "Topic 1",
            description: "Unable to extract topics from the chapter content."
          },
          {
            title: "Topic 2",
            description: "Unable to extract topics from the chapter content."
          }
        ];
      }
      
      console.log(`Extracted ${parsedResponse.topics.length} topics`);
      return parsedResponse.topics;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Response content:', content);
      // Return placeholder topics on parsing error
      return [
        {
          title: "Topic 1",
          description: "Error parsing topics from the chapter content."
        },
        {
          title: "Topic 2",
          description: "Error parsing topics from the chapter content."
        }
      ];
    }
  } catch (error) {
    console.error('Error extracting topics:', error);
    // Return placeholder topics on API error
    return [
      {
        title: "Topic 1",
        description: "Error communicating with AI service."
      },
      {
        title: "Topic 2",
        description: "Error communicating with AI service."
      }
    ];
  }
}

/**
 * Generate narrative snippets for each topic
 */
export async function generateNarratives(topics: ExtractedTopic[]): Promise<TopicNarrative[]> {
  try {
    console.log(`Generating narratives for ${topics.length} topics`);
    const topicTitles = topics.map(t => t.title).join(', ');
    
    const prompt = `Using the following list of topics: ${topicTitles}, 
    generate a connected storyline that links all the topics together as a single classroom adventure. 
    Provide one short narrative snippet (2-3 lines) for each topic, forming parts of a continuous story.
    
    Format your response as a JSON object with a "narratives" array, where each object in the array has 'topicId' (the index of the topic, 0-based) and 'narrative' fields.
    
    Example response format:
    {
      "narratives": [
        {
          "topicId": "0",
          "narrative": "Short narrative connecting to the topic"
        }
      ]
    }
    
    Topics:
    ${topics.map((t, i) => `${i}: ${t.title} - ${t.description}`).join('\n')}`;

    console.log('Sending narrative request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('Narratives response received:', content.substring(0, 150) + '...');
    
    try {
      const parsedResponse = JSON.parse(content);
      
      if (!parsedResponse.narratives || !Array.isArray(parsedResponse.narratives)) {
        console.error('Invalid narratives format from OpenAI:', parsedResponse);
        // Create placeholder narratives if the format is incorrect
        return topics.map((_, index) => ({
          topicId: index.toString(),
          narrative: "Join us on an adventure as we explore this fascinating topic!"
        }));
      }
      
      console.log(`Generated ${parsedResponse.narratives.length} narratives`);
      return parsedResponse.narratives;
    } catch (parseError) {
      console.error('Error parsing narratives response:', parseError);
      console.error('Response content:', content);
      // Return placeholder narratives on parsing error
      return topics.map((_, index) => ({
        topicId: index.toString(),
        narrative: "Join us on an adventure as we explore this fascinating topic!"
      }));
    }
  } catch (error) {
    console.error('Error generating narratives:', error);
    // Return placeholder narratives on API error
    return topics.map((_, index) => ({
      topicId: index.toString(),
      narrative: "Join us on an adventure as we explore this fascinating topic!"
    }));
  }
}

/**
 * Generate questions for a specific topic
 */
export async function generateQuestions(topic: ExtractedTopic, grade: string): Promise<GeneratedQuestion[]> {
  try {
    console.log(`Generating questions for topic: ${topic.title}`);
    
    const prompt = `Create 3-5 multiple choice questions based on the topic: '${topic.title}'. 
    Each question should be clear and targeted at a Grade ${grade} student. 
    
    Topic description: ${topic.description}
    
    For each question provide:
    - Question stem
    - Four options (A, B, C, D)
    - The correct option letter
    
    Format your response as a JSON object with a "questions" array, where each object in the array has 'stem', 'optionA', 'optionB', 'optionC', 'optionD', and 'correctOption' fields.
    
    Example response format:
    {
      "questions": [
        {
          "stem": "Question text here?",
          "optionA": "First option",
          "optionB": "Second option",
          "optionC": "Third option",
          "optionD": "Fourth option",
          "correctOption": "A"
        }
      ]
    }
    
    The correctOption field should contain only the letter: A, B, C or D.`;

    console.log('Sending questions request to OpenAI for topic:', topic.title);
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('Questions response received for topic:', topic.title);
    
    try {
      const parsedResponse = JSON.parse(content);
      
      // Check if questions array exists before mapping
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        console.warn(`No valid questions array returned for topic: ${topic.title}`);
        console.warn('Response content:', content);
        // Create placeholder questions if the format is incorrect
        return [
          {
            topicId: topic.title,
            stem: `What is the main concept covered in ${topic.title}?`,
            optionA: "First concept",
            optionB: "Second concept",
            optionC: "Third concept",
            optionD: "Fourth concept",
            correctOption: "A"
          },
          {
            topicId: topic.title,
            stem: `Which example best illustrates ${topic.title}?`,
            optionA: "Example A",
            optionB: "Example B",
            optionC: "Example C",
            optionD: "Example D",
            correctOption: "B"
          }
        ];
      }
      
      console.log(`Generated ${parsedResponse.questions.length} questions for topic: ${topic.title}`);
      
      return parsedResponse.questions.map((q: any) => ({
        ...q,
        topicId: topic.title
      }));
    } catch (parseError) {
      console.error(`Error parsing questions for topic: ${topic.title}`, parseError);
      console.error('Response content:', content);
      // Return placeholder questions on parsing error
      return [
        {
          topicId: topic.title,
          stem: `What is the main concept covered in ${topic.title}?`,
          optionA: "First concept",
          optionB: "Second concept",
          optionC: "Third concept",
          optionD: "Fourth concept",
          correctOption: "A"
        },
        {
          topicId: topic.title,
          stem: `Which example best illustrates ${topic.title}?`,
          optionA: "Example A",
          optionB: "Example B",
          optionC: "Example C",
          optionD: "Example D",
          correctOption: "B"
        }
      ];
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return placeholder questions on API error
    return [
      {
        topicId: topic.title,
        stem: `What is the main concept covered in ${topic.title}?`,
        optionA: "First concept",
        optionB: "Second concept",
        optionC: "Third concept",
        optionD: "Fourth concept",
        correctOption: "A"
      },
      {
        topicId: topic.title,
        stem: `Which example best illustrates ${topic.title}?`,
        optionA: "Example A",
        optionB: "Example B",
        optionC: "Example C",
        optionD: "Example D",
        correctOption: "B"
      }
    ];
  }
}