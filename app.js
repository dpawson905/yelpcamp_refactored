require('dotenv').config();

const debug = require('debug')('async-await-yelpcamp:app');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);
const expressSanitizer = require('express-sanitizer');

const usersRouter = require('./routes/users');
const contactRouter = require('./routes/contact');
const commentRouter = require('./routes/comment');
const campgroundRouter = require('./routes/campground');
const indexRouter = require('./routes/index');

const User = require('./models/user');

const app = express();

/* Set up the connection to the Database */
mongoose.connect(process.env.DB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  debug('Connected to MongoDB');
});
const store = new MongoDBStore({
  mongooseConnection: mongoose.connection,
  touchAfter: 24 * 3600,
  secret: process.env.COOKIE_SECRET
});
// Catch errors
store.on('error', function (error) {
  console.log('STORE ERROR!!!', error);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(methodOverride('_method'));
app.use(expressSanitizer());
app.use(express.static(path.join(__dirname, 'public')));

/* Set a varialble called sess and set some up some cookie stuff */
const sess = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(flash());
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.title = process.env.APP_NAME;
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);
app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/comments', commentRouter);
app.use('/contact', contactRouter);
app.use('/users', usersRouter);

// catch 404 and display message to user
app.use(function(req, res, next) {
  req.flash("error", "That page does not exist.");
  res.redirect("/");
  next();
});

// error handler
app.use(function(err, req, res, next) {
  debug(err.stack);
  req.flash("error", err.message);
  res.redirect("/");
});

module.exports = app;
