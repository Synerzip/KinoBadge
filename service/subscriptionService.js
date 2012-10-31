var subscriptionDataService = require('./subscriptionDataService').service();

exports.service = function() {
  return {
    getAllSubscriptions : function(user,callBack){
      subscriptionDataService.getAllSubscriptions(user,function(subscriptions){
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