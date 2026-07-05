
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/House/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('קוד לא תקין, אנא נסה שוב');
      }

      const responseData = await response.json();
      console.log('Verification successful:', responseData);
      showAlert('האימות בוצע בהצלחה! מעביר אותך לדף הבית...', 'success');
      
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (error: any) {
      showAlert(error.message || 'אירעה שגיאה באימות', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">אימות מייל</h2>
          <p className="text-gray-600">הזן את הקוד שנשלח לכתובת המייל שלך</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                id="code"
                value={code}
                onChange={handleCodeChange}
                required
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono 
                          border-2 border-gray-300 rounded-lg 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          transition-all"
                placeholder="000000"
              />
              <label 
                htmlFor="code" 
                className="absolute -top-6 right-0 text-sm font-medium text-gray-700"
              >
                קוד אימות
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className={`w-full py-3 px-4 ${
              loading || code.length !== 6
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]'
            } text-white rounded-lg font-medium transition-all duration-200`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                מאמת...
              </div>
            ) : (
              'אמת קוד'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <button 
              type="button"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              לא קיבלת קוד? שלח שוב
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
