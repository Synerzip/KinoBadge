var userService = require('./../service/subscriptionService').service();

var userArray = userService.getSubscription({subscriptionId: 1}, null);

console.log(JSON.stringify(userArray));