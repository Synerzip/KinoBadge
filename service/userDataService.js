/**
 * This service is an interface to the database for higher level services.
 * All this service requires is a handle to the genericDataService, so that the
 * reference to the connection pool is available.
 */


var genericDataService = require('./genericDataService').service();
var subscriptionDataService = require('./subscriptionDataService').service();

exports.service = function() {
  return {
    getUsersBySubscription: function(subscription, callBack) {
      // Fetch the subscription
      subscriptionDataService.getSubscription(subscription, function(subscription) {
        var criteriaUsers = [];

        if (subscription.users) {
          subscription.users.forEach(function(user) {
            var ObjectId = genericDataService.getObjectId();
            criteriaUsers.push(new ObjectId(user._id));
            // Query with a criteria object
            genericDataService.findByCriteria('User', {"_id": {$in: criteriaUsers}}, callBack);
          });
        } else {
          callBack([]);  // return an empty array
        }
      });
    },

    allBadgesByUser: function(user) {
      return [];  // return an array of badges for a user
    },

    updateUser: function(user) {
      return true;  // updates the user object and other associations and returns 'true/false' as the state of operation
    },

    getUser: function(user, callBack) {

    },
    getUserByOAuthId : function(fbUser,callBack){
      genericDataService.findOneByCriteria('User',{id:fbUser.id},callBack);
    }
  };
};