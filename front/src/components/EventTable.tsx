
import React, { useEffect, useState, useCallback } from 'react';
import EventForm from './EventForm';
import { Event } from '../interfaces/Event';
import { fetchEvents, addEvent, updateEvent, deleteEvent } from '../api/eventsApi';



const EventTable =  () => {

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<{message: string; type: 'success' | 'error'} | null>(null);
 

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadEvents = useCallback(async () => {
  try {
    const data = await fetchEvents();
    setEvents(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    showAlert('שגיאה בטעינת האירועים', 'error');
  }
}, []);
useEffect(() => {
  loadEvents();
}, [loadEvents]);


  const handleAddEvent = async (event: Event) => {
    try {
      const newEvent = await addEvent(event);
      if (newEvent) {
        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        showAlert('האירוע נוסף בהצלחה', 'success');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      showAlert('שגיאה בהוספת האירוע', 'error');
    }
   };

  const handleUpdateEvent = async (event: Event) => {
    try {
      const updatedEvent = await updateEvent(event);
      if (updatedEvent) {
      setEvents(events.map((e) => (e._id === event._id ? updatedEvent : e)));
      setSelectedEvent(undefined);
      setIsModalOpen(false);
      showAlert('האירוע עודכן בהצלחה', 'success');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showAlert('שגיאה בעדכון האירוע', 'error');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter((e) => e._id !== eventId));
      showAlert('האירוע נמחק בהצלחה', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showAlert('שגיאה במחיקת האירוע', 'error');
    }
  };

  const openAddEventModal = () => {
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getUpcomingWeekEvents = () => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date() && eventDate <= oneWeekFromNow;
    });
  };

  const upcomingWeekEvents = getUpcomingWeekEvents();

  const filteredEvents = events.filter(event => 
    event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const otherEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return eventDate > oneWeekFromNow;
  });
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0'); // מוסיף אפס לפני מספרי ימים בודדים
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // חודשים מתחילים מ-0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const addToGoogleCalendar = async (event: Event) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showAlert('יש להתחבר מחדש', 'error');
            return;
        }

        const response = await fetch('http://localhost:5001/api/events/add-to-calendar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ eventData: event })
        });

        const data = await response.json();
        console.log('Calendar Response:', data);
        
        if (data.success) {
            showAlert('האירוע נוסף ליומן בהצלחה', 'success');
            if (data.eventLink) {
                window.open(data.eventLink, '_blank');
            }
        } else {
            throw new Error(data.message || 'שגיאה בהוספת האירוע ליומן');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert(
            error instanceof Error ? error.message : 'שגיאה בהוספת האירוע ליומן',
            'error'
        );
    }
};
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => window.location.href = '/Home'}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
            >
              חזרה לדף הבית
            </button>
            <h1 className="text-3xl font-bold text-white">רשימת אירועים</h1>
          </div>
        </div>
      </div>

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

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <input
            type="text"
            placeholder="חיפוש אירוע..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <button
            onClick={openAddEventModal}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            הוספת אירוע
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* This Week's Events Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">אירועים השבוע</h2>
          {upcomingWeekEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingWeekEvents.map((event) => (
                <div key={event._id} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
                  <h3 className="font-semibold text-lg text-blue-600">{event.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{formatDate(event.date)}</p>
                  <p className="text-gray-600 mt-2">{event.description}</p>
                  <div className="mt-4 flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => addToGoogleCalendar(event)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                    >
                      🗓️ הוסף ליומן
                    </button>
                    <button
                      onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                      className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id || '')}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      מחיקה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500">אין לך אירועים השבוע</p>
            </div>
          )}
        </div>

       {/* Divider */}
       <div className="border-t border-gray-200 my-8"></div>

{/* All Other Events Section */}
<div>
  <h2 className="text-xl font-bold text-gray-900 mb-4">כל האירועים</h2>
  {otherEvents.length > 0 ? (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">כותרת</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {otherEvents.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                <td className="px-6 py-4">{event.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(event.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => addToGoogleCalendar(event)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                    >
                      🗓️ הוסף ליומן
                    </button>
                    <button
                      onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                      className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id || '')}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      מחיקה
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
      <p className="text-gray-500">אין אירועים עתידיים נוספים</p>
    </div>
  )}
</div>
</div>

{/* Modal */}
{isModalOpen && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
  <div className="relative w-full max-w-2xl">
    <button
      onClick={closeModal}
      className="absolute -top-12 left-0 text-white hover:text-gray-200 transition-colors"
    >
      סגור ×
    </button>
    <EventForm
      onAddEvent={handleAddEvent}
      onUpdateEvent={handleUpdateEvent}
      event={selectedEvent}
    />
  </div>
</div>
)}
</div>
);
};

export default EventTable;
