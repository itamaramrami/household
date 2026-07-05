import GoogleLoginButton from './GoogleLoginButton'; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { LoginFormData } from '../modules/LoginDate';
import { CodeResponse } from '@react-oauth/google';




interface GoogleTokenResponse {
  access_token: string;
  code?: string;
  scope: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
    friends: string[];
  };
}

const LoginPage = () => {

  const [Data, setData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:5001/api/House/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Data),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בהתחברות');
      }
  
   
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse: CodeResponse) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5001/api/House/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code: codeResponse.code,
            redirect_uri: 'http://localhost:3000'
          }),
        });

        const data = await response.json();
        console.log("Server Response:", data);

        if (!response.ok) {
          throw new Error(data.message || 'שגיאה בהתחברות עם Google');
        }

        if (data.success && data.token) {
          // שמירת הטוקן בפורמט הנכון
          localStorage.setItem('token', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));

          // בדיקה שהטוקן נשמר
          console.log("Saved token:", localStorage.getItem('token'));

          if (data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/home');
          }
          

        } else {
          throw new Error(data.message || 'חסרים נתונים בתגובה מהשרת');
        }
        window.location.reload();

      } catch (error) {
        console.error('Google login error:', error);
        setError(error instanceof Error ? error.message : 'שגיאה בהתחברות');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('שגיאה בהתחברות עם Google');
    },
    flow: 'auth-code',
    scope: 'email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ברוכים הבאים</h2>
          <p className="text-gray-600">התחבר כדי לנהל את משק הבית שלך</p>
        </div>

        
       {/* Google Login Button */}
<div className="mb-6">
  <GoogleLoginButton />
</div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">או</span>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              value={Data.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="הכנס את האימייל שלך"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              value={Data.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="הכנס את הסיסמה שלך"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 ${
              loading 
                ? 'bg-gray-400' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
            } text-white rounded-lg font-medium transition-all duration-200`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                מתחבר...
              </div>
            ) : (
              'התחבר'
            )}
          </button>

          {/* Links */}
          <div className="flex flex-col items-center space-y-2 text-sm">
            <div className="flex items-center space-x-4 space-x-reverse">
            <button
                type="button"
                onClick={() => navigate('/signUp')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >

                הרשם עכשיו
              </button>
            <span className="text-gray-500"> ?אין לך חשבון</span>

              
            </div>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              שכחתי סיסמה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
