var badgeDS = isc.DataSource.create({
  ID: "badgeDS",
  fields: [
    {name: "name", title: "Name"},
    {name: "icon", type: "FileItem"}
  ],
  dataFormat: "json",
  dataURL: "/data/badges",
  operationBindings: [
    {operationType: "fetch", dataProtocol: "postParams"}
  ],
  autoFetchData: false,
  showPrompt:true,
  preventHTTPCaching: true,
  cacheMaxAge: 1, /*time in seconds*/
  prompt: "Please wait updating page",
  promptStyle: "dialog",
  promptCursor: "wait"
});

var badgeToolStrip =
  isc.ToolStrip.create({
    ID: "badgeToolStrip",
    width: "100%", height: 24,
    totalsLabel: function(){
      return this.members[0];
    },
    members: [
      isc.Label.create({
        padding: 5,
        ID: "totalsLabelBadge"
      }),,
      isc.LayoutSpacer.create({ width: "*" }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/add.png",
        prompt: "Add new record",
        click: function() {
          badgeList.addData({name:"BadgeName"});
          badgeList.startEditing(badgeList.data.indexOf(1));
        }
      }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/edit.png",
        prompt: "Edit selected record",
        click: function() {
          var record = badgeList.getSelectedRecord();
          if (record == null) return;
          badgeList.startEditing(badgeList.data.indexOf(record));
        }
      }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/remove.png",
        prompt: "Remove selected record",
        click: "subscriptionList.removeSelectedData()"
      })
    ]
  });


var badgeList = isc.ListGrid.create({
  ID: "badgeList",
  width: "100%", height: "50%", alterRecordStyles: true,
  emptyCellValue: "---",
  dataSource: badgeDS,
  // display a subsset of fields from the datasource
  fields: [
    {name: "name"}
  ],
  recordClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
    uploadFormTabSet.selectTab(0);
    badgeUploadForm.loadItem(record);
  },
  gridComponents: ["header", "filterEditor", "body", badgeToolStrip],
  sortFieldNum: 0,
  dataPageSize: 50,
  autoSaveEdits: false,
  canEditTrue: true,
  dataChanged: function() {
    this.Super("dataChanged", arguments);
    var totalRows = this.data.getLength();
    if (totalRows > 0 && this.data.lengthIsKnown()) {
      badgeToolStrip.totalsLabel().setContents(totalRows + " Records");
    } else {
      badgeToolStrip.totalsLabel().setContents("&nbsp;");
    }
  }
});

var badgeUploadForm = isc.DynamicForm.create({
  ID: "uploadForm",
  width: "100%",
  height: "100%",
  fields: [
    {name: "name", title: "Name"},
    {name: "description", title: "Description "},
    {name: "file", editorType: "FileItem", dataSource: badgeDS},
    {type: "button", click: "form.validate", title: "Delete Record", name: "deleteRecord"},
    {type: "button", click: "form.clear", title: "Clear Record", name: "clearRecord"},
    {type: "button", click: "form.save", title: "Save", name: "saveRecord"}
  ],
  loadItem: function(badge) {
    this.getField('name').setValue(badge.name);
    //this.getField('description').setValue(subscription.description);
  }
});
