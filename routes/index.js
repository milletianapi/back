var express = require('express');
const path = require("path");
const {visit} = require("../dbms/MongDB");

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  visit();
  if (res.locals.isMobile){
    res.sendFile(path.resolve(__dirname, '../dist2', 'test.html'));
  } else {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  }
});

module.exports = router;