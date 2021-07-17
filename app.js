var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var youtubedl = require('youtube-dl')
const fs = require('fs');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api')

var app = express();
const port = process.env.PORT || 4001;
const baseUrl = process.env.BASE_URL;
const appDir = path.dirname(require.main.filename);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1', apiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log(`SERVER - STARTUP - Check /tmp/videos folder`);
if (!fs.existsSync('/tmp/videos')){
  console.log(`SERVER - STARTUP - Create /tmp/videos folder`);
  try{
    fs.mkdirSync('/tmp/videos');
  }catch(err){
    console.log(err);
  }
}

console.log('SERVER - STARTUP - Check ' + appDir + '/videos folder');
if (!fs.existsSync(appDir + '/videos')){
  console.log(`SERVER - STARTUP - Create ` + appDir +'/videos folder');

  try{
    fs.mkdirSync(appDir + '/videos');
  }catch(err){
    console.log(err);
  }
}

app.listen(port, () => {
  console.log(`SERVER - STARTUP - Start ytclipper`);
  console.log(`SERVER - STARTUP - Listening at port ${port}`);
})

module.exports = app;
