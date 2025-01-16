import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { Connectdb } from "./helper/connection.js";
import PropertyRoutes from "./routes/PropertyRoutes.js";
//
// import cookieParser from 'cookie-parser';
// Import routes
//import userRoutes from './Routes/userRoutes';
//import captainRoutes from './Routes/captainRoutes';
// Import database connection
//import dbx from './Db/db';
const app = express();
// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
Connectdb()
    .then(() => console.log("Database connected Successfully"))
    .catch((err) => console.error("Database Connection failed", err));
app.use(express.json());
// Routes
app.use("/api/properties", PropertyRoutes);
// app.get("/", async (req: Request, res: Response) =>
//   res.json({ naam: "Jalebi bai" })
// );
//app.use('/user', userRoutes);
//app.use('/captain', captainRoutes);
export default app;
//# sourceMappingURL=app.js.map