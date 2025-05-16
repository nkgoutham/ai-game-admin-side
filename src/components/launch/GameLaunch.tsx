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
  Copy, 
  Share2,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { createGameSession } from '../../services/database';

const GameLaunch: React.FC = () => {
  const { currentChapter, topics, resetState, setView } = useAppContext();
  const [gameCode] = useState(generateGameCode());
  const [launchState, setLaunchState] = useState<'ready' | 'starting' | 'active'>('ready');
  const [copied, setCopied] = useState(false);
  const [timeLimit, setTimeLimit] = useState(5);
  const [gameSession, setGameSession] = useState<any>(null);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLaunch = async () => {
    setLaunchState('starting');
    
    try {
      // Create a game session in the database
      const session = await createGameSession(currentChapter?.id || '', 'Anonymous Teacher');
      setGameSession(session);
      
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

  const handleBackToReview = () => {
    setView('review');
  };
  
  // Generate a random 6-character game code
  function generateGameCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit confusing characters
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
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
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Game Access Code</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      icon={copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="bg-[#EEF4FF] px-6 py-3 rounded-lg">
                      <span className="text-2xl font-bold tracking-wider text-[#3A7AFE]">
                        {gameCode}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Students can join using this code at play.etherexcel.edu
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
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
                    Your game is now running. Students can join with code {gameCode}.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Student Session</h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Students Joined</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<UserPlus className="w-4 h-4" />}
                    >
                      Add Student
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-center text-sm text-gray-500">
                            No students have joined yet
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Current Progress</p>
                    <p className="text-sm text-gray-500">Topic 1 of {topics.length}</p>
                  </div>
                  
                  <div className="bg-[#EEF4FF] p-3 rounded-lg">
                    <h4 className="text-sm font-medium">{topics[0]?.topic_name}</h4>
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>Time remaining: {timeLimit}:00</span>
                      <span>{topics[0] ? '0/0 students answered' : 'Waiting to start'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#FFC857] h-2 rounded-full" style={{width: '0%'}}></div>
                    </div>
                  </div>
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