const BASE_URL = 'http://localhost:5001/api/shopping';
interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  isPurchased: boolean;
  itemGroupId: string | null;
 }

const getToken = () => localStorage.getItem('token');

export const fetchShoppingItems = async (): Promise<ShoppingItem[]> => {
 const token = getToken();
 if (!token) return [];

 try {
   const response = await fetch(BASE_URL, {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     credentials: 'include',
   });

   if (!response.ok) {
     if (response.status === 401) return [];
     throw new Error('Failed to fetch shopping items');
   }

   return await response.json();
 } catch (error) {
   console.error('Error fetching shopping items:', error);
   return [];
 }
};

export const addShoppingItem = async (name: string, quantity: number, category: string, unit: string) => {
  try {
    const response = await fetch(`${BASE_URL}/addItem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
      body: JSON.stringify({ 
        name, 
        quantity, 
        category: category || 'כללי',
        unit: unit || 'יחידות' 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add item');
    }
    return response.json();
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

export const updateShoppingItem = async (
  itemId: string, 
  name: string, 
  quantity: number, 
  category: string, 
  unit: string,
  isPurchased: boolean
) => {
  try {
    const response = await fetch(`${BASE_URL}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
      body: JSON.stringify({ 
        name, 
        quantity, 
        category: category || 'כללי',
        unit: unit || 'יחידות',
        isPurchased 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteShoppingItem = async (itemId: string): Promise<boolean> => {
 const token = getToken();
 if (!token) return false;

 try {
   const response = await fetch(`${BASE_URL}/${itemId}`, {
     method: 'DELETE',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     credentials: 'include',
   });

   if (!response.ok) {
     if (response.status === 401) return false;
     throw new Error('Failed to delete shopping item');
   }

   return true;
 } catch (error) {
   console.error('Error deleting shopping item:', error);
   return false;
 }
};