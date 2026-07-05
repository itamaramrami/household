import React, { useState, useEffect, useCallback } from 'react';
import { fetchSavings, addSaving, editSaving, deleteSaving } from '../../api/Saving';
import { Saving } from '../../interfaces/SavingModel';
import { useFinancialContext } from '../context/FinancialContext';

const SavingsTable: React.FC = () => {
  const { updateFinancialData } = useFinancialContext();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // ✅ FIX: useCallback כדי למנוע re-render loop
  const loadSavings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSavings();
      setSavings(data);
    } catch (error) {
      setError('שגיאה בטעינת החסכונות');
    } finally {
      setLoading(false);
    }
  }, []);

  // טעינה ראשונית
  useEffect(() => {
    loadSavings();
  }, [loadSavings]);

  // interval נקי עם cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      loadSavings();
      updateFinancialData();
    }, 300000);

    return () => clearInterval(interval);
  }, [loadSavings, updateFinancialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSaving) return;

    try {
      setLoading(true);

      if (editingSaving._id) {
        await editSaving(editingSaving);
      } else {
        await addSaving(editingSaving);
      }

      await loadSavings();
      await updateFinancialData();

      setIsModalOpen(false);
      setEditingSaving(null);
    } catch (error) {
      setError('שגיאה בשמירת החיסכון');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק חיסכון זה?')) return;

    try {
      setLoading(true);

      await deleteSaving(id);
      await loadSavings();
      await updateFinancialData();
    } catch (error) {
      setError('שגיאה במחיקת החיסכון');
    } finally {
      setLoading(false);
    }
  };

  const isValidDate = (date: any): boolean => {
    return !isNaN(new Date(date).getTime());
  };

  const getTotalSavings = () =>
    savings.reduce((sum, saving) => sum + saving.amount, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4">

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center">

          <div className="text-white">
            <h1 className="text-2xl font-bold mb-1">חסכונות</h1>
            <p className="text-blue-100">
              סה"כ חסכונות: ₪{getTotalSavings().toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSaving({
                _id: '',
                amount: 0,
                description: '',
                date: getCurrentDate()
              });
              setIsModalOpen(true);
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            💰 הוספת חיסכון
          </button>

        </div>
      </div>

      {loading && (
        <div className="text-center bg-white rounded-lg shadow p-4 mb-6">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="mr-2">טוען...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 rounded-lg">
          ❌ {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-gray-50">
            <tr>
              <th>סכום</th>
              <th>תיאור</th>
              <th>תאריך</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {savings.map((saving) => (
              <tr key={saving._id}>
                <td>₪{saving.amount.toLocaleString()}</td>
                <td>{saving.description}</td>
                <td>
                  {isValidDate(saving.date)
                    ? new Date(saving.date).toLocaleDateString('he-IL')
                    : 'תאריך לא תקין'}
                </td>
                <td>
                  <button onClick={() => {
                    setEditingSaving(saving);
                    setIsModalOpen(true);
                  }}>
                    ✏️
                  </button>

                  <button onClick={() => handleDelete(saving._id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl">

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                value={editingSaving?.amount || ''}
                onChange={(e) =>
                  setEditingSaving(prev =>
                    prev ? { ...prev, amount: Number(e.target.value) } : prev
                  )
                }
                placeholder="סכום"
              />

              <input
                type="text"
                value={editingSaving?.description || ''}
                onChange={(e) =>
                  setEditingSaving(prev =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                placeholder="תיאור"
              />

              <input
                type="date"
                value={editingSaving?.date || getCurrentDate()}
                onChange={(e) =>
                  setEditingSaving(prev =>
                    prev ? { ...prev, date: e.target.value } : prev
                  )
                }
              />

              <button type="submit">
                {editingSaving?._id ? 'עדכן' : 'הוסף'}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default SavingsTable;