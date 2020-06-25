const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema(
  {
    roles: {
      admin: {
        type: Boolean,
        default: false
      },
      moderator: {
        type: Boolean,
        default: false
      },
      camper: {
        type: Boolean,
        default: true
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      required: "username is required",
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: "email is required",
      lowercase: true,
      trim: true,
      unique: true,
    },
    emailToken: String,
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    image: {
      secure_url: {
        type: String,
        default: "/images/no-user.jpg",
      },
      public_id: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    expiresDateCheck: {
      type: Date,
      default: undefined,
      // if user is not verified then the account will be removed in 24 hours
      expires: 86400,
    },
    campgrounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground",
      },
    ],
  },
  { timestamps: true }
);

UserSchema.index({
  username: "text",
  email: "text",
});

UserSchema.pre("findOne", function (next) {
  this.populate({
    path: "campgrounds",
    options: {
      sort: "-_id",
    },
    limit: 10,
  });
  next();
});

UserSchema.plugin(passportLocalMongoose, {
  limitAttempts: true,
  interval: 100,
  // 300000ms is 5 min
  maxInterval: 300000,
  // This will completely lock out an account and requires user intervention.
  maxAttempts: 10,
  usernameLowerCase: true,
});

// UserSchema.pre('update', function(next) {
//   try {
//     if(this.isOnline = true) {
//       this.set(isOnline, false);
//       next();
//     }
//     if(this.isOnline = false) {
//       this.set(isOnline, true);
//       next();
//     }
//   } catch(err) {
//     next(err);
//   }
// });

module.exports = mongoose.model("User", UserSchema);
