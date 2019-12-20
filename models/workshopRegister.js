var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");



var workshopRegisterSchema = new mongoose.Schema({
  event_id : {
    type: String,
    required: true
  },
  leader_id : {
    type: String,
    required: true
  },
  student_id : {
      type : String,
      required : true
  },
  status : {
      type : Boolean,
      required : true,
      default : false
  },
  payment : {
      type : Boolean,
      required : true,
      default : false
  }

});

workshopRegisterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("WorkshopRegister", workshopRegisterSchema);