const mongoose = require("mongoose");

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: {
    secure_url: {
      type: String,
      default: "/images/campDefault.jpg",
    },
    public_id: String,
  },
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Campground", campgroundSchema);
