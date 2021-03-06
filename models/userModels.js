const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/*
    Definizione Schema Utente
 */

const userSchema = mongoose.Schema({
    username: {type: String},
    email: {type: String},
    password: {type: String},
    posts: [
        {
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
            post: { type: String },
            created_at: { type: Date, default: Date.now() }
        }
    ],

    following: [
        {userFollowed: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}}
    ],

    followers: [
        {follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}}
    ],

    notifications: [
        {
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            message: { type: String },
            viewProfile: { type: Boolean, default: false },
            created: { type: Date, default: Date.now() },
            read: { type: Boolean, default: false },
            date: { type: String, default: '' }
        }
    ],

    chatList: [
        {
            receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            msgId: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'}
        }
    ],

    profileImageId: {type: String , default: 'qktq4chaw5bk7xdwwieu.jpg' },
    profileImageVersion: { type: String, default: '1596898350' },
    coverImageId: {type: String , default: 'qktq4chaw5bk7xdwwieu.jpg' },
    coverImageVersion: { type: String, default: '1596898350' },

    images: [
        {
            imageId : { type: String, default:'' },
            imageVersion : { type: String, default:'' }
        }
    ],

    city: { type: String, default: ''},
    country: { type: String, default: ''}
});

userSchema.statics.EncryptPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

// userSchema.pre('remove', function(next) {
//     this.model('Post').remove({ user_id: this._id }, next);
//     next();
// });

// esportazione schema
module.exports = mongoose.model('User', userSchema);
