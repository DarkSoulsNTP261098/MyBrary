const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const keys = process.env.PRIVATE_KEY;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        //Find the user specified in token
        const user = await User.findById(payload.id);

        //If users doesn't exist,handle it
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    })
  );
};
