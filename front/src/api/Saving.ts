import { Saving } from "../interfaces/SavingModel";

const API_URL = 'http://localhost:5001/api/savings';
const getToken = () => localStorage.getItem('token');

export const fetchSavings = async (): Promise<Saving[]> => {
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
   console.error('Error fetching savings:', error);
   return [];
 }
};

export const addSaving = async (saving: Omit<Saving, '_id'>): Promise<Saving | null> => {
 const token = getToken();
 if (!token) return null;

 try {
   const response = await fetch(`${API_URL}/add`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify(saving),
   });

   if (!response.ok) {
     if (response.status === 401) return null;
     throw new Error('Network response was not ok');
   }

   return await response.json();
 } catch (error) {
   console.error('Error adding saving:', error);
   return null;
 }
};

export const editSaving = async (saving: Saving): Promise<Saving | null> => {
 if (!saving._id) {
   console.error('Saving ID is undefined');
   return null;
 }

 const token = getToken();
 if (!token) return null;

 try {
   const response = await fetch(`${API_URL}/${saving._id}`, {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify(saving),
   });

   if (!response.ok) {
     if (response.status === 401) return null;
     throw new Error('Network response was not ok');
   }

   return await response.json();
 } catch (error) {
   console.error('Error editing saving:', error);
   return null;
 }
};

export const deleteSaving = async (savingId: string): Promise<boolean> => {
 const token = getToken();
 if (!token) return false;

 try {
   const response = await fetch(`${API_URL}/${savingId}`, {
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
   console.error('Error deleting saving:', error);
   return false;
 }
};