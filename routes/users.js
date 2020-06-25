const express = require('express');
const router = express.Router();

const {
  asyncErrorHandler,
  isNotAuthenticated,
  isNotVerified
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
router.get('/register', getRegister);

/* POST users register */
router.post('/register', asyncErrorHandler(postRegister));

/* GET verify user */
router.get('/verify-email', asyncErrorHandler(verifyEmail));

/* GET login */
router.get('/login', getLogin);

/* POST login */
router.post('/login', asyncErrorHandler(isNotVerified), asyncErrorHandler(postLogin));

/* LOGOUT */
router.get('/logout', isNotAuthenticated, asyncErrorHandler(logout));

/* GET checkout */
router.get('/checkout', isNotAuthenticated, checkout);

/* POST pay */
router.post('/pay', isNotAuthenticated, asyncErrorHandler(postPay));

module.exports = router;
