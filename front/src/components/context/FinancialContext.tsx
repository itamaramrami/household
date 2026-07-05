import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalFixedPayments: number;
}

interface FinancialContextProps {
  financialData: FinancialData;
  updateFinancialData: () => Promise<void>;  // הוספת הפונקציה לממשק
  isLoading: boolean;  // הוספת מצב טעינה
}

const FinancialContext = createContext<FinancialContextProps | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    totalFixedPayments: 0,
  });

  const fetchFinancialData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);  // מתחיל טעינה

      const [incomeRes, expensesRes, savingsRes, fixedPaymentsRes] = await Promise.all([
        fetch('http://localhost:5001/api/transaction/total-income', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:5001/api/transaction/total-expenses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:5001/api/savings/total-savings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:5001/api/fixedPayments/total-fixed-payments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (!incomeRes.ok || !expensesRes.ok || !savingsRes.ok || !fixedPaymentsRes.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const [incomeData, expensesData, savingsData, fixedPaymentsData] = await Promise.all([
        incomeRes.json(),
        expensesRes.json(),
        savingsRes.json(),
        fixedPaymentsRes.json(),
      ]);

      setFinancialData({
        totalIncome: incomeData.totalIncome,
        totalExpenses: expensesData.totalExpenses,
        totalSavings: savingsData.totalSavings,
        totalFixedPayments: fixedPaymentsData.totalFixedPayments,
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialData({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        totalFixedPayments: 0,
      });
    } finally {
      setIsLoading(false);  // מסיים טעינה
    }
  };

  const updateFinancialData = async () => {
    if (isLoggedIn) {
      await fetchFinancialData();
    }
  };

  // רענון אוטומטי כל 30 שניות
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoggedIn) {
      fetchFinancialData();
      interval = setInterval(fetchFinancialData, 30000);
    } else {
      setFinancialData({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        totalFixedPayments: 0,
      });
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoggedIn]);

  return (
    <FinancialContext.Provider value={{ 
      financialData, 
      updateFinancialData,  // חשוף את הפונקציה
      isLoading 
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancialContext = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialContext must be used within a FinancialProvider');
  }
  return context;
};