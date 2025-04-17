// auth-store.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserDataType } from "@/types"; // adjust the path

type AuthStore = {
  user: UserDataType | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadAuthData: () => Promise<void>;
  setUser: (user: UserDataType | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/user/login`,
        { email, password }
      );
      const { token, user } = res.data;
      console.log("Login response:", res.data);

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("authUser", JSON.stringify(user));
      set({ user, token, loading: false });
    } catch (error) {
      console.error("Login error:", error);
      set({ loading: false });
      throw error;
    }
  },

  setUser: (user) => set({ user }),

  register: async ({ name, email, password, phone }) => {
    set({ loading: true });
    try {
      const res = await axios.post(
        `${process.env.EXP_PUBLIC_BASE_URL}/user/register`,
        { name, email, password, phone }
      );
      // No token returned from register currently
      set({ loading: false });
    } catch (error) {
      console.error("Register error:", error);
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authUser");
    set({ user: null, token: null });
  },

  loadAuthData: async () => {
    const token = await AsyncStorage.getItem("authToken");
    const userString = await AsyncStorage.getItem("authUser");

    if (token && userString) {
      const user: UserDataType = JSON.parse(userString);
      set({ token, user });
    }
  },
}));
