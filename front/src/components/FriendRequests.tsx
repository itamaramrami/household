import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddFriend from '../components/AddFriend';
import { getUserIdFromToken } from '../utils/utils';
import { makeAuthenticatedRequest } from '../utils/api';
import { handleAuthError } from '../utils/authInterceptor';

interface FriendRequest {
  _id: string;
  sender: {
    name?: string; 
    email: string;
  };
}

interface QuickStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
}

const Home: React.FC = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [alert, setAlert] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setFriends(user.friends || []);
    }
  }, []);

  const quickStats: QuickStat[] = [
    {
      title: 'מטלות להיום',
      value: '5',
      icon: '📋',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'פריטים ברשימת קניות',
      value: '12',
      icon: '🛒',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'אירועים קרובים',
      value: '3',
      icon: '📅',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'הוצאות החודש',
      value: '₪2,450',
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-800'
    }
  ];

  const menuItems: MenuItem[] = [
    {
      title: 'רשימת קניות',
      description: 'נהל את רשימת הקניות המשותפת',
      icon: '🛒',
      route: '/shopping-list'
    },
    {
      title: 'אירועים',
      description: 'צפה ונהל את לוח האירועים',
      icon: '📅',
      route: '/events'
    },
    {
      title: 'משימות',
      description: 'נהל את המשימות היומיות',
      icon: '📋',
      route: '/tasks'
    },
    {
      title: 'ניהול תקציב',
      description: 'עקוב אחר הוצאות והכנסות',
      icon: '💰',
      route: '/budget'
    }
  ];

  useEffect(() => {
    const user = getUserIdFromToken();
    if (user) {
      setUserId(user.userId);
      setUserName(user.name);
      loadFriendRequests();
    }
  }, []);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadFriendRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/friends/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Friend requests data:', data);
      setFriendRequests(data?.requests || []);

    } catch (error) {
      console.error('Error loading friend requests:', error);
      setFriendRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await makeAuthenticatedRequest('http://localhost:5001/api/friends/approve', {
        method: 'POST',
        body: JSON.stringify({ requestId }),
        credentials: 'include'
      });
      
      await loadFriendRequests();
      
      showAlert('בקשת החברות אושרה בהצלחה', 'success');
      window.location.reload();
    } catch (error) {
      handleAuthError(error);
      showAlert('שגיאה באישור הבקשה', 'error');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await makeAuthenticatedRequest('http://localhost:5001/api/friends/reject', {
        method: 'POST',
        body: JSON.stringify({ requestId }),
        credentials: 'include'
      });
      
      await loadFriendRequests();
      showAlert('בקשת החברות נדחתה', 'success');
    } catch (error) {
      handleAuthError(error);
      showAlert('שגיאה בדחיית הבקשה', 'error');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      showAlert('שגיאה בהתנתקות', 'error');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      {/* Alert */}
      {alert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 
          ${alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{alert.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}
   
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">ניהול משק בית</h1>
              <p className="text-blue-100">ברוך הבא {userName}! נהל את משק הבית שלך בקלות ויעילות</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Friend Requests Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsRequestsOpen(!isRequestsOpen)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors relative"
                >
                  <span className="text-2xl">🔔</span>
                  {!loading && friendRequests && friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
   
                {isRequestsOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold">בקשות חברות</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                      ) : Array.isArray(friendRequests) && friendRequests.length === 0 ? (
                        <p className="text-gray-500 text-sm p-4">אין בקשות חברות ממתינות</p>
                      ) : Array.isArray(friendRequests) ? (
                        friendRequests.map((request) => (
                          <div 
                            key={request._id}
                            className="p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                          >
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                {request.sender.name?.charAt(0)}
                              </div>
                              <div className="mr-3 flex-1">
                                <div className="font-medium">{request.sender.name}</div>
                                <div className="text-sm text-gray-500">{request.sender.email}</div>
                              </div>
                            </div>
                            <div className="flex space-x-2 space-x-reverse">
                              <button
                                onClick={() => handleAcceptRequest(request._id)}
                                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                אשר
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id)}
                                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                דחה
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm p-4">שגיאה בטעינת בקשות</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
   
              <button
                onClick={() => setShowAddFriendModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-blue-50 transition-all duration-300 ease-in-out flex items-center space-x-2 space-x-reverse"
              >
                <span className="text-xl">👥</span>
                <span className="font-medium">הוספת חבר</span>
              </button>
   
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-red-600 transition-all duration-300 ease-in-out flex items-center space-x-2 space-x-reverse"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">התנתקות</span>
              </button>
            </div>
          </div>
        </div>
      </div>
   
      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-4">{stat.icon}</span>
                <div>
                  <h3 className="text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
   
      {/* Main Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.route)}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
   
      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowAddFriendModal(false)}
          />
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-6 relative">
              <button
                onClick={() => setShowAddFriendModal(false)}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300"
              >
                ×
              </button>
              {userId && <AddFriend onSuccess={() => {
                setShowAddFriendModal(false);
                loadFriendRequests();
              }} />}
            </div>
          </div>
        </div>
      )}
    </div>
   );}
export default Home;