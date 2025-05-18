/**
 * Game Launch component for Ether Excel
 * Handles creating and managing a game session
 */
import React, { useState } from 'react';
import { 
  Rocket, 
  Play, 
  Users, 
  Clock, 
  CheckCircle, 
  Share2,
  ArrowLeft,
  Eye,
  QrCode
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { updateGameSessionStatus } from '../../services/database';

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
  const [timeLimit, setTimeLimit] = useState(5);
  const [gameCode, setGameCode] = useState('ABCD12'); // Placeholder game code
  
  // Handle creating/launching the game session
  const handleLaunch = async () => {
    setLaunchState('starting');
    
    try {
      // Simulate processing time
      setTimeout(() => {
        setLaunchState('active');
        if (gameSession) {
          // Update game code from session if available
          setGameCode(gameSession.game_code);
        }
      }, 2000);
    } catch (error) {
      console.error('Error launching game:', error);
      setLaunchState('ready');
    }
  };
  
  // Handle starting the actual game
  const handleStartGame = async () => {
    try {
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
      
      // Navigate to the game monitoring view
      setView('lobby');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
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
                
                {/* Game Access Code Section */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium mb-3">Game Access Info</h3>
                  
                  <p className="text-xs text-gray-500 mb-4">
                    Students will access the game using the separate student portal URL 
                    and the game code shown below.
                  </p>
                  
                  <div className="bg-gray-100 p-3 rounded-lg text-center mb-3">
                    <p className="text-xs text-gray-500 mb-1">Student Portal URL</p>
                    <p className="font-medium text-[#3A7AFE]">
                      https://student-game-portal.example.com
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-[#EEF4FF] p-3 rounded-lg flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-[#3A7AFE] mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Game Code</p>
                        <p className="font-mono text-lg font-bold tracking-wider text-[#3A7AFE]">
                          {gameSession?.game_code || gameCode}
                        </p>
                      </div>
                    </div>
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
                  View Game Board
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
                    Your game is now ready to start. Share the game code with your students.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Game Access Info</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#EEF4FF] p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Student Portal URL</p>
                    <div className="bg-white p-3 rounded-md flex items-center justify-between">
                      <p className="text-sm text-[#3A7AFE] truncate">https://student-game-portal.example.com</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#EEF4FF] p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Game Code</p>
                    <div className="bg-white p-3 rounded-md flex items-center justify-between">
                      <p className="text-xl font-mono font-bold tracking-wider text-[#3A7AFE]">{gameSession?.game_code || gameCode}</p>
                    </div>
                  </div>
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