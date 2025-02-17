import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "@/models/User";
import generateToken from "@/utils/GenerateToken";


export const registerUser = async (req:Request, res:Response)=> {
    try{
        const {name,email,password}=req.body;
        const existingUser=await Users.findOne({email});

        if(existingUser){
            res.status(400).json({message:"User already exists"});
            return;
        }
        

        const user= await Users.create({name,email,password});
        res.status(201).json({message:"User created successfully"});

    }catch(err){
        res.status(500).json({message:"Error registering user",err});
    };
}

export const loginUser = async (req:Request , res:Response)=> {
    try{
        const {email,password}=req.body;
        const user=await Users.findOne({email});

        if(!user || !(await user.compare(password))){
            res.status(404).json({message:"Invalid credentials"});
            return;
        }

        res.json({token:generateToken(user._id),user});
    }catch(err){
        res.status(500).json({message:""})
    }
}