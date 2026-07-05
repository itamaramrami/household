import GoogleLoginButton from './GoogleLoginButton';  // הוסף את זה בראש הקובץ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpFormData } from '../modules/LoginDate';


const SignUpPage = () => {
  const [data, setData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {

      const response = await fetch('http://localhost:5001/api/House/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('ההרשמה נכשלה, אנא נסה שוב');
      }

      const responseData = await response.json();
      console.log('signUp successful:', responseData);
      showAlert('נרשמת בהצלחה! מעביר אותך לאימות מייל...', 'success');

      
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);

    } catch (error: any) {
      showAlert(error.message || 'אירעה שגיאה בהרשמה', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 
            ${alert.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {alert.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">הרשמה</h2>
          <p className="text-gray-600">צור חשבון חדש כדי להתחיל לנהל את משק הבית שלך</p>
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
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              שם מלא
            </label>
            <input
              type="text"
              id="name"
              value={data.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="הכנס את שמך המלא"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              value={data.email}
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
              value={data.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="בחר סיסמה חזקה"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 ${loading
              ? 'bg-gray-400'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
              } text-white rounded-lg font-medium transition-all duration-200`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                נרשם...
              </div>
            ) : (
              'הרשם'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium mr-2"
            >
              התחבר כאן
            </button>
            <span>?</span>
            <span className="text-gray-500">כבר יש לך חשבון</span>

          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
