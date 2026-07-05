import { FixedPayment } from "../interfaces/FixedModel";

const API_URL = 'http://localhost:5001/api/fixedPayments';
const getToken = () => localStorage.getItem('token');

export const fetchFixedPayments = async (): Promise<FixedPayment[]> => {
  const token = getToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return [];
      }
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fixed payments:', error);
    return [];
  }
};

export const addFixedPayment = async (
  fixedPayment: Omit<FixedPayment, '_id'>
): Promise<FixedPayment | null> => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(fixedPayment),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding fixed payment:', error);
    return null;
  }
};

export const editFixedPayment = async (
  fixedPayment: FixedPayment
): Promise<FixedPayment | null> => {
  if (!fixedPayment._id) {
    console.error('FixedPayment ID is undefined');
    return null;
  }

  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/${fixedPayment._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(fixedPayment),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error editing fixed payment:', error);
    return null;
  }
};

export const deleteFixedPayment = async (fixedPaymentId: string): Promise<boolean> => {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/${fixedPaymentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return false;
      }
      throw new Error('Network response was not ok');
    }

    return true;
  } catch (error) {
    console.error('Error deleting fixed payment:', error);
    return false;
  }
};