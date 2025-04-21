import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
// import { OAuth2Client } from "google-auth-library";
import Traveller from "@/models/traveller"
// import { create } from "domain";
import dotenv from 'dotenv';
dotenv.config(); 

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    
    const existingUser = await Traveller.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new Traveller({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message }); 
    return;

  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await Traveller.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" }); 
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       res.status(400).json({ message: "Invalid credentials" });
       return;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

     res.status(200).json({ message: "Login successful", token, user }); 
     return;
  } catch (error) {
     res.status(500).json({ message: "Internal server error", error: error.message }); 
     return;
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const objectId = new mongoose.Types.ObjectId(userId);
    const user = await Traveller.findById(objectId);
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return
    }
     res.status(200).json({ user });
     return
  } catch (error) {
     res.status(500).json({ message: "Internal server error", error: error.message });
     return
  }
};
export const updateProfilePic = async (req: Request, res: Response) => {
  const { userId, profilePic } = req.body;

  if (!userId || !profilePic) {
    res.status(400).json({ error: 'Missing required fields' });
    return 
  }

  try {
    const user = await Traveller.findByIdAndUpdate(
      userId,
      { profilePic },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return
    }

    res.status(200).json({ message: 'Profile picture updated', user });
    return
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Server error' });
    return
  }
};

export const sendEmail = async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!email || !name || !message) {
    res.status(400).json({ error: "Missing fields required" });
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: `${process.env.EMAIL}`,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

export const updateProfile= async(req:Request,res:Response)=>{
  const {userId,...fieldsToUpdate}=req.body;
  try {
    const user=await Traveller.findByIdAndUpdate(userId,fieldsToUpdate,{new:true});
    if(!user){
      res.status(404).json({message:"user not found"});
      return;
    }
    res.status(200).json({message:"profile updated",user});
    return;
  } catch (error) {
    
  } 
}






// export const loginOrSignup = async(req:Request, res:Response) => {
//   const {id_token} = req.body;
//   try {
//     const ticket=await client.verifyIdToken({
//       idToken:id_token,
//       audience:process.env.GOOGLE_CLIENT_ID
//     })

//     const payload=ticket.getPayload();

//     const {email,sub:googleId,name,picture,email_verified}=payload!;
//     if(!email_verified){
//       res.status(400).json({ error:"failed to authenticate with google" });
//       return; 
//     }

//     let user=await User.findOne({googleId});
//     let isNewUser=false;
//     if(!user){
//       isNewUser=true;
//       user=new User({googleId,name,email,picture,createdAt:new Date(),updatedAt:new Date()});
//       await user.save();
//     }

//     const {accessToken,refreshToken}=generateTokens(user.toObject());

//     res.status(200).json({
//       user,
//       accessToken,
//       refreshToken,
//       isNewUser
//     });

    
//   } catch (error) {
//     console.error("login error",error);
//     res.status(500).json({ error:"failed to authenticate with google" });
    
//   }
// }

// export const refreshToken = async(req:Request, res:Response) => {
//   const {refreshToken} = req.body;
//   if(!refreshToken){
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   try {
//     const decoded=jwt.verify(refreshToken,process.env.JWT_SECRET!);
//     const {userId}=decoded as {userId:string};
//     const user=await User.findById(userId);
//     if(!user){
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }
//     const newAccessToken =jwt.sign({userId:user._id},process.env.JWT_SECRET!,{expiresIn:"1d"});
//     res.status(200).json({ accessToken: newAccessToken });
    
//   } catch (error) {
//     console.error("refresh token error",error);
//     res.status(403).json({ error: "Forbidden" });
//   }
// }; 
