import axiosInstance from "./axiosConfig";

export interface SessionStatisticsResponse {
  timeSpentInSeconds: number;
  completionPercentage: number;
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
};

export default sessionApi;
