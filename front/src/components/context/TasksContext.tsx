import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchAllTasks, TaskResponse, Task } from "../../api/taskApi"; // נניח שיש פונקציה לשליפת משימות

interface TasksContextProps {
  tasks: Task[];
  tasksCount: number;
  loadTasks: () => void;
}

const TasksContext = createContext<TasksContextProps | undefined>(undefined);

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = async () => {
    try {
      const response: TaskResponse = await fetchAllTasks(); // פונקציה שמביאה את רשימת המשימות מהשרת
      setTasks(response.tasks); // שימוש בשדה tasks מהתוצאה
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, tasksCount: tasks.length, loadTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
