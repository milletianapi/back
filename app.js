const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // cors 모듈 추가
const indexRouter = require('./routes/index');
const testRouter = require('./routes/test');
const adsRouter = require('./routes/ads');
const usersRouter = require('./routes/users');
const readRouter = require('./routes/read');
const getDataRouter = require('./routes/getData');
const totalGetRouter = require('./routes/totalGet');
const getGroupRouter = require('./routes/getGroup');
const searchAllPingRouter = require('./routes/SearchAllPing');
const getMainPingRouter = require('./routes/getMain');
const cron = require('node-cron');
const {totalGet, deleteAndRefetchDocuments, getall} = require("./dbms/total");
const {colorstats} = require("./dbms/stats");
const mongodb = require("mongodb");

const app = express();

const CYCLE_DURATION = 36 * 60 * 1000;
const ONE_MINUTES = 1 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;
const SIX_MINUTES = 5 * 60 * 1000;

cron.schedule('* * * * *',  async () => {
  const now = Date.now()
  const startOfDay = new Date(now).setHours(0, 0, 0, 0);
  const cycle = Math.floor((now - startOfDay) / CYCLE_DURATION) + 1;

  const cycleStartTime = startOfDay + (cycle - 1) * CYCLE_DURATION;
  const executionTime = cycleStartTime + FIVE_MINUTES;
  const oneTime = cycleStartTime + ONE_MINUTES;
  const statsTime = cycleStartTime + SIX_MINUTES;
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

// CORS 설정

app.use((req, res, next) => {
  res.locals.isMobile = req.hostname.startsWith('m.');
  next();
});

// view engine setup
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
app.use('/test', testRouter);
app.use('/ads.txt', adsRouter);
app.use('/read', readRouter);
app.use('/users', usersRouter);
app.use('/getData', getDataRouter);
app.use('/totalGet', totalGetRouter);
app.use('/getgroup', getGroupRouter);
app.use('/searchallping', searchAllPingRouter);
app.use('/getmain', getMainPingRouter);

// dist 폴더를 정적 파일로 제공하도록 설정합니다.
app.use(express.static(path.join(__dirname, 'dist3')));
app.use(express.static(path.join(__dirname, 'dist2')));
app.use(express.static(path.join(__dirname, 'dist')));

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
