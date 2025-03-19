import {Request,Response} from "express";
import Coupon from "../models/discountCoupon";

export const createCoupon = async(req:Request,res:Response)=>{
    const {code,discountType,discountValue,expiryDate,usageLimit,usedCount,minOrderValue} = req.body;
    try{
        const existingCoupon = await Coupon.findOne({code:code.toUpperCase()});
        if(existingCoupon){
            res.status(400).json({message:"Coupon already exists"});
        }
        const newCoupon = new Coupon({
            code:code.toUpperCase(),
            discountType,
            discountValue,
            expiryDate,
            usageLimit,
            usedCount,
            minOrderValue
        });

        await newCoupon.save();
        res.status(201).json({message:"Coupon created successfully",coupon:newCoupon});
    }
    catch(err){
        res.status(500).json({message:"Internal server error",error:err});
    }
}

export const getAllCoupons = async (req: Request, res: Response) => {
    try {
      const coupons = await Coupon.find();
      res.status(200).json({ message: 'Coupons fetched successfully', coupons });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching coupons', error: err });
    }
};

// Apply Coupon
export const applyCoupon = async (req: Request, res: Response) => {
  const { code, orderValue } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404).json({ message: 'Invalid coupon code' });
    } else if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      res.status(400).json({ message: 'Coupon expired' });
    } else if (coupon.usedCount !== undefined && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ message: 'Coupon usage limit exceeded' });
    } else if (orderValue < coupon.minOrderValue) {
      res.status(400).json({
        message: `Minimum order value should be ₹${coupon.minOrderValue}`,
      });
    } else {
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderValue * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      const finalAmount = orderValue - discountAmount;

      res.status(200).json({
        message: 'Coupon applied successfully',
        discountAmount,
        finalAmount,
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error applying coupon', error: err });
  }
};

  
  // Update Coupon Usage
  export const updateCouponUsage = async (req: Request, res: Response) => {
    const { code } = req.body;
  
    try {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  
      if (!coupon) {
        res.status(404).json({ message: 'Invalid coupon code' });
      } else {
        if (coupon.usedCount !== undefined) {
          coupon.usedCount += 1;
          await coupon.save();
        }
  
        res.status(200).json({ message: 'Coupon usage updated successfully' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error updating usage', error: err });
    }
  };
  