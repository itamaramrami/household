// components/context/FixedPaymentsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FixedPaymentsData {
  totalFixedPayments: number;
  monthlyFixedPayments: number;
}

interface FixedPaymentsContextProps {
  fixedPaymentsData: FixedPaymentsData;
  updateFixedPaymentsData: () => Promise<void>;
  isLoading: boolean;
}

const FixedPaymentsContext = createContext<FixedPaymentsContextProps | undefined>(undefined);

export const FixedPaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fixedPaymentsData, setFixedPaymentsData] = useState<FixedPaymentsData>({
    totalFixedPayments: 0,
    monthlyFixedPayments: 0
  });

  const fetchFixedPaymentsData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/fixedPayments/total-fixed-payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fixed payments data');
      }

      const data = await response.json();
      setFixedPaymentsData(data);
    } catch (error) {
      console.error('Error fetching fixed payments data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFixedPaymentsData = async () => {
    if (isLoggedIn) {
      await fetchFixedPaymentsData();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoggedIn) {
      fetchFixedPaymentsData();
      interval = setInterval(fetchFixedPaymentsData, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoggedIn]);

  return (
    <FixedPaymentsContext.Provider value={{ 
      fixedPaymentsData, 
      updateFixedPaymentsData, 
      isLoading 
    }}>
      {children}
    </FixedPaymentsContext.Provider>
  );
};

export const useFixedPaymentsContext = () => {
  const context = useContext(FixedPaymentsContext);
  if (!context) {
    throw new Error('useFixedPaymentsContext must be used within a FixedPaymentsProvider');
  }
  return context;
};