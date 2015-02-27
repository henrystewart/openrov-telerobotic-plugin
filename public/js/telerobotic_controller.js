(function (window, $, undefined) {
    'use strict';

    var telerobotic_controller;
    var OT_apiKey, OT_token, OT_sessionId;
    telerobotic_controller = function telerobotic_controller(cockpit) {
        console.log("Loading telerobotic_controller plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

    //example keyboard hook
    this.cockpit.emit('inputController.register',
      {
        name: "telerobotic_controller.keyBoardMapping",
        description: "Turns it on",
        defaults: { keyboard: 'alt+5', gamepad: '' },
        down: function() { console.log('telerobotic_controller alt-5 pressed'); },
      });

    // for plugin management:
    this.name = 'telerobotic_controller';   // for the settings
    this.viewName = 'telerobotic_controller plugin'; // for the UI
    this.canBeDisabled = true; //allow enable/disable
    this.enable = function () {
      alert('telerobotic_controller enabled');
    };
    this.disable = function () {
      alert('telerobotic_controller disabled');
    };
  };

  //This will be called by the input manager automatically
  telerobotic_controller.prototype.listen = function listen() {
    var rov = this;

    //This snippet allows you to listen to events coming
    //from the beaglebone.  Those coulbe be navdata, status, etc...

    this.cockpit.socket.on('test', function (data) {
      console.log("recieved test message from browser.");
      //rov.dosomethingwith(data);
    });

    //This example will put an entry in the pop-up Heads Up Menu
    /*
    var item = {
      label: ko.observable("telerobotic_controller menu"),
      callback: function () {
        alert('telerobotic_controller menu item');
        item.label(this.label() + " Foo Bar");
      }
    };
    rov.cockpit.emit('headsUpMenu.register', item);
    */


    //the code below is used to load other asssets that have a path relative to the current
    //path of the executing javascript file.
    var jsFileLocation = urlOfJsFile('telerobotic_controller.js');

    
    // $.getScript(jsFileLocation + './data-channel.js',function(data){
    //   console.log(data);
    // });
    

    // If you have more than a couple lines of HTML it might be better
    // to place them in a seperate .html file. The code below will load
    // them in to an element.

    $('body').prepend('<div id="data-channel"></div>')
    $('#data-channel').load(jsFileLocation + '../partial.html',function(data){
      console.log('partial template loaded');
    });
    var room;
    var users = {};
    var dataChannels = {};
    var self = this.cockpit;
    
    $.getScript("http://static.opentok.com/v2.4/js/opentok.min.js", function (data,status) {
      console.log("loaded opentok successfully");
      var rov_control = self; // controls

      $.get("https://openrov-liveview.herokuapp.com/channels/1/telerobotic_credentials", function (data, status){
        OT_apiKey = data.api_key;
        OT_token = data.token;
        OT_sessionId = data.session_id;
        console.log("OT_sessiondId: " + OT_sessionId + "\nOT_apiKey: " + OT_apiKey + "\nOT_token: " + OT_token);
        var session = OT.initSession(OT_apiKey, OT_sessionId)

        var self = rov_control; // controls

        session.connect(OT_token, function(error) {
          console.log("session connected");
        });

        session.on("signal:light",function(event){
          console.log("light: signal sent from connection: " + event.from.id);
          self.socket.emit('brightness_update',1);
          var myrov = self;
          setTimeout(function(){ 
            myrov.socket.emit('brightness_update',0);
          }, 1000);
        });

        session.on("signal:laser", function(event){
          console.log("laser: signal sent from connection: " + event.from.id);
          self.socket.emit('laser_update',1);
          var myrov = self;
          setTimeout(function(){ 
            myrov.socket.emit('brightness_update',0);
          }, 1000);

        });
      });
    });




    // var OT_apiKey, OT_roomToken, OT_sessionId;
    // $.get("https://localhost:3001/channels/1/telerobotic_credentials", function (data, status){
    //   OT_apiKey = data.api_key;
    //   OT_roomToken = data.token;
    //   OT_sessionId = data.session_id;
    // });
    
    // var session = OT.initSession(OT_apiKey, OT_sessionId)
    // session.connection(OT_token, function (error) {
    //   console.log("session connected")
    //   session.signal({
    //     type: "foo",
    //     data: "hello"
    //   },
    //   function(error) {
    //     if (error) {
    //       console.log("signal error: " + error.message)
    //     } else {
    //       console.log("signal sent")
    //     }
    //   });

    //   session.on("signal:foo", function(event) {
    //     console.log("signal sent from connection: " + event.from.id)
    //   });
    // });

    //For loading third party libraries that are bower dependencies
    /*
    $.getScript('plugin_components/<projectname>/<filetoload>.js',function(){
      console.log("loaded");
    });
    */

  };

    window.Cockpit.plugins.push(telerobotic_controller);

}(window, jQuery));
