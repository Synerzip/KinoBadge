/**
 * This service is an interface to the database for higher level services.
 * All this service requires is a handle to the genericDataService, so that the
 * reference to the connection pool is available.
 */


var genericDataService = require('./genericDataService').service();
var ObjectID = genericDataService.getObjectId();

exports.service = function() {
  return {
    allUsersBySubscription: function(subscription, callBack) {
      this.getSubscription(subscription,function(subscription){
        callBack(subscription.users);
      });
    },
    /**
     *
     * @param user
     * @param callBack
     * @return all the subscriptions for a particular user
     */
    getAllSubscriptions: function(user,callBack) {
      var subscriptionIds = [];
      user.subscriptions.forEach(function(subscription){
        var ObjectId = genericDataService.getObjectId();
        subscriptionIds.push(ObjectId(subscription._id));
      });
      genericDataService.findByCriteria('Subscription', {"_id": {$in: subscriptionIds}}, callBack);
    },

    getSubscription: function(subscription, callBack) {
      genericDataService.findOneById('Subscription',subscription._id,function(subscription){
        callBack(subscription);
      });
    },

    updateSubscription: function(subscription, callBack) {
      return {};
    }
  };
};