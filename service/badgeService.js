var badgeDataService = require('./badgeDataService').service();

exports.service = function() {
  return {
    getBadgesBySubscription : function(subscription,callBack){
      badgeDataService.getBadgesBySubscription(subscription,function(badges){
        callBack(badges);
      });
    },
    getAllBadgesByUser : function(user,callBack){

    },
    getBadge : function(badge,callBack){
      // first argument is the criteria object to subscription
      badgeDataService.getBadge(badge,callBack);
    }
  };
};