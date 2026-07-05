import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchFixedPayments,
  addFixedPayment,
  editFixedPayment,
  deleteFixedPayment
} from '../../api/Fixed';

import { FixedPayment } from '../../interfaces/FixedModel';
import { useFinancialContext } from '../context/FinancialContext';

const FixedPaymentsTable: React.FC = () => {
  const { updateFinancialData } = useFinancialContext();

  const [fixedPayments, setFixedPayments] = useState<FixedPayment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFixedPayment, setEditingFixedPayment] = useState<FixedPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // ✅ FIX: stabilize function
  const loadFixedPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFixedPayments();
      setFixedPayments(data);
    } catch (error) {
      setError('שגיאה בטעינת התשלומים הקבועים');
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    loadFixedPayments();
  }, [loadFixedPayments]);

  // interval
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      loadFixedPayments();
      updateFinancialData();
    }, 300000);

    return () => clearInterval(interval);
  }, [loadFixedPayments, updateFinancialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixedPayment) return;

    try {
      setLoading(true);

      if (editingFixedPayment._id) {
        await editFixedPayment(editingFixedPayment);
      } else {
        await addFixedPayment(editingFixedPayment);
      }

      await loadFixedPayments();
      await updateFinancialData();

      setIsModalOpen(false);
      setEditingFixedPayment(null);

    } catch (error) {
      setError('שגיאה בשמירת התשלום הקבוע');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק תשלום קבוע זה?')) return;

    try {
      setLoading(true);

      await deleteFixedPayment(id);
      await loadFixedPayments();
      await updateFinancialData();

    } catch (error) {
      setError('שגיאה במחיקת התשלום הקבוע');
    } finally {
      setLoading(false);
    }
  };

  const isValidDate = (date: any): boolean => {
    return !isNaN(new Date(date).getTime());
  };

  const getTotalFixedPayments = () =>
    fixedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4">

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center">

          <div className="text-white">
            <h1 className="text-2xl font-bold mb-1">תשלומים קבועים</h1>
            <p className="text-blue-100">
              סה"כ תשלומים חודשיים: ₪{getTotalFixedPayments().toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => {
              setEditingFixedPayment({
                _id: '',
                amount: 0,
                description: '',
                date: getCurrentDate()
              });
              setIsModalOpen(true);
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
          >
            ⏰ הוספת תשלום
          </button>

        </div>
      </div>

      {loading && <div className="p-4 text-center">טוען...</div>}

      {error && <div className="p-4 text-red-600">❌ {error}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-gray-50">
            <tr>
              <th>סכום</th>
              <th>תיאור</th>
              <th>תאריך</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {fixedPayments.map((payment) => (
              <tr key={payment._id}>

                <td className="text-red-600">
                  ₪{payment.amount.toLocaleString()}
                </td>

                <td>{payment.description}</td>

                <td>
                  {isValidDate(payment.date)
                    ? new Date(payment.date).toLocaleDateString('he-IL')
                    : 'תאריך לא תקין'}
                </td>

                <td>
                  <button onClick={() => {
                    setEditingFixedPayment(payment);
                    setIsModalOpen(true);
                  }}>
                    ✏️
                  </button>

                  <button onClick={() => handleDelete(payment._id)}>
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

          <form className="bg-white p-6 rounded-xl" onSubmit={handleSubmit}>

            <input
              type="text"
              value={editingFixedPayment?.amount || ''}
              onChange={(e) =>
                setEditingFixedPayment(prev =>
                  prev ? { ...prev, amount: Number(e.target.value) } : prev
                )
              }
              placeholder="סכום"
            />

            <input
              value={editingFixedPayment?.description || ''}
              onChange={(e) =>
                setEditingFixedPayment(prev =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              placeholder="תיאור"
            />

            <input
              type="date"
              value={editingFixedPayment?.date || getCurrentDate()}
              onChange={(e) =>
                setEditingFixedPayment(prev =>
                  prev ? { ...prev, date: e.target.value } : prev
                )
              }
            />

            <button type="submit">
              {editingFixedPayment?._id ? 'עדכן' : 'הוסף'}
            </button>

          </form>

        </div>
      )}

    </div>
  );
};

export default FixedPaymentsTable;