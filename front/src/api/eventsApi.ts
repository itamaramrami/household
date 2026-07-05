import { Event } from '../interfaces/Event';

const API_URL = 'http://localhost:5001/api/events';

const getToken = () => localStorage.getItem('token');

export const fetchEvents = async (): Promise<Event[]> => {
  const token = getToken();
  if (!token) {
    return [];  // החזרת מערך ריק אם אין טוקן
  }

  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return [];  // החזרת מערך ריק במקרה של Unauthorized
      }
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const addEvent = async (event: Event): Promise<Event | null> => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

export const updateEvent = async (event: Event): Promise<Event | null> => {
  if (!event._id) {
    throw new Error('Event ID is undefined');
  }

  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/${event._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return false;
      }
      throw new Error('Network response was not ok');
    }

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};