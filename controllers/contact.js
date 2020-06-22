const debug = require("debug")("async-await-yelpcamp:contact");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  getContact(req, res, next) {
    res.render('contact/contact');
  },

  async postContact(req, res, next) {
    let { name, email, message } = req.body;
    name = req.sanitize(name);
    email = req.sanitize(email);
    message = req.sanitize(message);
    const msg = {
      to: process.env.ADMIN_EMAIL,
      from: email,
      subject: `YelpCamp Contact Form Submission from ${name}`,
      text: message,
      html: `
      <h1>Hi there, this email is from, ${name}</h1>
      <p>${message}</p>
      `,
    };
    try {
      await sgMail.send(msg);
      req.flash('success', 'Thank you for your email, we will get back to you shortly.');
      res.redirect('/contact');
    } catch (error) {
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
      req.flash('error', 'Sorry, something went wrong, please contact admin@website.com');
      res.redirect('back');
    }
  }
}