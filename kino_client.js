/*!
 * Copyright Quickoffice, Inc, 2005-2011
 *
 * NOTICE:   The intellectual and technical concepts contained
 * herein are proprietary to Quickoffice, Inc. and is protected by
 * trade secret and copyright law. Dissemination of any of this
 * information or reproduction of this material is strictly forbidden
 * unless prior written permission is obtained from Quickoffice, Inc.
 */
// Models
window.User = Backbone.Model.extend({
    urlRoot:"/user",
    destroy_server : function(){
      var options = {
        url : '/user/'+this.get('_id')
      }
      Backbone.sync('delete',this,options);
      this.destroy();
    },
    defaults:{
        "_id":null,
        "name":"",
        "surname":""
    }
});

window.UserCollection = Backbone.Collection.extend({
    model:User,
    url:"/user"
});

// Views
window.UserListView = Backbone.View.extend({

    tagName:'ul',

    initialize:function () {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (user) {
            $(self.el).append(new UserListItemView({model:user}).render().el);
        });
    },

    render:function (eventName) {
        _.each(this.model.models, function (user) {
            $(this.el).append(new UserListItemView({model:user}).render().el);
        }, this);
        return this;
    }
});

window.UserListItemView = Backbone.View.extend({

    tagName:"li",

    template:_.template($('#tpl-user-list-item').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).remove();
    }
});

window.UserView = Backbone.View.extend({

    template:_.template($('#tpl-user-details').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events:{
        "change input":"change",
        "click .save":"saveUser",
        "click .delete":"deleteUser"
    },

    change:function (event) {
        var target = event.target;
        console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
        // You could change your model on the spot, like this:
        // var change = {};
        // change[target.name] = target.value;
        // this.model.set(change);
    },

    saveUser:function () {
        this.model.set({
            name:$('#name').val(),
            surname:$('#surname').val()
        });
        if (this.model.isNew()) {
            var self = this;
            app.userList.create(this.model, {
                success:function () {
                    app.navigate('user/' + self.model.id, false);
                }
            });
        } else {
            this.model.save();
        }
        return false;
    },

    deleteUser:function () {
        this.model.destroy_server({
            success:function (model,response) {
                alert('User deleted successfully');
                window.history.back();
            },
            error : function(){

            }
        });
        return false;
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).empty();
    }
});

window.HeaderView = Backbone.View.extend({

    template:_.template($('#tpl-header').html()),

    initialize:function () {
        this.render();
    },

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },

    events:{
        "click .new":"newUser"
    },

    newUser:function (event) {
        app.navigate("user/new", true);
        return false;
    }
});

// Router
var AppRouter = Backbone.Router.extend({

    routes:{
        "":"list",
        "user/new":"newUser",
        "user/:id":"userDetails"
    },

    initialize:function () {
        $('#header').html(new HeaderView().render().el);
    },

    list:function () {
        this.userList = new UserCollection();
        var self = this;
        this.userList.fetch({
            success:function () {
                self.userListView = new UserListView({model:self.userList});
                $('#sidebar').html(self.userListView.render().el);
                if (self.requestedId) self.userDetails(self.requestedId);
            }
        });
    },

    userDetails:function (id) {
        if (this.userList) {

            this.user = this.userList.get(id);

            if(this.user === undefined){
              /**
               * TODO This is a temporary hack
               * as this.userList.get(id) is not working
               * we need to figure out how this is actually
               * populated
               */

              loop:for(var index in this.userList.models){
                var record = this.userList.models[index];
                if(record.get("_id") === id){
                  this.user = record;
                  break;
                }
              }
            }
            if (this.userView) this.userView.close();
            this.userView = new UserView({model:this.user});
            $('#content').html(this.userView.render().el);
        } else {
            this.requestedId = id;
            this.list();
        }
    },

    newUser:function () {
        if (app.userView){
          app.userView.close();
        }
        app.userView = new UserView({model:new User()});
        $('#content').html(app.userView.render().el);
    }

});

var app = new AppRouter();
app.initialize();
app.list();
Backbone.history.start();
