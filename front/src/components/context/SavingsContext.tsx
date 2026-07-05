// components/context/SavingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SavingsData {
  totalSavings: number;
  monthlySavings: number;
}

interface SavingsContextProps {
  savingsData: SavingsData;
  updateSavingsData: () => Promise<void>;
  isLoading: boolean;
}

const SavingsContext = createContext<SavingsContextProps | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [savingsData, setSavingsData] = useState<SavingsData>({
    totalSavings: 0,
    monthlySavings: 0
  });

  const fetchSavingsData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/savings/total-savings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch savings data');
      }

      const data = await response.json();
      setSavingsData(data);
    } catch (error) {
      console.error('Error fetching savings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSavingsData = async () => {
    if (isLoggedIn) {
      await fetchSavingsData();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoggedIn) {
      fetchSavingsData();
      interval = setInterval(fetchSavingsData, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoggedIn]);

  return (
    <SavingsContext.Provider value={{ 
      savingsData, 
      updateSavingsData, 
      isLoading 
    }}>
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavingsContext = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavingsContext must be used within a SavingsProvider');
  }
  return context;
};