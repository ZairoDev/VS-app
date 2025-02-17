import express from "express";
import passport from "passport";

import {registerUser, loginUser} from "../controllers/UserController";

const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/goolgle/callback", passport.authenticate("google",{failureRedirect:"/login"}),
(req,res)=>{
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${req.user}`);
}
)


export default router