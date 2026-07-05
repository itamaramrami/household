import React, { useState, useEffect } from 'react';
import { fetchTransactions, addTransaction, editTransaction, deleteTransaction } from '../../api/transactionsAPI';
import { useFinancialContext } from '../context/FinancialContext';
import { Transaction } from '../../interfaces/TransactionModel';

const TransactionsTable: React.FC = () => {
  const { updateFinancialData } = useFinancialContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      loadTransactions();
      updateFinancialData();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      setError('שגיאה בטעינת העסקאות');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      setLoading(true);
      if (editingTransaction._id) {
        await editTransaction(editingTransaction);
      } else {
        await addTransaction(editingTransaction);
      }
      await loadTransactions();
      await updateFinancialData();
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      setError('שגיאה בשמירת העסקה');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    

    try {
      setLoading(true);
      await deleteTransaction(id);
      await loadTransactions();
      await updateFinancialData();
    } catch (error) {
      setError('שגיאה במחיקת העסקה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-2xl font-bold mb-1">עסקאות</h1>
            <p className="text-blue-100">ניהול העסקאות שלך</p>
          </div>
          <button
            onClick={() => {
              setEditingTransaction({ _id: '', type: 'income', amount: 0, description: '', date: getCurrentDate() });
              setIsModalOpen(true);
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg 
              hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            <span>עסקה חדשה</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
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

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סוג</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'}`}>
                      {transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium
                    ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    ₪{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setIsModalOpen(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 text-xl"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingTransaction?._id ? 'עריכת עסקה' : 'עסקה חדשה'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ❌
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג עסקה</label>
                  <select
                    value={editingTransaction?.type}
                    onChange={e => setEditingTransaction(prev => prev ? { ...prev, type: e.target.value } : prev)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="income">הכנסה</option>
                    <option value="expense">הוצאה</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סכום</label>
                  <input
                    type="text"
                    value={editingTransaction?.amount || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                        setEditingTransaction(prev =>
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
                    value={editingTransaction?.description}
                    onChange={e => setEditingTransaction(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
                  <input
                    type="date"
                    value={editingTransaction?.date || getCurrentDate()}
                    onChange={e => setEditingTransaction(prev => prev ? { ...prev, date: e.target.value } : prev)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg
                      hover:bg-blue-700 transition-colors"
                  >
                    {editingTransaction?._id ? 'עדכן' : 'הוסף'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTransaction(null);
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

export default TransactionsTable;