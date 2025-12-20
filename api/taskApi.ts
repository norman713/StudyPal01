import axiosInstance from "./axiosConfig";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface DeletedTask {
  id: string;
  planCode: string;
  content: string;
  startDate: string;   // ISO string
  dueDate: string;     
  deletedAt: string;   
}
export interface GetDeletedTasksResponse {
  tasks: DeletedTask[];
  total: number;
  nextCursor: string | null;
}

export interface TaskAdditionalData {
  planId?: string;
  planCode?: string;
  assigneeId?: string;
  assigneeAvatarUrl?: string;
  assigneeName?: string;
}

export interface PersonalTask {
    id: string;
    content: string;
    priority: TaskPriority;
    startDate: string;
    dueDate: string;
    taskType: "PERSONAL" | "TEAM" | "CLONED";
    taskCode: string;
    completedAt: string | null;
    note?: string;
    additionalData?: TaskAdditionalData;
  deletedAt?: string;
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
 * Get deleted tasks
 * GET /api/tasks/deleted
 */
/**
 * Get deleted tasks
 * GET /api/tasks/deleted
 */
async getDeletedTasks(params: {
  teamId?: string;
  cursor?: string;
  size?: number;
}): Promise<GetDeletedTasksResponse> {
  const url = `/tasks/deleted`;

  const data: GetDeletedTasksResponse = await axiosInstance.get(url, {
    params: {
      size: 10,
      ...params,
    },
  });

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

    /**
     * Create new task
     * POST /api/tasks
     */
    async createTask(payload: CreateTaskRequest): Promise<PersonalTask> {
        const url = `/tasks`;
        const data: PersonalTask = await axiosInstance.post(url, payload);
        return data;
    },

    /**
     * Get task detail generic
     * GET /api/tasks/{id}
     */
    async getTaskDetail(id: string): Promise<PersonalTask> {
        const url = `/tasks/${id}`;
        const data: PersonalTask = await axiosInstance.get(url);
        return data;
    },

    /**
     * Mark task as complete generic
     * PATCH /api/tasks/{id}/complete
     */
    async completeTask(id: string): Promise<{ success: boolean; message: string }> {
        const url = `/tasks/${id}/complete`;
        const data: { success: boolean; message: string } = await axiosInstance.patch(url);
        return data;
    },

    /**
     * Update task generic
     * PATCH /api/tasks/{id}?applyScope=CURRENT_ONLY
     */
    async updateTask(id: string, payload: UpdateTaskRequest): Promise<PersonalTask> {
        const url = `/tasks/${id}`;
        // User requested applyScope=CURRENT_ONLY by default or as example.
        // I will add it as query param.
        const params = { applyScope: "CURRENT_ONLY" };
        const data: PersonalTask = await axiosInstance.patch(url, payload, { params });
        return data;
    },

    /**
     * Delete task generic
     * DELETE /api/tasks/{id}?applyScope=CURRENT_ONLY
     */
    async deleteTask(id: string, applyScope: "CURRENT_ONLY" | "ALL_ITEMS" = "CURRENT_ONLY"): Promise<{ success: boolean; message?: string }> {
        const url = `/tasks/${id}`;
        const params = { applyScope };
        const data: any = await axiosInstance.delete(url, { params });
        return data;
    },

    // --- RECURRENCE ---
    async getRecurrenceRules(taskId: string): Promise<RecurrenceRule | null> {
        const url = `/tasks/${taskId}/recurrence-rules`;
        // API might return 204 or empty if no rules? Assuming it returns object or null.
        // User said it returns the object.
        const data: RecurrenceRule = await axiosInstance.get(url);
        return data;
    },

    async updateRecurrenceRules(taskId: string, rules: Partial<RecurrenceRule> & { type?: string }): Promise<void> {
        const url = `/tasks/${taskId}/recurrence-rules`;
        await axiosInstance.post(url, rules);
    },

    // --- REMINDERS ---
    async getReminders(taskId: string): Promise<Reminder[]> {
        const url = `/tasks/${taskId}/reminders`;
        const data: Reminder[] = await axiosInstance.get(url);
        return data;
    },

    async createReminder(taskId: string, remindAt: string): Promise<{ success: boolean, message: string }> {
        const url = `/tasks/${taskId}/reminders`;
        const data: any = await axiosInstance.post(url, { remindAt });
        return data; // Assuming interceptor returns data directly
    },

    async updateReminder(reminderId: string, remindAt: string): Promise<void> {
        const url = `/tasks/reminders/${reminderId}`;
        await axiosInstance.put(url, { remindAt });
    },

    async deleteReminder(reminderId: string): Promise<{ success: boolean, message: string }> {
        const url = `/tasks/reminders/${reminderId}`;
        const data: any = await axiosInstance.delete(url);
        return data;
    },
};

export interface RecurrenceRule {
    recurrenceType?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"; // For GET response
    type?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"; // For UPDATE payload
    weekDays: string[] | null; // e.g. ["MONDAY"]
    recurrenceStartDate: string | null; // YYYY-MM-DD
    recurrenceEndDate: string|null;   // YYYY-MM-DD
}

export interface Reminder {
    id: string;
    remindAt: string; // YYYY-MM-DD HH:mm:ss
}

export interface SearchTaskRequest {
    keyword?: string;
    fromDate: string; // "yyyy-MM-dd HH:mm:ss"
    toDate: string;   // "yyyy-MM-dd HH:mm:ss"
    size: number;
}

export interface SearchTaskResponse {
    tasks: PersonalTask[];
    total: number;
    nextCursor: string | null;
}

export interface UpdateTaskRequest {
    content?: string;
    startDate?: string;
    dueDate?: string;
    priority?: TaskPriority;
    note?: string;
}

export interface CreateTaskRequest {
    content: string;
    startDate: string;
    dueDate: string;
    priority: TaskPriority;
    note?: string;
}

export default taskApi;
