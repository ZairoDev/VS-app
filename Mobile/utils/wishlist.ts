import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/auth-store";
import type { UserDataType } from "@/types";

/** Normalize API/local wishlist entries to string property IDs. */
export function normalizeWishlistIds(wishlist: unknown): string[] {
  if (!Array.isArray(wishlist)) return [];
  return wishlist
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "_id" in item) {
        const id = (item as { _id?: unknown })._id;
        return id != null ? String(id) : "";
      }
      return item != null ? String(item) : "";
    })
    .filter(Boolean);
}

export function isInWishlist(
  wishlist: string[] | undefined,
  propertyId: string | undefined
): boolean {
  if (!wishlist?.length || !propertyId) return false;
  const target = String(propertyId);
  return wishlist.some((id) => String(id) === target);
}

export async function fetchWishlistIds(userId: string): Promise<string[]> {
  const res = await axios.post(
    `${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/get`,
    { userId }
  );
  return normalizeWishlistIds(res.data?.wishlist);
}

export async function persistUserWishlist(
  user: UserDataType,
  wishlist: string[],
  setUser: (user: UserDataType) => void
): Promise<void> {
  const updatedUser = { ...user, wishlist };
  setUser(updatedUser);
  await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
}

/** Toggle wishlist membership with optimistic UI and rollback on failure. */
export async function toggleWishlistProperty(
  propertyId: string
): Promise<{ added: boolean } | null> {
  const { user, setUser } = useAuthStore.getState();
  if (!user?._id) return null;

  const currentWishlist = normalizeWishlistIds(user.wishlist);
  const inWishlist = isInWishlist(currentWishlist, propertyId);
  const target = String(propertyId);
  const updatedWishlist = inWishlist
    ? currentWishlist.filter((id) => String(id) !== target)
    : [...currentWishlist, target];

  await persistUserWishlist(user, updatedWishlist, setUser);

  try {
    const endpoint = inWishlist
      ? `${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/remove`
      : `${process.env.EXPO_PUBLIC_BASE_URL}/wishlist/add`;
    await axios.post(endpoint, { userId: user._id, propertyId: target });
    return { added: !inWishlist };
  } catch (error) {
    await persistUserWishlist(user, currentWishlist, setUser);
    throw error;
  }
}
