import express from "express";
import passport from "passport";

import {loginUser, registerUser} from "../controllers/UserController";

const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/loginUser",loginUser)

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      if (!req.user) {
         res.status(401).json({ message: "Authentication failed" });
      }
  
      const { user, token } = req.user as { user: any; token: string };
  
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
    }
  );


export default router