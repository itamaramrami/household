import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction
} from '../../api/transactionsAPI';

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

  // ✅ FIX: useCallback כדי למנוע re-render loop
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      setError('שגיאה בטעינת העסקאות');
    } finally {
      setLoading(false);
    }
  }, []);

  // טעינה ראשונית
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // interval נקי
  useEffect(() => {
    const interval = setInterval(() => {
      loadTransactions();
      updateFinancialData();
    }, 300000);

    return () => clearInterval(interval);
  }, [loadTransactions, updateFinancialData]);

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
              setEditingTransaction({
                _id: '',
                type: 'income',
                amount: 0,
                description: '',
                date: getCurrentDate()
              });
              setIsModalOpen(true);
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            ➕ עסקה חדשה
          </button>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center bg-white rounded-lg shadow p-4 mb-6">
          <span>טוען...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6">
          ❌ {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full">

          <thead className="bg-gray-50">
            <tr>
              <th>סוג</th>
              <th>סכום</th>
              <th>תיאור</th>
              <th>תאריך</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>

                <td>
                  {transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}
                </td>

                <td>
                  ₪{transaction.amount.toLocaleString()}
                </td>

                <td>{transaction.description}</td>

                <td>
                  {new Date(transaction.date).toLocaleDateString('he-IL')}
                </td>

                <td>
                  <button onClick={() => {
                    setEditingTransaction(transaction);
                    setIsModalOpen(true);
                  }}>
                    ✏️
                  </button>

                  <button onClick={() => handleDelete(transaction._id)}>
                    🗑️
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl">

            <form onSubmit={handleSubmit}>

              <select
                value={editingTransaction?.type}
                onChange={(e) =>
                  setEditingTransaction(prev =>
                    prev ? { ...prev, type: e.target.value } : prev
                  )
                }
              >
                <option value="income">הכנסה</option>
                <option value="expense">הוצאה</option>
              </select>

              <input
                value={editingTransaction?.amount || ''}
                onChange={(e) =>
                  setEditingTransaction(prev =>
                    prev ? { ...prev, amount: Number(e.target.value) } : prev
                  )
                }
                placeholder="סכום"
              />

              <input
                value={editingTransaction?.description || ''}
                onChange={(e) =>
                  setEditingTransaction(prev =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                placeholder="תיאור"
              />

              <input
                type="date"
                value={editingTransaction?.date || getCurrentDate()}
                onChange={(e) =>
                  setEditingTransaction(prev =>
                    prev ? { ...prev, date: e.target.value } : prev
                  )
                }
              />

              <button type="submit">
                {editingTransaction?._id ? 'עדכן' : 'הוסף'}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionsTable;