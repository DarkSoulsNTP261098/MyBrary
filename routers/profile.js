const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load profile model
const Profile = require("../models/profile");
//Load user model
const User = require("../models/user");

router.get("/test", (req, res) => {
  res.send("hi");
});

router.get(
  "/",
  passport.authenticate("jwt", { session: false }, (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  })
);

module.exports = router;
