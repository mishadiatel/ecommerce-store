import { projectApi } from '@/lib/axios';
import { AdminUserListResponse, AdminUserDetails } from '@/types/adminUser';

export const getAdminUsers = async (params: {
  page?: number | string;
  limit?: number | string;
  search?: string;
  hasAbandonedCart?: boolean | string;
} = {}): Promise<AdminUserListResponse | undefined> => {
  try {
    const { data } = await projectApi.get<AdminUserListResponse>(
      '/api/users/admin',
      { params },
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAdminUserDetails = async (
  id: string,
): Promise<AdminUserDetails | undefined> => {
  try {
    const { data } = await projectApi.get<AdminUserDetails>(
      `/api/users/admin/${id}/details`,
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
