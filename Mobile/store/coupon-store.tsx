import { create } from "zustand";


interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  minOrderValue: number;
}


interface CouponState {
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  resetCoupon: () => void;
}


export const useCouponStore = create<CouponState>((set) => ({
    
  appliedCoupon: null,

  applyCoupon: (coupon) => {
    set({ appliedCoupon: coupon });
  },


  resetCoupon: () => {
    set({ appliedCoupon: null });
  },
}));
