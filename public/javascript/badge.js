var badgeDS = isc.DataSource.create({
  ID: "badgeDS",
  fields: [
    {name: "name", title: "Name"},
    {name: "icon", type: "FileItem"}
  ],
  dataFormat: "json",
  dataURL: "/data/badges",
  operationBindings: [
    {operationType: "fetch", dataProtocol: "getParams"},
    {operationType: "add", dataProtocol: "postParams"},
    {operationType: "remove", dataProtocol: "getParams", requestProperties: {httpMethod: "DELETE"}},
    {operationType: "update", dataProtocol: "postParams", requestProperties: {httpMethod: "PUT"}}
  ],
  autoFetchData: false,
  showPrompt: true,
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
    totalsLabel: function() {
      return this.members[0];
    },
    members: [
      isc.Label.create({
        padding: 5,
        ID: "totalsLabelBadge"
      }), ,
      isc.LayoutSpacer.create({ width: "*" }),
      isc.ToolStripButton.create({
        icon: "[SKIN]/actions/add.png",
        prompt: "Add new record",
        click: function() {
          badgeList.addData({name: "BadgeName"});
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
  ID: "badgeUploadForm",
  width: "100%",
  height: "100%",
  dataSource: badgeDS,
  fields: [
    {name: "name", title: "Name", type: "textArea"},
    {name: "description", title: "Description ", type: "textArea"},
    {name: "icon", editorType: "FileItem", dataSource: badgeDS},
    {
      type: "button", title: "Update Record", name: "updateRecord",
      click: function() {
        var record = badgeList.getSelectedRecord();
        record.name = badgeUploadForm.getItem("name").getValue();
        record.description = badgeUploadForm.getItem("description").getValue();
        record.icon = badgeUploadForm.getItem('icon').getValue();

        badgeList.updateData({rawJSON:JSON.stringify(record)}, function() {
          // call back post data addition
        }, {
          // additional request properties
        });
      }},
    {
      type: "button", title: "Clear Record", name: "clearRecord",
      click: function() {
        badgeUploadForm.clear();
      }},
    {
      type: "button", title: "Save", name: "saveRecord",
      click: function() {
        var subscription = subscriptionList.getSelectedRecord();
        var record = {
          subscription :{
            _id:subscription._id
          }
        };

        record.name = badgeUploadForm.getItem("name").getValue();
        record.description = badgeUploadForm.getItem("description").getValue();
        record.file = badgeUploadForm.getItem('file').getValue();

        badgeList.addData({rawJSON:JSON.stringify(record)}, function() {
          // call back post data addition
        }, {
          // additional request properties
        });
      }}
  ],
  loadItem: function(badge) {
    this.getField('name').setValue(badge.name);
    this.getField('description').setValue(badge.description);
  }
});
