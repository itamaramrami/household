const BASE_URL = 'http://localhost:5001/api/task';

const getToken = () => localStorage.getItem('token');

export interface Friend {
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  status: string;
  assignee: {     // שינוי מ-string ל-object
    name: string;
    email: string;
  } | null;
  priority: string;
  userId: string;
  taskGroupId: string;
}
export interface TaskResponse {
  tasks: Task[];
  friends: Friend[];
}

export const fetchAllTasks = async (): Promise<TaskResponse> => {
 const token = getToken();
 if (!token) return { tasks: [], friends: [] };

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
    if (response.status === 401) return { tasks: [], friends: [] };
    throw new Error('Failed to fetch tasks');
   }

   return await response.json();
 } catch (error) {
   console.error('Error fetching tasks:', error);
   return { tasks: [], friends: [] };
  }
};

export const addTask = async (
 title: string,
 description?: string,
 dueDate?: string,
 status?: string,
 assignee?: string,
 priority: string = 'Medium'  // הוספנו ברירת מחדל לעדיפות


): Promise<Task | null> => {
 const token = getToken();
 if (!token) return null;

 try {
  console.log('Sending task data:', {  // לוג לדיבוג
    title,
    description,
    dueDate,
    status,
    assignee,
    priority
  });
   const response = await fetch(`${BASE_URL}/add`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     credentials: 'include',
     body: JSON.stringify({
       title,
       ...(description && { description }),
       ...(dueDate && { dueDate }),
       ...(status && { status }),
       ...(assignee && { assignee }),
       ...(priority && { priority })

     })
   });

   if (!response.ok) {
    const errorData = await response.json();
    console.error('Server error:', errorData);  // לוג לדיבוג
    throw new Error(errorData.message || 'Failed to add task');
  }

   return await response.json();
 } catch (error) {
   console.error('Error adding task:', error);
   return null;
 }
};

export const updateTask = async (
 taskId: string,
 title: string,
 description?: string,
 dueDate?: string,
 status?: string,
 assignee?: string,
 priority?: string

): Promise<Task | null> => {
 const token = getToken();
 if (!token) return null;

 try {
   const response = await fetch(`${BASE_URL}/${taskId}`, {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     credentials: 'include',
     body: JSON.stringify({
       title,
       ...(description && { description }),
       ...(dueDate && { dueDate }),
       ...(status && { status }),
       ...(assignee && { assignee }),
       ...(priority && { priority })

     })
   });

   if (!response.ok) {
     if (response.status === 401) return null;
     throw new Error('Failed to update task');
   }

   return await response.json();
 } catch (error) {
   console.error('Error updating task:', error);
   return null;
 }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
 const token = getToken();
 if (!token) return false;

 try {
   const response = await fetch(`${BASE_URL}/${taskId}`, {
     method: 'DELETE',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`,
     },
     credentials: 'include',
   });

   if (!response.ok) {
     if (response.status === 401) return false;
     throw new Error('Failed to delete task');
   }

   return true;
 } catch (error) {
   console.error('Error deleting task:', error);
   return false;
 }
};