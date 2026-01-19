import { LoginRequestData } from '@/types/auth';
import { projectApi } from '@/lib/axios';

export const login  = async (loginData: LoginRequestData) => {
  try {
    const { data } = await projectApi.post('/api/auth/signin', loginData);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getMe  = async () => {
  try {
    const { data } = await projectApi.get('/api/auth/me');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export const authLogout  = async () => {
  try {
    const { data } = await projectApi.get('/api/auth/logout');
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}