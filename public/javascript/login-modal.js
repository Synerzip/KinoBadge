isc.Window.create({
    ID: "modalWindow",
    title: "Modal Window",
    autoSize:true,
    autoCenter: true,
    isModal: true,
    showModalMask: true,
    autoDraw: true,
    closeClick : function () {
      touchButton.setTitle('Touch This'); this.Super("closeClick", arguments);
    },
    items: [
      isc.DynamicForm.create({
          autoDraw: false,
          height: 48,
          padding:4,
          fields: [
              {
                type: "button",
                title: "Login with Facebook",
                click: server_redirect
              }
          ]
      })
    ]
});

function server_redirect(){
  window.location.replace('/fbLogin');
}