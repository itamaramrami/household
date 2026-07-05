const BASE_URL = 'http://localhost:5001/api/friends';

interface FriendRequestData {
 recipientEmail: string;
}

interface FriendRequest {
 _id: string;
 sender: {
   name: string;
   email: string;
 };
}

const getToken = () => localStorage.getItem('token');

export const sendFriendRequest = async (data: FriendRequestData) => {
 const token = getToken();
 if (!token) return null;

 try {
   const response = await fetch(`${BASE_URL}/request`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     credentials: 'include', 
     body: JSON.stringify(data),
   });

   if (!response.ok) {
     if (response.status === 401) return null;
     throw new Error('Network response was not ok');
   }

   return await response.json();
 } catch (error) {
   console.error('Error sending friend request:', error);
   throw error; // נעביר את השגיאה הלאה כדי שנוכל לטפל בה בקומפוננטה
  }
};

export const getFriendRequests = async (): Promise<FriendRequest[]> => {
 const token = getToken();
 if (!token) return [];

 try {
   const response = await fetch(`${BASE_URL}/requests`, {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
   });

   if (!response.ok) {
     if (response.status === 401) return [];
     throw new Error('Network response was not ok');
   }

   const result = await response.json();
   return result.requests || [];
 } catch (error) {
   console.error('Error getting friend requests:', error);
   return [];
 }
};

export const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
 const token = getToken();
 if (!token) return false;

 try {
   const response = await fetch(`${BASE_URL}/approve`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify({ requestId }),
   });

   if (!response.ok) {
     if (response.status === 401) return false;
     throw new Error('Network response was not ok');
   }

   return true;
 } catch (error) {
   console.error('Error accepting friend request:', error);
   return false;
 }
};

export const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
 const token = getToken();
 if (!token) return false;

 try {
   const response = await fetch(`${BASE_URL}/reject`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     body: JSON.stringify({ requestId }),
   });

   if (!response.ok) {
     if (response.status === 401) return false;
     throw new Error('Network response was not ok');
   }

   return true;
 } catch (error) {
   console.error('Error rejecting friend request:', error);
   return false;
 }
};