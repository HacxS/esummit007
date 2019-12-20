var express = require("express");
var router = express.Router();

var User = require("../models/User");
var Event = require("../models/events");
var Workshop = require("../models/workshop");
var EventRegister = require("../models/eventRegister");
var WorkshopRegister = require("../models/workshopRegister")

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
  link="https://"+req.get('host')+"/verify?id="+rand+"&email="+req.user.email;
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
  Event.find({}, (err, events) => {
    if(err){
      res.send({error : "Error Occured due to events"})
    }
    else{
      dup =events
      dup2 =[]
      EventRegister.find({student_id : req.user.email} , (err , doc1) => {
        var flag = 0
        dup.forEach(x => {
          doc1.forEach(y => {
            if( x._id == y.event_id){
              flag = 1;
            }
          });
          if(flag == 0)dup2.push(x);
          else flag = 0;
        });
        events = dup2;
        Workshop.find({}, (err2, workshops) => {
          if(err2){
            res.send({error : "Error Occured due to workshops"})
          }
          else{

            EventRegister.find({ student_id : req.user.email}, (err3, result4) => {
              
              EventRegister.find({ leader_id : req.user.email}, (err3, result5) => {
              res.render("dashboard", { user : req.user, events : events, registeredEvents : result4, workshops : workshops, leaderEvents : result5});
            })
            
          })
        }
        })
      })
    }
  })
});



router.get('/dashboard-participate', middleware.ensureAuthenticated , (req,res) => {  

    EventRegister.find({ student_id : req.user.email}, (err, result) => {
      if(err)res.send("Error");
      else{
        arr =[]
        var len = result.length;
        var i=1;
        result.forEach(x => {
          EventRegister.find({ team_name : a.team_name}, (err2, result2) => {
            if(err2)res.send("Error2");
            else{
              arr.push(result2);
            }
            i++;
            if(i==len){
              res.render("participate", { user : req.user, registeredEvents : result, allteam : result2 });
            }
        });


      })
      }
      
      
      
    
  })
})


router.post('/dashboard/event', middleware.ensureAuthenticated , (req,res) => {
  var event_id = req.body.id;
  var name = null;
  var leader_id = req.user.email;
  var student_id = req.user.email;
  var status = true;
  var team_name = req.body.team_name;

  Event.findOne({_id : event_id}, (err, result) => {
    console.log(result)
    name = result.name;
    var newEventRegister = new EventRegister({ event_id, name, team_name, leader_id, student_id, status});
    newEventRegister.save().then(newEvent => {
      req.flash('success_msg','You have registered this event');
      res.redirect('/dashboard');
      })
  })
  
});

router.post('/dashboard/add-member-event', middleware.ensureAuthenticated , (req,res) => {
  var event_id = req.body.event_id;
  var leader_id = req.user.email;
  var student_id = req.body.email;
  var name = null;
  var team_name = "T";
  console.log("11")
  Event.findOne({_id : event_id}, (err, result) => {
    name = result.name;
    console.log("22")
    User.findOne({email : student_id}, (err, result) => {
      if(err)res.send("Error")
      else {
        console.log("33")
        if(result){
          console.log("**")
          var newEventRegister = new EventRegister({ event_id, team_name, name, leader_id, student_id});
          newEventRegister.save().then(newEvent => {
            console.log("44")
            req.flash('success_msg','You have registered this event');
            res.redirect('/dashboard-participate');
            })
        }
        else{
          console.log("//")
          req.flash('success_msg','Email Id does not exist');
          res.redirect('/dashboard-participate');
        }
      }
    })
  });

  
  
});


router.get('/dashboard/accept-event/:id', middleware.ensureAuthenticated , (req,res) => {
  var event_register_id = req.params.id;

  EventRegister.findOne({_id : event_register_id }, (err, event) => {
    if(err){
      res.send({error : "Error Occured due to accpetance"})
    }
    else{
      if(event.student_id == req.user.email){
        EventRegister.findOneAndUpdate({_id : event_register_id }, {$set:{status : true}}, (err, event) => {
          if(err){
            res.send({error : "Error Occured due to acceptance up"})
          }
          else{
                req.flash('success_msg','You have accpeted the event');
                res.redirect('/dashboard');
          }
        })
      }
      else{
            req.flash('success_msg','Event cannot be rejected');
            res.redirect('/dashboard');
      }
    }
  });
});


router.get('/dashboard/reject-event/:id', middleware.ensureAuthenticated , (req,res) => {
  var event_register_id = req.params.id;

  EventRegister.findOne({_id : event_register_id }, (err, event) => {
    if(err){
      res.send({error : "Error Occured due to deletion"})
    }
    else{
      if(event.student_id == req.user.email){
        EventRegister.findByIdAndRemove({_id : event_register_id }, (err, event) => {
          if(err){
            res.send({error : "Error Occured due to deletion"})
          }
          else{
                req.flash('success_msg','You have rejected the event');
                res.redirect('/dashboard');
          }
        })
      }
      else{
            req.flash('success_msg','Event cannot be rejected');
            res.redirect('/dashboard');
      }
    }
  });
});

router.get('/dashboard/discard-event/:id', middleware.ensureAuthenticated , (req,res) => {
  var event_register_id = req.params.id;

  EventRegister.findOne({_id : event_register_id }, (err, event) => {
    if(err){
      res.send({error : "Error Occured due to deletion"})
    }
    else{
      if(event.leader_id == req.user.email){
        EventRegister.findByIdAndRemove({_id : event_register_id }, (err, event) => {
          if(err){
            res.send({error : "Error Occured due to deletion"})
          }
          else{
                req.flash('success_msg','You have removed the event');
                res.redirect('/dashboard');
          }
        })
      }
      else{
            req.flash('success_msg','Event cannot be rejected');
            res.redirect('/dashboard');
      }
    }
  });
});

router.post('/event-post', (req, res) => {
  var name = req.body.name;
  var startup = true;
  var student = false;
  var newEvent = new Event({name, student, startup});
  newEvent.save().then(newEvent => {
    console.log("++")
    req.flash('success_msg','You have created a event');
    res.redirect('/tab');
    });
});

router.get('/tab' , (req, res) => {
  res.render('tab')
})



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
    var startup = req.body.startup;
    if(startup == 1)startup = true;
    else startup = false;
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
                var newUser = new User({ first_name, last_name, email, password, phone, college, city, referal_from,  startup});
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(user => {
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
                  req.flash('success_msg','You are now registered and can log in');
                  res.redirect('/login');
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