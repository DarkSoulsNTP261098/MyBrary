const express = require("express");
const router = express.Router();
const User = require("../models/user");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Book = require("../models/book");

//Load Input Validation
const validateRegisterInput = require("./validation/register");
const validateLoginInput = require("./validation/login");

//All Author Router
router.get("/", async (req, res) => {
  let searchOptions = {};

  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i"); //i so khớp không quan tâm đến chữ hoa chữ thường
  }
  try {
    const users = await User.find(searchOptions);
    res.render("users/index", {
      users: users,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("users/new");
});

router.post("/new", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    let firstkey = Object.keys(errors)[0];
    return res.render("users/new", {
      errorMessage: errors[firstkey]
    });
  } else {
    try {
      await User.findOne({ email: req.body.email }).then(user => {
        if (user) {
          res.render("users/new", {
            user: user,
            errorMessage: "Email already exists"
          });
        } else {
          const avatar = gravatar.url(req.body.email, {
            s: "200", //size
            r: "pg", //Rating
            d: "mm" //Default
          });
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar,
            password: req.body.password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save().then(user => {
                res.render("users/login", {
                  msg: "You are now registerd and can log in"
                });
              });
            });
          });
        }
      });
    } catch {
      res.render("users/new", {
        errorMessage: "Error creating User"
      });
    }
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    let firstkey = Object.keys(errors)[0];
    return res.render("users/login", {
      errorMessage: errors[firstkey]
    });
  }
  const email = req.body.email;
  const password = req.body.password;
  await User.findOne({ email }).then(user => {
    //Check for user
    if (!user) {
      res.render("users/login", {
        errorMessage: "User not found"
      });
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // res.render("users/login", {
        //   msg: "Login Success"
        // });

        //User match
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        jwt.sign(
          payload,
          process.env.PRIVATE_KEY,
          { expiresIn: 3600 },
          async (err, token) => {
            const users = await User.find();
            // res.redirect("/");
            res.render("users", {
              users: users,
              msg: "Login Success",
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.render("users/login", {
          errorMessage: "Password incorrect"
        });
      }
    });
  });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
