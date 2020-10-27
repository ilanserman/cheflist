//ChefList
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const mongoose = require('mongoose');
const authenticate = require('./authenticate');
const multer = require('multer');
const helmet = require('helmet');
var rfs = require('rotating-file-stream')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const suppliersRouter = require('./routes/suppliers');
const categoriesRouter = require('./routes/categoriesRouter');
const uploadRouter = require('./routes/uploadRouter');
const productsRouter = require('/routes/products');

const config = require('./config');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db)=> {
    console.log('Connected correctly to the server');
}, (err) => {console.log("err: " + err);});

const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

const app = express();

app.use(helmet());
app.use(logger('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/api/users', usersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/products', productsRouter);

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
});

module.exports = app;
