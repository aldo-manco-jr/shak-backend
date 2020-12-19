const express = require('express');
const router = express.Router();

const PostsMiddlewares = require('../controllers/posts');
const AuthHelper = require('../helpers/AuthHelper');


// Get All Posts Submitted by Following Users of Logged User
router.get('/streams', AuthHelper.VerifyToken, PostsMiddlewares.GetAllFollowingUsersPosts);

// Get All New Posts When Someone Submit a New Post
router.get('/streams/new/:created_at', AuthHelper.VerifyToken, PostsMiddlewares.GetAllNewPosts);

// Get All Posts From a Specific User
router.get('/streams/:username', AuthHelper.VerifyToken, PostsMiddlewares.GetAllUserPosts);

// Get a Single Post
router.get('/post/:id', AuthHelper.VerifyToken, PostsMiddlewares.GetPost);

// Logged User Submit a New Post
router.post('/post', AuthHelper.VerifyToken, PostsMiddlewares.AddPost);

// Logged User Deletes Its Own Post
router.delete('/post/:postid', AuthHelper.VerifyToken, PostsMiddlewares.RemovePost);

// Logged User Add a Specific Post In Its Favourites
router.post('/post/like', AuthHelper.VerifyToken, PostsMiddlewares.AddLike);

// Logged User Remove a Specific Post From Its Favourites
router.delete('/post/like/:postId', AuthHelper.VerifyToken, PostsMiddlewares.RemoveLike);

// Get Comments List Related to a Specific Post
router.get('/post/comments-list/:id', AuthHelper.VerifyToken, PostsMiddlewares.GetAllPostComments);

// Logged User Add a Comment to a Post Submitted by a Following User
router.post('/post/comment', AuthHelper.VerifyToken, PostsMiddlewares.AddComment);

// Logged User Delete Its Own Comment From a Post Submitted by a Following User
router.delete('/post/comment/:postid/:commentid', AuthHelper.VerifyToken, PostsMiddlewares.RemoveComment);


module.exports = router;
