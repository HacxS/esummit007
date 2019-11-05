var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  name: {
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
  branch : {
    type: String,
    required : true
  },
  course : {
    type : String,
    required : true
  },
  year : {
    type : String,
    required : String
  },
  date: {
    type: Date,
    default: Date.now
  },
  verified:{
    type: Boolean,
    default: false
  },
  referal_code: {
    type : String,
    default : null
  },
  refered_to: [{
    id: {
      type : String
    }
  }],
  referal_from : {
    type: String,
    default: null
  },
  link : {
    type : String,
    default : null
  }
  });

  userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);