// app.js
// Entry point to the application, creates and configures the server.
// =============================================================================

require("dotenv").config(); // load enviromental variables from local .env file

const path = require("path");

const express = require("express");
const mogoose = require("mongoose");
const session = require("express-session");
const csurf = require("csurf");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

const app = express();
const csrfProtection = csurf({ cookie: true }); // a cookie is be used because otherwise every session is modified (and therefore saved) when the csrf token is set

const User = require("./models/user");

// EXPRESS SETTINGS
// =============================================================================

app.set("view engine", "ejs");

// MIDDLEWARE
// =============================================================================

app.use("/static", express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET.split(","), // parse comma-seperated secrets
    resave: false,
    saveUninitialized: false, // don't save sessions that haven't been modified
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_SRV,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.ENVIROMENT === "production" ? true : false,
      maxAge:
        process.env.ENVIROMENT === "production"
          ? 1000 * 60 * 60 * 24 * 30
          : undefined,
    },
  })
);
app.use(cookieParser());
app.use(csrfProtection);

app.use(async (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  const user = await User.findById(req.session.userId);

  if (!user) {
    await req.session.destroy();
  } else {
    req.user = user;
  }

  next();
});

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAuthenticated = req.user ? true : false;
  res.locals.docTitle = "Connect Social Media";
  res.locals.activeTab = "home";
  next();
});

// ROUTES
// =============================================================================

const authRoutes = require("./routes/auth");
const socialRoutes = require("./routes/social");
const profileRoutes = require("./routes/profile");
const reportRoutes = require("./routes/report");
const postRoutes = require("./routes/post");

app.use(authRoutes);
app.use(socialRoutes);
app.use("/profile", profileRoutes);
app.use("/report", reportRoutes);
app.use("/post", postRoutes);

app.use((req, res) => {
  res.render("error/404.ejs");
});

// SERVER / DATABASE CONNECTION
// =============================================================================

mogoose
  .connect(process.env.MONGODB_SRV, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
