const express = require('express');
const path = require("path");
const {getGroupedPouch} = require("../dbms/total");
const {totalViewCount} = require("../dbms/MongDB");
const router = express.Router();

/* GET home page. */
router.post('/', async function(req, res, next) {
  totalViewCount()
  const result = await getGroupedPouch(req.body);
  res.send(result)
});

module.exports = router;