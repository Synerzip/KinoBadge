var express = require('express');
var Facebook = require('facebook-node-sdk');
var app = express();

var userService = require('./service/userService').service();
var subscriptionService = require('./service/subscriptionService').service();
var badgeService = require('./service/badgeService').service();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'foo bar' }));
  app.use(Facebook.middleware({ appId: '275083449277082', secret: '8fbef9ec42cc581b366e16d8cb568c4e' }));
});

/**
 * Static content handling
 */

app.get('/isomorphic/*', function(req, res) {
  res.sendfile(__dirname + '/isomorphic/' + req.params[0]);
});

app.get('/public/*', function(req, res) {
  res.sendfile(__dirname + '/public/' + req.params[0]);
});

app.get('/images/*', function(req, res) {
  res.sendfile(__dirname + '/public/' + req.params[0]);
});

/**
 Approach for User Authentication via client-side (Browser)
 *
 */

// Landing page
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/login-modal.html');
});

/**
 * Approach for User Authentication via server-side
 * Uses FB authentication
 */
app.get('/fbLogin',
  //Facebook.loginRequired(), // uncomment it for FB Authentication
  function(req, res) {
    //req.facebook.api('/me', function(err, fbUser) { // uncomment it for fetching FB User JSON
    var fbUser = {
      id: "100000353297074", username: "hussainpw", link: "http://www.facebook.com/hussainpw"
    };

    userService.getUserByOAuthId(fbUser, function(user) {
      req.session.user = user;
      res.sendfile(__dirname + '/public/index.html');
    });
    //});
  });
/**
 * Returns all the subscriptions for the current User
 */
app.get('/data/subscription', function(req, res) {
  res.set('Content-Type', "application/javascript");
  var user = req.session.user;
  subscriptionService.getAllSubscriptions(req.session.user, function(subscriptions) {
    res.send(JSON.stringify(subscriptions));
  })
});

/**
 * Updates the subscription related data
 */
app.post('/data/subscription',function(req,res){
  res.set('Content-Type', "application/javascript");
  var subscription = req.body;
  subscriptionService.saveSubscription(subscription,function(subscription){
    res.send(JSON.stringify(subscription));
  });
});

/**
 * Updates the subscription related data
 */
app.put('/data/subscription',function(req,res){
  res.set('Content-Type', "application/javascript");
  var subscription = req.body;
  console.log("Update subscription " + JSON.stringify(subscription));
  subscriptionService.updateSubscription(subscription,function(subscription){
    res.send(JSON.stringify(subscription));
  });
});

/**
 * Returns all the badges for the subscription provided as the Id
 */
app.get('/data/badges', function(req, res) {
  res.set('Content-Type', "application/javascript");

  var subscription = {_id: req.param("subscriptionId")};
  badgeService.getBadgesBySubscription(subscription, function(badges) {
    res.send(JSON.stringify(badges));
  });

});

/**
 * Save a new badge
 */
app.post('/data/badges', function(req, res) {
  res.set('Content-Type', "application/javascript");
  var badge = JSON.parse(req.body.rawJSON);
  badgeService.saveBadge(badge,function(badge){
    res.send(JSON.stringify(badge));
  })
});

/**
 * Update an existing badge
 */
app.put('/data/badges', function(req, res) {
  res.set('Content-Type', "application/javascript");

  var badge = JSON.parse(req.body.rawJSON);

  var body = '';
  var header = '';
  var content_type = req.headers['content-type'];
  var boundary = content_type.split('; ')[1].split('=')[1];
  var content_length = parseInt(req.headers['content-length']);
  var headerFlag = true;
  var filename = badge.file;
  var filenameRegexp = /filename="(.*)"/m;

  console.log('content-type: ' + content_type);
  console.log('boundary: ' + boundary);
  console.log('content-length: ' + content_length);

  req.on('data', function(raw) {
    console.log('received data length: ' + raw.length);
    var i = 0;
    while (i < raw.length)
      if (headerFlag) {
        var chars = raw.slice(i, i+4).toString();
        if (chars === '\r\n\r\n') {
          headerFlag = false;
          header = raw.slice(0, i+4).toString();
          console.log('header length: ' + header.length);
          console.log('header: ');
          console.log(header);
          i = i + 4;
          // get the filename
          var result = filenameRegexp.exec(header);
          if (result[1]) {
            filename = result[1];
          }
          console.log('filename: ' + filename);
          console.log('header done');
        }
        else {
          i += 1;
        }
      }
      else {
        // parsing body including footer
        body += raw.toString('binary', i, raw.length);
        i = raw.length;
        console.log('actual file size: ' + body.length);
      }
  });

  req.on('end', function() {
    // removing footer '\r\n'--boundary--\r\n' = (boundary.length + 8)
    body = body.slice(0, body.length - (boundary.length + 8))
    console.log('final file size: ' + body.length);
    fs.writeFileSync('files/' + filename, body, 'binary');
    console.log('done');
    res.redirect('back');
  });

  //badgeService.updateBadge(badge,function(badge){
   res.send(JSON.stringify(badge));
  //});
});

/**
 * Returns all the users for the current subscription
 */
app.get('/data/users', function(req, res) {
  var subscription = {_id: req.param("subscriptionId")};
  res.set('Content-Type', "application/javascript");
  userService.getUsersBySubscription(subscription, function(users) {
    res.send(JSON.stringify(users));
  });
});

/**
 * Save the user, create a new document in the collection
 */
app.post('/data/users', function(req, res) {
  res.set('Content-Type', "application/javascript");
  var user = req.body;
  userService.saveUser(user, function(user) {
    res.send(JSON.stringify(user));
  });
});

/**
 * Update the user, update the existing document in the collection
 */
app.put('/data/users', function(req, res) {
  res.set('Content-Type', "application/javascript");
  var user = req.body;
  userService.updateUser(user, function(user) {
    res.send(JSON.stringify(user));
  });
});

app.get('/fbUser', function(req, res) {
  res.send(JSON.stringify(req.session.user));
});

app.listen(3000, 'localhost');
