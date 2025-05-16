/**
 * Lobby View component for Ether Excel
 * Displays waiting students and allows the teacher to start the game
 */
import React, { useEffect, useState } from 'react';
import { Users, ArrowLeft, Play, RefreshCw, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { getAllStudents, updateGameSessionStatus } from '../../services/database';
import { Student } from '../../types';

const LobbyView: React.FC = () => {
  const { currentChapter, gameSession, setView } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  
  // Fetch students on load and set up polling
  useEffect(() => {
    fetchStudents();
    
    // Set up polling every 10 seconds
    const interval = setInterval(fetchStudents, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  // Handle start game
  const handleStartGame = async () => {
    if (!gameSession) {
      alert('No active game session found');
      return;
    }
    
    try {
      setGameStarting(true);
      
      // Update game session status to in_progress
      await updateGameSessionStatus(gameSession.id, 'in_progress');
      
      // Wait a moment for UI feedback
      setTimeout(() => {
        // Return to launch view
        setView('launch');
      }, 1500);
    } catch (error) {
      console.error('Error starting game:', error);
      setGameStarting(false);
      alert('Failed to start game. Please try again.');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Game Lobby</CardTitle>
          <CardDescription>
            Students waiting to join the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-[#EEF4FF] p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#3A7AFE]" />
                Game Session: {currentChapter?.title || 'New Game'}
              </h2>
              
              {gameSession && (
                <div className="mb-4 flex items-center justify-center bg-white p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Game Code</p>
                    <p className="text-2xl font-bold tracking-wider text-[#3A7AFE]">
                      {gameSession.game_code}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-medium">Students in Lobby</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleRefresh}
                      isLoading={refreshing}
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Refresh
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<UserPlus className="w-4 h-4" />}
                    >
                      Add Student
                    </Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block w-8 h-8 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : students.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined At
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                          <tr key={student.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="w-6 h-6 rounded-full bg-[#3A7AFE] text-white flex items-center justify-center text-xs">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(student.joined_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No students have joined yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={handleStartGame}
                  isLoading={gameStarting}
                  icon={<Play className="w-5 h-5" />}
                  disabled={students.length === 0 || gameStarting}
                >
                  Start Game
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setView('launch')}
            icon={<ArrowLeft className="w-4 h-4 mr-1" />}
          >
            Back to Game Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LobbyView;