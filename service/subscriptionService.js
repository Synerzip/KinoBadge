var subscriptionDataService = require('./subscriptionDataService').service();

exports.service = function() {
  return {
    getAllSubscriptions : function(callBack){
      subscriptionDataService.getAllSubscriptions(function(subscriptions){
        // Some business logic
        // Alter the record for display purpose
        callBack(subscriptions);
      });
    },
    getSubscription : function(subscription,callBack){
      // first argument is the criteria object to subscription
      subscriptionDataService.getSubscription(subscription,callBack);
    }
  };
};