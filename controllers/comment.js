const Campground = require("../models/campground");
const Comment = require("../models/comment");

module.exports = {
  async getNewComment(req, res, next) {
    const campground = await Campground.findOne({ slug: req.params.slug });
    return res.render("comments/new", { campground });
  },

  async postNewComment(req, res, next) {
    const campground = await Campground.findOne({ slug: req.params.slug });
    const comment = await Comment.create(req.body.comment);
    comment.author.id = req.user.id;
    comment.author.username = req.user.username;
    await comment.save();
    campground.comments.push(comment);
    await campground.save();
    req.flash("success", "Successfully added comment");
    return res.redirect(`/campgrounds/${campground.slug}`);
  },

  async getEditComment(req, res, next) {
    const comment = await Comment.findById(req.params.comment_id);
    res.render("comments/edit", { campground_slug: req.params.slug, comment });
  },

  async putEditComment(req, res, next) {
    await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
    return res.redirect(`/campgrounds/${req.params.slug}`);
  },

  async deleteComment(req, res, next) {
    await Comment.findByIdAndRemove(req.params.comment_id);
    req.flash("success", "Comment deleted");
    return res.redirect(`/campgrounds/${req.params.slug}`);
  }
};
