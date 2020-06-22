const debug = require("debug")("async-await-yelpcamp:campground");
const Campground = require("../models/campground");
const { cloudinary } = require('../cloudinary');
const { deleteCampgroundImage } = require('../middleware');

module.exports = {
  async getCampgrounds(req, res, next) {
    if (req.query.paid) res.locals.success = 'Payment succeeded, welcome to YelpCamp!';
    console.log(req.user)
    const campgrounds = await Campground.find({});
    return res.render('campgrounds/index', { campgrounds });
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
      await Campground.create(campgroundInfo);
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
    const campground = await Campground.findById(req.params.id).populate('comments').exec();
    return res.render("campgrounds/show", { campground });
  },

  async getEditCampground(req, res, next) {
    const campground = await Campground.findById(req.params.id);
    return res.render("campgrounds/edit", { campground });
  },

  async putEditCampGround(req, res, next) {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    req.flash('success', 'Campground has been updated.')
    return res.redirect(`/campgrounds/${req.params.id}`);
  },

  async deleteCampground(req, res, next) {
    await Campground.findByIdAndRemove(req.params.id);
    req.flash('success', 'Campground removed');
    return res.redirect('/campgrounds');
  }
}
