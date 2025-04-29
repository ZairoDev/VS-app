import Users from "@/models/users";
import {Request,Response} from "express";

export const registerUser = async(req:Request,res:Response)=>{
    try{
        const {name,email,password,phone}=req.body;

        const existingUser= await Users.findOne({email});

        if(existingUser){
            res.status(400).json({message:"user already exists"});
        }

        const newUser=new Users({
            name,
            email,
            phone,
            password,
            // isVerified:false,
        });

        await newUser.save();
        res.status(201).json({message:"user registered successfully"});
    }catch(error){
        res.status(500).json({message:"internal server error",error:error.message});


    }
}
