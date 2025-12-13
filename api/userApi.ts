import axiosInstance from "./axiosConfig"

export interface User {
  id: string
  name: string
  email: string
  dateOfBirth: string
  gender: string
  avatarUrl: string
}

const userApi = {
    getUserById(userId: string):Promise<User> {
        return axiosInstance.get(`/users/${userId}`);
    }
}

export default userApi;