const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const  auth = require('./passport');
var app = express();
const keys = require('./security/keys');

// Passport Config
auth(passport);

app.use(express.static(__dirname + "/public"));
// DB Config
const db = process.env.MONGDB_URL || keys.admin.mongoDB;

// Connect to MongoDB
mongoose
  .connect(db);

app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
name: 'session',
keys: ['SECRECT KEY'],
maxAge: 24 * 60 * 60 * 1000
}));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
    app.use(cookieParser());
  
    // Connect flash
    app.use(flash());
  
  // Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

var index = require("./routes/index")

// Routes
app.use('/', index);

const PORT = process.env.PORT || 443;

app.listen(PORT, function(){
    console.log("Server started");
});