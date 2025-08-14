const express = require("express");
const app = express();
const dbConnect = require("./config/dbConnect");
const User = require("./model/bookModel");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const { initializingPassport } = require("./passportConfig");
const expressSession = require("express-session");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./public")));

app.use(expressSession({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

initializingPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get("/login", (req, res) => {
  res.render("login");
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/register',
    failureRedirect: '/login',

  })
);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./public"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

app.get("/register", isAuthenticated, async (req, res) => {
  try {
    const books = await User.find();
    return res.render("book", { books });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/add-book", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    req.body.image = req.file.filename;
    await User.create(req.body);

    const books = await User.find();
    return res.render("seen", { books });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/delete/:id", isAuthenticated, async (req, res) => {
  let id = req.params.id;
  await User.findByIdAndDelete(id);
  return res.redirect("/register");
});

app.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  const user = await User.findById(id);
  res.render("edit", { user });
});

app.post("/update-user/:id", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    let id = req.params.id;
    let existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).send("Book not found");
    }

    let updatedData = {
      bookname: req.body.bookname,
      author: req.body.author,
      date: req.body.date,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      image: req.file ? req.file.filename : existingUser.image,
    };

    await User.findByIdAndUpdate(id, updatedData, { new: true });

    const books = await User.find();
    return res.render("seen", { books });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/seelist", isAuthenticated, async (req, res) => {
  try {
    const books = await User.find();
    return res.render("seen", { books, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
