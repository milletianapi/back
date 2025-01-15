var express = require('express');
const path = require("path");
const {visit, mobilevisitCount} = require("../dbms/MongDB");

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (res.locals.isMobile){
    mobilevisitCount();
    res.sendFile(path.resolve(__dirname, '../../frontmobile/dist', 'index.html'));
  } else {
    visit();
    res.sendFile(path.resolve(__dirname, '../../frontdesktop/dist', 'index.html'));
  }
});

module.exports = router;