import axiosInstance from "./axiosConfig";

export interface SessionStatisticsResponse {
  timeSpentInSeconds: number;
  completionPercentage: number;
}

export interface SessionSettings {
  focusTimeInSeconds: number;
  breakTimeInSeconds: number;
  totalTimeInSeconds: number;
  enableBgMusic: boolean;
}

const sessionApi = {
  /**
   * Get session statistics
   * GET /api/sessions/statistics
   */
  async getStatistics(
    fromDate: string,
    toDate: string
  ): Promise<SessionStatisticsResponse> {
    const url = `/sessions/statistics`;
    const params = { fromDate, toDate };
    const data: SessionStatisticsResponse = await axiosInstance.get(url, {
      params,
    });
    return data;
  },

  /**
   * Get session settings
   * GET /api/sessions/settings
   */
  async getSettings(): Promise<SessionSettings> {
    // Correct URL from user screenshot: /api/sessions/settings
    // axiosInstance base url usually handles /api or just base.
    // getStatistics used `/sessions/statistics`, so I will use `/sessions/settings`
    const url = `/sessions/settings`;
    const data: SessionSettings = await axiosInstance.get(url);
    return data;
  },

  /**
   * Update session settings
   * PUT /api/sessions/settings
   */
  async updateSettings(settings: SessionSettings): Promise<SessionSettings> {
    const url = `/sessions/settings`;
    const data: SessionSettings = await axiosInstance.put(url, settings);
    return data;
  },

  /**
   * Save a study session
   * POST /api/sessions
   */
  async saveSession(payload: {
    studiedAt: string;
    durationInSeconds: number;
    elapsedTimeInSeconds: number;
  }): Promise<void> {
    const url = `/sessions`;
    await axiosInstance.post(url, payload);
  },
};

export default sessionApi;
