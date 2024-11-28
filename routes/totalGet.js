var express = require('express');
const path = require("path");
const {totalGet} = require("../dbms/total");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log('start totalGet');
  const result = await totalGet();
  res.send(result)

});

module.exports = router;