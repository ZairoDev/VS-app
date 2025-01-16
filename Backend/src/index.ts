import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Response } from "express";

import propertyRoutes from "../routes/propertyRoutes";
import connectMongoDB from "../helper/connection";

//For env File
dotenv.config();
connectMongoDB();

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());

// Middeleware
app.use(express.json());

app.get("/", (res: Response) => {
  res.json({ name: "Aviral" });
});

// Routes
app.use("/properties", propertyRoutes);

// Server Started
app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});
