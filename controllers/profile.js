const debug = require("debug")("async-await-yelpcamp:campground");
const Campground = require("../models/campground");
const { cloudinary } = require('../cloudinary');
const { deleteCampgroundImage } = require('../middleware');
const User = require('../models/user');

module.exports = {
  async getProfile(req, res, next) {
    const user = await User.findOne({username: req.params.username });
    return res.render('profile/index', { user });
  }
}