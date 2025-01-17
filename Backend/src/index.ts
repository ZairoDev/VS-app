import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";

import connectMongoDB from "../helper/connection";
import propertyRoutes from "../routes/propertyRoutes";

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

// Server Started
app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});
