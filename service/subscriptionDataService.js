/**
 * This service is an interface to the database for higher level services.
 * All this service requires is a handle to the genericDataService, so that the
 * reference to the connection pool is available.
 */


var genericDataService = require('./genericDataService').service();
var pool = genericDataService.pool();
var ObjectID = genericDataService.getObjectId();

exports.service = function() {
  return {
    allUsersBySubscription: function(subscription, callBack) {
      this.getSubscription(subscription,function(subscription){
        callBack(subscription.users);
      });
    },
    getAllSubscriptions: function(callBack) {
      genericDataService.findByCriteria('Subscription',{},callBack);
    },
    getSubscription: function(subscription, callBack) {
      genericDataService.findOneById('Subscription',subscription._id,callBack);
    },
    updateSubscription: function(subscription, callBack) {
      return {};
    }
  };
};