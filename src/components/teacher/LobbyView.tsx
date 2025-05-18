/**
 * Lobby View component for Ether Excel
 * Displays game session status and allows the teacher to monitor game progress
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Award, CheckSquare, AlignJustify } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { getOrCreateDefaultGameSession } from '../../services/database';

interface LeaderboardEntry {
  id: string;
  name: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
}

const LobbyView: React.FC = () => {
  const { currentChapter, gameSession, setGameSession, setView, topics, questions } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Calculate total questions across all topics
  const getTotalQuestions = () => {
    return topics.reduce((total, topic) => {
      const topicQuestions = questions[topic.id] || [];
      return total + topicQuestions.length;
    }, 0);
  };
  
  // Initialize on component mount
  useEffect(() => {
    // Ensure we have a game session
    if (!gameSession) {
      initializeGameSession();
    }
    
    // For demonstration, we'll generate a placeholder leaderboard
    generatePlaceholderLeaderboard();
    
    setLoading(false);
    
    // Set up polling every 5 seconds
    const interval = setInterval(() => {
      generatePlaceholderLeaderboard();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  // Generate placeholder leaderboard data (for demo purposes only)
  const generatePlaceholderLeaderboard = () => {
    const names = [
      'Emma Thompson', 'Liam Johnson', 'Olivia Williams', 
      'Noah Smith', 'Ava Jones', 'Lucas Brown', 
      'Sophia Miller', 'Jackson Davis', 'Isabella Wilson'
    ];
    
    const demoLeaderboard = names.map((name, index) => {
      // Generate random but consistent data for demo
      const totalQuestions = getTotalQuestions();
      const answered = Math.min(Math.floor(totalQuestions * Math.random()), totalQuestions);
      const correct = Math.floor(answered * (0.5 + Math.random() * 0.5));
      
      return {
        id: `demo-${index}`,
        name,
        correctAnswers: correct,
        totalQuestions: answered,
        score: correct * 10 // Simple scoring system
      };
    });
    
    // Sort by score descending
    demoLeaderboard.sort((a, b) => b.score - a.score);
    
    setLeaderboard(demoLeaderboard);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    generatePlaceholderLeaderboard();
    setTimeout(() => setRefreshing(false), 500);
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
              <CardTitle>Game Monitoring</CardTitle>
              <CardDescription>
                Manage and monitor your active game session
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
                        <p className="text-gray-500">Loading leaderboard data...</p>
                      </div>
                    ) : leaderboard.length > 0 ? (
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
                                Progress
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
                            {leaderboard.map((player, index) => (
                              <tr key={player.id} className={index === 0 ? "bg-yellow-50" : ""}>
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
                                  <div className="text-sm font-medium text-gray-900">{player.name}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {player.totalQuestions} / {getTotalQuestions()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {player.correctAnswers}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {player.score} pts
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No students have answered questions yet
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <p>Data from the student application will appear here as students answer questions</p>
                    <p className="text-xs mt-1">(Demo data shown for preview purposes)</p>
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