interface User {
  _id: string;
  name: string;
  email: string;
  lastLogin: string;
}

// שליפת כל המשתמשים
export const fetchAllUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  try {
    const response = await fetch("http://localhost:5001/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return [];
      }
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// מחיקת משתמש לפי ID
export const deleteUserById = async (userId: string): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return false;
      }
      throw new Error("Failed to delete user");
    }

    await response.json();
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// חיפוש משתמשים
export const searchUsers = async (query: string): Promise<User[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`http://localhost:5001/api/admin/users/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return [];
      }
      throw new Error("Failed to search users");
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};