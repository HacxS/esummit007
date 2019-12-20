var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");



var workshopRegisterSchema = new mongoose.Schema({
  workshop_id : {
    type: String,
    required: true
  },
  workshop_name : {
    type : String,
    required:true
  },
  email : {
      type : String,
      required : true
  },
  name : {
      type : String,
      required : true
  },
  payment : {
      type : Boolean,
      required : true,
      default : false
  }

});

workshopRegisterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("WorkshopRegister", workshopRegisterSchema);