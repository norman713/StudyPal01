import { TaskDraft } from "@/api/planApi";

let tasks: TaskDraft[] = [];

// Subscribers to notify when tasks change
const listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((l) => l());
};

export const planCreationStore = {
  getTasks: () => [...tasks],

  addTask: (task: TaskDraft) => {
    tasks = [...tasks, task];
    notifyListeners();
  },

  // ❌ REMOVE index
  updateTask: (tempId: string, updatedTask: TaskDraft) => {
    tasks = tasks.map((t) => (t.tempId === tempId ? updatedTask : t));
    notifyListeners();
  },

  // ❌ REMOVE index
  removeTask: (tempId: string) => {
    tasks = tasks.filter((t) => t.tempId !== tempId);
    notifyListeners();
  },

  clearTasks: () => {
    tasks = [];
    notifyListeners();
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },
};
