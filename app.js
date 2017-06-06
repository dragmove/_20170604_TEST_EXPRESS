var express = require('express'),
  http = require('http'),
  path = require('path'),
  static = require('serve-static');

app = express();

app.set('port', process.env.PORT || 3000);

app.use(static(path.join(__dirname, 'public')));

/*
app.get('/', function (req, res) {
  res.send('Hello World!')
})
*/

/*
 app.use(function(req, res, next) {
 // res.redirect('http://google.co.kr');

 var userAgent = req.header('User-Agent');
 var paramName = req.query.name || '';

 res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
 res.write(paramName);
 res.end();
 });
 */

http.createServer(app).listen(app.get('port'), function() {
  console.log(app.get('port'));
});