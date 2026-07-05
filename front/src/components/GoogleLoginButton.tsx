import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        console.log("Google Response:", codeResponse);
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5001/api/House/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
             code: codeResponse.code, 
             redirect_uri: 'http://localhost:3000' // חשוב שזה יהיה זהה להגדרה בשרת
            })
        });

        const data = await response.json();
        console.log("Server Response:", data);

        if (!response.ok) {
          throw new Error(data.message || 'שגיאה בהתחברות עם Google');
        }

        if (data.success && data.token) {
          const cleanToken = data.token.replace(/^Bearer\s+/i, '');
    localStorage.setItem('token', cleanToken);
    localStorage.setItem('userData', JSON.stringify(data.user));

    console.log("Saved token:", localStorage.getItem('token'));


          // ניווט
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
    scope: 'email profile openid https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    ux_mode: 'popup',  
    redirect_uri: 'http://localhost:3000' 


  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className={`w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium
        hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {loading ? 'מתחבר...' : 'Google התחבר עם'}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </button>
  );
};

export default GoogleLoginButton;