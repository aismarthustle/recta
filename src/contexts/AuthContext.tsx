import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, SignInCredentials, User, ChangePasswordData } from '@/types/auth';

interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<boolean>;
  signOut: () => void;
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setState({
            isAuthenticated: true,
            user: data.user,
            loading: false,
            error: null,
          });
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('auth_token');
          setState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('auth_token');
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Authentication verification failed',
        });
      }
    };
    
    checkAuth();
  }, []);

  const signIn = async (credentials: SignInCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: data.error || 'Sign in failed',
        });
        return false;
      }
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      
      setState({
        isAuthenticated: true,
        user: data.user,
        loading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'An unexpected error occurred',
      });
      return false;
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  const changePassword = async (data: ChangePasswordData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Not authenticated' 
        }));
        return false;
      }
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: responseData.error || 'Failed to change password' 
        }));
        return false;
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred' 
      }));
      return false;
    }
  };

  const value = {
    ...state,
    signIn,
    signOut,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
