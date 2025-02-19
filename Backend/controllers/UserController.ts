import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "@/models/User";


export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser)
    res.status(400).json({ message: "User already exists" });

  
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({ name, email, password: hashedPassword });
    res.status(201).json({ user ,message:"User created successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Some error occurred", error: err.message });
  }
};

