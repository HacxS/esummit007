var middlewareObj = {};


middlewareObj.ensureAuthenticated =  function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
}

middlewareObj.forwardAuthenticated = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/dashboard');      
}

middlewareObj.checkEmailVerification = function(req, res, next){
  // Is user Logged in
 if(req.user && req.user.verify == false){
     next(); 
 }else{

    if(!req.user){
      res.redirect("/"); 
    }
    else{
      req.flash(
        'success_msg',
        'Email is already verified'
      );
      
      res.redirect("/dashboard"); 
    }
      // Redirect to the previous page
     //res.send("You need to be logged in to edit the campground");
 }
}

module.exports = middlewareObj;

