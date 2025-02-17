import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import User from "../models/User";
import dotenv from "dotenv";
import Users from "../models/User";

dotenv.config()

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:"/api/auth/google/callback",
    },
    async (accessToken,refreshToken,profile,done)=>{
        try{
            let user=await Users.findOne({googleId:profile.id});

            if(!user){
                user= await Users.create({
                    googleId:profile.id,
                    name:profile.displayName,
                    email:profile.emails?.[0]?.value,
                    profilePic:profile.photos?.[0]?.value,
                    isVerified:true
                });
            }
            done(null,user);



        }catch(err){
            done(err,null);
        }

    }
)
)

passport.serializeUser((user,done)=>done(null, user));
passport.deserializeUser(async(id,done)=>done(null,await Users.findById(id)));