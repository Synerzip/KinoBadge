/**
 * A Subscription tree to display Users subscriptions
 */
var subscriptionDS = isc.DataSource.create({
  ID: "subscriptionDS",
  fields: [
    {name: "name", title: "Name"}
  ],
  dataFormat: "json",
  dataURL: "/data/subscription/all"
});

var subscriberToolStrip =
  isc.ToolStrip.create({
    ID: "subscriberToolStrip",
    width: "100%", height: 24,
    members: [
      isc.Label.create({
        padding: 5,
        ID: "totalsLabel"
      }),
      isc.LayoutSpacer.create({ width: "*" }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/add.png",
        prompt: "Add new record",
        click: function() {
          var record = subscriptionList.getSelectedRecord();
          if (record == null) return;
          subscriptionList.startEditing(subscriptionList.data.indexOf(record));
        }
      }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/edit.png",
        prompt: "Edit selected record",
        click: function() {
          var record = subscriptionList.getSelectedRecord();
          if (record == null) return;
          subscriptionList.startEditing(subscriptionList.data.indexOf(record));
        }
      }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/remove.png",
        prompt: "Remove selected record",
        click: "subscriptionList.removeSelectedData()"
      })
    ]
  });

var subscriptionList = isc.ListGrid.create({
  ID: "subscriptionList",
  width: 500, height: 224, alternateRecordStyles: true,
  emptyCellValue: "--",
  dataSource: "subscriptionDS",
  fields: [
    {name: "name"}
  ],
  recordClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
    subscriptionForm.loadItem(record);  // load the subscription form with the record

    subscriberBadgeList.fetchData({_id: record._id}, function(dsResponse, data, dsRequest) {
      userListGrid.addCustomFields(data); // upon reception of subscriberBadgeList update the userListGrid with custom fields
    });

    userListGrid.fetchData({_id : record._id},function(dsResponse,data,dsRequest){
      // call back over userListGrid
    });
  },
  sortFieldNum: 0, // sort by subscriptionId
  dataPageSize: 50,
  autoFetchData: true,
  showFilterEditor: true,
  canEdit: true,
  editEvent: "none",
  gridComponents: ["header", "filterEditor", "body", subscriberToolStrip],
  dataChanged: function() {
    this.Super("dataChanged", arguments);
    var totalRows = this.data.getLength();
    if (totalRows > 0 && this.data.lengthIsKnown()) {
      totalsLabel.setContents(totalRows + " Records");
    } else {
      totalsLabel.setContents("&nbsp;");
    }
  }
})

var badgeDS = isc.DataSource.create({
  ID: "badgeDS",
  fields: [
    {name: "name", title: "Name"}
  ],
  dataFormat: "json",
  dataURL: "/data/badges",
  operationBindings: [
    {operationType: "fetch", dataProtocol: "postParams"}
  ],
  autoFetchData: true
});

var subscriberBadgeList = isc.ListGrid.create({
  ID: "subscriberBadgeList",
  width: "100%", height: "50%", alterRecordStyles: true,
  emptyCellValue: "---",
  dataSource: badgeDS,
  // display a subsset of fields from the datasource
  fields: [
    {name: "name"}
  ],
  recordClick: function() {
    /** TODO
     *  Need to launch a separate EDIT form for a badge
     *  the form should support creation of new badge also.
     *
     */
    //alert("Showing details of a Badge Record");

  },
  sortFieldNum: 0,
  dataPageSize: 50,
  autoFetchData: false
});

var userDS = isc.DataSource.create({
  ID: "userDS",
  dataFormat: "json",
  dataURL: "/data/users",
  operationBindings: [
    {operationType: "fetch", dataProtocol: "postParams"},
    {operationType: "update", dataProtocol: "postParams"}
  ], fields: [
    {name: "name", title: "Name", name: "40%"}
  ],
  autoFetchData: false
});

var userListGrid = isc.ListGrid.create({
  ID: "userListGrid",
  width: "100%",
  height: "100%",
  dataSource: userDS,
  autoFetchData: false,
  imageIcon: "/public/images/person.png",
  folderIcon: "/public/images/person.png",
  showOpenIcons: false,
  showDropIcons: false,
  closedIconSuffix: "",
  showHeaders: true,
  showNodeCount: true,
  expansionMode: "related",
  fields: [
    {name: "name", title: "Name"}
  ],
  gridComponents: ["header", "filterEditor", "body"],
  canEdit: true,
  customFields: [],
  autoSaveEdits:false,
  addCustomFields: function(data) {
    userListGrid.customFields.forEach(function(myField) {
      userListGrid.removeField(myField);  // remove old fields
    });

    userListGrid.customFields = []; // reinitialize

    data.forEach(function(badge) {
      var myField = {name: badge.name, type: "boolean", canEdit: "true", icon: badge.icon};
      userListGrid.addField(myField);   // create new fields
      userListGrid.customFields.push(myField);  // store them in the custom fields
    });
  }
});

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
      items: []
    }
  ]
});

var subscriptionForm = isc.DynamicForm.create({
  ID: "formBasic",
  fields: [
    {name: "name", type: "text", title: "Name", disabled: true},
    {name: "description", type: "textArea", title: "Description"}
  ],
  loadItem: function(subscription) {
    this.getField('name').setValue(subscription.name);
    this.getField('description').setValue(subscription.description);
  }
});

var subscriptionTabs = isc.TabSet.create({
  ID: "DetailTabs",
  width: "80%",
  height: "80%",
  tabs: [
    {
      title: "Basic",
      pane: subscriptionForm
    },
    {
      title: "Badges",
      pane: subscriberBadgeList
    }
    ,
    {
      title: "Users",
      pane: userListGrid
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

var formLoadPane = isc.Canvas.create({
  ID: "formLoadPane",
  height: "100%",
  overflow: "auto",
  styleName: "defaultBorder",
  children: []
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

