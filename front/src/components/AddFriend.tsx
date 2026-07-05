import React, { useState } from 'react';
import { makeAuthenticatedRequest } from '../utils/api';
import { handleAuthError } from '../utils/authInterceptor';

interface AddFriendProps {
  onSuccess?: () => void;
}

interface MessageState {
  text: string;
  type: 'success' | 'error' | 'info';
}

const AddFriend: React.FC<AddFriendProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  const handleAddFriend = async () => {
    if (!email) {
      setMessage({ text: 'יש להזין כתובת דואר אלקטרוני', type: 'error' });
      return;
    }
  
    // בדיקת תקינות כתובת המייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: 'יש להזין כתובת דואר אלקטרוני תקינה', type: 'error' });
      return;
    }
  
    setLoading(true);
    setMessage(null);
  
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5001/api/House/friends/add', {
        method: 'POST',
        body: JSON.stringify({ friendEmail: email })
      });
  
      setMessage({ 
        text: 'בקשת החברות נשלחה בהצלחה', 
        type: 'success' 
      });
      setEmail('');
      
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (error) {
      handleAuthError(error);
      setMessage({
        text: error instanceof Error ? error.message : 'שגיאה בשליחת בקשת החברות',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAddFriend();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">הוספת חבר חדש</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          כתובת דואר אלקטרוני
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="הכנס את המייל של החבר"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          message.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleAddFriend}
        disabled={loading}
        className={`w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg
          hover:bg-blue-700 transition-colors duration-200
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          flex items-center justify-center`}
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
            שולח בקשה...
          </>
        ) : (
          'שלח בקשת חברות'
        )}
      </button>
    </div>
  );
};

export default AddFriend;