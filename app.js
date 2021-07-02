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

// EXPRESS SETTINGS
// =============================================================================

app.set("view engine", "ejs");

// MIDDLEWARE
// =============================================================================

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
      maxAge: 1000 * 60 * 60 * 24 * 30, // the cookie is valid for 30 days
    },
  })
);
app.use(cookieParser());
app.use(csrfProtection);

// ROUTES
// =============================================================================

const authRoutes = require("./routes/auth");

app.use(authRoutes);

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
