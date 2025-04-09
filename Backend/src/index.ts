
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import passport from "passport";
import session from "express-session";


import connectMongoDB from "@/config/Connection";
import propertyRoutes from "@/routes/property-route";
import userRoutes from "@/routes/user-route";
import couponRoutes from "@/routes/discount-coupon-route";
import wishlistRoutes from "@/routes/wishlist-routes";
import "@/config/passport";


dotenv.config();
connectMongoDB();

const app: Application = express();
const port = process.env.PORT || 8000;
app.use(cors());


app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req: Request, res: Response) => {
  res.json({ name: "Welcome to Vacationsaga Mobile App" });
});
app.use("/properties", propertyRoutes);
app.use("/user", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/coupon", couponRoutes);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});