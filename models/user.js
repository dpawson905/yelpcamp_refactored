const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    emailToken: String,
    isVerified: Boolean,
    isPaid: { type: Boolean, default: false },
    expiresDateCheck: {
      type: Date,
      default: undefined,
      // if user is not verified then the account will be removed in 24 hours
      expires: 86400
    }
});

UserSchema.plugin(passportLocalMongoose, {
  limitAttempts: true,
  interval: 100,
  // 300000ms is 5 min
  maxInterval: 300000,
  // This will completely lock out an account and requires user intervention.
  maxAttempts: 10,
  usernameLowerCase: true
});

UserSchema.index({
  username: 'text',
  email: 'text'
})

module.exports = mongoose.model("User", UserSchema);