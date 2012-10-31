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
  autoFetchData: false,
  showPrompt:true,
  preventHTTPCaching: true,
  cacheMaxAge: 1, /*time in seconds*/
  prompt: "Please wait updating page",
  promptStyle: "dialog",
  promptCursor: "wait"
});

var userToolStrip =
  isc.ToolStrip.create({
    ID: "userToolStrip",
    width: "100%", height: 24,
    totalsLabel: function(){
      return this.members[0];
    },
    members: [
    isc.Label.create({
        padding: 5,
        ID: "totalsLabelUser"
      }),
      isc.LayoutSpacer.create({ width: "*" }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/add.png",
        prompt: "Add new record",
        click: function() {
          var record = userList.getSelectedRecord();
          if (record == null) return;
          userList.startEditing(userList.data.indexOf(record));
        }
      }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/edit.png",
        prompt: "Edit selected record",
        click: function() {
          var record = userList.getSelectedRecord();
          if (record == null) return;
          userList.startEditing(userList.data.indexOf(record));
        }
      }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/remove.png",
        prompt: "Remove selected record",
        click: "subscriptionList.removeSelectedData()"
      })
    ]
  });

var userList = isc.ListGrid.create({
  ID: "userList",
  width: "100%",
  height: "100%",
  dataSource: userDS,
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
  gridComponents: ["header", "filterEditor", "body", userToolStrip],
  canEdit: true,
  customFields: [],
  autoSaveEdits: false,
  addCustomFields: function(data) {
    userList.customFields.forEach(function(myField) {
      userList.removeField(myField);  // remove old fields
    });

    userList.customFields = []; // reinitialize

    data.forEach(function(user) {
      var myField = {name: user.name, type: "boolean", canEdit: "true", icon: user.icon};
      userList.addField(myField);   // create new fields
      userList.customFields.push(myField);  // store them in the custom fields
    });
  },
  dataChanged: function() {
    this.Super("dataChanged", arguments);
    var totalRows = this.data.getLength();
    if (totalRows > 0 && this.data.lengthIsKnown()) {
      userToolStrip.totalsLabel().setContents(totalRows + " Records");
    } else {
      userToolStrip.totalsLabel().setContents("&nbsp;");
    }
  },
  recordClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
      uploadFormTabSet.selectTab(1);
      userUploadForm.loadItem(record);
    }
});

var userUploadForm = isc.DynamicForm.create({
  width: 250,
  dataSource:userDS,
  fields: [
    {name: "name", title: "Name", type: "text", required: true, defaultValue: ""},
    {name: "email", title: "Email", required: true, type: "text", defaultValue: ""},
    {
      name: "saveUser", title: "Save User",type: "button",
      click: function(){
        alert("Save call");
      }
    },
    {name: "updateUser", title: "Update User", type: "button", click: function(){
      alert("Update call");
    }},
    {name: "clearForm", title: "Clear", type: "button", click: ""}
  ],
  loadItem: function(user) {
    this.getField('name').setValue(user.name);
    //this.getField('description').setValue(subscription.description);
  }
});