var express = require('express'),
  router = express.Router(),
  expressErrorHandler = require('express-error-handler'),

  http = require('http'),
  path = require('path'),

  bodyParser = require('body-parser'),
  static = require('serve-static');

app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(static(path.join(__dirname, 'public')));

router.route('/process/login/:name').post(function (req, res) {
  var paramName = req.params.name;

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
  res.write('<h1>from express</h1>');
  res.write('<div>url param name : ' + paramName + '</div>');
  res.write('<div>param id : ' + paramId + '</div>');
  res.write('<div>param password : ' + paramPassword + '</div>');
  res.write('<div><a href="/login.html">go login.html</a></div>');
  res.end();
});

app.use('/', router);

var errorHandler = expressErrorHandler({
  static: {
    '404': './public/404.html'
  }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

/*
app.all('*', function(req, res) {
  res.status(404).send('<h1>can not find page. 404 error</h1>');
});
*/

/*
 app.get('/', function (req, res) {
 res.send('Hello World!')
 })
 */

/*
 app.use(function (req, res, next) {
 // redirect.
 // res.redirect('http://google.co.kr');

 // get user agent.
 // var userAgent = req.header('User-Agent');

 var paramId = req.body.id || req.query.id;
 var paramPassword = req.body.password || req.query.password;

 res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
 res.write('<h1>from express</h1>');
 res.write('<div>param id : ' + paramId + '</div>');
 res.write('<div>param password : ' + paramPassword + '</div>');
 res.end();
 });
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log(app.get('port'));
});