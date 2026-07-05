import React, { useState, useEffect } from 'react';
import { fetchFixedPayments, addFixedPayment, editFixedPayment, deleteFixedPayment } from '../../api/Fixed';
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

  useEffect(() => {
    loadFixedPayments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadFixedPayments();
      updateFinancialData();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const loadFixedPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchFixedPayments();
      setFixedPayments(data);
    } catch (error) {
      setError('שגיאה בטעינת התשלומים הקבועים');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-blue-100">סה"כ תשלומים חודשיים: ₪{getTotalFixedPayments().toLocaleString()}</p>
          </div>
          <button
            onClick={() => {
              setEditingFixedPayment({ _id: '', amount: 0, description: '', date: getCurrentDate() });
              setIsModalOpen(true);
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg 
             hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <span className="text-xl">⏰</span>
            <span>הוספת תשלום קבוע</span>
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
          <div className="flex items-center">
            <div className="flex-shrink-0">❌</div>
            <div className="mr-3">{error}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fixedPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-red-600">
                      ₪{payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isValidDate(payment.date)
                      ? new Date(payment.date).toLocaleDateString('he-IL')
                      : 'תאריך לא תקין'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingFixedPayment(payment);
                          setIsModalOpen(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 text-xl"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(payment._id)}
                        className="text-red-600 hover:text-red-900 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingFixedPayment?._id ? 'עריכת תשלום קבוע' : 'תשלום קבוע חדש'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingFixedPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ❌
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סכום</label>
                  <input
                    type="text"
                    value={editingFixedPayment?.amount || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                        setEditingFixedPayment(prev =>
                          prev ? { ...prev, amount: value === '' ? 0 : parseFloat(value) } : prev
                        );
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="הזן סכום"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                  <input
                    type="text"
                    value={editingFixedPayment?.description}
                    onChange={e => setEditingFixedPayment(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך חיוב</label>
                  <input
                    type="date"
                    value={editingFixedPayment?.date || getCurrentDate()}
                    onChange={e => setEditingFixedPayment(prev => prev ? { ...prev, date: e.target.value } : prev)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg
                     hover:bg-blue-700 transition-colors"
                  >
                    {editingFixedPayment?._id ? 'עדכן' : 'הוסף'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingFixedPayment(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg
                     hover:bg-gray-200 transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedPaymentsTable;