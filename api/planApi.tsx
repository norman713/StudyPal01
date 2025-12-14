import axiosInstance from "./axiosConfig";

export type PlanStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

export interface Plan {
  id: string;
  code: string; // PLN-1, PLN-2, etc.
  name: string;
  title?: string; // Some APIs return title instead of name
  description?: string;
  startDate: string; // ISO date
  dueDate: string; // ISO date
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
  status: PlanStatus;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  dueDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  priority?: TaskPriority;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  planId: string;
}

export interface PlanListResponse {
  plans: Plan[];
  total: number;
  nextCursor?: string | null;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  nextCursor?: string | null;
}

export interface TaskDraft {
  content: string;
  startDate: string;
  dueDate: string;
  assigneeId?: string;
  priority: TaskPriority;
  note?: string;
}

export interface CreatePlanRequest {
  teamId: string;
  title: string;
  description?: string;
  tasks: TaskDraft[];
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  startDate: string;
  dueDate: string;
  assigneeId?: string;
}

export interface SearchPlanRequest {
  keyword?: string;
  fromDate?: string; // yyyy-MM-dd HH:mm:ss
  toDate?: string; // yyyy-MM-dd HH:mm:ss
  cursor?: string;
  size?: number;
}

export interface TaskStatistics {
  total: number;
  unfinished: number;
  low: number;
  medium: number;
  high: number;
}

const planApi = {
  /**
   * Get list of plans for a team
   * @param teamId - Team ID
   * @param keyword - Search keyword (optional)
   * @param fromDate - Filter from date (optional)
   * @param toDate - Filter to date (optional)
   * @param date - Filter by specific date (optional)
   * @param cursor - Pagination cursor (optional)
   * @param size - Page size (default: 20)
   */
  async getPlans(
    teamId: string,
    keyword?: string,
    fromDate?: string,
    toDate?: string,
    date?: string,
    cursor?: string,
    size: number = 20
  ): Promise<PlanListResponse> {
    const url = `/teams/${teamId}/plans`;
    const params = { keyword, fromDate, toDate, date, cursor, size };
    const data: PlanListResponse = await axiosInstance.get(url, { params });
    return data;
  },

  /**
   * Search plans (POST)
   */
  async searchPlans(
    teamId: string,
    data: SearchPlanRequest
  ): Promise<PlanListResponse> {
    const url = `/teams/${teamId}/plans/search`;
    const res: PlanListResponse = await axiosInstance.post(url, data);
    return res;
  },

  /**
   * Get list of plans for a specific date (returns array)
   */
  async getPlansByDate(teamId: string, date: string): Promise<Plan[]> {
    const url = `/teams/${teamId}/plans`;
    const params = { date };
    const data: Plan[] = await axiosInstance.get(url, { params });
    return data;
  },

  /**
   * Get dates that have plans/deadlines
   */
  async getPlanDates(
    teamId: string,
    month: number,
    year: number
  ): Promise<string[]> {
    const url = `/teams/${teamId}/plans/dates`;
    const params = { month, year };
    const data: string[] = await axiosInstance.get(url, { params });
    return data;
  },

  /**
   * Get task statistics for a member
   */
  async getTaskStatistics(
    teamId: string,
    memberId: string,
    fromDate: string,
    toDate: string
  ): Promise<TaskStatistics> {
    const url = `/teams/${teamId}/tasks/statistics`;
    const body = { memberId, fromDate, toDate };
    const data: TaskStatistics = await axiosInstance.post(url, body);
    return data;
  },

  /**
   * Get plan detail
   * @param teamId - Team ID
   * @param planId - Plan ID
   */
  async getPlanDetail(teamId: string, planId: string): Promise<Plan> {
    const url = `/teams/${teamId}/plans/${planId}`;
    const data: Plan = await axiosInstance.get(url);
    return data;
  },

  /**
   * Create new plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param data - Plan data
   */
  async createPlan(teamId: string, data: CreatePlanRequest): Promise<Plan> {
    const url = `/plans`;
    const res: Plan = await axiosInstance.post(url, data);
    return res;
  },

  /**
   * Update plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param data - Plan data to update
   */
  async updatePlan(
    teamId: string,
    planId: string,
    data: UpdatePlanRequest
  ): Promise<Plan> {
    const url = `/teams/${teamId}/plans/${planId}`;
    const res: Plan = await axiosInstance.patch(url, data);
    return res;
  },

  /**
   * Delete plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   */
  async deletePlan(teamId: string, planId: string): Promise<void> {
    const url = `/teams/${teamId}/plans/${planId}`;
    await axiosInstance.delete(url);
  },

  /**
   * Get tasks of a plan
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param filter - Filter: ALL | MY (optional)
   * @param cursor - Pagination cursor (optional)
   * @param size - Page size (default: 50)
   */
  async getTasks(
    teamId: string,
    planId: string,
    filter?: "ALL" | "MY",
    cursor?: string,
    size: number = 50
  ): Promise<TaskListResponse> {
    const url = `/teams/${teamId}/plans/${planId}/tasks`;
    const params = { filter, cursor, size };
    const data: TaskListResponse = await axiosInstance.get(url, { params });
    return data;
  },

  /**
   * Create task in plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param data - Task data
   */
  async createTask(
    teamId: string,
    planId: string,
    data: CreateTaskRequest
  ): Promise<Task> {
    const url = `/teams/${teamId}/plans/${planId}/tasks`;
    const res: Task = await axiosInstance.post(url, data);
    return res;
  },

  /**
   * Update task status
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param taskId - Task ID
   * @param status - New status
   */
  async updateTaskStatus(
    teamId: string,
    planId: string,
    taskId: string,
    status: Task["status"]
  ): Promise<Task> {
    const url = `/teams/${teamId}/plans/${planId}/tasks/${taskId}`;
    const res: Task = await axiosInstance.patch(url, { status });
    return res;
  },

  /**
   * Delete task (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param taskId - Task ID
   */
  async deleteTask(
    teamId: string,
    planId: string,
    taskId: string
  ): Promise<void> {
    const url = `/teams/${teamId}/plans/${planId}/tasks/${taskId}`;
    await axiosInstance.delete(url);
  },

  /**
   * Toggle task completion
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param taskId - Task ID
   */
  async toggleTaskComplete(
    teamId: string,
    planId: string,
    taskId: string
  ): Promise<Task> {
    const url = `/teams/${teamId}/plans/${planId}/tasks/${taskId}/toggle`;
    const res: Task = await axiosInstance.patch(url);
    return res;
  },
};

export default planApi;
