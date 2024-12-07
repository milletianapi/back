var express = require('express');
const {getMain} = require("../dbms/main");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const result = await getMain();
  res.send(result)
});

module.exports = router;