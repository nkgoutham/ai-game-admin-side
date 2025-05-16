/**
 * AI Processing component for Ether Excel
 * Handles the extraction of educational content from chapter text using OpenAI
 */
import React, { useEffect, useState } from 'react';
import { Brain, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { useAppContext } from '../../context/AppContext';
import { extractTopics, generateNarratives, generateQuestions, ExtractedTopic } from '../../lib/openai';
import { extractTextFromPDF } from '../../lib/pdf-parser';
import { saveChapter, saveTopics, saveQuestions, getTopicsByChapterId, getQuestionsByTopicId } from '../../services/database';

const AIProcessing: React.FC = () => {
  const { 
    currentChapter, 
    processingState, 
    setProcessingState, 
    setView,
    setTopics,
    setQuestions 
  } = useAppContext();

  const [error, setError] = useState<string | null>(null);
  const [chapterSaved, setChapterSaved] = useState(false);

  // Process content with OpenAI and save to Supabase
  useEffect(() => {
    if (processingState.status === 'idle' && currentChapter) {
      processChapterContent();
    }
  }, [processingState.status, currentChapter]);

  const processChapterContent = async () => {
    if (!currentChapter) return;
    
    // Start processing
    setProcessingState({ 
      status: 'processing', 
      progress: 0,
      message: 'Starting AI processing...'
    });

    try {
      // Step 1: Parse PDF if needed and extract text
      setProcessingState(prev => ({
        ...prev,
        progress: 10,
        message: 'Extracting content from chapter...'
      }));

      let chapterContent = currentChapter.content;
      if (currentChapter.file && currentChapter.file.type === 'application/pdf') {
        chapterContent = await extractTextFromPDF(currentChapter.file);
      }

      // Step 2: Save chapter to database (only if not already saved)
      if (!chapterSaved) {
        setProcessingState(prev => ({
          ...prev,
          progress: 20,
          message: 'Saving chapter to database...'
        }));

        const savedChapter = await saveChapter(
          currentChapter.title,
          chapterContent,
          currentChapter.grade,
          null // pdfUrl - would be implemented with file storage
        );
        
        // Mark chapter as saved to prevent duplicate saving
        setChapterSaved(true);

        // Step 3: Extract topics with OpenAI
        setProcessingState(prev => ({
          ...prev,
          progress: 30,
          message: 'Identifying instructional topics...'
        }));

        const extractedTopics = await extractTopics(chapterContent, currentChapter.grade);

        // Step 4: Generate narrative elements
        setProcessingState(prev => ({
          ...prev,
          progress: 50,
          message: 'Generating narrative elements...'
        }));

        const narratives = await generateNarratives(extractedTopics);

        // Step 5: Save topics and narratives to database
        setProcessingState(prev => ({
          ...prev,
          progress: 60,
          message: 'Saving topics to database...'
        }));

        const savedTopics = await saveTopics(extractedTopics, narratives, savedChapter.id);

        // Create a mapping from topic title to database ID
        const topicIdMap: Record<string, string> = {};
        savedTopics.forEach(topic => {
          topicIdMap[topic.topic_name] = topic.id;
        });

        // Step 6: Generate questions for each topic
        setProcessingState(prev => ({
          ...prev,
          progress: 70,
          message: 'Creating question bank...'
        }));

        let allQuestions = [];
        for (const topic of extractedTopics) {
          try {
            const topicQuestions = await generateQuestions(topic, currentChapter.grade);
            if (topicQuestions.length > 0) {
              allQuestions = [...allQuestions, ...topicQuestions];
            }
          } catch (err) {
            console.warn(`Error generating questions for topic ${topic.title}:`, err);
            // Continue with other topics instead of failing completely
          }
        }

        // Only proceed if we have questions
        if (allQuestions.length > 0) {
          // Step 7: Save questions to database
          setProcessingState(prev => ({
            ...prev,
            progress: 90,
            message: 'Saving questions to database...'
          }));

          await saveQuestions(allQuestions, topicIdMap);
        } else {
          console.warn('No questions were generated for any topics');
        }

        // Step 8: Finalize and prepare for review
        setProcessingState(prev => ({
          ...prev,
          progress: 100,
          message: 'Finalizing content...'
        }));

        // Load topics from database for display
        const dbTopics = await getTopicsByChapterId(savedChapter.id);
        setTopics(dbTopics);

        // Load questions for each topic
        const questionsMap: Record<string, any[]> = {};
        for (const topic of dbTopics) {
          const topicQuestions = await getQuestionsByTopicId(topic.id);
          questionsMap[topic.id] = topicQuestions;
        }
        setQuestions(questionsMap);

        // Mark processing as complete
        setTimeout(() => {
          setProcessingState(prev => ({ 
            ...prev, 
            status: 'ready',
            message: 'Processing complete!' 
          }));
        }, 1000);
      }
    } catch (err) {
      console.error('Error processing chapter:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setProcessingState(prev => ({ 
        ...prev, 
        status: 'error',
        error: err instanceof Error ? err.message : 'An unexpected error occurred'
      }));
    }
  };

  const handleContinue = () => {
    setView('review');
  };

  const handleRetry = () => {
    setError(null);
    setChapterSaved(false); // Reset saved state to allow retrying
    setProcessingState({ 
      status: 'idle', 
      progress: 0 
    });
  };

  if (!currentChapter) {
    return <div>No chapter selected</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Content Generation</CardTitle>
          <CardDescription>
            Our AI is analyzing the chapter and creating educational content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            {processingState.status === 'processing' && (
              <>
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#EEF4FF] flex items-center justify-center animate-pulse">
                    <Brain className="w-16 h-16 text-[#3A7AFE]" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-[#1F2937] mb-2">
                  Processing Chapter
                </h3>
                <p className="text-gray-500 mb-6">
                  {processingState.message || 'Please wait while our AI analyzes your content...'}
                </p>
                
                <div className="w-full max-w-md mb-8">
                  <ProgressBar 
                    value={processingState.progress} 
                    showLabel 
                    size="lg"
                  />
                </div>
              </>
            )}

            {processingState.status === 'ready' && (
              <>
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                
                <h3 className="text-xl font-medium text-[#1F2937] mb-2">
                  Processing Complete!
                </h3>
                <p className="text-gray-500 mb-6">
                  Your chapter has been processed and content has been generated.
                </p>
                
                <Button onClick={handleContinue}>
                  Review Content
                </Button>
              </>
            )}

            {processingState.status === 'error' && (
              <>
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                
                <h3 className="text-xl font-medium text-[#1F2937] mb-2">
                  Processing Error
                </h3>
                <p className="text-gray-500 mb-6">
                  {processingState.error || 'There was an error processing your chapter.'}
                </p>
                
                <Button onClick={handleRetry} icon={<RefreshCw className="w-4 h-4" />}>
                  Try Again
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIProcessing;