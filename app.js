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
var fbUser;

// Landing page
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/login-modal.html');
});

// FB Authentication page
/*
 app.get('/fbLogin',function(req,res){
 res.sendfile(__dirname + '/public/login.html');
 });
 */

/**
 * Approach for User Authentication via server-side
 */
app.get('/fbLogin',
  //Facebook.loginRequired(),
  function(req, res) {
    req.facebook.api('/me', function(err, user) {
      //fbUser = user;
      res.sendfile(__dirname + '/public/index.html');
    });
  });

app.get('/data/subscription/all', function(req, res) {
  subscriptionService.getAllSubscriptions(function(subscriptions) {
    res.set('Content-Type', "application/javascript");
    res.send(JSON.stringify(subscriptions));
  })
});

app.post('/data/badges', function(req, res) {
  var subscription = req.body;
  req.session.subscription = subscription; // save this in session
  badgeService.getBadgesBySubscription(subscription,function(badges){
    res.set('Content-Type', "application/javascript");
    res.send(JSON.stringify(badges));
  });
});

app.post('/data/users', function(req, res) {
  var subscription = req.body;
  userService.getUsersBySubscription(subscription,function(users){
    res.set('Content-Type', "application/javascript");
    res.send(JSON.stringify(users));
  });
});

app.get('/fbUser', function(req, res) {
  res.send(JSON.stringify(fbUser));
});

app.listen(3000, '172.24.211.21');
