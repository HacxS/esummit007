var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
/* var ids = require('short-id');

ids.configure({
  length: 5,          
  algorithm: 'sha1',  
  salt: Math.random   
}); */


var userSchema = new mongoose.Schema({
/*   id: {
    type: String,
    default: "ES-" + ids.generate()
  }, */
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
  }],
  startup : {
    type : Boolean,
    default : false
  },
  esummit_id : {
    type : Boolean,
    default : null
  }
})

  userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);