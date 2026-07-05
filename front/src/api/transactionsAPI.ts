import { Transaction } from "../interfaces/TransactionModel";

const API_URL = 'http://localhost:5001/api/transaction';
const getToken = () => localStorage.getItem('token');

export const fetchTransactions = async (): Promise<Transaction[]> => {
 const token = getToken();
 if (!token) return [];

 try {
   const response = await fetch(API_URL, {
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
   });

   if (!response.ok) {
     if (response.status === 401) return [];
     throw new Error('Network response was not ok');
   }

   return await response.json();
 } catch (error) {
   console.error('Error fetching transactions:', error);
   return [];
 }
};

export const addTransaction = async (
 transaction: Omit<Transaction, '_id'>
): Promise<Transaction | null> => {
 const token = getToken();
 if (!token) return null;

 try {
   const response = await fetch(`${API_URL}/add`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify(transaction),
   });

   if (!response.ok) {
     if (response.status === 401) return null;
     throw new Error('Network response was not ok');
   }

   return await response.json();
 } catch (error) {
   console.error('Error adding transaction:', error);
   return null;
 }
};

export const editTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
 if (!transaction._id) {
   console.error('Transaction ID is undefined');
   return null;
 }

 const token = getToken();
 if (!token) return null;

 try {
   const response = await fetch(`${API_URL}/${transaction._id}`, {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify(transaction),
   });

   if (!response.ok) {
     if (response.status === 401) return null;
     throw new Error('Network response was not ok');
   }

   return await response.json();
 } catch (error) {
   console.error('Error editing transaction:', error);
   return null;
 }
};

export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
 const token = getToken();
 if (!token) return false;

 try {
   const response = await fetch(`${API_URL}/${transactionId}`, {
     method: 'DELETE',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
   });

   if (!response.ok) {
     if (response.status === 401) return false;
     throw new Error('Network response was not ok');
   }

   return true;
 } catch (error) {
   console.error('Error deleting transaction:', error);
   return false;
 }
};