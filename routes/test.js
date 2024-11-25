var express = require('express');
const path = require("path");
const {colorstats} = require("../dbms/stats");
const {totalGet} = require("../dbms/cron");
const {deleteAndRefetchDocuments} = require("../dbms/MongDB");
const mongodb = require("mongodb");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const uri = 'mongodb+srv://yoop80075:whrudwns!048576@cluster0.r9zhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const mongo = new mongodb.MongoClient(uri);
  const totalClient = mongo.db('mabi').collection('total');
  const CYCLE_DURATION = 36 * 60 * 1000;
  const now = Date.now()
  const startOfDay = new Date(now).setHours(0, 0, 0, 0);
  const cycle = Math.floor((now - startOfDay) / CYCLE_DURATION) + 1;
  await totalGet();
  await new Promise(resolve => setTimeout(resolve, 20000));
  const currentCount = await totalClient.countDocuments({});
  await deleteAndRefetchDocuments(currentCount, cycle);
  await colorstats();
  res.send("ok")
});

module.exports = router;