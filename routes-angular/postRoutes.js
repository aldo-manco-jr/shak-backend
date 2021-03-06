const express = require('express');
const router = express.Router();

const PostCtrl = require('../controllers-angular/posts');
const AuthHelper = require('../helpers/AuthHelper');

router.get('/posts', AuthHelper.VerifyToken, PostCtrl.GetAllPosts);
//router.get('/post/:id', AuthHelper.VerifyToken, PostCtrl.GetPost);

router.post('/post/add-post', AuthHelper.VerifyToken, PostCtrl.AddPost);
router.post('/post/remove-post', AuthHelper.VerifyToken, PostCtrl.RemovePost);

router.post('/post/add-like', AuthHelper.VerifyToken, PostCtrl.AddLike);
router.post('/post/remove-like', AuthHelper.VerifyToken, PostCtrl.RemoveLike);

router.post('/post/add-comment', AuthHelper.VerifyToken, PostCtrl.AddComment);
router.post('/post/remove-comment', AuthHelper.VerifyToken, PostCtrl.RemoveComment);

module.exports = router;
