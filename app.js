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
        id: "100000353297074",
        username: "hussainpw",
        link: "http://www.facebook.com/hussainpw"
      };

      userService.getUserByOAuthId(fbUser, function(user) {
        req.session.user = user;
        res.sendfile(__dirname + '/public/index.html');
      });
    //});
  });

app.get('/data/subscription/all', function(req, res) {
  res.set('Content-Type', "application/javascript");
  var user = req.session.user;
  subscriptionService.getAllSubscriptions(req.session.user, function(subscriptions) {
    res.send(JSON.stringify(subscriptions));
  })
});

app.post('/data/badges', function(req, res) {
  var subscription = req.body;
  res.set('Content-Type', "application/javascript");
  badgeService.getBadgesBySubscription(subscription, function(badges) {
    res.send(JSON.stringify(badges));
  });
});

app.post('/data/users', function(req, res) {
  var subscription = req.body;
  res.set('Content-Type', "application/javascript");
  userService.getUsersBySubscription(subscription, function(users) {
    res.send(JSON.stringify(users));
  });
});

app.get('/fbUser', function(req, res) {
  res.send(JSON.stringify(req.session.user));
});

app.listen(3000, 'localhost');
