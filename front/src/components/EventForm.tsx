import React, { useState, useEffect } from 'react';
import { Event, EventFormProps } from '../interfaces/Event';

const EventForm: React.FC<EventFormProps> = ({ onAddEvent, onUpdateEvent, event }) => {
  const [formState, setFormState] = useState<Event>({
    title: "",
    date: new Date().toISOString().split('T')[0], // Default to current date
    description: "",
  });

  useEffect(() => {
    if (event) {
      setFormState(event);
    } else {
      setFormState({ 
        title: "", 
        date: new Date().toISOString().split('T')[0], // Reset to current date
        description: "" 
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState._id) {
      await onUpdateEvent(formState);
    } else {
      await onAddEvent(formState);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-2xl w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
        {/* כותרת הטופס */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          {formState._id ? "עריכת אירוע" : "הוספת אירוע חדש"}
        </h2>

        {/* שדה כותרת */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            כותרת
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formState.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
            placeholder="הכנס כותרת לאירוע"
            required
          />
        </div>

        {/* שדה תאריך */}
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            תאריך
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
            required
          />
        </div>

        {/* שדה תיאור */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            תיאור
          </label>
          <textarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none hover:border-blue-400"
            placeholder="הוסף תיאור לאירוע"
          />
        </div>

        {/* כפתור שליחה */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg 
                   hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
        >
          {formState._id ? "עדכן אירוע" : "צור אירוע"}
        </button>
      </form>
    </div>
  );
};

export default EventForm;