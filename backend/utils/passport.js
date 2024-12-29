import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../model/user.model.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export const configurePassport = () => {
  passport.use(
    "jwt",
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // Check if the token has expired
        if (Date.now() > jwt_payload.exp * 1000) {
          return done(null, false, { message: "Token has expired" });
        }

        const user = await User.findById(jwt_payload._id);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, { message: "User not found" });
        }
      } catch (err) {
        return done(err, false, { message: "Server error" });
      }
    })
  );
};
