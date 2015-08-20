/**
 * 程序主入口
 */

var express = require('express'),
	passport = require('passport'),
	GitHubStrategy = require('passport-github').Strategy,
	routes = require('./routes/index.js'),
	http = require('http'),
	path = require('path'),
	app = express(),
	MongoStore = require('connect-mongo')(express),
	settings = require('./settings'),
	flash = require('connect-flash'),
	fs = require('fs'),
	accessLog = fs.createWriteStream('access.log',{'flags':'a'}),
	errorLog = fs.createWriteStream('error.log',{'flags':'a'});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
        clientID: '72f2a96d967d130a885c',
        clientSecret: 'd97fa59771406babd868aefffe18ac30f6db42fb',
        callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));
//	定义一个passport策略,并尝试从GitHub获取授权,登录并且授权成功后跳转到callbackURL,并以JSON的形式返回用户信息

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.engine('.html', require('ejs').__express);
//	设置后缀名为.html的文件里面存放ejs代码

app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.logger({'stream':accessLog}));

app.use(express.bodyParser({
	'keepExtensions':true,
	'uploadDir':'./public/upload'
}));
//	保留文件的后缀名和上传路径

app.use(express.cookieParser());

app.use(express.session({
	secret:settings.cookieSecret,
	key:settings.db,
	cookie:{maxAge:1000 * 60 * 60 * 24 * 30},
	store:new MongoStore({
		db:settings.db
	})
}));
//	写入cookie和session

app.use(passport.initialize());
app.use(passport.session());
//	初始化passport

app.use(flash());

app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err,req,res,next){
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.write(meta + err.static + '\n');
	next();
});
//	打印日志

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);