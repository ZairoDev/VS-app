// auth-store.ts

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserDataType } from "@/types";
import { fetchWishlistIds, normalizeWishlistIds } from "@/utils/wishlist";

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
  syncWishlist: () => Promise<void>;
  setUser: (user: UserDataType | null) => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
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

      const userWithWishlist = {
        ...user,
        wishlist: normalizeWishlistIds(user?.wishlist),
      };

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("authUser", JSON.stringify(userWithWishlist));
      set({ user: userWithWishlist, token, loading: false });
      await get().syncWishlist();
    } catch (error) {
      console.error("Login error:", error);
      set({ loading: false });
      throw error;
    }
  },

  setUser: (user) =>
    set({
      user: user
        ? { ...user, wishlist: normalizeWishlistIds(user.wishlist) }
        : null,
    }),

  syncWishlist: async () => {
    const { user, token } = get();
    if (!user?._id || !token) return;

    try {
      const ids = await fetchWishlistIds(user._id);
      const updatedUser = { ...user, wishlist: ids };
      await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error("Wishlist sync error:", error);
    }
  },

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
      const userWithWishlist = {
        ...user,
        wishlist: normalizeWishlistIds(user.wishlist),
      };
      set({ token, user: userWithWishlist });
      await get().syncWishlist();
    }
  },
}));
