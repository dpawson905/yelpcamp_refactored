const debug = require('debug')('async-await-yelpcamp:auth')
const passport = require('passport');
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/user');

module.exports = {
  getRegister(req, res, next) {
    res.render('auth/register');
  },

  async postRegister(req, res, next) {
    /* 
      Passport.js by default only validates and checks for identical
      usernames. So we need to check to make sure that there isn't 
      duplicate emails in the database as well. If there are no duplicate 
      email addresses, we continue on with the registration process.
    */
    const userEmailCheck = await User.findOne({ email: req.body.email });
    if (userEmailCheck) {
      req.flash('error', 'This email address is already in use.');
      return res.redirect('back');
    }
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      emailToken: crypto.randomBytes(64).toString('hex'),
      isVerified: false,
      expiresDateCheck: Date.now()
    });
    const user = await User.register(newUser, req.body.password);
    const msg = {
      from: 'noreply@email.com',
      to: user.email,
      subject: 'Yelp Camp - verify your email',
      text: `
        Hello, thanks for registering on our site.
        Please copy and paste the address below to verify your account.
        http://${req.headers.host}/verify-email?token=${user.emailToken}
      `,
      html: `
        <h1>Hello,</h1>
        <p>Thanks for registering on our site.</p>
        <p>Please click the link below to verify your account.</p>
        <a href="http://${req.headers.host}/users/verify-email?token=${user.emailToken}">Verify your account</a>
      `
    }
    try {
      await sgMail.send(msg);
      req.flash('success', 'Thanks for registering. Please check you email to verify your account.')
      return res.redirect('/');
    } catch(err) {
      if (err) return next(err);
      req.flash('Something went wrong please contact us so we can look into it.');
      return res.redirect('back');
    }
  }, 

  async verifyEmail(req, res, next) {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      req.flash('error', 'Token is invalid. Please contact us for assistance.');
      return res.redirect('/');
    }
    user.emailToken = null;
    user.isVerified = true;
    user.expiresDateCheck = null;
    await user.save();
    await req.login(user, async (err) => {
      if (err) return next(err);
      req.flash('success', `Welcome to Yelp Camp ${user.username}`);
      res.redirect('/users/checkout');
    });
  },

  getLogin(req, res, next) {
    res.render('auth/login')
  }, 

  async postLogin(req, res, next) {
    await passport.authenticate('local', {
      successRedirect: '/campgrounds',
      failureRedirect: '/users/login',
      successFlash: `Welcome back`,
      failureFlash: true
    })(req, res, next);
  },

  logout(req, res, next) {
    req.logout();
    res.redirect('/');
  }
}