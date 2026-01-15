import axiosInstance from "./axiosConfig";

export interface MessageReceive {
  success: boolean;
  message: string;
}

const deviceTokenApi = {
  regisDeviceToken(body: {
    deviceToken: string;
    platform: "ANDROID";
  }): Promise<MessageReceive> {
    return axiosInstance.post(`/device-tokens`, body);
  },

  delDeviceToken(token: string): Promise<MessageReceive> {
    return axiosInstance.delete(`/device-tokens?token=${token}`);
  },
};

export default deviceTokenApi;
