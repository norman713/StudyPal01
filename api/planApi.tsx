import axiosInstance from "./axiosConfig";

export type PlanStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

export interface Plan {
  id: string;
  planCode: string;
  title: string;
  description?: string;
  startDate: string;
  dueDate: string;
  totalTasksCount: number;
  completedTaskCount: number;
  tasks?: Task[];
  status?: PlanStatus;
  progress?: number;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface ActivityLog {
  imageUrl: string;
  message: string;
  timestamp: string; // format: "YYYY-MM-DD HH:mm:ss"
}

export interface PlanHistoryResponse {
  records: ActivityLog[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
  id: string;
  content: string; // Changed from name
  description?: string; // or note?
  startDate: string;
  dueDate: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  priority?: TaskPriority;
  completedAt?: string | null;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  assignee?: {
    // Keep for compatibility if needed, but API returns flat fields
    id: string;
    name: string;
    avatarUrl?: string;
  };
  planId?: string; // Optional in response
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
  tempId: string;
}

export interface CreatePlanRequest {
  teamId: string;
  title: string;
  description?: string;
  tasks: TaskDraft[];
}

export interface UpdatePlanRequest {
  title?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
}

export interface CreateTaskRequest {
  content: string; // Changed from name
  note?: string; // Changed from description
  startDate: string;
  dueDate: string;
  assigneeId?: string;
  priority?: TaskPriority;
}

export interface UpdatePlanTaskRequest {
  content?: string;
  note?: string;
  startDate?: string;
  dueDate?: string;
  assigneeId?: string;
  priority?: TaskPriority;
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

export interface TaskDetailResponse {
  id: string;
  taskType: "TEAM" | "PERSONAL";
  taskCode: string;
  content: string;
  note: string;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  priority: TaskPriority;
  additionalData: {
    planId: string;
    planCode: string;
    assigneeId: string;
    assigneeAvatarUrl: string;
    assigneeName: string;
    // Add teamId if it appears later
  };
  deletedAt: string | null;
  status?: string; // Mapped from completedAt?
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
  /**
   * Get plan detail by ID (Flat, includes tasks)
   * GET /api/plans/{id}
   */
  async getPlanById(planId: string): Promise<Plan> {
    const url = `/plans/${planId}`;
    const data: Plan = await axiosInstance.get(url);
    return data;
  },

  /**
   * Get task detail by ID (Generic Plan Task)
   * GET /api/tasks/{id}
   */
  async getTaskById(taskId: string): Promise<TaskDetailResponse> {
    const url = `/tasks/${taskId}`;
    const data: TaskDetailResponse = await axiosInstance.get(url);
    return data;
  },

  /**
   * Get plan detail (Legacy / Team Scoped)
   * @param teamId - Team ID
   * @param planId - Plan ID
   */
  async getPlanDetail(teamId: string, planId: string): Promise<Plan> {
    // Adapter to new API if needed, or keep as is using new fields
    // Returning getPlanById for now as valid replacement
    return this.getPlanById(planId);
  },

  /**
   * Create new plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param data - Plan data
   */
  async createPlan(teamId: string, data: CreatePlanRequest): Promise<Plan> {
    const url = `/plans`;
    // data should include teamId if using flat API
    const payload = { ...data, teamId };
    const res: Plan = await axiosInstance.post(url, payload);
    return res;
  },

  /**
   * Update plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param data - Plan data to update
   */
  async updatePlan(
    teamId: string, // Kept for interface compatibility, but unused in new API
    planId: string,
    data: UpdatePlanRequest
  ): Promise<Plan> {
    const url = `/plans/${planId}`;
    const res: Plan = await axiosInstance.patch(url, data);
    return res;
  },

  /**
   * Delete plan (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   */
  async deletePlan(teamId: string, planId: string): Promise<void> {
    const url = `/plans/${planId}`;
    await axiosInstance.delete(url);
  },

  /**
   * Get plan history
   * GET /api/plans/{planId}/history
   */
  async getPlanHistory(
    planId: string,
    size: number = 20
  ): Promise<PlanHistoryResponse> {
    const url = `/plans/${planId}/history`;
    const params = { size };
    const data: PlanHistoryResponse = await axiosInstance.get(url, { params });
    return data;
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
    teamId: string, // Kept for compatibility but unused in URL
    planId: string,
    data: CreateTaskRequest
  ): Promise<Task> {
    const url = `/plans/${planId}/tasks`;
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
   * Update plan task details (ADMIN/OWNER)
   * PATCH /api/plans/tasks/{taskId}
   */
  async updatePlanTask(
    taskId: string,
    data: UpdatePlanTaskRequest
  ): Promise<Task> {
    const url = `/plans/tasks/${taskId}`;
    const res: Task = await axiosInstance.patch(url, data);
    return res;
  },

  /**
   * Delete task (OWNER, ADMIN only)
   * @param teamId - Team ID
   * @param planId - Plan ID
   * @param taskId - Task ID
   */
  async deleteTask(
    teamId: string, // Unused in new API
    planId: string, // Unused in new API
    taskId: string
  ): Promise<void> {
    const url = `/plans/tasks/${taskId}`;
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
