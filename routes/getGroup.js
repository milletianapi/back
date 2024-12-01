const express = require('express');
const path = require("path");
const {getGroupedPouch} = require("../dbms/total");
const router = express.Router();

/* GET home page. */
router.post('/', async function(req, res, next) {
  console.log('start get grouped');

  const result = await getGroupedPouch(req.body);
  console.log(result);
  res.send(result)
});

module.exports = router;