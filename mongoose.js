var express = require('express'),
  router = null,

  http = require('http'),
  path = require('path'),

  bodyParser = require('body-parser'),
  static = require('serve-static'),

  errorHandler = require('errorHandler'),
  expressErrorHandler = require('express-error-handler'),

  cookieParser = require('cookie-parser'),
  expressSession = require('express-session'),

  multer = require('multer'),
  fs = require('fs'),

  cors = require('cors'),

  // MongoClient = require('mongodb').MongoClient,

  mongoose = require('mongoose'),
  database = null,
  UserSchema,
  UserModel;

var authUser = function (database, id, password, callback) {
  console.log('called authUser :', id);

  UserModel.find({
    'id': id,
    'password': password

  }, function (error, results) {
    if (error) {
      callback(error, null);
      return;
    }

    console.dir(results);

    if (results.length > 0) {
      console.log('found user :', id, password);
      callback(null, results);

    } else {
      console.log('can not find user');
      callback(null, null);
    }
  });
};

var addUser = function (database, id, password, name, callback) {
  console.log('called addUser :', id, password);

  var user = new UserModel({
    'id': id,
    'password': password,
    'name': name
  });

  user.save(function(error) {
    if(error) {
      callback(error, null);
      return;
    }

    console.log('added user data');
    callback(null, user);
  })
};

/*
 function connectDB() {
 var databaseUrl = 'mongodb://localhost:27017/local';

 MongoClient.connect(databaseUrl, function (error, db) {
 if (error) throw error;
 console.log('connected database :', databaseUrl);

 database = db;
 });
 }
 */

function connectDB() {
  console.log('try to connect dababase');

  var databaseUrl = 'mongodb://localhost:27017/local';

  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);

  database = mongoose.connection;

  database.on('error', console.error.bind(console, 'mongoose connection error.'));

  database.on('open', function () {
    console.log('connected to database :', databaseUrl);

    UserSchema = mongoose.Schema({
      id: {type: String, required: true, unique: true},
      name: String,
      password: String
    });

    UserModel = mongoose.model('users', UserSchema);
  });

  database.on('disconnected', function () {
    setInterval(connectDB, 5000);
  });
}

app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(static(path.join(__dirname, 'public')));
app.use(static(path.join(__dirname, 'uploads')));

app.use(cookieParser());
app.use(expressSession({
  secret: 'my key',
  resave: true,
  saveUninitialized: true
}));

app.use(cors());

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname + Date.now());
  }
});

var upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 1024 * 1024 * 1024
  }
});

router = express.Router();

router.route('/process/login').post(function (req, res) {
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  if (database) {
    authUser(database, paramId, paramPassword, function (error, docs) {
      if (error) {
        throw error;
      }

      if (docs) {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>success login</h1>');
        res.write('<div>param id : ' + paramId + '</div>');
        res.write('<div>param password : ' + paramPassword + '</div>');
        res.write('<div><a href="/login.html">retry login</a></div>');
        res.end();

      } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>fail to login</h1>');
        res.write('<div>reconfirm id, password</div>');
        res.write('<div><a href="/login.html">retry login</a></div>');
        res.end();
      }
    });

  } else {
    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<h1>fail to connect database</h1>');
    res.write('<div><a href="/process/login.html">go login page</a></div>');
    res.end();
  }

  /*
   if (req.session.user) {
   res.redirect('/product.html');

   } else {
   req.session.user = {
   id: paramId,
   name: 'winter',
   authorized: true
   };

   res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
   res.write('<h1>success login</h1>');
   res.write('<div>param id : ' + paramId + '</div>');
   res.write('<div>param password : ' + paramPassword + '</div>');
   res.write('<div><a href="/process/product">go product page</a></div>');
   res.end();
   }
   */
});

router.route('/process/adduser').post(function (req, res) {
  console.log('call /process/adduser');

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;

  if (database) {
    addUser(database, paramId, paramPassword, paramName, function (error, result) {
      if (error) {
        throw error;
      }

      console.log('addUser result :', result);

      if (result) {
        console.dir(result);

        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>success add user</h1>');
        res.end();
      } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h1>fail add user</h1>');
        res.end();
      }
    });
  } else {
    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<h1>fail to connect database</h1>');
    res.end();
  }
});

router.route('/process/product').get(function (req, res) {
  console.log('call /process/product');

  if (req.session.user) {
    res.redirect('/product.html');

  } else {
    res.redirect('/login.html');
  }
});

router.route('/process/logout').get(function (req, res) {
  console.log('call /process/logout');

  if (req.session.user) {
    req.session.destroy(function (error) {
      if (error) {
        throw error;
      }

      res.redirect('/login.html');
    });

  } else {
    res.redirect('/login.html');
  }
});

router.route('/process/photo').post(upload.array('photo', 5), function (req, res) {
  try {
    var files = req.files;
    console.dir(req.files[0]);

    var index = 0,
      file = null,
      originalname = '',
      filename = '',
      mimetype = '',
      size = 0;

    if (Array.isArray(files)) {
      for (index = 0; index < files.length; index++) {
        file = files[index];

        originalname = file.originalname;
        filename = file.filename;
        mimetype = file.mimetype;
        size = file.size;

        console.log(originalname, filename, mimetype, size);
      }
    } else {
      file = files[index];

      originalname = file.originalname;
      filename = file.filename;
      mimetype = file.mimetype;
      size = file.size;
    }


    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<h1>success upload file</h1>');
    res.write('<div>original name : ' + originalname + '</div>');
    res.write('<div>filename : ' + filename + '</div>');
    res.end();

  } catch (err) {
    console.dir(err.stack);
  }
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

  connectDB();
});