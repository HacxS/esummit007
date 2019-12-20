var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");



var eventRegisterSchema = new mongoose.Schema({
  event_id : {
    type: String,
    required: true
  },
  name : {
      type : String,
      required : true
  },
  team_name : {
      type : String,
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

eventRegisterSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("EventRegister", eventRegisterSchema);