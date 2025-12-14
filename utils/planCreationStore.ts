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

    updateTask: (index: number, updatedTask: TaskDraft) => {
        if (index >= 0 && index < tasks.length) {
            tasks = tasks.map((t, i) => (i === index ? updatedTask : t));
            notifyListeners();
        }
    },

    removeTask: (index: number) => {
        tasks = tasks.filter((_, i) => i !== index);
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
