/**
 * Login Page component for Ether Excel
 * Provides options for teacher login and student joining
 */
import React, { useState } from 'react';
import { BookOpen, User, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'player'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, joinAsPlayer, authState } = useAuth();
  
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      alert('Please enter your name');
      return;
    }
    
    if (!gameCode) {
      alert('Please enter a game code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await joinAsPlayer(name, gameCode);
    } catch (error) {
      console.error('Join error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpen className="w-16 h-16 text-[#3A7AFE]" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ether Excel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI-Powered Classroom Game
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex space-x-1">
              <button 
                className={`flex-1 py-2 text-center rounded-t-lg transition-colors ${
                  activeTab === 'teacher' 
                    ? 'bg-[#3A7AFE] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('teacher')}
              >
                <User className="inline-block w-4 h-4 mr-2" />
                Teacher
              </button>
              <button 
                className={`flex-1 py-2 text-center rounded-t-lg transition-colors ${
                  activeTab === 'player' 
                    ? 'bg-[#3A7AFE] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('player')}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Student
              </button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Show error if any */}
            {authState.error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {authState.error}
              </div>
            )}
            
            {activeTab === 'teacher' ? (
              <form onSubmit={handleTeacherLogin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3A7AFE] focus:border-[#3A7AFE] sm:text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3A7AFE] focus:border-[#3A7AFE] sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStudentJoin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3A7AFE] focus:border-[#3A7AFE] sm:text-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gameCode" className="block text-sm font-medium text-gray-700">
                      Game Code
                    </label>
                    <input
                      id="gameCode"
                      name="gameCode"
                      type="text"
                      required
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3A7AFE] focus:border-[#3A7AFE] sm:text-sm"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Join Game
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter>
            <p className="text-xs text-gray-500 text-center w-full">
              {activeTab === 'teacher' 
                ? 'Sign in to manage your games and review student progress'
                : 'Enter your name and the game code to join a session'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;