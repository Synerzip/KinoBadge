/*!
 * Copyright Quickoffice, Inc, 2005-2011
 *
 * NOTICE:   The intellectual and technical concepts contained
 * herein are proprietary to Quickoffice, Inc. and is protected by
 * trade secret and copyright law. Dissemination of any of this
 * information or reproduction of this material is strictly forbidden
 * unless prior written permission is obtained from Quickoffice, Inc.
 */
var subscriptionService = require('./../service/subscriptionService').service();

var subscription = subscriptionService.getAllSubscriptions(function(subscriptions) {
  console.log("Subscriptions " + JSON.stringify(subscriptions));
});