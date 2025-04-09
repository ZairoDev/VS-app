import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const setUserAndToken = async (user: any, token: string) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
  await AsyncStorage.setItem('token', token);
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['user', 'token']);
};
