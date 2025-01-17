import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Response } from "express";

import Connectdb from "../helper/connection";
import propertyRoutes from "../routes/PropertyRoutes";
//For env File
dotenv.config();
Connectdb();

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());

// Middeleware
app.use(express.json());
app.get("/", (req: express.Request, res: express.Response) => {
    res.send("name Aviral Mishra");
  });


app.use("/properties", propertyRoutes);

// Server Started
app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);                                                                                                                                                                                                                                                                                                                                                                                                                           
});