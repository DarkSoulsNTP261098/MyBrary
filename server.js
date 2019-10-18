if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const indexRouter = require("./routers/index");
const authorRouter = require("./routers/authors");
const bookRouter = require("./routers/books");
const userRouter = require("./routers/users");

const passport = require("passport");
//Pastport middleware
app.use(passport.initialize());

//Passport config
require("./config/passport")(passport);

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", error => {
  console.error(error);
});

db.once("open", () => {
  console.log("Connected to Mongoose");
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));
app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);
app.use("/users", userRouter);

app.get("*", (req, res) => {
  // res.render("404");
  res.sendFile(path.join(__dirname + "/views/404.html"));
});

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
