const express = require("express");
const router  = express.Router({ mergeParams: true });

const {
  asyncErrorHandler,
  isNotAuthenticated,
  checkCommentOwnership
} = require('../middleware');

const {
  getNewComment,
  postNewComment,
  getEditComment,
  putEditComment,
  deleteComment
} = require('../controllers/comment');

/* GET new comment */
router.get('/new', isNotAuthenticated, asyncErrorHandler(getNewComment));

/* POST new comment */
router.post('/', isNotAuthenticated, asyncErrorHandler(postNewComment));

/* GET edit comment */
router.get('/:comment_id/edit', isNotAuthenticated, asyncErrorHandler(checkCommentOwnership), asyncErrorHandler(getEditComment));

/* PUT edit comment */
router.put('/:comment_id', isNotAuthenticated, asyncErrorHandler(checkCommentOwnership), asyncErrorHandler(putEditComment));

/* DELETE comment */
router.delete('/:comment_id', isNotAuthenticated, asyncErrorHandler(checkCommentOwnership), asyncErrorHandler(deleteComment));

module.exports = router;
