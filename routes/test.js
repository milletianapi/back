var express = require('express');
const path = require("path");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '../dist3', 'index3.html'));
});

module.exports = router;