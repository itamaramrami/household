import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {useAuth} from './context/AuthContext'
interface LogoutProps {
  className?: string;
}

const Logout: React.FC<LogoutProps> = ({ className }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);


    try {
      logout();

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/House/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // הוספת טוקן לבקשה
        },
        credentials: 'include' // הוספת credentials
      });

      if (response.ok) {
        console.log('Logged out successfully');
        // ניקוי כל המידע מה-localStorage
        localStorage.clear();
        // ניווט לדף הבית
        navigate('/', { replace: true }); // שימוש ב-replace למניעת חזרה אחורה
      } else {
        console.error('Failed to log out');
        // במקרה של שגיאה, עדיין ננקה את ה-localStorage ונעביר לדף הבית
        localStorage.clear();
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error:', error);
      // גם במקרה של שגיאת רשת, ננקה ונעביר לדף הבית
      localStorage.clear();
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };


  return (
    <button 
      onClick={handleLogout} 
      className={className}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'מתנתק...' : 'התנתקות'}
    </button>
  );
};

export default Logout;
