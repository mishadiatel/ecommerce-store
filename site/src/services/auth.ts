import {
  ForgotPasswordRequestData,
  LoginRequestData,
  ResendActivationRequestData,
  ResetPasswordRequestData,
  SignupRequestData,
  UpdateMeRequestData,
  UpdatePasswordRequestData,
} from '@/types/auth';
import { projectApi } from '@/lib/axios';

export const login = async (loginData: LoginRequestData) => {
  try {
    const { data } = await projectApi.post('/api/auth/signin', loginData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signup = async (signupData: SignupRequestData) => {
  try {
    const { data } = await projectApi.post('/api/auth/signup', signupData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const { data } = await projectApi.get('/api/auth/me');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const authLogout = async () => {
  try {
    const { data } = await projectApi.get('/api/auth/logout');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateMe = async (payload: UpdateMeRequestData) => {
  try {
    const { data } = await projectApi.patch('/api/auth/updateMe', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updatePassword = async (
  payload: UpdatePasswordRequestData
) => {
  try {
    const { data } = await projectApi.patch(
      '/api/auth/updateMyPassword',
      payload
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const forgotPassword = async (payload: ForgotPasswordRequestData) => {
  try {
    const { data } = await projectApi.post('/api/auth/forgotPassword', payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  payload: ResetPasswordRequestData,
) => {
  try {
    const { data } = await projectApi.patch(
      `/api/auth/resetPassword/${token}`,
      payload,
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const resendActivation = async (
  payload: ResendActivationRequestData,
) => {
  try {
    const { data } = await projectApi.post(
      '/api/auth/resendActivationToken',
      payload,
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
