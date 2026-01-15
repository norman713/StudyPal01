import axiosInstance from "./axiosConfig";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};
const authApi = {

  login(email: string, password: string): Promise<LoginResponse> {
    const url = "/auth/cred";
    const body = { email, password };
    return axiosInstance.post(url, body);
  },
  logout() {
    const url = "/auth/logout";
    return axiosInstance.post(url);
  },
 
  // register
  // 1. call api auth/register to send code
  // 2. call api verify/register to verify code sent
 register(name: string, email: string, password: string): Promise<ApiResponse> {
    const url = "/auth/register";
    const body = { name, email, password };
    return axiosInstance.post(url, body);
  },
  
  verifyRegister(email: string, code: string): Promise<ApiResponse> {
    const url = "/auth/verify/register";
    const body = { email, code };
    return axiosInstance.post(url, body);
  },

 // send - resend code
  code(type:"REGISTER"| "RESET_PASSWORD", email:string):Promise<ApiResponse>{
    const url="/auth/code"
    const body={type, email}
    return axiosInstance.post(url, body);
  },

  // reset password
  // 1: call api code
  // 2: call api verifyReset to verify code received
  // 3: call api reset

  verifyReset(email:string, code:string):Promise<ApiResponse>{
    const url="/auth/verify/reset";
    const body={email, code};
    return axiosInstance.post(url,body);
  },
  reset(email:string, newPassword:string):Promise<ApiResponse>{
    const url="/auth/reset";
    const body={email, newPassword};
    return axiosInstance.post(url, body);
  },
  gglogin(provider = "GOOGLE",accessToken: string): Promise<LoginResponse> {
    const url = "/auth/prov";
    const body = { provider, accessToken };
    return axiosInstance.post(url, body);
  },


}
export default authApi;