const debug = require("debug")("async-await-yelpcamp:campground");
const Campground = require("../models/campground");
const { cloudinary } = require('../cloudinary');
const { deleteCampgroundImage } = require('../middleware');
const User = require('../models/user');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const util = require('util');

module.exports = {
  async getProfile(req, res, next) {
    const user = await User.findOne({username: req.params.username });
    return res.render('profile/index', { user });
  },

  async updateProfile(req, res, next) {
    const { password } = req.body;
    const user = req.user
    try {
      if (req.file) {
       if (user.image.public_id) {
        await cloudinary.v2.uploader.destroy(user.image.public_id);
       }
        const { secure_url, public_id } = req.file;
        user.image = {
          secure_url,
          public_id
        };
        await user.save();
        req.flash('success', 'Image updated successfully');
        return res.redirect('back');
      }
      if(password) {
        await user.setPassword(password);
        await user.save();
        const login = util.promisify(req.login.bind(req));
        const msg = {
          from: "noreply@email.com",
          to: user.email,
          subject: "Yelp Camp - password changed",
          text: `
            Hello, it looks like your password was changed.
            If you did not do this, please change your password now.
          `,
          html: `
            <h1>Hello,</h1>
            <p>Hello, it looks like your password was changed.</p>
            <p>If you did not do this, please change your password now.</p>
          `,
        };
        await sgMail.send(msg);
        await login(user);
        req.flash('success', 'Password updated successfully');
        return res.redirect('back');
      }
    } catch(err) {
      debug(err.message);
      req.flash('error', 'Something went wrong, please contact us so we can look into it.');
      return res.redirect('back');
    }
  }
}