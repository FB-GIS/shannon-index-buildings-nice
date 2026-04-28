const express = require('express');
const router = express.Router();
const { getAllBati } = require('../controllers/batiController.js');

router.get('/bati', getAllBati);

module.exports = router;