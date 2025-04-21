import {Request,Response} from "express";
import Traveller from "../models/traveller";
import mongoose,{Types} from "mongoose";

export const addToWishlist =async(req:Request,res:Response)=>{
    try{
        const {userId,propertyId}=req.body;
        const user=await Traveller.findById(userId);
        if(!user){
            res.status(404).json({message:"user not found"});
            return;
        }
        if(user.wishlist.includes(propertyId)){
            res.status(400).json({message:"property already in woshlist"});
            return;
        }
        user.wishlist.push(propertyId);
        await user.save();

        res.status(200).json({message:"property added to wishlist",wishlist:user.wishlist});
        return;
    }catch(err){
        res.status(500).json({message:"internal server error",error:err.message});
        return;
    }
}

export const removeFromWishlist = async(req:Request,res:Response)=>{
    try {
        const {userId,propertyId}=req.body;
        const user=await Traveller.findById(userId);
        if(!user){
            res.status(404).json({message:"user not found"});
            return;
        }
        user.wishlist= user.wishlist.filter((id:Types.ObjectId)=>id.toString()!==propertyId);
        await user.save();
        
        res.status(200).json({message:"property removed from wishlist",wishlist:user.wishlist});
        return;

    } catch (error) {
        res.status(500).json({message:"internal server error",error:error.message});
        return;
    }
}

export const getWishlist = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
  
      const user = await Traveller.findById(userId).populate("wishlist");
      if (!user){
         res.status(404).json({ message: "User not found" });
         return;
      } 
  
      res.status(200).json({ wishlist: user.wishlist });
      return;
    } catch (error) {
       res.status(500).json({ message: "Internal server error", error: error.message });
       return;
    }
  };