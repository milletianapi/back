var express = require('express');
const path = require("path");
const {visit} = require("../dbms/MongDB");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  visit();
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

module.exports = router;