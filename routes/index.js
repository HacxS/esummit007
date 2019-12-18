var express = require("express");
var router = express.Router();
var User = require("../models/User");
var middleware = require('../config');
var passport = require("passport");
var bcrypt = require('bcryptjs');
var nodemailer = require("nodemailer");
const keys = require('../security/keys');
const refer = require('../security/refer');

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL || keys.admin.email,
      pass: process.env.PASSWORD  ||keys.admin.password
  }
});

var rand, link;

router.get('/send', middleware.checkEmailVerification, middleware.ensureAuthenticated, (req, res) => {
  rand=Math.floor((Math.random() * 100000) + 54);
  link="http://"+req.get('host')+"/verify?id="+rand+"&email="+req.user.email;
  console.log(link)
  arr = []
  User.findOne({email: req.user.email}, (err, user)=> {
    if(err){
      req.flash('error_msg','Email not found');
      res.redirect('/dashboard');
    }
    else{
      arr = user.link;
      arr.push(rand)
      User.findOneAndUpdate({email: req.user.email}, {$set:{link:arr}}, (err, resu) => {
        if(err){
          req.flash('error_msg','Could Not update Link in Database');
          res.redirect('/dashboard');
        }
        else{
          let mailOptions={
            from: keys.admin.from_email,
            to : req.user.email,
            subject : "Please confirm your Email account",
            html : "<h4 style='text-align:center'>Email Verification </h4> <br>Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a><br> <p>P.S. If you have received this mail multiple time then please click the most recent mail and in that click verify email.</p>"	
          }
          smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
              req.flash('error_msg','Could Not Send Mail');
              res.redirect('/dashboard');
            }
            else{
                console.log("Message sent: " + response.message);
                req.flash('success_msg','Email Sent Successfuly');
                res.redirect('/dashboard');
            }
          });
        }
      })
    }
  });
});

router.get('/verify', function(req,res){
  var currentID = req.query.id;
  var trueID = null;
  var allID = null;
 User.findOne({email: req.query.email}, (err1, result) => {
   
   if(err1){res.send("Something went wrong, email not found")}
   else{
    if(result.verify == false){
      trueID = result.link[result.link.length-1];
      allID = result.link;
      if(currentID == trueID)
      {
         User.findOneAndUpdate({email: req.query.email}, {$set:{verify:true}}, (err3, doc) => {
           if (err3) {  
               res.send("Something went wrong, please re-verify your email")
           }
           else{
             res.send("Email is verified, please close this tab and refresh the previous tab of the dashboard.")
           }
         })
      }
      else
      {
        flag = 0;
        allID.forEach(x => {
          if(x == currentID){
           flag = 1;
           res.send("This is an experied link please clicked the latest one");
          }
        });
        if(flag == 0){
         res.send("This is a wrong link");
        }
      }
    }
    else{
      res.send("Email already verified");
    }
   }
 
 })
});

router.get('/', (req,res) => {
  res.render("index", {user : req.user});
})

router.get('/register', middleware.forwardAuthenticated, (req,res) => {
  res.render("register");
});

router.get('/login', middleware.forwardAuthenticated, (req,res) => {
  res.render("login");
});

router.get('/dashboard', middleware.ensureAuthenticated , (req,res) => {
  res.render("dashboard", { user : req.user});
});



// Register
router.post('/register', (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const phone = req.body.phone;
    const college = req.body.college;
    const city = req.body.city;
    const referal_from = req.body.referal_from || null;
    let errors = [];
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
    if (errors.length > 0) {
      res.render('register', { errors, email, password  });
    }
    else {
      console.log(refer.referal[0].referal_code);
      var flag =0;
      console.log(referal_from + "==");
      
      if(referal_from !=null){
        refer.referal.forEach(x => {
          if(x.referal_code == referal_from){
            console.log(x.referal_code);
            flag =1;
            User.findOne({ email: email }).then(user => {
              if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', { errors, email, password });
              } 
              else {
                var newUser = new User({ first_name, last_name, email, password, phone, college, city, referal_from });
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(user => {
                      console.log("--")
                      req.flash('success_msg','You are now registered and can log in');
                      res.redirect('/login');
                      })
                      .catch(err => console.log(err));
                  })    
                })
              }
            })
          }
        });
        if(flag ==0){
          errors.push({ msg: 'Invalid Referal Code' });
          res.render('register', { errors, email, password });
        }
      }
      else{
        User.findOne({ email: email }).then(user => {
          if (user) {
            errors.push({ msg: 'Email already exists' });
            res.render('register', { errors, email, password });
          } 
          else {
            var newUser = new User({ first_name, last_name, email, password, phone, college, city, referal_from });
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save().then(user => {
                  console.log("--")
                  req.flash('success_msg','You are now registered and can log in');
                  res.redirect('/');
                  })
                  .catch(err => console.log(err));
              })    
            })
          }
        })
      }
    }
  });


router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/',
      failureFlash: true,
      successFlash: true,
      successMessage: "Yoyo"
    })(req, res, next);
  });



router.get("/logout",  function(req, res) {
  req.logout(); 
  req.flash('success_msg','Successfully logged out');
  res.redirect('/');
});











 module.exports = router;