import axiosInstance from "./axiosConfig";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface PersonalTask {
    id: string;
    content: string;
    priority: TaskPriority;
    startDate: string;
    dueDate: string;
    taskType: "PERSONAL" | "TEAM"| "CLONED";
    completedAt: string | null;
}

const taskApi = {
    /**
     * Get dates that have tasks
     * GET /api/tasks/dates?month={month}&year={year}
     */
    async getTaskDates(month: number, year: number): Promise<string[]> {
        const url = `/tasks/dates`;
        const params = { month, year };
        const data: string[] = await axiosInstance.get(url, { params });
        return data;
    },

    /**
     * Get tasks for a specific date
     * GET /api/tasks?date={YYYY-MM-DD}
     */
    async getTasksByDate(date: string): Promise<PersonalTask[]> {
        const url = `/tasks`;
        const params = { date };
        const data: PersonalTask[] = await axiosInstance.get(url, { params });
        return data;
    },

    /**
     * Search tasks
     * POST /api/tasks/search
     */
    async searchTasks(request: SearchTaskRequest): Promise<SearchTaskResponse> {
        const url = `/tasks/search`;
        const data: SearchTaskResponse = await axiosInstance.post(url, request);
        return data;
    },
};

export interface SearchTaskRequest {
    keyword: string;
    fromDate: string; // "yyyy-MM-dd HH:mm:ss"
    toDate: string;   // "yyyy-MM-dd HH:mm:ss"
    size: number;
}

export interface SearchTaskResponse {
    tasks: PersonalTask[];
    total: number;
    nextCursor: string | null;
}

export default taskApi;
