/**
 * Login Page component for Ether Excel
 * Provides teacher authentication functionality
 */
import React, { useState } from 'react';
import { BookOpen, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, authState } = useAuth();
  
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
            AI-Powered Classroom Game - Teacher Portal
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="inline-block w-5 h-5 text-[#3A7AFE]" />
              <h3 className="text-lg font-semibold">Teacher Login</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Show error if any */}
            {authState.error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {authState.error}
              </div>
            )}
            
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
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter>
            <p className="text-xs text-gray-500 text-center w-full">
              Sign in to manage your games and review student progress
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;