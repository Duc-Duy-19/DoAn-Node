// load environment variables from .env (if present)
require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let mongoose = require("mongoose");
let { Response } = require("./utils/responseHandler");

// Database connection
mongoose
  .connect("mongodb://localhost:27017/NNPTUD-S5")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// serve templates (static assets like reset-password.html / reset-password.js)
app.use("/templates", express.static(path.join(__dirname, "templates")));
// serve resources (static frontend files: views, js, css)
app.use("/resources", express.static(path.join(__dirname, "resources")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/roles", require("./routes/roles"));
app.use("/auth", require("./routes/auth"));
app.use("/categories", require("./routes/categories"));
app.use("/products", require("./routes/products"));
app.use("/addresses", require("./routes/addresses"));
app.use("/reviews", require("./routes/reviews"));
app.use("/carts", require("./routes/carts"));
app.use("/orders", require("./routes/orders"));
app.use("/orderItems", require("./routes/orderItems"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  Response(res, err.status || 500, false, err);
});

module.exports = app;
