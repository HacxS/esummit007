var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");



var eventSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  student : {
      type : Boolean,
      default : true
  },
  startup : {
    type : Boolean,
    default : false
  }
});

eventSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Event", eventSchema);