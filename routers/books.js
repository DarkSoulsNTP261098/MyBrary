const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

//All Book Router
router.get("/", async (req, res) => {
  let query = Book.find();

  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }

  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }

  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/");
  }
});

//New Book Route
router.get("/new", async (req, res) => {
  renderFormPage(res, new Book(), "new");
});

//Create Book Router
router.post("/", async (req, res) => {
  // const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: parseInt(req.body.pageCount),
    description: req.body.description
  });

  saveCover(book, req.body.cover); //req.body.cover cua filepond

  try {
    const newBook = await book.save();

    res.redirect("books");
  } catch {
    renderFormPage(res, book, "new", true);
  }
});

//Show book route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .exec();
    res.render("books/show", {
      book: book
    });
  } catch (err) {
    console.error(err);
  }
});

//Edit book route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderFormPage(res, book, "edit");
  } catch (err) {
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  // const fileName = req.file != null ? req.file.filename : null;
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = req.body.publishDate;
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover); //req.body.cover cua filepond
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book != null) {
      renderFormPage(res, book, "edit", true);
    } else {
      redirect("/");
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/books");
  } catch (err) {
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not remove book"
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Book";
      }

      if (form === "new") {
        params.errorMessage = "Error Creating Book";
      }
    }

    console.log("ok");
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("books");
  }
}

// async function renderEditPage(res, book, hasError = false) {
//   try {
//     const authors = await Author.find({});
//     const params = {
//       authors: authors,
//       book: book
//     };
//     if (hasError) params.errorMessage = "Error Update Book";
//     res.render("books/edit", params);
//   } catch {
//     res.redirect("books");
//   }
// }

// async function renderNewPage(res, book, hasError = false) {
//   try {
//     const authors = await Author.find({});
//     const params = {
//       authors: authors,
//       book: book
//     };
//     if (hasError) params.errorMessage = "Error Creating Book";
//     res.render("books/new", params);
//   } catch {
//     res.redirect("books");
//   }
// }

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
