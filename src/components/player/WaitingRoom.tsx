/**
 * Waiting Room component for Ether Excel
 * Student-facing component for waiting to join the game
 */
import React, { useEffect, useState, useRef } from 'react';
import { Clock, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { getAllStudents } from '../../services/database';
import { Student, GameSession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

const WaitingRoom: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const { gameState, setGameState } = useAppContext();
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  
  // Poll for updates
  useEffect(() => {
    let interval: number;
    
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
    
    // Set up polling
    interval = window.setInterval(fetchData, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle game state changes
  useEffect(() => {
    if (gameState.status === 'countdown') {
      // Start countdown
      startCountdown();
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

  // Main waiting room
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