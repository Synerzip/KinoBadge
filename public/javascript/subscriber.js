/**
 * A Subscription tree to display Users subscriptions
 */
var subscriptionDS = isc.DataSource.create({
  ID: "subscriptionDS",
  operationBindings: [
      {operationType: "fetch", dataProtocol: "getParams"},
      {operationType: "add", dataProtocol: "postParams"},
      {operationType: "remove", dataProtocol: "getParams", requestProperties: {httpMethod: "DELETE"}},
      {operationType: "update", dataProtocol: "postParams", requestProperties: {httpMethod: "PUT"}}
    ],
  fields: [
    {name: "name", title: "Name"}
  ],
  dataFormat: "json",
  dataURL: "/data/subscription"
});

var subscriberToolStrip =
  isc.ToolStrip.create({
    ID: "subscriberToolStrip",
    width: "100%", height: 24,
    totalsLabel: function(){
      return this.members[0];
    },
    members: [
      isc.Label.create({
            padding: 5,
            ID: "totalsLabelSubscriber"
          }),
      isc.LayoutSpacer.create({ width: "*" }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/add.png",
        prompt: "Add new record",
        click: function() {
          subscriptionList.addData({"name": "New Subscription"});
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
  dataSource: subscriptionDS,
  fields: [
    {name: "name"}
  ],
  recordClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
    subscriptionForm.loadItem(record);  // load the subscription form with the record
    badgeList.fetchData({subscriptionId: record._id}, function(dsResponse, data, dsRequest) {
      userList.addCustomFields(data); // upon reception of subscriberBadgeList update the userListGrid with custom fields
    });
    userList.fetchData({subscriptionId: record._id}, function(dsResponse, data, dsRequest) {
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
      subscriberToolStrip.totalsLabel().setContents(totalRows + " Records");
    } else {
      subscriberToolStrip.totalsLabel().setContents("&nbsp;");
    }
  }
});

var subscriptionForm = isc.DynamicForm.create({
  ID: "subscriptionForm",
  dataSource: subscriptionDS,
  fields: [
    {name: "name", type: "textArea", title: "Name"},
    {name: "description", type: "textArea", title: "Description"},
    {name: "saveSubscription",title: "Save", type:"button",
      click:function(){
        var record = subscriptionList.getSelectedRecord();

        record.description = subscriptionForm.getItem('description').getValue();

        subscriptionList.updateData({rawJSON:JSON.stringify(record)},function(){
          // callback function post update operation
        },{
          // optional properties to be passed to the request
        });
    }}
  ],
  loadItem: function(subscription) {
    this.getField('name').setValue(subscription.name);
    this.getField('description').setValue(subscription.description);
  }
});