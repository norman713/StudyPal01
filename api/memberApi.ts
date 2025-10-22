import axiosInstance from "./axiosConfig";

const memberApi = {

  async leave(teamId: string) {
    const url = `/members/leave`;
    return await axiosInstance.delete(url, { params: { teamId } });
  },

};

export default memberApi;
