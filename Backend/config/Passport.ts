import passport from "passport";
import dotenv from "dotenv";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Traveller from "../models/traveller";

dotenv.config();

passport.use(
  new JwtStrategy(
    {
      
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "default_secret"
      
    },
    async (payload, done) => {
      try {
        const user = await Traveller.findById(payload.id);
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await Traveller.findOne({ googleId: profile.id });

        if (!user) {
          user = await Traveller.create({
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Traveller.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});