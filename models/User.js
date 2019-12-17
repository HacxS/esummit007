var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  college: {
     type: String,
     required: true
  },
  phone: {
     type: String,
     required: true 
  },
  city : {
    type : String,
    required : true
  },
  date: {
    type: Date,
    default: Date.now
  },
  referal_from : {
    type: String,
    default: null
  },
  verify : {
    type : Boolean,
    default : false
  },
  link : [{
    type : Number
  }]
  });

  userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);