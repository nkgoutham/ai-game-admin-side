/**
 * Waiting Room component for Ether Excel
 * Student-facing component for waiting to join the game
 */
import React, { useEffect, useState } from 'react';
import { Clock, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { getGameSessionByCode, getStudentsBySessionId } from '../../services/database';
import { Student, GameSession } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface WaitingRoomProps {
  gameCode: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ gameCode }) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  
  // Poll for updates
  useEffect(() => {
    let interval: number;
    
    const fetchData = async () => {
      try {
        // Get game session
        const sessionData = await getGameSessionByCode(gameCode);
        setGameSession(sessionData);
        
        // Get students in session
        const studentsData = await getStudentsBySessionId(sessionData.id);
        setStudents(studentsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setError('Could not connect to the game. Please try again.');
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    interval = window.setInterval(fetchData, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [gameCode]);
  
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
          <p className="text-gray-600">Connecting to game session...</p>
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
              Could not connect to the game session
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
  
  if (!gameSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle>Game Not Found</CardTitle>
            <CardDescription>
              The game session could not be found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please check the game code and try again.</p>
              <Button onClick={() => window.location.reload()}>
                Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Waiting Room</CardTitle>
          <CardDescription>
            Game Code: <span className="font-medium text-[#3A7AFE]">{gameCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {gameSession.status === 'in_progress' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-medium">The game is starting!</p>
                <p className="text-green-600 text-sm">You will be redirected shortly...</p>
              </div>
            ) : (
              <div className="bg-[#EEF4FF] rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-[#3A7AFE] mx-auto mb-2" />
                <p className="text-gray-700">Waiting for the teacher to start the game...</p>
              </div>
            )}
            
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