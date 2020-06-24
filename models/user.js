const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    emailToken: String,
    isVerified: Boolean,
    image: {
      secure_url: {
        type: String,
        default: "/images/no-user.jpg",
      },
      public_id: String,
    },
    isPaid: { type: Boolean, default: false },
    expiresDateCheck: {
      type: Date,
      default: undefined,
      // if user is not verified then the account will be removed in 24 hours
      expires: 86400
    },
    campgrounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground",
      },
    ],
}, { timestamps: true });

UserSchema.index({
  username: 'text',
  email: 'text'
});

UserSchema.pre('findOne', function(next) {
  this.populate('campgrounds');
  next();
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

module.exports = mongoose.model("User", UserSchema);