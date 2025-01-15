const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // cors 모듈 추가
const indexRouter = require('./routes/index');
const adsRouter = require('./routes/ads');
const usersRouter = require('./routes/users');
const readRouter = require('./routes/read');
const getDataRouter = require('./routes/getData');
const totalGetRouter = require('./routes/totalGet');
const getGroupRouter = require('./routes/getGroup');
const searchAllPingRouter = require('./routes/SearchAllPing');
const getMainPingRouter = require('./routes/getMain');
const cron = require('node-cron');
const {totalGet, getall} = require("./dbms/total");
const {colorstats} = require("./dbms/stats");
const mongodb = require("mongodb");

const app = express();

const CYCLE_DURATION = 36 * 60 * 1000;
const ONE_MINUTES = 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

cron.schedule('* * * * *',  async () => {
  const now = Date.now()
  const startOfDay = new Date(now).setHours(0, 0, 0, 0);
  const cycle = Math.floor((now - startOfDay) / CYCLE_DURATION) + 1;

  const cycleStartTime = startOfDay + (cycle - 1) * CYCLE_DURATION;
  const executionTime = cycleStartTime + FIVE_MINUTES;
  const oneTime = cycleStartTime + ONE_MINUTES;
  const uri = 'mongodb+srv://yoop80075:whrudwns!048576@cluster0.r9zhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const mongo = new mongodb.MongoClient(uri);
  const totalClient = mongo.db('mabi').collection('total');

  if (now >= oneTime && now < oneTime + 60 * 1000) {
    totalClient.deleteMany({});
    mongo.close();
  }

  if (now >= executionTime && now < executionTime + 60 * 1000) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await totalGet();
      await new Promise(resolve => setTimeout(resolve, 30000));
      const currentCount = await totalClient.countDocuments({});
      if (currentCount === 35904) {
        await getall(cycle);
        await colorstats();
        mongo.close();
        return;
      }
      await totalClient.deleteMany({});
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
});

app.set('trust proxy', true);

app.use((req, res, next) => {
  res.locals.isMobile = req.hostname.startsWith('m.');
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/searchall', indexRouter);
app.use('/searchone', indexRouter);
app.use('/ads.txt', adsRouter);
app.use('/read', readRouter);
app.use('/users', usersRouter);
app.use('/getData', getDataRouter);
app.use('/totalGet', totalGetRouter);
app.use('/getgroup', getGroupRouter);
app.use('/searchallping', searchAllPingRouter);
app.use('/getmain', getMainPingRouter);

app.use(express.static(path.join(__dirname, '../frontmobile/dist')));
app.use(express.static(path.join(__dirname, '../frontdesktop/dist')));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://milletianapi.com/', 'https://m.milletianapi.com/'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
