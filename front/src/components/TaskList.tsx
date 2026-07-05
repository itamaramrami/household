import React, { useEffect, useState } from "react";
import { Task, TaskResponse, fetchAllTasks, addTask, updateTask, deleteTask } from "../api/taskApi";

interface Friend {
  name: string;
  email: string;
}

interface PriorityOrder {
  Low: number;
  Medium: number;
  High: number;
  Urgent: number;
}

const TaskList: React.FC = () => {
  // State variables
  const [tasks, setTasks] = useState<Task[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]); // Default to current date
  const [status, setStatus] = useState<string>("Open");
  const [assignee, setAssignee] = useState<string>("");
  const [priority, setPriority] = useState<string>("Medium");
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [filterType, setFilterType] = useState<'status' | 'priority' | 'assignee' | 'none'>('none');
  const [filterValue, setFilterValue] = useState<string>('all');
  
  // Sorting and filtering states
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'assignee' | 'none'>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date().toISOString().split('T')[0]); // Reset to current date
    setStatus("Open");
    setAssignee("");
    setPriority("Medium");
    setEditingTaskId(null);
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'Open': return 'פתוח';
      case 'In Progress': return 'בתהליך';
      case 'Completed': return 'הושלם';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-yellow-100 text-yellow-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'Low': return 'נמוכה';
      case 'Medium': return 'בינונית';
      case 'High': return 'גבוהה';
      case 'Urgent': return 'דחופה';
      default: return priority;
    }
  };

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    if (sortBy === 'none') return tasksToSort;

    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;

        case 'priority': {
          const priorityOrder: PriorityOrder = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
          const priorityA = priorityOrder[a.priority as keyof PriorityOrder] || 2;
          const priorityB = priorityOrder[b.priority as keyof PriorityOrder] || 2;
          return sortDirection === 'asc' ? priorityA - priorityB : priorityB - priorityA;
        }

        case 'assignee':
          const assigneeA = a.assignee?.name || '';
          const assigneeB = b.assignee?.name || '';
          return sortDirection === 'asc' 
            ? assigneeA.localeCompare(assigneeB) 
            : assigneeB.localeCompare(assigneeA);

        default:
          return 0;
      }
    });
  };

  const filteredAndSortedTasks = () => {
    let filtered = tasks;
    
    switch (filterType) {
      case 'status':
        if (filterValue !== 'all') {
          filtered = tasks.filter(task => task.status === filterValue);
        }
        break;
      
      case 'priority':
        if (filterValue !== 'all') {
          filtered = tasks.filter(task => task.priority === filterValue);
        }
        break;
      
      case 'assignee':
        if (filterValue !== 'all') {
          filtered = tasks.filter(task => task.assignee?.email === filterValue);
        }
        break;
    }
    
    return sortTasks(filtered);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: TaskResponse = await fetchAllTasks();
      setTasks(response.tasks);
      setFriends(response.friends);
    } catch (error) {
      setError("שגיאה בטעינת רשימת המשימות.");
      showAlert("שגיאה בטעינת המשימות", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!title.trim()) {
      showAlert("אנא הכנס שם משימה", "error");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const newTask = await addTask(
        title,
        description,
        dueDate || undefined,
        status,
        assignee || undefined,
        priority
      );
      if (newTask) {
        setTasks([...tasks, newTask]);
        resetForm();
        showAlert("המשימה נוספה בהצלחה", "success");
      }
    } catch (error) {
      showAlert("שגיאה בהוספת משימה", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId || !title.trim()) {
      showAlert("אנא מלא את כל השדות", "error");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await updateTask(
        editingTaskId,
        title,
        description,
        dueDate || undefined,
        status,
        assignee || undefined,
        priority
      );
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(task =>
          task._id === editingTaskId ? updatedTask : task
        ));
        resetForm();
        showAlert("המשימה עודכנה בהצלחה", "success");
      }
    } catch (error) {
      showAlert("שגיאה בעדכון משימה", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      try {
        setLoading(true);
        setError(null);
        await deleteTask(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
        showAlert("המשימה נמחקה בהצלחה", "success");
      } catch (error) {
        showAlert("שגיאה במחיקת משימה", "error");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // The entire render method remains exactly the same as in the original code
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => window.location.href = '/Home'}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
            >
              חזרה לדף הבית
            </button>
            <h1 className="text-3xl font-bold text-white">רשימת משימות</h1>
          </div>
        </div>
      </div>
  
      {/* Alert */}
      {alert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 
          ${alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{alert.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}
  
      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">❌</div>
              <div className="mr-3">{error}</div>
            </div>
          </div>
        </div>
      )}
  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Task Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שם המשימה"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
  
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="תיאור המשימה"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mb-4 h-24 resize-none"
          />
  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="Open">פתוח</option>
              <option value="In Progress">בתהליך</option>
              <option value="Completed">הושלם</option>
            </select>
  
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="Low">נמוכה</option>
              <option value="Medium">בינונית</option>
              <option value="High">גבוהה</option>
              <option value="Urgent">דחופה</option>
            </select>
  
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">ללא משתמש מוקצה</option>
              {friends.map((friend) => (
                <option key={friend.email} value={friend.email}>
                  {friend.name}
                </option>
              ))}
            </select>
  
            <button
              onClick={editingTaskId ? handleUpdateTask : handleAddTask}
              className={`px-6 py-3 text-white font-medium rounded-lg transition-all
                ${editingTaskId 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'} 
                hover:shadow-lg transform hover:scale-[1.02]`}
            >
              {editingTaskId ? 'עדכן משימה' : 'הוסף משימה'}
            </button>
          </div>
        </div>
  
        {/* Filter and Sort Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium">סינון לפי:</span>
            
            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'status' | 'priority' | 'assignee' | 'none');
                setFilterValue('all');
              }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="none">ללא סינון</option>
              <option value="status">סטטוס</option>
              <option value="priority">דחיפות</option>
              <option value="assignee">משתמש מוקצה</option>
            </select>
  
            {/* Filter Value - Status */}
            {filterType === 'status' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="Open">פתוח</option>
                <option value="In Progress">בתהליך</option>
                <option value="Completed">הושלם</option>
              </select>
            )}
  
            {/* Filter Value - Priority */}
            {filterType === 'priority' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">כל העדיפויות</option>
                <option value="Low">נמוכה</option>
                <option value="Medium">בינונית</option>
                <option value="High">גבוהה</option>
                <option value="Urgent">דחופה</option>
              </select>
            )}
  
            {/* Filter Value - Assignee */}
            {filterType === 'assignee' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">כל המשתמשים</option>
                {friends.map((friend) => (
                  <option key={friend.email} value={friend.email}>
                    {friend.name}
                  </option>
                ))}
              </select>
            )}
  
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="font-medium">מיון:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'assignee' | 'none')}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="none">ללא מיון</option>
                <option value="date">תאריך</option>
                <option value="priority">דחיפות</option>
                <option value="assignee">משתמש מוקצה</option>
              </select>
  
              {sortBy !== 'none' && (
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sortDirection === 'asc' ? '⬆️' : '⬇️'}
                </button>
              )}
            </div>
          </div>
        </div>
  
        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <p className="mt-2 text-gray-600">טוען משימות...</p>
            </div>
          ) : filteredAndSortedTasks().length > 0 ? (
            filteredAndSortedTasks().map((task) => (
              <div key={task._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                      
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </span>
  
                      {task.dueDate && (
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                          {formatDate(task.dueDate)}
                        </span>
                      )}
  
                      {task.assignee && (
                        <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 flex items-center gap-1">
                          <span role="img" aria-label="user icon">👤</span>
                          <span>{task.assignee.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTitle(task.title);
                        setDescription(task.description || "");
                        setDueDate(formatDate(task.dueDate));
                        setStatus(task.status);
                        setPriority(task.priority);
                        setAssignee(task.assignee?.email || "");
                        setEditingTaskId(task._id);
                      }}
                      className="px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      ערוך
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-gray-500">אין משימות להצגה</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;