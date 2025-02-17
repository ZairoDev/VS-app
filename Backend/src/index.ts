import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import passport from "passport";


import connectMongoDB from "@/config/Connection";

import propertyRoutes from "@/routes/property-route";
import userRoutes from "@/routes/user-route";

//For env File
dotenv.config();
connectMongoDB();

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());

// Middeleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ name: "Welcome to Vacationsaga Mobile App" });
});
app.use("/properties", propertyRoutes);
app.use("/auth", userRoutes);

// Server Started
app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});
