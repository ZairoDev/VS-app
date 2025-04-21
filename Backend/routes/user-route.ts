

import { OAuth2Client } from 'google-auth-library';
import Traveller from "../models/traveller";
// import {loginOrSignup,refreshToken} from "../controllers/UserController";
import {login,register,getUser, updateProfilePic, sendEmail, updateProfile} from "../controllers/UserController";
import express, { Request, Response } from 'express';
import { get } from 'http';
import { updateCouponUsage } from '@/controllers/discountCouponControllers';


const router = express.Router();
router.post('/login',login);
router.post('/register',register);
router.post('/getUser',getUser);
router.post('/contact',sendEmail);
router.put('/updateProfilePic',updateProfilePic);
router.put('/update',updateProfile);
// router.post('/register', register);
// router.post('/login', loginOrSignup);
// router.post('/refresh', refreshToken);

const client = new OAuth2Client("360635271354-f7vr696f94nqqniijfrhqrmqpsvm2st2.apps.googleusercontent.com");

router.post('/verify-google-token', async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "360635271354-f7vr696f94nqqniijfrhqrmqpsvm2st2.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email;
    const name = payload?.name;
    const profilePicture = payload?.picture;

    let user = await Traveller.findOne({ googleId });
    if (!user) { 
      user = new Traveller({
        name,
        email,
        googleId,
        profilePicture,
        isVerified: true,
      });
      await user.save();
    }
    res.json({ message: 'Token verified', userId: user._id }); 
  } catch (error) {
    console.error('Token verification failed:', error);
    console.error('Error Details:', error.message, error.stack, JSON.stringify(error)); 
    res.status(401).json({ message: 'Token verification failed' });
  }
});


export default router;
