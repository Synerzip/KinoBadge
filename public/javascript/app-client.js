/**
 * Default application layout
 * 1) Horizontal layout with two section stacks
 *    A) LeftsideLayout to support the display of Subscriptions and basic User-Profile
 *    B) RightsideLayout to support the display of Subscription-Form, Badge-Grid, Badge-Form, User-Grid, User-Form
 */

var leftSideLayout = isc.SectionStack.create({
  ID: "leftSideLayout",
  width: "30%",
  showResizeBar: true,
  visibilityMode: "multiple",
  animateSections: true,
  sections: [
    {
      title: "Subscriptions", autoShow: true,
      items: [
        subscriptionList
      ]},
    {
      title: "Profile Details", autoShow: true,
    }
  ]
});

var subscriptionTabs = isc.TabSet.create({
  ID: "DetailTabs",
  width: "80%",
  height: "80%",
  canCloseTabs: true,
  tabs: [
    {
      title: "Basic",
      pane: subscriptionForm
    },
    {
      title: "Badges",
      pane: badgeList
    }
    ,
    {
      title: "Users",
      pane: userList
    }
  ]
});

var subscriptionLoadPane = isc.Canvas.create({
  ID: "subsLoadPane",
  height: "100%",
  overflow: "auto",
  styleName: "defaultBorder",
  children: [
    subscriptionTabs
  ]
});

var uploadFormTabSet = isc.TabSet.create({
  ID: "FormTabs",
  width: "60%",
  height: "100%",
  canCloseTabs: true,
  tabs: [
    {
      ID: "badgeUploadFormTab",
      title: "Badge",
      pane: badgeUploadForm
    },
    {
      ID: "userUploadFormTab",
      title: "User",
      pane: userUploadForm
    }
  ]
});

var formLoadPane = isc.Canvas.create({
  ID: "formLoadPane",
  height: "100%",
  overflow: "auto",
  styleName: "defaultBorder",
  children: [
    uploadFormTabSet
  ]
});

var sectionStack = isc.SectionStack.create({
  ID: "rightSideLayout",
  visibilityMode: "multiple",
  height: "100%",
  animateSections: true,
  sections: [
    {title: "Subscription Details", autoShow: true, items: [subscriptionLoadPane]},
    {title: "Details", autoShow: false, items: [formLoadPane]}
  ]
});

isc.HLayout.create({
  ID: "pageLayout",
  width: "100%",
  height: "100%",
  layoutMargin: 20,
  members: [leftSideLayout, sectionStack]
});
