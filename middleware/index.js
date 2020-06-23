const Campground = require("../models/campground");
const Comment = require("../models/comment");
const User = require("../models/user");
const { cloudinary } = require('../cloudinary');


module.exports = {
  asyncErrorHandler: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },

  isNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    if (req["headers"]["content-type"] === "application/json") return res.send({ error: "Login required" });
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/users/login");
  },

  async checkCampgroundOwnership(req, res, next) {
    const foundCampground = await Campground.findById(req.params.id);
    if (foundCampground.author.id.equals(req.user._id)) return next();
    req.flash("error", "You don't have permission to do that");
    return res.redirect("back");
  },

  async checkCommentOwnership(req, res, next) {
    const foundComment = await Comment.findById(req.params.comment_id);
    if (foundComment.author.id.equals(req.user._id)) return next();
    req.flash("error", "You don't have permission to do that");
    return res.redirect("back");
  },

  isPaid(req, res, next) {
    if (req.user.isPaid) return next();
    req.flash("error", "Please pay registration fee before continuing");
    return res.redirect("/users/checkout");
  },

  async isNotVerified(req, res, next) {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      if (user.isVerified) return next();
      req.flash('error', 'Your account has not been verified. Please check your email to verify your account');
      return res.redirect('/');
    }
    next();
  },

  deleteCampgroundImage: async req => {
    if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
  }
};
