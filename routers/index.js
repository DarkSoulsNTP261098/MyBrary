const express = require("express");
const router = express();
const Book = require("../models/book");

router.get("/", async (req, res) => {
  let books;
  try {
    books = await Book.find()
      .sort({ createAt: "desc" })
      .limit(10)
      .exec();
  } catch {
    books = [];
  }
  console.log(books);

  res.render("index", {
    books: books
  });
});

module.exports = router;
