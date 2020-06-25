const debug = require("debug")("async-await-yelpcamp:campground");
const Campground = require("../models/campground");
const { cloudinary } = require('../cloudinary');
const { deleteCampgroundImage } = require('../middleware');
const _ = require('lodash');

module.exports = {
  async getCampgrounds(req, res, next) {
    if (req.query.paid) res.locals.success = 'Payment succeeded, welcome to YelpCamp!';
    if(req.query.search) {
      const regex = new RegExp(_.escapeRegExp(req.query.search));
      const campgrounds = await Campground.find({ name: regex });
      if(campgrounds.length < 1) {
        req.flash('error', `No campgrounds match ${regex}, please try again.`)
        return res.redirect('/campgrounds')
      }else {
        return res.render('campgrounds/index', { campgrounds });
      }
    } else {
      const campgrounds = await Campground.find({});
      return res.render('campgrounds/index', { campgrounds });
    }
  },

  getNewCampground(req, res, next) {
    res.render("campgrounds/new");
  },

  async postNewCampground(req, res, next) {
    try {
      const campgroundInfo = req.body;
      campgroundInfo.author = {
        id: req.user.id,
        username: req.user.username
      };
      if (req.file) {
        const { secure_url, public_id } = req.file;
        req.body.image = {
          secure_url,
          public_id
        };
      }
      const campground = await Campground.create(campgroundInfo);
      req.user.campgrounds.push(campground);
      await req.user.save();
      req.flash('success', `${campgroundInfo.name} has been created.`);
      return res.redirect('/campgrounds');
    } catch(err) {
      if(err) return next(err);
      deleteCampgroundImage(req);
      debug(err);
      req.flash('error', 'Something went wrong with cloudinary. Please contact us so we can look into it.')
      return res.redirect('back');
    }
  },

  async getCampground(req, res, next) {
    const campground = await Campground.findOne({ slug: req.params.slug });
    return res.render("campgrounds/show", { campground });
  },

  async postLikes(req, res, next) {
    let campground = await Campground.findOne({ slug: req.params.slug });
    const foundUserLike = campground.likes.some((like) => {
      return like.equals(req.user._id);
    });
    if (foundUserLike) {
      // User already liked, removing like
      campground.likes.pull(req.user._id);
    } else {
      // adding the new user like
      campground.likes.push(req.user);
    }
    await campground.save();
    return res.redirect(`/campgrounds/${campground.slug}`);
  },

  async getEditCampground(req, res, next) {
    const campground = await Campground.findOne({ slug: req.params.slug });
    return res.render("campgrounds/edit", { campground });
  },

  async putEditCampGround(req, res, next) {
    console.log(JSON.parse(JSON.stringify(req.body)))
    try {
      const campground = await Campground.findOne({ slug: req.params.slug });
      campground.name = req.body.campground.name;
      campground.description = req.body.campground.description;
      campground.cost = req.body.campground.cost;
      if (req.file) {
        if (campground.image.public_id) {
          await cloudinary.v2.uploader.destroy(campground.image.public_id);
        }
        const { secure_url, public_id } = req.file;
        campground.image = {
          secure_url,
          public_id
        };
      } 
      await campground.save();
      req.flash('success', 'Campground has been updated.')
      return res.redirect(`/campgrounds/${req.params.slug}`);
    } catch(err) {
      deleteCampgroundImage(req);
      console.log(err)
      next(err);
    }
  },

  async deleteCampground(req, res, next) {
    const campground = await Campground.findOneAndRemove({ slug: req.params.slug });
    if (campground.image.public_id) {
      await cloudinary.v2.uploader.destroy(campground.image.public_id);
    }
    req.flash('success', 'Campground removed');
    return res.redirect('/campgrounds');
  },
}
