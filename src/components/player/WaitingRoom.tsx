/**
 * Waiting Room component for Ether Excel
 * Student-facing component for waiting to join the game
 */
import React, { useEffect, useState, useRef } from 'react';
import { Clock, Users, RefreshCw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { getAllStudents } from '../../services/database';
import { Student, GameSession, Question, Topic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const NarrativeScreen: React.FC<{topic: Topic, onContinue: () => void}> = ({ topic, onContinue }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF4FF] p-4">
      <Card className="w-full max-w-lg animate-fadeIn">
        <CardHeader>
          <CardTitle>{topic.topic_name}</CardTitle>
          <CardDescription>
            Introduction to this topic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-lg font-medium italic text-center text-gray-700">
                "{topic.topic_narrative}"
              </p>
            </div>
            
            <Button 
              onClick={onContinue}
              fullWidth
              size="lg"
              icon={<ArrowRight className="w-4 h-4 ml-2" />}
              iconPosition="right"
            >
              Begin Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuestionScreen: React.FC<{
  question: Question, 
  onAnswer: (option: string) => void,
  answered: boolean,
  selectedOption: string | null,
  isCorrect: boolean | null
}> = ({ question, onAnswer, answered, selectedOption, isCorrect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF4FF] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Question</CardTitle>
          <CardDescription>
            Select the correct option
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-lg font-medium mb-6">{question.question_stem}</p>
              
              <div className="space-y-3">
                {[
                  { id: 'A', text: question.option_a },
                  { id: 'B', text: question.option_b },
                  { id: 'C', text: question.option_c },
                  { id: 'D', text: question.option_d }
                ].map((option) => {
                  // Determine button styling based on answer state
                  let buttonStyle = "border border-gray-300 bg-white hover:bg-gray-50";
                  
                  if (answered && selectedOption === option.id) {
                    buttonStyle = isCorrect 
                      ? "border-green-500 bg-green-50 text-green-700" 
                      : "border-red-500 bg-red-50 text-red-700";
                  }
                  
                  if (answered && option.id === question.correct_option && selectedOption !== option.id) {
                    buttonStyle = "border-green-500 bg-green-50 text-green-700";
                  }
                  
                  return (
                    <button
                      key={option.id}
                      className={`w-full p-4 rounded-lg text-left flex items-center justify-between ${buttonStyle} ${
                        answered ? "cursor-default" : "cursor-pointer"
                      }`}
                      onClick={() => !answered && onAnswer(option.id)}
                      disabled={answered}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 border ${
                          answered && selectedOption === option.id
                            ? isCorrect 
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-red-500 bg-red-500 text-white"
                            : answered && option.id === question.correct_option
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-gray-300 bg-white text-gray-700"
                        }`}>
                          {option.id}
                        </div>
                        <span>{option.text}</span>
                      </div>
                      
                      {answered && option.id === question.correct_option && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {answered && selectedOption === option.id && !isCorrect && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {answered && (
              <div className={`p-4 rounded-lg text-center ${
                isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {isCorrect 
                  ? "Correct! Well done!"
                  : `Incorrect. The correct answer is ${question.correct_option}.`
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const WaitingRoom: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const { gameState, setGameState, topics, questions } = useAppContext();
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  
  // Game flow state
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showingNarrative, setShowingNarrative] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Poll for updates and set up subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all students
        const studentsData = await getAllStudents();
        setStudents(studentsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lobby data:', error);
        setError('Could not connect to the game lobby. Please try again.');
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Subscribe to game_sessions changes
    const subscription = supabase
      .channel('public:game_sessions')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'game_sessions' 
      }, (payload) => {
        console.log('Game session update received:', payload);
        
        // Check if any game is starting
        if (payload.new.status === 'in_progress') {
          // Start countdown
          setGameState({
            ...gameState,
            status: 'countdown'
          });
        }
      })
      .subscribe();
    
    // Set up polling for students
    const interval = window.setInterval(fetchData, 5000);
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, []);

  // Handle game state changes
  useEffect(() => {
    if (gameState.status === 'countdown') {
      // Start countdown
      startCountdown();
    } else if (gameState.status === 'playing') {
      // Show narrative for first topic
      setShowingNarrative(true);
    }
  }, [gameState.status]);

  // Countdown timer effect
  useEffect(() => {
    return () => {
      // Clean up timer on unmount
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Start countdown from 3 to 1
  const startCountdown = () => {
    setCountdown(3);
    
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          // When countdown reaches 1, clear interval and move to playing state
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          
          // Set game state to playing after countdown finishes
          setTimeout(() => {
            setGameState({
              ...gameState,
              status: 'playing'
            });
          }, 1000);
          
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };
  
  // Get current topic and its questions
  const currentTopic = topics.length > currentTopicIndex ? topics[currentTopicIndex] : null;
  const topicQuestions = currentTopic ? questions[currentTopic.id] || [] : [];
  const currentQuestion = topicQuestions.length > currentQuestionIndex ? topicQuestions[currentQuestionIndex] : null;
  
  // Handle continuing from narrative to questions
  const handleContinueFromNarrative = () => {
    setShowingNarrative(false);
  };
  
  // Handle answering a question
  const handleAnswer = (option: string) => {
    const correct = option === currentQuestion?.correct_option;
    setSelectedOption(option);
    setIsCorrect(correct);
    setAnswered(true);
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < topicQuestions.length - 1) {
        // Next question in same topic
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentTopicIndex < topics.length - 1) {
        // Move to next topic
        setCurrentTopicIndex(currentTopicIndex + 1);
        setCurrentQuestionIndex(0);
        setShowingNarrative(true);
      } else {
        // Game complete
        setGameState({
          ...gameState,
          status: 'results'
        });
      }
      
      // Reset for next question
      setAnswered(false);
      setSelectedOption(null);
      setIsCorrect(null);
    }, 3000);
  };
  
  // Find current student
  const currentStudent = authState.user 
    ? students.find(s => s.name === authState.user?.display_name)
    : null;
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#3A7AFE] border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to game lobby...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Connection Error</CardTitle>
            <CardDescription>
              Could not connect to the game lobby
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} icon={<RefreshCw className="w-4 h-4" />}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show countdown overlay when in countdown state
  if (countdown !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-80 p-4 fixed inset-0 z-50">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-[#3A7AFE] flex items-center justify-center mx-auto mb-8 animate-pulse">
            <span className="text-5xl font-bold text-white">{countdown}</span>
          </div>
          <p className="text-2xl font-bold text-white">Game Starting...</p>
        </div>
      </div>
    );
  }
  
  // Show game completed screen
  if (gameState.status === 'results') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF4FF] p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Game Completed!</CardTitle>
            <CardDescription>
              Great job participating in this game session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <p className="text-lg">
                Thank you for playing! Your teacher will share the results soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show active game screens - narrative or questions
  if (gameState.status === 'playing') {
    if (showingNarrative && currentTopic) {
      return <NarrativeScreen topic={currentTopic} onContinue={handleContinueFromNarrative} />;
    }
    
    if (currentQuestion) {
      return (
        <QuestionScreen 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          answered={answered}
          selectedOption={selectedOption}
          isCorrect={isCorrect}
        />
      );
    }
  }

  // Main waiting room (default view)
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Waiting Room</CardTitle>
          <CardDescription>
            Waiting for the game to start
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-[#EEF4FF] rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-[#3A7AFE] mx-auto mb-2" />
              <p className="text-gray-700">Waiting for the teacher to start the game...</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-500" /> 
                  Students in Waiting Room
                </h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {students.length} joined
                </span>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {students.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {students.map((student, index) => (
                        <div 
                          key={student.id} 
                          className={`p-3 flex items-center justify-between ${
                            currentStudent?.id === student.id ? 'bg-[#EEF4FF]' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-[#3A7AFE] text-white flex items-center justify-center text-xs mr-3">
                              {index + 1}
                            </div>
                            <span className="font-medium">
                              {student.name}
                              {currentStudent?.id === student.id && ' (You)'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No students have joined yet
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Your name will appear in the list above once you've successfully joined.</p>
              <p>The game will begin when the teacher starts the session.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingRoom;