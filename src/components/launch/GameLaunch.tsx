/**
 * Game Launch component for Ether Excel
 * Handles creating and managing a game session
 */
import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Play, 
  Users, 
  Clock, 
  CheckCircle, 
  Share2,
  ArrowLeft,
  Eye,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { getAllStudents, updateStudentStatus, removeStudent, updateGameSessionStatus } from '../../services/database';
import { Student } from '../../types';

const GameLaunch: React.FC = () => {
  const { 
    currentChapter, 
    topics, 
    resetState, 
    setView, 
    gameState,
    setGameState,
    gameSession,
    setGameSession
  } = useAppContext();
  
  const [launchState, setLaunchState] = useState<'ready' | 'starting' | 'active'>('ready');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLimit, setTimeLimit] = useState(5);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);
  
  // Initialize or fetch students on component mount
  useEffect(() => {
    fetchStudents();
    
    // Create polling for students list
    const interval = setInterval(fetchStudents, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch all students in the system
  const fetchStudents = async () => {
    try {
      setLoading(true);
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
  
  // Handle student selection for potential removal
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  // Handle removing selected students
  const handleRemoveSelectedStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    if (window.confirm(`Are you sure you want to remove ${selectedStudents.length} student(s) from the game?`)) {
      try {
        setLoading(true);
        
        // Remove each selected student
        for (const studentId of selectedStudents) {
          setRemovingStudent(studentId);
          await removeStudent(studentId);
        }
        
        // Reset selections and refresh student list
        setSelectedStudents([]);
        await fetchStudents();
        setRemovingStudent(null);
        setLoading(false);
      } catch (error) {
        console.error('Error removing students:', error);
        setLoading(false);
        setRemovingStudent(null);
        alert('Failed to remove some students. Please try again.');
      }
    }
  };
  
  // Handle start game
  const handleStartGame = async () => {
    try {
      // Update all student statuses to 'playing'
      for (const student of students) {
        await updateStudentStatus(student.id, 'playing');
      }
      
      // Update game session status to 'in_progress' if we have a session
      if (gameSession) {
        await updateGameSessionStatus(gameSession.id, 'in_progress');
      }
      
      // Update game state to playing
      setGameState({
        ...gameState,
        status: 'playing',
        currentTopic: topics.length > 0 ? topics[0] : null
      });
      
      // Navigate to the leaderboard/game view for teacher
      setView('lobby');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };
  
  const handleLaunch = async () => {
    setLaunchState('starting');
    
    try {
      setTimeout(() => {
        setLaunchState('active');
      }, 2000);
    } catch (error) {
      console.error('Error launching game:', error);
      // Handle error case
      setLaunchState('ready');
    }
  };
  
  const handleNewGame = () => {
    resetState();
  };

  const handleViewLobby = () => {
    setView('lobby');
  };

  const handleBackToReview = () => {
    setView('review');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Launch Game Session</CardTitle>
          <CardDescription>
            Configure and start your classroom game session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {launchState === 'ready' && (
            <div className="space-y-6">
              <div className="bg-[#EEF4FF] p-6 rounded-xl">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-[#3A7AFE]" />
                  Game Session: {currentChapter?.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg flex items-center">
                    <Users className="w-5 h-5 text-[#3A7AFE] mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Grade Level</p>
                      <p className="font-medium">{currentChapter?.grade}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg flex items-center">
                    <Play className="w-5 h-5 text-[#3A7AFE] mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Topics</p>
                      <p className="font-medium">{topics.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg flex items-center">
                    <Clock className="w-5 h-5 text-[#3A7AFE] mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Time per Topic</p>
                      <p className="font-medium">{timeLimit} minutes</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit per Topic (minutes)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 min</span>
                    <span>5 min</span>
                    <span>10 min</span>
                  </div>
                </div>
                
                {/* Students in Lobby section with selection and removal */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Students in Lobby</h3>
                    <div className="flex space-x-2">
                      {selectedStudents.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRemoveSelectedStudents}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          isLoading={!!removingStudent}
                          icon={<Trash2 className="w-4 h-4" />}
                        >
                          Remove {selectedStudents.length} Selected
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRefresh}
                        isLoading={refreshing}
                        icon={<RefreshCw className="w-4 h-4" />}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
                    {loading ? (
                      <div className="p-4 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading students...</p>
                      </div>
                    ) : students.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Select
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined At
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student, index) => (
                              <tr 
                                key={student.id} 
                                className={selectedStudents.includes(student.id) ? "bg-blue-50" : ""}
                              >
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => toggleStudentSelection(student.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <div className="w-6 h-6 rounded-full bg-[#3A7AFE] text-white flex items-center justify-center text-xs">
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.name}
                                    {removingStudent === student.id && <span className="ml-2 text-red-500 text-xs">Removing...</span>}
                                  </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(student.joined_at).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No students have joined yet
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <p>Students are automatically added when they join the classroom</p>
                    <p className="text-blue-600">
                      {selectedStudents.length > 0 ? `${selectedStudents.length} students selected` : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={handleViewLobby}
                  icon={<Eye className="w-5 h-5 mr-1" />}
                  variant="outline"
                >
                  View Lobby
                </Button>
                <Button 
                  size="lg"
                  onClick={handleLaunch}
                  icon={<Rocket className="w-5 h-5" />}
                >
                  Launch Game Session
                </Button>
              </div>
            </div>
          )}
          
          {launchState === 'starting' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-full h-full rounded-full bg-[#3A7AFE]">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-medium text-[#1F2937] mb-2">
                Starting Game Session...
              </h3>
              <p className="text-gray-500">
                The game will begin in a few seconds.
              </p>
            </div>
          )}
          
          {launchState === 'active' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium text-green-800">Game Session Active</h3>
                  <p className="text-sm text-green-600">
                    Your game is now ready to start. {students.length} students in the lobby.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Player Lobby</h3>
                  <div className="flex space-x-2">
                    {selectedStudents.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveSelectedStudents}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        isLoading={!!removingStudent}
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Remove {selectedStudents.length}
                      </Button>
                    )}
                    <Button 
                      onClick={handleRefresh}
                      icon={<RefreshCw className="w-4 h-4 mr-1" />}
                      size="sm"
                      isLoading={refreshing}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading students...</p>
                    </div>
                  ) : students.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Select
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student, index) => (
                            <tr 
                              key={student.id}
                              className={selectedStudents.includes(student.id) ? "bg-blue-50" : ""}
                            >
                              <td className="px-3 py-2 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  checked={selectedStudents.includes(student.id)}
                                  onChange={() => toggleStudentSelection(student.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="w-6 h-6 rounded-full bg-[#3A7AFE] text-white flex items-center justify-center text-xs">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
                                  {removingStudent === student.id && <span className="ml-2 text-red-500 text-xs">Removing...</span>}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {new Date(student.joined_at).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No students have joined yet
                    </div>
                  )}
                </div>
                
                <div className="bg-[#EEF4FF] p-3 rounded-lg">
                  <h4 className="text-sm font-medium">Ready to Start Game</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Click the button below when all students have joined
                  </p>
                  <Button 
                    onClick={handleStartGame}
                    icon={<Play className="w-4 h-4 mr-1" />}
                    fullWidth
                    disabled={students.length === 0}
                  >
                    Start Game Now
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline"
                  icon={<Share2 className="w-5 h-5" />}
                >
                  Share Results
                </Button>
                <Button onClick={handleNewGame}>
                  Prepare New Game
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {launchState === 'ready' && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => handleNewGame()}>
              Start Over
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackToReview}
              icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            >
              Back to Review
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default GameLaunch;