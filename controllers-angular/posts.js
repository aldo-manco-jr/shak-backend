const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const moment = require('moment');
const request = require('request');

cloudinary.config({
  cloud_name: 'dfn8llckr',
  api_key: '575675419138435',
  api_secret: 'lE_zxe8vYudPLseXYFAJojyyTpc'
});

const posts = require('../models/postModels');
const users = require('../models/userModels');

module.exports = {

  AddPost(req, res) {

    const schemaPost = Joi.object().keys({
      post: Joi.string().required()
    });

    const onlyPost = {
      post: req.body.post
    };

    const { error } = Joi.validate(onlyPost, schemaPost);

    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ msg: error.details });
    }

    const body = {
      user_id: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created_at: new Date()
    };

    if (req.body.post && !req.body.image) {

      posts.create(body)
        .then(async post => {
          await users.updateOne({
            _id: req.user._id
          }, {
            $push: {
              posts: {
                postId: post._id,
                post: req.body.post,
                created_at: new Date()
              }
            }
          });
          res.status(HttpStatus.OK).json({ message: 'Post created successfully', post });
        }).catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });

      });

    }

    if (req.body.post && req.body.image) {

      cloudinary.uploader.upload(req.body.image, async (result) => {

        const reqBody = {
          user_id: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imageVersion: result.version,
          imageId: result.public_id,
          created_at: new Date()
        };

        posts.create(reqBody)
          .then(async post => {
            await users.updateOne({
                _id: req.user._id
              }, {
                $push: {
                  posts: {
                    postId: post._id,
                    post: req.body.post,
                    created_at: new Date()
                  }
                }
              }
            );
            res.status(HttpStatus.OK).json({ message: 'Post created successfully', post });
          })
          .catch(err => {
            res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: 'Error occured' });
          });
      });
    }
  },

  async RemovePost(req, res) {

    await posts.deleteOne({
      _id: req.body._id
    })
      .then(async () => {
        await users.updateOne({
          _id: req.user._id
        }, {
          $pull: {
            posts: {
              postId: req.body._id
            }
          }
        }).then(() => {
          return res.status(HttpStatus.OK).json({ message: 'Post removed successfully' });
        }).catch((err) => {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
        });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async GetAllPosts(req, res) {

    const today = moment().startOf('day');
    const oneMonthAgo = moment(today).subtract(31, 'days');

    try {
      const allPosts = await posts.find({
        created_at: {$gte: oneMonthAgo.toDate()}
      })
        .populate('user_id')
        .sort({ created_at: -1 });

      const top = await posts.find({
        'likes.username': { $eq: req.user.username },
        created_at: {$gte: oneMonthAgo.toDate()}
      })
        .populate('user_id')
        .sort({ created_at: -1 });

      const loggedUser = await users.findOne({
        _id: req.user._id
      });

      if (loggedUser.city === '' && loggedUser.country === ''){
        request('http://geolocation-db.com/json/', {json: true}, async (err, res, body) => {

          await users.updateOne({
            _id: req.user._id
          }, {
            city: body.city,
            country: body.country_name
          });
        });
      }

      return res.status(HttpStatus.OK).json({ message: 'All posts', allPosts, top });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
    }
  },

  async AddLike(req, res) {

    const postId = req.body._id;

    await posts.updateOne({
        _id: postId,
        'likes.username': { $ne: req.user.username }
      },
      {
        $push: {
          likes: {
            username: req.user.username
          }
        },
        $inc: {
          total_likes: 1
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have liked the post' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async RemoveLike(req, res) {

    const postId = req.body._id;

    await posts.updateOne({
        _id: postId,
        'likes.username': { $eq: req.user.username }
      },
      {
        $pull: {
          likes: {
            username: req.user.username
          }
        },
        $inc: {
          total_likes: -1
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have unliked the post' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async AddComment(req, res) {

    const postId = req.body.postId;

    await posts.updateOne({
        _id: postId
      },
      {
        $push: {
          comments: {
            user_id: req.user._id,
            username: req.user.username,
            comment_text: req.body.comment,
            created_at: new Date()
          }
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have commented the post' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async RemoveComment(req, res) {

    const { postId, comment } = req.body;

    await posts.updateOne({
        _id: postId
      },
      {
        $pull: {
          comments: {
            _id: comment._id
          }
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have remove the post successfully' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async GetPost(req, res) {
    await posts.findOne({ _id: req.params.id })
      .populate('user_id')
      .populate('comments.user_id')
      .then((post) => {
        res.status(HttpStatus.OK).json({ message: 'Post Found', post });
      })
      .catch(err =>
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Post Not Found' }));
  }
};
