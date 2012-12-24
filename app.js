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
  app.use(Facebook.middleware({ appId: '275083449277082', secret: '8fbef9ec42cc581b366e16d8cb568c4e'}));
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
  Facebook.loginRequired(),
  function(req, res) {
    req.facebook.api('/me', function(err, fbUser) { // uncomment it for fetching FB User JSON
    userService.getUserByOAuthId(fbUser, function(user) {
      req.session.user = user;
      res.sendfile(__dirname + '/public/index.html');
    });
    });
  });
/**
 * Returns all the subscriptions for the current User
 */
app.get('/data/subscription', function(req, res) {
  res.set('Content-Type', "application/javascript");
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
  badgeService.updateBadge(badge,function(badge){
   res.send(JSON.stringify(badge));
  });
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

/**
app.get('/fbUser', function(req, res) {
  res.send(JSON.stringify(req.session.user));
});
*/

app.listen(3000, 'localhost');
