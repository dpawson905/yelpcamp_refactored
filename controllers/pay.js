const debug = require("debug")("async-await-yelpcamp:pay");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require("../models/user");

module.exports = {
  checkout(req, res, next) {
    if (req.user.isPaid) {
      req.flash("success", "Your account is already paid");
      return res.redirect("/campgrounds");
    }
    res.render("checkout/checkout", { amount: 20 });
  },

  async postPay(req, res, next) {
    const { paymentMethodId, items, currency } = req.body;
    const amount = 2000;
    try {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        error_on_requires_action: true,
        confirm: true,
      });

      debug("💰 Payment received!");

      req.user.isPaid = true;
      await req.user.save();
      // The payment is complete and the money has been moved
      // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

      // Send the client secret to the client to use in the demo
      res.send({ clientSecret: intent.client_secret });
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
      // See https://stripe.com/docs/declines/codes for more
      if (e.code === "authentication_required") {
        res.send({
          error:
            "This card requires authentication in order to proceeded. Please use a different card.",
        });
      } else {
        res.send({ error: e.message });
      }
    }
  },
};
