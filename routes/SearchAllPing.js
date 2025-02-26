var express = require('express');
const {groupClient} = require("../dbms/MongDB");
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const CYCLE_DURATION = 36 * 60 * 1000;
  const now = Date.now()
  const startOfDay = new Date(now).setHours(0, 0, 0, 0);
  const cycle = Math.floor((now - startOfDay) / CYCLE_DURATION) + 1;
  const isExist = await groupClient.countDocuments({cycle: cycle})
  if (isExist === 0) {
    const beforeCount = await groupClient.countDocuments({cycle: cycle === 1 ? 40 : cycle-1})
    res.send({status:"준비중", count: beforeCount}
    )}
  res.send({status:"갱신됨", count: isExist})
});

module.exports = router;