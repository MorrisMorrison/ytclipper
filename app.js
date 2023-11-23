var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");

var app = express();
const port = process.env.PORT || 4001;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/v1", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    message:
      "Ooopsi, that's not a valid url.)",
  });
});

app.listen(port, () => {
  console.log(`SERVER - STARTUP - Start ytclipper`);
  console.log(`SERVER - STARTUP - Listening at port ${port}`);
});

module.exports = app;
