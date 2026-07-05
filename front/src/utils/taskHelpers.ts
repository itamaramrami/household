import {Task} from '../api/taskApi'
// פונקציה לפילטור משימות להיום
export const getTodayTasks = (tasks: Task[]): Task[] => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // תחילת היום
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // סוף היום

    const todayStart = new Date(startOfDay);
    const todayEnd = new Date(endOfDay);

    return tasks.filter(task => {
        // בדוק אם dueDate קיים ומחולל תאריך תקני
        if (!task.dueDate) return false; // אם אין dueDate, תחזור false
        const taskDate = new Date(task.dueDate);
        
        // אם taskDate לא תקני, תחזור false
        if (isNaN(taskDate.getTime())) return false;

        return taskDate >= todayStart && taskDate <= todayEnd;
    });
};

// פונקציה לפילטור משימות לשבוע הנוכחי
export const getThisWeekTasks = (tasks: Task[]): Task[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // תחילת השבוע (ראשון)

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 6 - today.getDay()); // סוף השבוע (שבת)

    return tasks.filter(task => {
        // בדוק אם dueDate קיים ומחולל תאריך תקני
        if (!task.dueDate) return false; // אם אין dueDate, תחזור false
        const taskDate = new Date(task.dueDate);
        
        // אם taskDate לא תקני, תחזור false
        if (isNaN(taskDate.getTime())) return false;

        return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
};



