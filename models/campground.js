const mongoose = require("mongoose");
const comments = require('./comment');

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
}, { timestamps: true });

campgroundSchema.pre('findOne', function(next) {
  this.populate({
    path: 'comments',
    options: {
      sort: '-_id'
    }
  });
  next();
});

campgroundSchema.index({
  name: 'text'
})

module.exports = mongoose.model("Campground", campgroundSchema);
