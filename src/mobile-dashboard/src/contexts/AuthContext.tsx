'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  privilege: string;
  organization: string;
  long_organization: string;
  profilePicture: string | null;
  country: string;
  phoneNumber: string | null;
  interests: string[];
  interestsDescription: string | null;
  verified: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('airqo_token');
    const storedUser = localStorage.getItem('airqo_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 'https://api.airqo.net'}/api/v2/users/loginUser`, {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_AIRQO_MOBILE_TOKEN || '',
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userName: email, 
          password: password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // AirQo API returns only _id and token
      const fullToken = data.token;
      const userId = data._id;
      
      setToken(fullToken);
      // Create a minimal user object since we only get _id and token
      const userData = {
        _id: userId,
        email: email, // We'll use the email they entered
        firstName: '',
        lastName: '',
        userName: '',
        privilege: '',
        organization: '',
        long_organization: '',
        profilePicture: null,
        country: '',
        phoneNumber: null,
        interests: [],
        interestsDescription: null,
        verified: true,
        isActive: true
      };
      
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('airqo_token', fullToken);
      localStorage.setItem('airqo_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('airqo_token');
    localStorage.removeItem('airqo_user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
