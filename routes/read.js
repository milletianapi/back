var express = require('express');
const {readData, getData, viewCount} = require("../dbms/MongDB");
var router = express.Router();

router.get('/', async function (req, res, next) {
  await viewCount();
  try {
    const request = req.query;
    const now = Date.now();
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    const CYCLE_DURATION = 36 * 60 * 1000;
    const cycle = Math.floor((now - startOfDay) / CYCLE_DURATION) + 1;
    const date = new Date(now);
    const ymd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const find = await readData(ymd, cycle, request.server, request.channel, request.trade);
    find === null ? res.send(await getData(ymd, cycle, request.server, request.channel, request.trade)) : res.send(find);
  } catch (error) {
    res.send("error").status(500);
  }
});

module.exports = router;
