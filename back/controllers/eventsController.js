import { OAuth2Client } from 'google-auth-library';

import Event from '../models/Event.js';
import User from '../models/user.model.js';
import eventSchema from "../models/Event.js"
import mongoose from 'mongoose';
import { google } from 'googleapis';


export const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await eventSchema.find({ userId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.massage || "Failed to get items" })
  }
}

export const addEvent = async (req, res) => {
  const { title, date, description } = req.body;
  try {
    const userId = req.user.id;

    // יצירת מזהה ייחודי לקבוצה של האירועים
    const eventGroupId = new mongoose.Types.ObjectId();

    // יצירת האירוע עבור המשתמש הראשי
    const newEvent = await Event.create({
      userId,
      title,
      date,
      description,
      eventGroupId
    });

    const friendEmails = req.user.friends;

    if (!friendEmails || friendEmails.length === 0) {
      return res.status(201).json(newEvent);
    }

    // מציאת החברים לפי המיילים
    const friends = await User.find({ email: { $in: friendEmails } });

    // הכנת האירועים עבור החברים עם אותו eventGroupId
    const eventToAdd = friends.map(friend => ({
      userId: friend._id,
      title,
      date,
      description,
      eventGroupId
    }));

    if (eventToAdd.length > 0) {
      await Event.insertMany(eventToAdd);
      console.log("Items added for friends successfully!");
    }

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Error adding event' });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    // מציאת האירוע עבור המשתמש הראשי
    const event = await Event.findOne({ _id: id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' });
    }

    // מחיקת האירוע עבור המשתמש הראשי
    await Event.deleteOne({ _id: id, userId: req.user.id });

    // מציאת המשתמש הראשי
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // מציאת החברים של המשתמש
    const friends = await User.find({ email: { $in: user.friends } });
    const friendIds = friends.map(friend => friend._id);

    // מחיקת האירועים של החברים עם אותו eventGroupId
    await Event.deleteMany({ userId: { $in: friendIds }, eventGroupId: event.eventGroupId });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  try {
    // מציאת האירוע עבור המשתמש הראשי
    const event = await Event.findOne({ _id: id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or access denied' });
    }

    // עדכון האירוע עבור המשתמש הראשי
    event.title = title;
    event.date = date;
    event.description = description;
    await event.save();

    // מציאת החברים של המשתמש הראשי
    const user = await User.findById(req.user.id);
    const friendEmails = user.friends;
    if (friendEmails && friendEmails.length > 0) {
      const friends = await User.find({ email: { $in: friendEmails } });
      const friendIds = friends.map(friend => friend._id);

      // עדכון האירועים עבור החברים של המשתמש הראשי לפי eventGroupId
      await Event.updateMany(
        { userId: { $in: friendIds }, eventGroupId: event.eventGroupId },
        { title, date, description }
      );
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const refreshGoogleToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.refreshToken) {
      console.log('No refresh token found for user');
      return null;
    }

    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // עדכון הטוקן החדש
    user.accessToken = credentials.access_token;
    if (credentials.refresh_token) {
      user.refreshToken = credentials.refresh_token;
    }
    
    await user.save();
    return credentials.access_token;

  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// פונקציה להוספת אירוע ליומן גוגל
export const addToGoogleCalendar = async (req, res) => {
  try {
      const { eventData } = req.body;
      const user = await User.findById(req.user.id);

      if (!user?.accessToken) {
          return res.status(401).json({
              success: false,
              message: "נדרשת התחברות מחדש עם Google"
          });
      }

      const oauth2Client = new OAuth2Client(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'http://localhost:3000'
      );

      oauth2Client.setCredentials({
          access_token: user.accessToken,
          refresh_token: user.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // הוספת שעה לתאריך
      const eventDate = new Date(eventData.date);
      const eventEndDate = new Date(eventData.date);
      eventEndDate.setHours(eventEndDate.getHours() + 1); // אירוע של שעה אחת

      const event = {
          summary: eventData.title,
          description: eventData.description,
          start: {
              dateTime: eventDate.toISOString(),
              timeZone: 'Asia/Jerusalem',
          },
          end: {
              dateTime: eventEndDate.toISOString(),
              timeZone: 'Asia/Jerusalem',
          },
      };

      try {
          const response = await calendar.events.insert({
              calendarId: 'primary',
              resource: event,
          });

          res.status(200).json({
              success: true,
              message: 'האירוע נוסף ליומן בהצלחה',
              eventLink: response.data.htmlLink
          });
      } catch (calendarError) {
          if (calendarError.response?.status === 401) {
              const newAccessToken = await refreshGoogleToken(user._id);
              if (newAccessToken) {
                  oauth2Client.setCredentials({ access_token: newAccessToken });
                  const response = await calendar.events.insert({
                      calendarId: 'primary',
                      resource: event,
                  });

                  res.status(200).json({
                      success: true,
                      message: 'האירוע נוסף ליומן בהצלחה',
                      eventLink: response.data.htmlLink
                  });
              } else {
                  throw new Error('נכשל חידוש הטוקן');
              }
          } else {
              throw calendarError;
          }
      }
  } catch (error) {
      console.error('Error adding event to calendar:', error);
      res.status(500).json({
          success: false,
          message: 'שגיאה בהוספת האירוע ליומן',
          error: error.message
      });
  }
};