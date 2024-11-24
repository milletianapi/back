var express = require('express');
const path = require("path");
const {getall} = require("../dbms/getall");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {

  res.send(await getall())
});

module.exports = router;