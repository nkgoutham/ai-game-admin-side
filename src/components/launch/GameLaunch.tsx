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
  ArrowLeft,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { createGameSession, getOrCreateDefaultGameSession, updateGameSessionStatus } from '../../services/database';

const GameLaunch: React.FC = () => {
  const { 
    currentChapter, 
    topics, 
    resetState, 
    setView, 
    gameSession, 
    setGameSession,
    gameState
  } = useAppContext();
  
  const [launchState, setLaunchState] = useState<'ready' | 'starting' | 'active'>('ready');
  const [copied, setCopied] = useState(false);
  const [timeLimit, setTimeLimit] = useState(5);
  
  // Initialize or fetch game session on component mount
  useEffect(() => {
    if (!gameSession) {
      initializeGameSession();
    } else if (gameSession.status === 'in_progress') {
      setLaunchState('active');
    }
  }, []);

  // Initialize a game session
  const initializeGameSession = async () => {
    try {
      const session = await getOrCreateDefaultGameSession(
        currentChapter?.id, 
        'Anonymous Teacher'
      );
      setGameSession(session);
      
      if (session.status === 'in_progress') {
        setLaunchState('active');
      }
    } catch (error) {
      console.error('Error initializing game session:', error);
    }
  };
  
  const handleCopyCode = () => {
    if (!gameSession) return;
    
    navigator.clipboard.writeText(gameSession.game_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLaunch = async () => {
    setLaunchState('starting');
    
    try {
      // Create a game session in the database if needed
      let session = gameSession;
      if (!session) {
        session = await createGameSession(currentChapter?.id || '', 'Anonymous Teacher');
        setGameSession(session);
      }
      
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
  
  // Handle start game
  const handleStartGame = async () => {
    if (!gameSession) {
      alert('No active game session found');
      return;
    }
    
    try {
      // Update game session status to in_progress
      await updateGameSessionStatus(gameSession.id, 'in_progress');
      
      // Set launch state to active if not already
      if (launchState !== 'active') {
        setLaunchState('active');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
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
                
                {gameSession && (
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
                          {gameSession.game_code}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Students can join using this code at play.etherexcel.edu
                    </p>
                  </div>
                )}
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
                    Your game is now running. Students can join with code {gameSession?.game_code}.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Student Session</h3>
                  <Button 
                    onClick={handleViewLobby}
                    icon={<Eye className="w-4 h-4 mr-1" />}
                    size="sm"
                  >
                    View Lobby
                  </Button>
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
                    disabled={gameSession?.status === 'in_progress'}
                  >
                    {gameSession?.status === 'in_progress' ? 'Game Started' : 'Start Game Now'}
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