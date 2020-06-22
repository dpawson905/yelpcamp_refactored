var express = require('express');
var router = express.Router();

const {
  asyncErrorHandler,
  isAuthenticated,
  isNotAuthenticated,
  isNotVerified,
  isPaid
} = require('../middleware');

const {
  getRegister,
  postRegister,
  verifyEmail,
  getLogin,
  postLogin,
  logout
} = require('../controllers/user');

const {
  checkout,
  postPay
} = require('../controllers/pay');

/* GET users listing. */
router.get('/register', isAuthenticated, getRegister);

/* POST users register */
router.post('/register', isAuthenticated, asyncErrorHandler(postRegister));

/* GET verify user */
router.get('/verify-email', isAuthenticated, asyncErrorHandler(verifyEmail));

/* GET login */
router.get('/login', isAuthenticated, getLogin);

/* POST login */
router.post('/login', isAuthenticated, asyncErrorHandler(isNotVerified), asyncErrorHandler(postLogin));

/* LOGOUT */
router.get('/logout', isNotAuthenticated, logout);

/* GET checkout */
router.get('/checkout', isNotAuthenticated, checkout);

/* POST pay */
router.post('/pay', isNotAuthenticated, asyncErrorHandler(postPay));

module.exports = router;
