import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddFriend from "../components/AddFriend";
import { getUserIdFromToken } from "../utils/utils";
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../api/friendRequests";
import { useFinancialContext } from "../components/context/FinancialContext";
import { useEvents } from "../components/context/EventsContext";
import { useShopping } from "../components/context/ShoppingContext";
import { useTasks } from "../components/context/TasksContext";

interface FriendRequest {
  _id: string;
  sender: {
    name: string;
    email: string;
  };
}

interface Friend {
  name: string;
  email: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { itemCount } = useShopping();
  const { financialData } = useFinancialContext();
  const { getUpcomingWeekEventsCount } = useEvents();
  const { tasksCount, loadTasks } = useTasks();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/House/friends/details', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setFriends(data.friends);
        } else {
          setFriends([]);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        setFriends([]);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const user = getUserIdFromToken();
    if (user) {
      setUserName(user.name);
      setUserId(user.userId);
      console.log(`User ${user.name}`);
      console.log(`User ${user.userId}`);
    }
  }, []);

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const loadFriendRequests = async () => {
    try {
      const requests = await getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
      showAlert("בקשת החברות אושרה בהצלחה", "success");
      window.location.reload();
    } catch (error) {
      showAlert("שגיאה באישור הבקשה", "error");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
      showAlert("בקשת החברות נדחתה", "success");
    } catch (error) {
      showAlert("שגיאה בדחיית הבקשה", "error");
    }
  };

  const menuItems = [
    {
      path: "/shopping-list",
      label: "קניות",
      icon: "🛒",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-800",
      stats: { count: itemCount, text: "פריטים ברשימה" },
    },
    {
      path: "/tasks",
      label: "משימות",
      icon: "✓",
      color: "bg-green-100 hover:bg-green-200 text-green-800",
      stats: { count: tasksCount, text: "משימות ברשימה" },
    },
    {
      path: "/events",
      label: "אירועים",
      icon: "📅",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-800",
      stats: {
        count: `${getUpcomingWeekEventsCount()}`,
        text: "אירועים קרובים",
      },
    },
    {
      path: "/dashboard",
      label: "הוצאות והכנסות",
      icon: "💰",
      color: "bg-orange-100 hover:bg-orange-200 text-orange-800",
      stats: { count: `₪${financialData.totalIncome}`, text: "הכנסות החודש" },
    },
  ];

  const quickStats = [
    {
      label: "הוצאות החודש",
      value: financialData.totalExpenses,
      trend: "+12%",
      icon: "📈",
    },
    {
      label: "חברים פעילים",
      value: Array.isArray(friends) ? friends.length : 0,
      trend: "חדש",
      icon: "👥",
    },
    
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex flex-col">
      {alert && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
            alert.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{alert.type === "success" ? "✓" : "⚠"}</span>
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}
  
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">ניהול משק בית</h1>
              <p className="text-blue-100">
                <p dir="rtl">ברוך הבא{userName ? `, ${userName}` : ""}!</p>נהל את
                משק הבית שלך בקלות ויעילות
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsRequestsOpen(!isRequestsOpen)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors relative"
                >
                  <span className="text-2xl">🔔</span>
                  {friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
                {isRequestsOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold">בקשות חברות</h3>
                      {friendRequests.length === 0 && (
                        <p className="text-gray-500 text-sm mt-2">
                          אין בקשות חברות ממתינות
                        </p>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {friendRequests.map((request) => (
                        <div
                          key={request._id}
                          className="p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {request.sender.name.charAt(0)}
                            </div>
                            <div className="mr-3 flex-1">
                              <div className="font-medium">{request.sender.name}</div>
                              <div className="text-sm text-gray-500">
                                {request.sender.email}
                              </div>
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
                      ))}
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
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg hover:scale-105 hover:bg-red-600 transition-all duration-300 ease-in-out flex items-center space-x-2 space-x-reverse"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">התנתקות</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
  <div className="flex justify-center">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              onClick={() => {
                if (stat.label === "חברים פעילים") {
                  setShowFriendsModal(true);
                }
              }}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl mb-1">{stat.icon}</span>
                <span className="text-sm text-gray-500">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`${item.color} rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse mb-4">
                  <div className="bg-white p-3 rounded-full shadow-sm text-2xl">
                    {item.icon}
                  </div>
                  <span className="text-lg font-medium">{item.label}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-2xl font-bold">{item.stats.count}</p>
                  <p className="text-sm text-gray-600">{item.stats.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  
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
              {userId && <AddFriend />}
            </div>
          </div>
        </div>
      )}
  
      {showFriendsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowFriendsModal(false)}
          />
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">חברים פעילים</h2>
                <button
                  onClick={() => setShowFriendsModal(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.isArray(friends) && friends.length > 0 ? (
                  friends.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-xl">
                            {friend.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{friend.name}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">אין חברים פעילים כרגע</p>
                    <button
                      onClick={() => {
                        setShowFriendsModal(false);
                        setShowAddFriendModal(true);
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                      הוסף חברים חדשים
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;