const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { uploadAudio } = require('../controllers/uploadController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, upload.single('audio'), uploadAudio);

module.exports = router;
