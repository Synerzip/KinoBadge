var badgeService = require('./../service/badgeService').service();

var subscription = {"_id" : "50866ff121423482103db547"};

var badge = badgeService.getBadgesBySubscription(subscription,function(badges) {
  console.log("Badges for subscription " + JSON.stringify(badges));
});

var badge = badgeService.getBadge();