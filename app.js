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
const cron = require('node-cron');
const {totalGet} = require("./dbms/cron");

const app = express();

cron.schedule('5,41 * * * *', async () => {
  console.log("get start")
  totalGet()
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
app.use('/test', testRouter);
app.use('/ads.txt', adsRouter);
app.use('/read', readRouter);
app.use('/users', usersRouter);
app.use('/getData', getDataRouter);
app.use('/totalGet', totalGetRouter);

// dist 폴더를 정적 파일로 제공하도록 설정합니다.
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
