/**
 * Waiting Room component for Ether Excel
 * Student-facing component for waiting to join the game and play the quiz
 */
import React, { useEffect, useState, useRef } from 'react';
import { Clock, Users, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Timer, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { getAllStudents, updateStudentStatus, saveStudentResponse } from '../../services/database';
import { Student, Question, Topic } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

// Timer component for the question countdown
const QuestionTimer: React.FC<{ timeLeft: number, totalTime: number }> = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const timerColor = timeLeft > 10 ? 'bg-blue-500' : 'bg-red-500';
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{timeLeft} seconds left</span>
        <Timer className="w-4 h-4" />
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Narrative screen component to show topic introduction
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

// Question screen component with timer and options
const QuestionScreen: React.FC<{
  question: Question, 
  onAnswer: (option: string) => void,
  answered: boolean,
  selectedOption: string | null,
  isCorrect: boolean | null,
  timeLeft: number,
  totalTime: number
}> = ({ 
  question, 
  onAnswer, 
  answered, 
  selectedOption, 
  isCorrect,
  timeLeft,
  totalTime
}) => {
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
            {/* Timer */}
            <QuestionTimer timeLeft={timeLeft} totalTime={totalTime} />
            
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
                      } option-button`}
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
              <div className={`p-4 rounded-lg flex items-center ${
                isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {isCorrect 
                  ? <><ThumbsUp className="w-5 h-5 mr-2" /> Correct! Well done!</>
                  : <><ThumbsDown className="w-5 h-5 mr-2" /> Incorrect. The correct answer is {question.correct_option}.</>
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Results screen component to show at the end of the game
const ResultsScreen: React.FC<{correctAnswers: number, totalQuestions: number}> = ({ correctAnswers, totalQuestions }) => {
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF4FF] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Game Completed!</CardTitle>
          <CardDescription>
            Here's how you did
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <div>
              <p className="text-2xl font-bold">{score}%</p>
              <p className="text-lg mt-2">
                You got {correctAnswers} out of {totalQuestions} questions correct
              </p>
            </div>
            
            <p className="text-gray-600">
              Thank you for playing! Your teacher will share the results soon.
            </p>
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
  const { gameState, setGameState, topics, questions, gameSession } = useAppContext();
  
  // Countdown state for game start (5 seconds)
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  
  // Game flow state
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showingNarrative, setShowingNarrative] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // User stats
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  
  // Question timer state (60 seconds per question)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);
  const questionTimerRef = useRef<number | null>(null);
  const QUESTION_TIME = 60; // 60 seconds per question
  
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
    
    // Subscribe to students changes
    const studentSubscription = supabase
      .channel('public:students')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'students' 
      }, (payload) => {
        console.log('Student update received:', payload);
        
        // Check if the current student is changing to playing status
        if (authState.user && payload.new.id === authState.user.id && payload.new.status === 'playing') {
          // Start countdown
          setGameState({
            ...gameState,
            status: 'countdown'
          });
        }
      })
      .subscribe();
    
    // Subscribe to game_sessions changes - this is the reliable way to detect game start
    const sessionSubscription = supabase
      .channel('public:game_sessions')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'game_sessions' 
      }, (payload) => {
        console.log('Game session update received:', payload);
        
        // If game session status changes to in_progress, start the countdown
        if (payload.new.status === 'in_progress') {
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
      supabase.removeChannel(studentSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, []);

  // Handle game state changes
  useEffect(() => {
    if (gameState.status === 'countdown') {
      // Start countdown from 5 seconds
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
  
  // Question timer effect
  useEffect(() => {
    // Start timer when a new question is shown (not during narrative)
    if (gameState.status === 'playing' && !showingNarrative && !answered) {
      startQuestionTimer();
    }
    
    return () => {
      // Clean up timer on unmount or when moving to next question
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [gameState.status, showingNarrative, currentQuestionIndex, answered]);

  // Start countdown from 5 to 0
  const startCountdown = () => {
    // Start with 5 seconds
    setCountdown(5);
    
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
  
  // Start the 60-second timer for questions
  const startQuestionTimer = () => {
    setQuestionTimeLeft(QUESTION_TIME);
    
    questionTimerRef.current = window.setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up, handle as if the user didn't answer
          if (questionTimerRef.current) {
            clearInterval(questionTimerRef.current);
          }
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle when time runs out for a question
  const handleTimeUp = () => {
    // Only process if the question hasn't been answered yet
    if (!answered) {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        // Record that time ran out (no selection)
        setAnswered(true);
        setSelectedOption(null);
        setIsCorrect(false);
        setTotalAnswered(prev => prev + 1);
        
        // Record response in database
        if (authState.user) {
          saveStudentResponse(
            authState.user.id, 
            currentQuestion.id, 
            'timeout', // Custom value for timeout
            false
          );
        }
        
        // Move to next question after delay
        setTimeout(moveToNextQuestion, 3000);
      }
    }
  };
  
  // Get current topic and its questions
  const getCurrentTopic = () => {
    return topics.length > currentTopicIndex ? topics[currentTopicIndex] : null;
  };
  
  const getTopicQuestions = (topic: Topic | null) => {
    return topic ? questions[topic.id] || [] : [];
  };
  
  const getCurrentQuestion = () => {
    const topic = getCurrentTopic();
    const topicQuestions = getTopicQuestions(topic);
    return topicQuestions.length > currentQuestionIndex ? topicQuestions[currentQuestionIndex] : null;
  };
  
  // Calculate total questions across all topics
  const getTotalQuestions = () => {
    return topics.reduce((total, topic) => {
      return total + (questions[topic.id]?.length || 0);
    }, 0);
  };
  
  // Handle continuing from narrative to questions
  const handleContinueFromNarrative = () => {
    setShowingNarrative(false);
    // Reset question state
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    // Timer will start automatically via the useEffect
  };
  
  // Handle answering a question
  const handleAnswer = (option: string) => {
    // Stop the timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      const correct = option === currentQuestion.correct_option;
      
      setSelectedOption(option);
      setIsCorrect(correct);
      setAnswered(true);
      setTotalAnswered(prev => prev + 1);
      
      // Update correct answers count
      if (correct) {
        setCorrectAnswers(prev => prev + 1);
      }
      
      // Record response in database
      if (authState.user) {
        saveStudentResponse(
          authState.user.id, 
          currentQuestion.id, 
          option,
          correct
        );
      }
      
      // Move to next question after delay
      setTimeout(moveToNextQuestion, 3000);
    }
  };
  
  // Move to the next question or topic
  const moveToNextQuestion = () => {
    const currentTopic = getCurrentTopic();
    const topicQuestions = getTopicQuestions(currentTopic);
    
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
      
      // Update student status to completed
      if (authState.user) {
        updateStudentStatus(authState.user.id, 'completed');
      }
    }
    
    // Reset for next question
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
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
          <div className="w-24 h-24 rounded-full bg-[#3A7AFE] flex items-center justify-center mx-auto mb-8 animate-countdown">
            <span className="text-5xl font-bold text-white">{countdown}</span>
          </div>
          <p className="text-2xl font-bold text-white">Game Starting...</p>
        </div>
      </div>
    );
  }
  
  // Show game completed screen with results
  if (gameState.status === 'results') {
    return <ResultsScreen correctAnswers={correctAnswers} totalQuestions={getTotalQuestions()} />;
  }
  
  // Show active game screens - narrative or questions
  if (gameState.status === 'playing') {
    const currentTopic = getCurrentTopic();
    const currentQuestion = getCurrentQuestion();
    
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
          timeLeft={questionTimeLeft}
          totalTime={QUESTION_TIME}
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