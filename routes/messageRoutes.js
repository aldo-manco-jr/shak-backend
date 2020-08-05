const express = require('express');
const router = express.Router();

const MessageCtrl = require('../controllers/message');
const AuthHelper = require('../Helpers/AuthHelper');

router.get('/chat-messages/:senderId/:receiverId', AuthHelper.VerifyToken, MessageCtrl.GetAllMessages);

router.get('/receiver-messages/:sender/:receiver', AuthHelper.VerifyToken, MessageCtrl.MarkReceiverMessages);

router.post('/chat-messages/:senderId/:receiverId', AuthHelper.VerifyToken, MessageCtrl.SendMessage);

module.exports = router;
