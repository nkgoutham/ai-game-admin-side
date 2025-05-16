/**
 * Lobby View component for Ether Excel
 * Displays leaderboard of students and allows the teacher to monitor game progress
 */
import React, { useEffect, useState } from 'react';
import { Users, ArrowLeft, RefreshCw, Award, CheckSquare, AlignJustify } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { getAllStudents, getOrCreateDefaultGameSession } from '../../services/database';
import { Student, Topic } from '../../types';

const LobbyView: React.FC = () => {
  const { currentChapter, gameSession, setGameSession, setView, topics, questions, gameState } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  
  // Extended student type with game stats
  interface StudentWithStats extends Student {
    currentQuestion: number;
    correctAnswers: number;
    score: number;
  }
  
  // Initialize stats for display purposes (in real app, would come from database)
  const [studentStats, setStudentStats] = useState<StudentWithStats[]>([]);
  
  // Calculate total questions across all topics once - moved before useEffect to fix hooks order
  const getTotalQuestions = () => {
    return topics.reduce((total, topic) => {
      const topicQuestions = questions[topic.id] || [];
      return total + topicQuestions.length;
    }, 0);
  };
  
  // Fetch students on load and set up polling
  useEffect(() => {
    fetchStudents();
    
    // Set up polling every 5 seconds
    const interval = setInterval(fetchStudents, 5000);
    
    // Ensure we have a game session
    if (!gameSession) {
      initializeGameSession();
    }
    
    return () => clearInterval(interval);
  }, []);
  
  // Update student stats whenever students array changes
  useEffect(() => {
    // Create dummy stats for demonstration
    const stats = students.map(student => ({
      ...student,
      currentQuestion: Math.floor(Math.random() * 5) + 1, // Random for demo
      correctAnswers: Math.floor(Math.random() * 4),      // Random for demo
      score: Math.floor(Math.random() * 100)              // Random for demo
    }));
    
    // Sort by score descending
    stats.sort((a, b) => b.score - a.score);
    
    setStudentStats(stats);
  }, [students]);
  
  // Initialize a game session if needed
  const initializeGameSession = async () => {
    try {
      const session = await getOrCreateDefaultGameSession(
        currentChapter?.id, 
        'Anonymous Teacher'
      );
      setGameSession(session);
    } catch (error) {
      console.error('Error initializing game session:', error);
    }
  };
  
  // Fetch all students in the system
  const fetchStudents = async () => {
    try {
      const studentsData = await getAllStudents();
      setStudents(studentsData);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };
  
  // Get current topic
  const currentTopic = topics.length > currentTopicIndex ? topics[currentTopicIndex] : null;
  
  // Get questions for current topic
  const currentTopicQuestions = currentTopic ? questions[currentTopic.id] || [] : [];
  
  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Game Leaderboard</CardTitle>
              <CardDescription>
                Monitoring student progress in real-time
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setView('launch')}
              icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            >
              Back to Game Setup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current topic and progress */}
              <div className="lg:col-span-1">
                <div className="bg-[#EEF4FF] p-4 rounded-xl">
                  <h2 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center">
                    <AlignJustify className="w-5 h-5 mr-2 text-[#3A7AFE]" />
                    Current Topic
                  </h2>
                  
                  {currentTopic ? (
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-lg">{currentTopic.topic_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{currentTopic.topic_coverage}</p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700">Narrative:</h4>
                        <p className="text-sm italic text-gray-600 mt-1">"{currentTopic.topic_narrative}"</p>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span>Questions: {currentTopicQuestions.length}</span>
                          <span>Topic {currentTopicIndex + 1} of {topics.length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 mb-4 text-center text-gray-500">
                      No active topic
                    </div>
                  )}
                  
                  <h2 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center mt-6">
                    <CheckSquare className="w-5 h-5 mr-2 text-[#3A7AFE]" />
                    Game Progress
                  </h2>
                  
                  <div className="bg-white rounded-lg p-4">
                    <div className="space-y-3">
                      {topics.map((topic, index) => (
                        <div key={topic.id} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                            ${index < currentTopicIndex ? 'bg-green-500 text-white' : 
                              index === currentTopicIndex ? 'bg-[#3A7AFE] text-white' : 
                              'bg-gray-200 text-gray-500'}`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${index === currentTopicIndex ? 'font-medium' : ''}`}>
                                {topic.topic_name}
                              </span>
                              {index < currentTopicIndex && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                  Complete
                                </span>
                              )}
                              {index === currentTopicIndex && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  In Progress
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Leaderboard */}
              <div className="lg:col-span-2">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <Award className="w-5 h-5 mr-2 text-[#3A7AFE]" /> 
                      Live Leaderboard
                    </h3>
                    <Button 
                      onClick={handleRefresh}
                      icon={<RefreshCw className="w-4 h-4 mr-1" />}
                      size="sm"
                      isLoading={refreshing}
                    >
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-500">Loading leaderboard...</p>
                      </div>
                    ) : studentStats.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rank
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Question
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Correct
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Score
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentStats.map((student, index) => (
                              <tr key={student.id} className={index === 0 ? "bg-yellow-50" : ""}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {index === 0 ? (
                                    <div className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center text-xs">
                                      1
                                    </div>
                                  ) : index === 1 ? (
                                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs">
                                      2
                                    </div>
                                  ) : index === 2 ? (
                                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">
                                      3
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs">
                                      {index + 1}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {student.currentQuestion} / {currentTopicQuestions.length}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {student.correctAnswers}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {student.score} pts
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No students in the game yet
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <p>Live updates will appear automatically as students answer questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LobbyView;