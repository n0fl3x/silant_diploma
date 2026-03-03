import type { Machine } from "../types/Machine";


export const fetchUserMachines = async (): Promise<Machine[]> => {
  try {
    const response = await fetch('/api/v1/machines', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Ошибка загрузки машин');
    }

    const data: Machine[] = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка загрузки машин: ', error);
    throw error;
  }
};
