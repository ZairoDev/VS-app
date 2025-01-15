import {Request,Response} from "express";;
import { parse } from "path";

import {Properties} from "../models/property.js"

export const getAllProperties= async(req:Request,res:Response)=>{
    try{
        const page=parseInt(req.query.page as string) || 1;
        const limit=parseInt(req.query.limit as string) || 2;
        const skip=(page-1)*limit

        const properties=await Properties.find().skip(skip).limit(limit);
        
        res.status(200).json({
            success:true,
            data:properties
        });
    }
    catch(error){
        console.error("Error fetching results",error);
        res.status(500).json({
            success:false,
            message:"failed to fetch properties",
            error:error.message
        })
    }
};