/**
 * This service is an interface to the database for higher level services.
 * All this service requires is a handle to the genericDataService, so that the
 * reference to the connection pool is available.
 */


var genericDataService = require('./genericDataService').service();
var ObjectID = genericDataService.getObjectId();
var subscriptionDataService = require('./subscriptionDataService').service();

/**
 * Badges depict the contains scenario, within subscriptions. In such a case
 * they are better modelled as the Embedded objects within the Subscriptions.
 * However, the badges share a one-to-many relationship with users. Hence
 * User records would be having the appropriate links towards the Badges.
 *
 * This is how the Schema design principles of Document driven MongoDB have been
 * put into action. Embedded and Linked.
 */

exports.service = function() {
  return {
    getBadgesBySubscription : function(subscription, callBack) {
      genericDataService.findByCriteria('Badge',{"subscription" : { "_id" : subscription._id }},function(badges){
        callBack(badges);
      });
    },
    getBadge: function(badge, callBack) {
        genericDataService.findOneById('Badge',badge._id,function(badge){
          callBack(badge);
        });
    },
    updateBadge: function(badge, callBack) {
      genericDataService.update("Badge",{"_id": new ObjectID(badge._id)},badge,null,callBack);
    },
    saveBadge: function(badge,callBack){
      genericDataService.save("Badge",badge,null,callBack);
    }
  };
};