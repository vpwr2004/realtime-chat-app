const express = require('express');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
const { accessChat, fetchChats, createGrouptChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatController');

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGrouptChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupremove').put(protect, removeFromGroup);
router.route('/groupadd').put(protect, addToGroup);

module.exports = router;
